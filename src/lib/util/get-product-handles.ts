import { medusaClient } from "../config"

export const getProductHandles = async (): Promise<string[]> => {
  const products = await medusaClient.products
    .list({ limit: 100 })
    // TODO: loop query so it will work beyond 100 products
    .then(({ products }) => products)

  const handles: string[] = []
  
  for (const product of products) {
    if (product.handle) {
      handles.push(product.handle)
    }
  }

  return handles
}
