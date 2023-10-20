import { medusaClient } from "@lib/config"
import { IS_BROWSER } from "@lib/constants"
import { getProductHandles } from "@lib/util/get-product-handles"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import ProductTemplate from "@modules/products/templates"
import SkeletonProductPage from "@modules/skeletons/templates/skeleton-product-page"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { ReactElement } from "react"
import { NextPageWithLayout, PrefetchedPageProps } from "types/global"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"
import { Region } from "@medusajs/medusa"
import { formatAmount } from "medusa-react"
import { getPercentageDiff } from "@lib/util/get-precentage-diff"

interface Params extends ParsedUrlQuery {
  handle: string
}

const fetchProduct = async (handle: string) => {
  return await medusaClient.products
    .list({ handle })
    .then(({ products }) => products[0])
}

export const fetchRelatedProducts = async (
region: Region
): Promise<ProductPreviewType[]> => {
  console.log(handle)
  const products = await medusaClient.products
    .list({
      region_id: region.id,
      is_giftcard: false,
      limit: 4, // TODO: make sure this doesn't pull the current product
    })
    .then(({ products }) => products)
    .catch((_) => [] as PricedProduct[])

  const productsStructured = products
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
  return productsStructured
}

const ProductPage: NextPageWithLayout<PrefetchedPageProps> = ({ notFound }) => {
  const { query, isFallback, replace } = useRouter()
  const handle = typeof query.handle === "string" ? query.handle : ""

  const { data, isError, isLoading, isSuccess } = useQuery(
    [`get_product`, handle],
    () => fetchProduct(handle),
    {
      enabled: handle.length > 0,
      keepPreviousData: true,
    }
  )

  if (notFound) {
    if (IS_BROWSER) {
      replace("/404")
    }

    return <SkeletonProductPage />
  }

  if (isFallback || isLoading || !data) {
    return <SkeletonProductPage />
  }

  if (isError) {
    replace("/404")
  }

  if (isSuccess) {
    return (
      <>
        <Head
          description={data.description}
          title={data.title}
          image={data.thumbnail}
        />
        <ProductTemplate product={data} />
      </>
    )
  }

  return <></>
}

ProductPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const handles = await getProductHandles()
  return {
    paths: handles.map((handle) => ({ params: { handle } })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const handle = context.params?.handle as string
  const queryClient = new QueryClient()

  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  // grab region to use in query for products list
  const regions = queryClient.getQueryData<any>(["regions"])
  const region = regions[0]

  // prefetch page-specific params
  await queryClient.prefetchQuery([`get_product`, handle], () =>
    fetchProduct(handle)
  )

  //console.log("from page ",`related-products-${handle}`,region)
  await queryClient.prefetchQuery([`related-products-${handle}`, region], () =>
    fetchRelatedProducts(region)
  )

  const queryData = await queryClient.getQueryData([`get_product`, handle])

  if (!queryData) {
    return {
      props: {
        notFound: true,
      },
    }
  }

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

export default ProductPage
