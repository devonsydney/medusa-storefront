import { StoreGetProductsParams } from "@medusajs/medusa"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"
import { ChangeEvent } from "react"

type RefinementListProps = {
  refinementList: StoreGetProductsParams
  setRefinementList: (refinementList: StoreGetProductsParams) => void
}

const RefinementList = ({
  refinementList,
  setRefinementList,
}: RefinementListProps) => {
  const { data: collections } = useNavigationCollections()
  const { data: categories } = useNavigationCategories()

  const handleCollectionChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { checked } = e.target

    const collectionIds = refinementList.collection_id || []

    const exists = collectionIds.includes(id)

    if (checked && !exists) {
      setRefinementList({
        ...refinementList,
        collection_id: [...collectionIds, id],
      })

      return
    }

    if (!checked && exists) {
      setRefinementList({
        ...refinementList,
        collection_id: collectionIds.filter((c) => c !== id),
      })

      return
    }

    return
  }

  const handleCategoryChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const { checked } = e.target

    const categoryIds = refinementList.category_id || []

    const exists = categoryIds.includes(id)

    if (checked && !exists) {
      setRefinementList({
        ...refinementList,
        category_id: [...categoryIds, id],
      })

      return
    }

    if (!checked && exists) {
      setRefinementList({
        ...refinementList,
        category_id: categoryIds.filter((c) => c !== id),
      })

      return
    }

    return
  }

  return (
    <div>
      <div className="px-8 py-4  small:pr-0 small:pl-8 small:min-w-[250px]">
        <div className="flex gap-x-3 small:flex-col small:gap-y-3">
          <span className="text-base-semi">Collections</span>
          <ul className="text-base-regular flex items-center gap-x-4 small:grid small:grid-cols-1 small:gap-y-2">
            {collections?.map((c) => (
              <li key={c.id}>
                <label className="flex items-center gap-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={refinementList.collection_id?.includes(
                      c.id
                    )}
                    onChange={(e) => handleCollectionChange(e, c.id)}
                    className="accent-amber-200"
                  />
                  {c.title}
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-1"></div>
        </div>
        <div className="flex gap-x-3 small:flex-col small:gap-y-3">
          <span className="text-base-semi">Categories</span>
          <ul className="text-base-regular flex gap-x-4 small:grid small:grid-cols-1 small:gap-y-2">
            {categories?.map((topLevelCategory) => (
              <li key={topLevelCategory.id}>
                <label className="flex items-center gap-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={refinementList.category_id?.includes(
                      topLevelCategory.id
                    )}
                    onChange={(e) => handleCategoryChange(e, topLevelCategory.id)}
                    className="accent-amber-200"
                  />
                  {topLevelCategory.name}
                </label>
                {topLevelCategory.category_children && topLevelCategory.category_children.length > 0 && (
                  <ul className="text-base-regular flex flex-col items-start gap-y-2 ml-6">
                    {topLevelCategory.category_children.map((childCategory) => (
                      <li key={childCategory.id}>
                        <label className="flex items-center gap-x-2">
                          <input
                            type="checkbox"
                            defaultChecked={refinementList.category_id?.includes(childCategory.id)}
                            onChange={(e) => handleCategoryChange(e, childCategory.id)}
                            className="accent-amber-200"
                          />
                          {childCategory.name}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-1"></div>
        </div>
      </div>
    </div>
  )
}

export default RefinementList
