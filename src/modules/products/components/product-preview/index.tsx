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
          <div className="flex items-center gap-x-2 mt-1">
            {cheapestPrice ? (
              <>
                {cheapestPrice.price_type === "sale" && (
                  <span className="line-through text-gray-500">
                    {cheapestPrice.original_price}
                  </span>
                )}
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
