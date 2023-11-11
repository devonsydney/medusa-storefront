import { medusaClient } from "../config"

export const getCategoryHandles = async (): Promise<string[][]> => {
  const data = await medusaClient.productCategories
    .list({ limit: 100 })
    .then(async ({ product_categories }) => {
      const handles: string[][] = []

      for (const { id, handle, category_children, parent_category_id } of product_categories) {
        // Add the parent category handle
        if (parent_category_id == null) {
          handles.push([handle])
          // Add the handle for the first child, if available
          for (const child of category_children) {
            handles.push([handle, child.handle])
          }
        }
      }
      return handles
    })
  return data
}
