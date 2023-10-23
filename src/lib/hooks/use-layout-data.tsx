import { medusaClient } from "@lib/config"
import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { ProductCategory, ProductCollection, Region } from "@medusajs/medusa"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { useQuery } from "@tanstack/react-query"
import { formatAmount } from "medusa-react"
import { ProductPreviewType } from "types/global"
import { CalculatedVariant } from "types/medusa"

type LayoutCollection = {
  id: string
  title: string
  handle: string
  product_handles: (string | null | undefined)[]
}

export type LayoutCategory = {
  id: string
  name: string
  handle: string
  description: string
  product_handles: (string | null | undefined)[]
  children?: LayoutCategory[]
  category_children?: LayoutCategory[]
  parent_name: string | undefined
  parent_handle: string | undefined
};

export const fetchRegionsData = async (): Promise<Region[]> => {
  const { regions } = await medusaClient.regions.list()
  return regions
}

export const useRegions = () => {
  const queryResults = useQuery({
    queryFn: fetchRegionsData,
    queryKey: ["regions"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return queryResults
}

export const fetchCollectionData = async (): Promise<LayoutCollection[]> => {
  const navigationCollections: LayoutCollection[] = []
  const { collections } = await medusaClient.collections.list()

  for (const collection of collections) {
    const { products } = await medusaClient.products.list({
      collection_id: [collection.id],
    })
    const productsInCollection = products.map((product) => ({
      handle: product.handle,
    }))
    if (products.length > 0) {
      navigationCollections.push({
        ...collection,
        product_handles: productsInCollection.map((product) => product.handle),
    })
    }
  }

  return navigationCollections.map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
    product_handles: c.product_handles,
  }))
}

export const useNavigationCollections = () => {
  const queryResults = useQuery({
    queryFn: fetchCollectionData,
    queryKey: ["navigation_collections"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return queryResults
}

export const fetchCategoryData = async (levels: number = Infinity): Promise<LayoutCategory[]> => {
  const formattedCategories: LayoutCategory[] = []
  const { product_categories } = await medusaClient.productCategories.list({
    include_descendants_tree: true,
  })
  const topLevelCategories = product_categories.filter(category => category.parent_category_id === null)

  for (const topLevelCategory of topLevelCategories) {
    const productsInCategory = await medusaClient.products.list({
      category_id: [topLevelCategory.id],
    })
    const productHandlesInCategory = productsInCategory.products.map((product) => product.handle)
    const categoryData: LayoutCategory = {
      id: topLevelCategory.id,
      name: topLevelCategory.name,
      handle: topLevelCategory.handle,
      description: topLevelCategory.description,
      product_handles: productHandlesInCategory,
      category_children: [] as LayoutCategory[],
      parent_name: topLevelCategory.parent_category?.name,
      parent_handle: topLevelCategory.parent_category?.handle,

    }

    const stack: { category: ProductCategory; level: number }[] = [{ category: topLevelCategory, level: 1 }]

    while (stack.length > 0) {
      const { category, level } = stack.pop()!
      if (level < levels) {
        const childCategories = product_categories.filter(child => child.parent_category_id === category.id)
        const childCategoriesData: LayoutCategory[] = []

        for (const childCategory of childCategories) {
          const productsInChildCategory = await medusaClient.products.list({
            category_id: [childCategory.id],
          })
          const productHandlesInChildCategory = productsInChildCategory.products.map((product) => product.handle)
          const childCategoryData: LayoutCategory = {
            id: childCategory.id,
            name: childCategory.name,
            handle: childCategory.handle,
            description: childCategory.description,
            product_handles: productHandlesInChildCategory,
            category_children: [] as LayoutCategory[],
            parent_name: childCategory.parent_category?.name,
            parent_handle: childCategory.parent_category?.handle,
          }

          stack.push({ category: childCategory, level: level + 1 })
          childCategoriesData.push(childCategoryData)
        }
        categoryData!.category_children!.push(...childCategoriesData)
      }
    }
    formattedCategories.push(categoryData)
  }
  return formattedCategories
}

export const useNavigationCategories = (levels: number = Infinity) => {
  // wrapper function to be able to pass parameters to useQuery
  const fetchCategoryDataWithLevels = () => fetchCategoryData(levels);
  const queryResults = useQuery({
    queryFn: fetchCategoryDataWithLevels,
    queryKey: ["navigation_categories"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return queryResults
}

export const fetchFeaturedProducts = async (
  region: Region
): Promise<ProductPreviewType[]> => {
  const products = await medusaClient.products
    .list({
      region_id: region.id,
      is_giftcard: false,
      limit: 5,
    })
    .then(({ products }) => products)
    .catch((_) => [] as PricedProduct[])

  return formatProducts(products, region)
}

export const useFeaturedProductsQuery = () => {
  const{ data: regions } = useRegions()
  const region = regions?.[0]

  const queryResults = useQuery({
    queryFn: () => fetchFeaturedProducts(region!),
    queryKey: ["featured_products"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return queryResults
}

export const fetchAllProducts = async (
  region: Region
  ): Promise<ProductPreviewType[]> => {
    const products = await medusaClient.products
      .list({
        region_id: region.id,
        is_giftcard: false,
      })
      .then(({ products }) => products)
      .catch((_) => [] as PricedProduct[])

  return formatProducts(products, region)
}

export const useAllProductsQuery = () => {
  const{ data: regions } = useRegions()
  const region = regions?.[0]

  const queryResults = useQuery({
    queryFn: () => fetchAllProducts(region!),
    queryKey: ["all_products"],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return queryResults
}

export const formatProducts = (products: PricedProduct[], region: Region): ProductPreviewType[] => {
  return products
    .filter((p) => !!p.variants)
    .map((p) => {
      const variants = p.variants as unknown as CalculatedVariant[]

      const cheapestVariant = variants.reduce((acc, curr) => {
        if (acc.calculated_price > curr.calculated_price) {
          return curr
        }
        return acc
      }, variants[0])

      const mostExpensiveVariant = variants.reduce((acc, curr) => {
        if (acc.calculated_price < curr.calculated_price) {
          return curr
        }
        return acc
      }, variants[0])

      return {
        id: p.id!,
        title: p.title!,
        handle: p.handle!,
        thumbnail: p.thumbnail!,
        cheapestPrice: cheapestVariant
          ? {
              calculated_price: formatAmount({
                amount: cheapestVariant.calculated_price,
                region: region,
                includeTaxes: false,
              }),
              original_price: formatAmount({
                amount: cheapestVariant.original_price,
                region: region,
                includeTaxes: false,
              }),
              difference: getPercentageDiff(
                cheapestVariant.original_price,
                cheapestVariant.calculated_price
              ),
              price_type: cheapestVariant.calculated_price_type,
            }
          : {
              calculated_price: "N/A",
              original_price: "N/A",
              difference: "N/A",
              price_type: "default",
            },
        mostExpensivePrice: mostExpensiveVariant
          ? {
              calculated_price: formatAmount({
                amount: mostExpensiveVariant.calculated_price,
                region: region,
                includeTaxes: false,
              }),
              original_price: formatAmount({
                amount: mostExpensiveVariant.original_price,
                region: region,
                includeTaxes: false,
              }),
              difference: getPercentageDiff(
                mostExpensiveVariant.original_price,
                mostExpensiveVariant.calculated_price
              ),
              price_type: mostExpensiveVariant.calculated_price_type,
            }
          : {
              calculated_price: "N/A",
              original_price: "N/A",
              difference: "N/A",
              price_type: "default",
            },
      }
    })
}
