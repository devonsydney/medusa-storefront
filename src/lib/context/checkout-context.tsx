import { medusaClient } from "@lib/config"
import useToggleState, { StateType } from "@lib/hooks/use-toggle-state"
import {
  Address,
  Cart,
  Customer,
  StorePostCartsCartReq,
} from "@medusajs/medusa"
import Wrapper from "@modules/checkout/components/payment-wrapper"
import { isEqual } from "lodash"
import {
  formatAmount,
  useCart,
  useCartShippingOptions,
  useMeCustomer,
  useSetPaymentSession,
  useUpdateCart,
} from "medusa-react"
import { useRegions } from "@lib/hooks/use-layout-data"
import { useRouter } from "next/router"
import React, { createContext, useContext, useEffect, useMemo, useCallback } from "react"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { useStore } from "./store-context"
import pluralize from "pluralize"

type AddressValues = {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}

export type CheckoutFormValues = {
  shipping_address: AddressValues
  billing_address: AddressValues
  email: string
}

interface CheckoutContext {
  cart?: Omit<Cart, "refundable_amount" | "refunded_total">
  shippingMethods: { label?: string; value?: string; price: string }[]
  isLoading: boolean
  readyToComplete: boolean
  sameAsBilling: StateType
  editAddresses: StateType
  initPayment: () => Promise<void>
  setAddresses: (addresses: CheckoutFormValues) => void
  setSavedAddress: (address: Address) => void
  setShippingOption: (soId: string) => void
  setPaymentSession: (providerId: string) => void
  onPaymentCompleted: (callback?: (errorMessage: string | null) => void) => void
}

const CheckoutContext = createContext<CheckoutContext | null>(null)

interface CheckoutProviderProps {
  children?: React.ReactNode
}

const IDEMPOTENCY_KEY = "create_payment_session_key"

