import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import ProductActions from "@modules/products/components/product-actions"
import React from "react"
import { Product } from "types/medusa"

type ProductInfoProps = {
  product: PricedProduct
  addToCartRef: React.RefObject<HTMLDivElement>
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product, addToCartRef }) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-12 lg:max-w-[500px] mx-auto">
        <div>
          <ProductActions product={product} addToCartRef={addToCartRef} />
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
