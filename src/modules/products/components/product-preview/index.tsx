import clsx from "clsx"
import Link from "next/link"
import { ProductPreviewType } from "types/global"
import Thumbnail from "../thumbnail"

const ProductPreview = ({
  title,
  handle,
  thumbnail,
  cheapestPrice,
  mostExpensivePrice,
}: ProductPreviewType) => {
  return (
    <Link href={`/products/${handle}`}>
      <div>
        <Thumbnail thumbnail={thumbnail} size="full" />
        <div className="text-base-regular mt-2">
          <span>{title}</span>
          <div className="flex flex-col items-start gap-y-1 mt-1">
            {cheapestPrice ? (
              <>
                {cheapestPrice && mostExpensivePrice && (
                  <span
                  className={clsx("font-semibold", {
                    "text-rose-500": cheapestPrice.price_type === "sale",
                  })}
                  >
                    {cheapestPrice.calculated_price}
                    {cheapestPrice.calculated_price !== mostExpensivePrice.calculated_price && 
                      ` - ${mostExpensivePrice.calculated_price}`}
                  </span>
                )}
                {cheapestPrice.price_type === "sale" && mostExpensivePrice && (
                  <span className="line-through text-gray-500">
                    Original: {cheapestPrice.original_price}
                    {cheapestPrice.original_price !== mostExpensivePrice.original_price && 
                        ` - ${mostExpensivePrice.original_price}`}
                  </span>
                )}
              </>
            ) : (
              <div className="w-20 h-6 animate-pulse bg-gray-100"></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductPreview
