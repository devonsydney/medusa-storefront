import { medusaClient } from "@lib/config"
import { Cart } from "@medusajs/medusa"
import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import Trash from "@modules/common/icons/trash"
import { useCart, useUpdateCart } from "medusa-react"
import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"

type DiscountFormValues = {
  discount_code: string
}

type DiscountCodeProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const { id, discounts, region } = cart
  const { mutate, isLoading } = useUpdateCart(id)
  const { setCart } = useCart()

  const { isLoading: mutationLoading, mutate: removeDiscount } = useMutation(
    (payload: { cartId: string; code: string }) => {
      return medusaClient.carts.deleteDiscount(payload.cartId, payload.code)
    }
  )

  const appliedDiscount = useMemo(() => {
    if (!discounts || !discounts.length) {
      return undefined
    }

    return `${discounts[0].code}`

  }, [discounts])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DiscountFormValues>({
    mode: "onSubmit",
  })

  const onApply = (data: DiscountFormValues) => {
    mutate(
      {
        discounts: [{ code: data.discount_code }],
      },
      {
        onSuccess: ({ cart }) => setCart(cart),
        onError: (error) => {
          setError(
            "discount_code",
            {
              message: (error as any).response?.data?.message || "An error occurred",
            },
            {
              shouldFocus: true,
            }
          )
        },
      }
    )
  }

  const onRemove = () => {
    removeDiscount(
      { cartId: id, code: discounts[0].code },
      {
        onSuccess: ({ cart }) => {
          setCart(cart)
        },
      }
    )
  }

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="mb-4">
        <h3 className="text-base-semi">Discount</h3>
      </div>
      <div className="text-small-regular">
        {appliedDiscount ? (
          <div className="flex items-center justify-between">
            <div>
              <span>Code: </span>
              <span className="font-semibold">{appliedDiscount}</span>
            </div>
            <div>
              <button
                className="flex items-center gap-x-2"
                onClick={onRemove}
                disabled={isLoading}
              >
                <Trash size={16} />
                <span className="sr-only">Remove gift card from order</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onApply)} className="w-full">
            <div className="grid grid-cols-[1fr_80px] gap-x-2">
              <Input
                label="Code"
                {...register("discount_code", {
                  required: "Code is required",
                })}
                errors={errors}
              />
              <div>
                <Button
                  className="!min-h-[0] h-[46px] w-[80px]"
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  Apply
                </Button>
              </div>
            </div>
            {errors.discount_code && (
              <div><span className="text-rose-500 w-full text-small-regular">
              {errors.discount_code.message}
              </span></div>)}
          </form>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
