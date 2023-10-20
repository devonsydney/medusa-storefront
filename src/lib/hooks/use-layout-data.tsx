import { medusaClient } from "@lib/config"
import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import { ProductCategory, ProductCollection, Region } from "@medusajs/medusa"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { useQuery, QueryFunctionContext } from "@tanstack/react-query"
import { formatAmount } from "medusa-react"
import { ProductPreviewType } from "types/global"
import { CalculatedVariant } from "types/medusa"

type LayoutCollection = {
  id: string
  title: string
  handle: string
}

type LayoutCategory = {
  id: string;
  name: string;
  handle: string;
  children?: LayoutCategory[];
  category_children?: LayoutCategory[];
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
  const nonEmptyCollections: ProductCollection[] = []
  const { collections } = await medusaClient.collections.list()

  for (const collection of collections) {
    const { products } = await medusaClient.products.list({
      collection_id: [collection.id],
      limit: 1, // Only need to fetch 1 product
    })

    if (products.length > 0) {
      nonEmptyCollections.push(collection)
    }
  }

  return nonEmptyCollections.map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
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
  // TODO: don't need the full parent data of each child inside this could reduce/remove it
  const response = await medusaClient.productCategories.list({
    include_descendants_tree: true,
  })

  const topLevelCategories = response.product_categories.filter(category => category.parent_category_id === null)

  const retrieveChildren = (category: ProductCategory, currentLevel: number): LayoutCategory => {
    const children = response.product_categories.filter(child => child.parent_category_id === category.id)

    const categoryData: LayoutCategory = {
      id: category.id,
      name: category.name,
      handle: category.handle,
      category_children: [],
    }

    if (currentLevel < levels) {
      categoryData.category_children = children.map(child => retrieveChildren(child, currentLevel + 1))
    }

    return categoryData
  }

  return topLevelCategories.map(category => retrieveChildren(category, 1))
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
