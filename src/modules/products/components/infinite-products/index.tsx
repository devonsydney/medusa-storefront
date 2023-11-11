import { useAllProductsQuery } from "@lib/hooks/use-layout-data"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"
import { StoreGetProductsParams } from "@medusajs/medusa";

type InfiniteProductsProps = {
  refinementList: StoreGetProductsParams
}

const InfiniteProducts = ({ refinementList }: InfiniteProductsProps) => {
  const { data: products } = useAllProductsQuery()
  const { data: collections } = useNavigationCollections()
  const { data: categories } = useNavigationCategories()

  // initialise output to all products
  let filteredProducts = products
  // filter products based on collections and categories selected in refinement list
  if (
    refinementList &&
    (
      (refinementList.collection_id && refinementList.collection_id.length > 0) ||
      (refinementList.category_id && refinementList.category_id.length > 0)
    )
  ) {
    filteredProducts = products?.filter((product) => {
      // initialise
      let inSelectedCollections = true
      let inSelectedCategories = true
      let inSelectedChildCategories = true
      // check if product is in selected collection
      if (refinementList.collection_id && refinementList.collection_id.length > 0) {
        inSelectedCollections = refinementList.collection_id?.some((collectionId) =>
          collections?.some((collection) =>
            collection.id === collectionId && collection.product_handles.includes(product.handle)
          )
        )
      }
      // check if product is in selected category (top level)
      if (refinementList.category_id && refinementList.category_id.length > 0) {
        inSelectedCategories = refinementList.category_id?.some((categoryId) =>
          categories?.some((category) =>
            category.id === categoryId && category.product_handles.includes(product.handle)
          )
        )
      }
      // check if product is in selected category (child level)
      if (refinementList.category_id && refinementList.category_id.length > 0) {
        inSelectedChildCategories = refinementList.category_id?.some((categoryId) =>
          categories?.some((category) =>
            category.category_children?.some((childCategory) =>
              childCategory.id === categoryId && childCategory.product_handles.includes(product.handle)
            )
          )
        )
      }
      // return the product if it's in both selected collections and top/child categories
      return inSelectedCollections && (inSelectedCategories || inSelectedChildCategories)
    });
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
