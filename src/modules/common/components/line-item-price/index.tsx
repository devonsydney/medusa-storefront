import { LineItem, Region } from "@medusajs/medusa"
import clsx from "clsx"
import { formatAmount } from "medusa-react"
import { CalculatedVariant } from "types/medusa"

type LineItemPriceProps = {
  item: Omit<LineItem, "beforeInsert">
  region: Region
  style?: "default" | "tight"
}

const LineItemPrice = ({
  item,
  region,
  style = "default",
}: LineItemPriceProps) => {
  const originalPrice =
    (item.variant as CalculatedVariant).original_price * item.quantity
  const hasReducedPrice = (item.subtotal || 0) < originalPrice

  return (
    <div className="flex flex-col text-gray-700 text-right">
      <span
        className={clsx("text-base-regular", {
          "text-rose-600": hasReducedPrice,
        })}
      >
        {formatAmount({
          amount: item.subtotal || 0,
          region: region,
          includeTaxes: false,
        })}
      </span>
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-gray-500">Original: </span>
            )}
            <span className="line-through">
              {formatAmount({
                amount: originalPrice,
                region: region,
                includeTaxes: false,
              })}
            </span>
          </p>
        </>
      )}
    </div>
  )
}

export default LineItemPrice
