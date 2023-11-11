import { medusaClient } from "../config"

export const getCollectionHandles = async (): Promise<string[]> => {
  const data = await medusaClient.collections
    .list({ limit: 100 })
    .then(async ({ collections }) => {
      const nonEmptyCollectionHandles: string[] = []

      for (const { id, handle } of collections) {
        const { products } = await medusaClient.products.list({
          collection_id: [id],
          limit: 1, // Only need to fetch 1 product
        })

        if (products.length > 0) {
          nonEmptyCollectionHandles.push(handle)
        }
      }

      return nonEmptyCollectionHandles
    })

  return data
}
