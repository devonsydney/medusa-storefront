import React from "react"

type CategoryTemplateProps = {
  handle: string
  categoryData: any
}

const CategoryTemplate: React.FC<CategoryTemplateProps> = ({
  handle,
  categoryData
}) => {
  const isParentCategory = handle.length === 1;
  return (
    <div>
      {isParentCategory ? (
        // Render parent category page
        <div>
          This is the category page for {categoryData.name}. Here are the children categories:
          {categoryData?.category_children?.map((child) => (
            <div key={child.title}>
              <a href={`/${handle[0]}/${child.handle}`}>{child.name}</a>
            </div>
          ))}
          <div>
            Here is the category data:
            { JSON.stringify(categoryData) }
          </div>
        </div>
      ) : (
        // Render subcategory page
        <div>
          This is the subcategory page for {categoryData.name}.
          <div>
            Here is the category data:
            { JSON.stringify(categoryData) }
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryTemplate
