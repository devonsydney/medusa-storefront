import { useProductActions } from "@lib/context/product-context"
import useProductPrice from "@lib/hooks/use-product-price"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import Button from "@modules/common/components/button"
import OptionSelect from "@modules/products/components/option-select"
import clsx from "clsx"
import Link from "next/link"
import React, { useMemo } from "react"
import MarkdownContent from "@modules/common/components/markdown-content"
import pluralize from "pluralize"

type ProductActionsProps = {
  product: PricedProduct
  addToCartRef: React.RefObject<HTMLDivElement>
}

const ProductActions: React.FC<ProductActionsProps> = ({ product, addToCartRef }) => {
  const { updateOptions, addToCart, increaseQuantity, decreaseQuantity, options, inStock, variant, quantity } = useProductActions()
  const price = useProductPrice({ product, variantId: variant?.id })

  const selectedPrice = useMemo(() => {
    const { variantPrice, cheapestPrice } = price

    return variantPrice || cheapestPrice || null
  }, [price])
  const variantMap = useMemo(() => {
    return product.variants.reduce<Array<{ variant_id: string, variant_rank: number, inventory_quantity?: number }>>((acc, variant) => {
      if (variant.id && variant.variant_rank !== undefined && variant.variant_rank !== null) {
        acc.push({ variant_id: variant.id, variant_rank: variant.variant_rank, inventory_quantity: variant.inventory_quantity })
      }
      return acc
    }, [])
  }, [product.variants])

  return (
    <div className="flex flex-col gap-y-2">
      {product.collection && (
        <Link
          href={`/collections/${product.collection.handle}`}
          className="text-small-regular text-gray-700"
        >
          {product.collection.title}
        </Link>
      )}
      <h3 className="text-xl-regular">{product.title}</h3>

      <div className="text-base-regular"><b>{product.subtitle}</b></div>
      <div className="text-base-regular">{product.material}</div>
      <MarkdownContent markdown={product.description} forceFull={false} length={350} buffer={50}/>

      {product.variants.length > 1 && (
        <div className="mb-1 flex flex-col gap-y-6">
          {(product.options || []).map((option) => {
            return (
              <div key={option.id}>
                <OptionSelect
                  option={option}
                  current={options[option.id]}
                  updateOption={updateOptions}
                  title={option.title}
                  variantMap={variantMap}
                />
              </div>
            )
          })}
        </div>
      )}

      <div className="mb-6 text-base-regular flex items-center gap-x-2">
        <button
          onClick={decreaseQuantity}
          disabled={quantity === 1}
          className={clsx(
            "border-gray-200 border text-large-regular h-[40px] w-[40px] transition-all duration-200",
            { "border-gray-900": quantity === 1 },
            { "bg-gray-200": quantity === 1 }
          )}
        >
          -
        </button>
        <span className="text-large-semi" >{quantity} </span>
        <button
          onClick={increaseQuantity}
          disabled={quantity === Math.min(8, (variant?.inventory_quantity ?? 1 ) || 0)}
          className={clsx(
            "border-gray-200 border text-large-regular h-[40px] w-[40px] transition-all duration-200",
            { "border-gray-900": quantity === Math.min(8, (variant?.inventory_quantity ?? 1 ) || 0) },
            { "bg-gray-200": quantity === Math.min(8, (variant?.inventory_quantity ?? 1 ) || 0) }
          )}
        >
          +
        </button>
      </div>

      <div ref={addToCartRef} className="mb-4">
        {selectedPrice ? (
          <div className="flex flex-col text-gray-700">
            <span
              className={clsx("text-xl-semi", {
                "text-rose-600": selectedPrice.price_type === "sale",
              })}
            >
              {selectedPrice.calculated_price}
            </span>
            {selectedPrice.price_type === "sale" && (
              <>
                <p>
                  <span className="text-gray-500">Original: </span>
                  <span className="line-through">
                    {selectedPrice.original_price}
                  </span>
                </p>
                <span className="text-rose-600">
                  -{selectedPrice.percentage_diff}%
                </span>
              </>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>

      <Button onClick={addToCart}>
        {!inStock ? "Out of stock" : `Add ${quantity} ${pluralize(Object.values(options).join(', '), quantity)} to cart`}
      </Button>
    </div>
  )
}

export default ProductActions
