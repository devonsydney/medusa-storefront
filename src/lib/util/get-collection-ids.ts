import { medusaClient } from "../config"

export const getCollectionIds = async (): Promise<string[]> => {
  const data = await medusaClient.collections
    .list({ limit: 100 })
    .then(async ({ collections }) => {
      const nonEmptyCollectionIds: string[] = []

      for (const { id } of collections) {
        const { products } = await medusaClient.products.list({
          collection_id: [id],
          limit: 1, // Only need to fetch 1 product
          sales_channel_id: [process.env.NEXT_PUBLIC_SALES_CHANNEL_ID!]

        })

        if (products.length > 0) {
          nonEmptyCollectionIds.push(id)
        }
      }

      return nonEmptyCollectionIds
    })

  return data
}
