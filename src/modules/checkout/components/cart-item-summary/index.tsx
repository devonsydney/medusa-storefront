import { Cart } from "@medusajs/medusa"
import { formatAmount } from "medusa-react"
import React from "react"

type CartItemSummaryProps = {
  cart: Omit<Cart, "refundable_amount" | "refunded_total">
}

const CartItemSummary: React.FC<CartItemSummaryProps> = ({ cart }) => {
  
  const getAmount = (amount: number | null | undefined) => {
    return formatAmount({
      amount: amount || 0,
      region: cart.region,
      includeTaxes: false,
    })
  }
  
  return (
    <div>
      {cart.items.map((item) => (
        <div key={item.id} className="flex items-center justify-between text-small-regular text-gray-700">
            <span>{`${item.quantity}x ${item.title}`}</span>
            <span>{getAmount(item.subtotal)}</span>
        </div>
      ))}
    </div>
  )
}

export default CartItemSummary