export const CheckoutProvider = ({ children }: CheckoutProviderProps) => {
  const {
    cart,
    setCart,
    addShippingMethod: {
      mutate: setShippingMethod,
      isLoading: addingShippingMethod,
    },
    completeCheckout: { mutate: complete, isLoading: completingCheckout },
  } = useCart()

  const { customer } = useMeCustomer()
  const { countryCode } = useStore()

  const methods = useForm<CheckoutFormValues>({
    defaultValues: mapFormValues(null, customer, cart, countryCode),
    reValidateMode: "onChange",
  })

  const {
    mutate: setPaymentSessionMutation,
    isLoading: settingPaymentSession,
  } = useSetPaymentSession(cart?.id!)

  const { mutate: updateCart, isLoading: updatingCart } = useUpdateCart(
    cart?.id!
  )

  const { shipping_options } = useCartShippingOptions(cart?.id!, {
    enabled: !!cart?.id,
  })

  const { data: regions } = useRegions()

  const { resetCart, setRegion } = useStore()
  const { push } = useRouter()

  const editAddresses = useToggleState()
  const sameAsBilling = useToggleState(
    cart?.billing_address && cart?.shipping_address
      ? isEqual(cart.billing_address, cart.shipping_address)
      : true
  )

  /**
   * Boolean that indicates if a part of the checkout is loading.
   */
  const isLoading = useMemo(() => {
    return (
      addingShippingMethod ||
      settingPaymentSession ||
      updatingCart ||
      completingCheckout
    )
  }, [
    addingShippingMethod,
    completingCheckout,
    settingPaymentSession,
    updatingCart,
  ])

  /**
   * Boolean that indicates if the checkout is ready to be completed. A checkout is ready to be completed if
   * the user has supplied a email, shipping address, billing address, shipping method, and a method of payment.
   */
  const readyToComplete = useMemo(() => {
    return (
      !!cart &&
      !!cart.email &&
      !!cart.shipping_address &&
      !!cart.billing_address &&
      !!cart.payment_session &&
      cart.shipping_methods?.length > 0
    )
  }, [cart])

  const shippingMethods = useMemo(() => {
    const province = cart?.shipping_address?.province || ""
    if (shipping_options && cart?.region) {
      return shipping_options
        .filter((option) => {
          const provincesInOptionString = option.name?.match(/\[(.*?)\]/);
          if (!provincesInOptionString) return true;
          const provincesInOption =
            provincesInOptionString &&
            provincesInOptionString[1]?.split(",").map((s) => s.trim()) || [];
          return provincesInOption.includes(province);
        })
        .map((option) => ({
          value: option.id,
          label: option.name,
          price: formatAmount({
            amount: option.amount || 0,
            region: cart.region,
          }),
        }));
    }
    return []
  }, [shipping_options, cart])

  /**
   * Resets the form when the cart changed.
   */
  useEffect(() => {
    if (cart?.id) {
      methods.reset(mapFormValues(methods.getValues, customer, cart, countryCode))
    }
  }, [customer, cart, methods, countryCode])

  useEffect(() => {
    if (!cart) {
      editAddresses.open()
      return
    }

    if (cart?.shipping_address && cart?.billing_address) {
      editAddresses.close()
      return
    }

    editAddresses.open()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  /**
   * Method to set the selected shipping method for the cart. This is called when the user selects a shipping method, such as UPS, FedEx, etc.
   */
  const setShippingOption = useCallback((soId: string) => {
    if (cart) {
      setShippingMethod(
        { option_id: soId },
        {
          onSuccess: ({ cart }) => setCart(cart),
        }
      )
    }
  }, [cart, setShippingMethod, setCart]);

  /**
   * Selects the first shipping method whenever the cart shipping address is changed.
   */
  useEffect(() => {
    if (cart?.shipping_address) {
      // Check if the shipping option is already set to the desired value
      if (cart.shipping_methods?.[0]?.shipping_option?.id !== shippingMethods?.[0]?.value) {
        // If not, set the shipping option
        if (shippingMethods?.length && shippingMethods?.[0]?.value) {
          setShippingOption(shippingMethods[0].value);
        }
      }
    }
  }, [cart?.shipping_address, cart?.shipping_methods, shippingMethods, setShippingOption]);

  /**
   * Method to create the payment sessions available for the cart. Uses a idempotency key to prevent duplicate requests.
   */
  const createPaymentSession = async (cartId: string) => {
    return medusaClient.carts
      .createPaymentSessions(cartId, {
        "Idempotency-Key": IDEMPOTENCY_KEY,
      })
      .then(({ cart }) => cart)
      .catch(() => null)
  }

  /**
   * Method that calls the createPaymentSession method and updates the cart with the payment session.
   */
  const initPayment = async () => {
    if (cart?.id && !cart.payment_sessions?.length && cart?.items?.length) {
      const paymentSession = await createPaymentSession(cart.id)

      if (!paymentSession) {
        setTimeout(initPayment, 500)
      } else {
        setCart(paymentSession)
        return
      }
    }
  }

  /**
   * Method to set the selected payment session for the cart. This is called when the user selects a payment provider, such as Stripe, PayPal, etc.
   */
  const setPaymentSession = (providerId: string) => {
    if (cart) {
      setPaymentSessionMutation(
        {
          provider_id: providerId,
        },
        {
          onSuccess: ({ cart }) => {
            setCart(cart)
          },
        }
      )
    }
  }

  const setSavedAddress = (address: Address) => {
    const setValue = methods.setValue

    setValue("shipping_address", {
      address_1: address.address_1 || "",
      address_2: address.address_2 || "",
      city: address.city || "",
      country_code: address.country_code || "",
      first_name: address.first_name || "",
      last_name: address.last_name || "",
      phone: address.phone || "",
      postal_code: address.postal_code || "",
      province: address.province || "",
      company: address.company || "",
    })
  }

  /**
   * Method that validates if the cart's region matches the shipping address's region. If not, it will update the cart region.
   */
  const validateRegion = (countryCode: string) => {
    if (regions && cart) {
      const region = regions.find((r) =>
        r.countries.map((c) => c.iso_2).includes(countryCode)
      )

      if (region && region.id !== cart.region.id) {
        setRegion(region.id, countryCode)
      }
    }
  }

  /**
   * Method that sets the addresses and email on the cart.
   */
  const setAddresses = (data: CheckoutFormValues) => {
    const { shipping_address, billing_address, email } = data

    const payload: StorePostCartsCartReq = {
      shipping_address,
      email,
    }

    if (isEqual(shipping_address, billing_address)) {
      sameAsBilling.open()
    }

    if (sameAsBilling.state) {
      payload.billing_address = shipping_address
    } else {
      payload.billing_address = billing_address
    }

    updateCart(payload, {
      onSuccess: ({ cart }) => {
        setCart(cart)
        initPayment()
      },
    })
  }

  /**
   * Method to complete the checkout process. This is called when the user clicks the "Checkout" button.
   */
  const onPaymentCompleted = useCallback((callback?: (errorMessage: string | null) => void) => {
    complete(undefined, {
      onSuccess: ({ data }) => {
        resetCart()
        push(`/order/confirmed/${data.id}`)
        if (callback) callback(null) // No error
      },
      onError: (error) => {
        // Default error message
        let errorMessage = "An unknown error occurred during checkout. Please try again.";

        // Accessing the specific error details
        const errorDetails = (error as any)?.response?.data?.errors?.[0];
        if (errorDetails) {
          const { message, type, code } = errorDetails;

          if (code == "insufficient_inventory") {
            // Extract variant
            const variantIdMatch = message.match(/id: (\w+)/);
            const variantId = variantIdMatch ? variantIdMatch[1] : null;
            const variant = variantId ? cart?.items?.find(item => item.variant.id === variantId)?.variant : "a variant";
            // TODO: Pull variant inventory_quantity from the backend OR force-refresh the cart object before pulling variant inventory_quantity.
            // errorMessage = `Insufficient stock. Only ${variant.inventory_quantity}x ${variant.title} ${pluralize(variant.product.title, variant.inventory_quantity)} in stock. Please adjust your cart and try again.`
            errorMessage = `Insufficient stock for ${variant.title} ${pluralize(variant.product.title, 2)}. Refresh your browser and return to cart for instructions.`
          }
          else {
            errorMessage = `An error occurred during checkout. Error type: ${type}. Code: ${code}. Please try again.`
          }
        }
        console.error("Checkout error:", error)
        console.log("Error details",errorDetails)

        if (callback) callback(errorMessage) // Pass the error message to the callback
      }
    });
  }, [complete, resetCart, push]);

  return (
    <FormProvider {...methods}>
      <CheckoutContext.Provider
        value={{
          cart,
          shippingMethods,
          isLoading,
          readyToComplete,
          sameAsBilling,
          editAddresses,
          initPayment,
          setAddresses,
          setSavedAddress,
          setShippingOption,
          setPaymentSession,
          onPaymentCompleted,
        }}
      >
        <Wrapper paymentSession={cart?.payment_session}>{children}</Wrapper>
      </CheckoutContext.Provider>
    </FormProvider>
  )
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  const form = useFormContext<CheckoutFormValues>()
  if (context === null) {
    throw new Error(
      "useProductActionContext must be used within a ProductActionProvider"
    )
  }
  return { ...context, ...form }
}

/**
 * Method to map the fields of a potential customer and the cart to the checkout form values. Information is assigned with the following priority:
 * 1. Cart information
 * 2. Customer information
 * 3. Default values - null
 */
const mapFormValues = (
  getValues: (() => CheckoutFormValues) | null,
  customer?: Omit<Customer, "password_hash">,
  cart?: Omit<Cart, "refundable_amount" | "refunded_total">,
  currentCountry?: string
): CheckoutFormValues => {
  const customerShippingAddress = customer?.shipping_addresses?.[0]
  const customerBillingAddress = customer?.billing_address
  const currentValues = getValues ? getValues() : null

  return {
    shipping_address: {
      first_name:
        cart?.shipping_address?.first_name ||
        customerShippingAddress?.first_name ||
        currentValues?.shipping_address?.first_name ||
        "",
      last_name:
        cart?.shipping_address?.last_name ||
        customerShippingAddress?.last_name ||
        currentValues?.shipping_address?.last_name ||
        "",
      address_1:
        cart?.shipping_address?.address_1 ||
        customerShippingAddress?.address_1 ||
        currentValues?.shipping_address?.address_1 ||
        "",
      address_2:
        cart?.shipping_address?.address_2 ||
        customerShippingAddress?.address_2 ||
        currentValues?.shipping_address?.address_2 ||
        "",
      city:
        cart?.shipping_address?.city ||
        customerShippingAddress?.city ||
        currentValues?.shipping_address?.city ||
        "",
      country_code:
        currentCountry ||
        cart?.shipping_address?.country_code ||
        customerShippingAddress?.country_code ||
        currentValues?.shipping_address?.country_code ||
        "",
      province:
        cart?.shipping_address?.province ||
        customerShippingAddress?.province ||
        currentValues?.shipping_address?.province ||
        "",
      company:
        cart?.shipping_address?.company ||
        customerShippingAddress?.company ||
        currentValues?.shipping_address?.company ||
        "",
      postal_code:
        cart?.shipping_address?.postal_code ||
        customerShippingAddress?.postal_code ||
        currentValues?.shipping_address?.postal_code ||
        "",
      phone:
        cart?.shipping_address?.phone ||
        customerShippingAddress?.phone ||
        currentValues?.shipping_address?.phone ||
        "",
    },
    billing_address: {
      first_name:
        cart?.billing_address?.first_name ||
        customerBillingAddress?.first_name ||
        currentValues?.billing_address?.first_name ||
        "",
      last_name:
        cart?.billing_address?.last_name ||
        customerBillingAddress?.last_name ||
        currentValues?.billing_address?.last_name ||
        "",
      address_1:
        cart?.billing_address?.address_1 ||
        customerBillingAddress?.address_1 ||
        currentValues?.billing_address?.address_1 ||
        "",
      address_2:
        cart?.billing_address?.address_2 ||
        customerBillingAddress?.address_2 ||
        currentValues?.billing_address?.address_2 ||
        "",
      city:
        cart?.billing_address?.city ||
        customerBillingAddress?.city ||
        currentValues?.billing_address?.city ||
        "",
      country_code:
        cart?.billing_address?.country_code ||
        customerBillingAddress?.country_code ||
        currentValues?.billing_address?.country_code ||
        "",
      province:
        cart?.billing_address?.province ||
        customerBillingAddress?.province ||
        currentValues?.billing_address?.province ||
        "",
      company:
        cart?.billing_address?.company ||
        customerBillingAddress?.company ||
        currentValues?.billing_address?.company ||
        "",
      postal_code:
        cart?.billing_address?.postal_code ||
        customerBillingAddress?.postal_code ||
        currentValues?.billing_address?.postal_code ||
        "",
      phone:
        cart?.billing_address?.phone ||
        customerBillingAddress?.phone ||
        currentValues?.billing_address?.phone ||
        "",
    },
    email:
      cart?.email ||
      customer?.email ||
      currentValues?.email ||
      "",
  }
}
