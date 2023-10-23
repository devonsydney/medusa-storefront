import React from "react"
import ProductPreview from "@modules/products/components/product-preview"
import Link from "next/link"
import UnderlineLink from "@modules/common/components/underline-link"
import { LayoutCategory } from "@lib/hooks/use-layout-data"
import { ProductPreviewType } from "types/global"

type CategoryTemplateProps = {
  handle: string | string[] | undefined
  categoryData: any
  categoryProducts: ProductPreviewType[] | undefined
}

const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  handle,
  categoryData,
  categoryProducts
}) => {
  return (
    <div className="content-container py-6">
      <div className="flex flex-row mb-8 text-2xl-semi gap-4">
        {categoryData.parent_name &&
          <span className="text-gray-500">
            <Link className="mr-4 hover:text-black" href={`/${categoryData.parent_handle}`}>
              {categoryData.parent_name}
            </Link>
            /
          </span>
        }
        <h1>{categoryData.name}</h1>
      </div>
      {categoryData.description && (
        <div className="mb-8 text-base-regular">
          <p>{categoryData.description}</p>
        </div>
      )}
      {categoryData.category_children && (
        <div className="mb-8 text-base-large">
          <ul className="grid grid-cols-1 gap-2">
            {categoryData.category_children?.map((c: LayoutCategory) => (
              <li key={c.id}>
                <UnderlineLink href={`/${handle?.[0]}/${c.handle}`}>{c.name}</UnderlineLink>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-4 gap-y-8">
        {categoryProducts?.map((p) => (
          <li key={p.id}>
            <ProductPreview {...p} />
          </li>
        ))}
      </ul>
      <div className="py-16 flex justify-center items-center text-small-regular text-gray-700">
        <span></span>
      </div>
    </div>
  )
}

export default CategoryTemplate
