import { RadioGroup } from "@headlessui/react"
import { ErrorMessage } from "@hookform/error-message"
import { useCheckout } from "@lib/context/checkout-context"
import { Cart } from "@medusajs/medusa"
import Radio from "@modules/common/components/radio"
import Spinner from "@modules/common/icons/spinner"
import clsx from "clsx"
import { formatAmount, useCart, useCartShippingOptions } from "medusa-react"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import StepContainer from "../step-container"

type ShippingOption = {
  value?: string
  label?: string
  price: string
}

type ShippingProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
}

type ShippingFormProps = {
  soId: string
}

const Shipping: React.FC<ShippingProps> = ({ cart }) => {
  const { addShippingMethod, setCart } = useCart()
  const {
    control,
    setError,
    formState: { errors },
  } = useForm<ShippingFormProps>({
    defaultValues: {
      soId: cart.shipping_methods?.[0]?.shipping_option_id,
    },
  })
  const [isLoading, setIsLoading] = useState(true);

  // Fetch shipping options
  const { shipping_options, refetch } = useCartShippingOptions(cart.id, {
    enabled: !!cart.id,
  })

  // Grab the Province from the cart
  const currentProvince = cart?.shipping_address?.province || "";

  // Memoized shipping method options
  const shippingMethods: ShippingOption[] = useMemo(() => {
    let methods: ShippingOption[] = [];
    if (shipping_options && cart?.region) {
      methods = shipping_options
        .filter((option) => {
          const provincesInOptionString = option.name?.match(/\[(.*?)\]/);
          if (!provincesInOptionString) return true;
          const provincesInOption = provincesInOptionString && provincesInOptionString[1]?.split(",").map(s => s.trim()) || [];
          return provincesInOption.includes(currentProvince);
        })
        .map((option) => ({
          value: option.id,
          label: option.name,
          price: formatAmount({
            amount: option.amount || 0,
            region: cart.region,
            includeTaxes: false
          }),
        }));
    }
    return methods;
  }, [shipping_options, cart, currentProvince]);

  // Any time the cart changes we need to ensure that we are displaying valid shipping options
  useEffect(() => {
    const refetchShipping = async () => {
      await refetch()
    }

    refetchShipping()
    setIsLoading(false)
  }, [cart, refetch])

  const submitShippingOption = (soId: string) => {
    addShippingMethod.mutate(
      { option_id: soId },
      {
        onSuccess: ({ cart }) => setCart(cart),
        onError: (error) =>
          setError(
            "soId",
            {
              type: "validate",
              message: (error as any).response?.data?.message || "An error occurred while adding shipping. Please try again.",
            },
            { shouldFocus: true }
          ),
      }
    )
  }

  const handleChange = (value: string, fn: (value: string) => void) => {
    submitShippingOption(value)
    fn(value)
  }

  const {
    sameAsBilling: { state: sameBilling },
  } = useCheckout()

  if (isLoading) {
    return null
  }

  return (
    <StepContainer
      index={2}
      title="Delivery"
      closedState={
        <div className="px-8 pb-8 text-small-regular">
          <p>Enter your address to see available delivery options.</p>
        </div>
      }
    >
      <Controller
        name="soId"
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <div>
              <RadioGroup
                value={value}
                onChange={(value: string) => handleChange(value, onChange)}
              >
                {shippingMethods && shippingMethods.length ? (
                  shippingMethods.map((option) => {
                    return (
                      <RadioGroup.Option
                        key={option.value}
                        value={option.value}
                        className={clsx(
                          "flex items-center justify-between text-small-regular cursor-pointer py-4 border-b border-gray-200 last:border-b-0 px-8",
                          {
                            "bg-gray-50": option.value === value,
                          }
                        )}
                      >
                        <div className="flex items-center gap-x-4">
                        <Radio checked={shippingMethods.length === 1 ? true : value === option.value} />
                          <span className="text-base-regular">
                            {option.label}
                          </span>
                        </div>
                        <span className="justify-self-end text-gray-700">
                          {option.price}
                        </span>
                      </RadioGroup.Option>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-8 text-gray-900">
                    <Spinner />
                  </div>
                )}
              </RadioGroup>
              <ErrorMessage
                errors={errors}
                name="soId"
                render={({ message }) => {
                  return (
                    <div className="pt-2 text-rose-500 text-small-regular">
                      <span>{message}</span>
                    </div>
                  )
                }}
              />
            </div>
          )
        }}
      />
    </StepContainer>
  )
}

export default Shipping
