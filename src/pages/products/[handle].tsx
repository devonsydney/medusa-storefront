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
import { fetchCollectionData, fetchRegionsData, fetchCategoryData, fetchProduct, fetchRelatedProducts, useRegions } from "@lib/hooks/use-layout-data"

interface Params extends ParsedUrlQuery {
  handle: string
}

const ProductPage: NextPageWithLayout<PrefetchedPageProps> = ({ notFound }) => {
  const { query, isFallback, replace } = useRouter()
  const handle = typeof query.handle === "string" ? query.handle : ""

  // fetch regionId to format product
  const{ data: regions } = useRegions()
  const region = regions?.[0]
  const regionId = region?.id

  // get product statically (without inventory data)
  const { data: product, isError, isLoading, isSuccess } = useQuery(
    [`get_product`, handle],
    () => fetchProduct(regionId!, handle),
    {
      enabled: handle.length > 0,
      keepPreviousData: true,
    }
  )

  // grab product dynamically (with inventory)
  const { data: productWithInventory } = useQuery(
    [`product_inventory`, handle],
    () => fetchProduct(regionId!, handle, true),
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

  if (isFallback || isLoading || !product) {
    return <SkeletonProductPage />
  }

  if (isError) {
    replace("/404")
  }

  // use the static product initially and then replace with dynamic once received
  if (isSuccess) {
    return (
      <>
        <Head
          description={product.description}
          title={product.title}
          image={product.thumbnail}
        />
        <ProductTemplate product={productWithInventory || product} />
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
  const region = regions[0] // TODO: switch to regionId, however currently region is needed for the formatting code
  const regionId = region.id

  // prefetch page-specific params
  await queryClient.prefetchQuery([`get_product`, handle], () =>
    fetchProduct(regionId, handle)
  )

  await queryClient.prefetchQuery([`related-products-${handle}`, region, handle], () =>
    fetchRelatedProducts(region, handle)
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
