import { useQuery } from "@tanstack/react-query"
import ProductPreview from "../product-preview"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { useRegions } from "@lib/hooks/use-layout-data"
import { fetchRelatedProducts } from "@pages/products/[handle]"

type RelatedProductsProps = {
  product: PricedProduct
}

const RelatedProducts = ({ product }: RelatedProductsProps) => {
  const { data: regions } = useRegions()
  const region = regions?.[0]

  const { data } = useQuery({
    queryFn: () => fetchRelatedProducts(region!, product.handle!),
    queryKey: [`related-products-${product.handle}`, region, product.handle],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Related products
        </span>
        <p className="text-2xl-regular text-gray-900 max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8">
        {data
          ? data.map((product) => (
              <li key={product.id}>
                <ProductPreview {...product} />
              </li>
            ))
          : Array.from(Array(4).keys()).map((i) => (
              <li key={i}>
                <SkeletonProductPreview />
              </li>
            ))}
      </ul>
    </div>
  )
}

export default RelatedProducts
