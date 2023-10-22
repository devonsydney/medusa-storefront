import { useAllProductsQuery } from "@lib/hooks/use-layout-data"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"

const InfiniteProducts = ({ refinementList }) => {
  const { data: products } = useAllProductsQuery()
  const { data: collections } = useNavigationCollections()

  // initialise output to all products
  let filteredProducts = products
  // filter products based on collections selected in refinement list
  if (refinementList && refinementList.collection_id && refinementList.collection_id.length > 0) {
    filteredProducts = products?.filter((product) => {
      const inSelectedCollections = refinementList.collection_id.some((collectionId) =>
        collections.some((collection) =>
          collection.id === collectionId && collection.product_handles.includes(product.handle)
        )
      )
      return inSelectedCollections
    })
  }

  return (
    <div className="flex-1 content-container">
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 large:grid-cols-5 gap-x-4 gap-y-8 flex-1">
        {filteredProducts
          ? filteredProducts.map((product) => (
              <li key={product.id}>
                <ProductPreview {...product} />
              </li>
            ))
          : Array.from(Array(5).keys()).map((i) => (
              <li key={i}>
                <SkeletonProductPreview />
              </li>
            ))}
      </ul>
    </div>
  )
}

export default InfiniteProducts
