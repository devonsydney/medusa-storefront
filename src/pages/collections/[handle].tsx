import { IS_BROWSER } from "@lib/constants"
import { getCollectionHandles } from "@lib/util/get-collection-handles"
import CollectionTemplate from "@modules/collections/templates"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import SkeletonCollectionPage from "@modules/skeletons/templates/skeleton-collection-page"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import { ParsedUrlQuery } from "querystring"
import { ReactElement } from "react"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"
import { NextPageWithLayout, PrefetchedPageProps } from "../../types/global"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData, fetchCollection, fetchCollectionProducts } from "@lib/hooks/use-layout-data"

interface Params extends ParsedUrlQuery {
  handle: string
}

const CollectionPage: NextPageWithLayout<PrefetchedPageProps> = ({
  notFound,
}) => {
  const { query, isFallback, replace } = useRouter()
  const handle = typeof query.handle === "string" ? query.handle : ""

  const { data, isError, isSuccess, isLoading } = useQuery(
    ["get_collection", handle],
    () => fetchCollection(handle)
  )

  if (notFound) {
    if (IS_BROWSER) {
      replace("/404")
    }

    return <SkeletonCollectionPage />
  }

  if (isError) {
    replace("/404")
  }

  if (isFallback || isLoading || !data) {
    return <SkeletonCollectionPage />
  }

  if (isSuccess) {
    return (
      <>
        <Head title={data.title} description={`${data.title} collection`} />
        <CollectionTemplate collection={data} />
      </>
    )
  }

  return <></>
}

CollectionPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const handles = await getCollectionHandles()
  const paths = handles.map((handle) => ({ params: { handle } }))

  return {
    paths: paths,
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

  // prefetch page-specific params
  await queryClient.prefetchQuery(["get_collection", handle], () =>
    fetchCollection(handle)
  )

  // grab regionId to use in query for products list
  const regions = queryClient.getQueryData<any>(["regions"])
  const regionId = regions[0].id

  // prefetch page-specific params
  await queryClient.prefetchInfiniteQuery(
    ["get_collection_products", handle],
    ({ pageParam }) => fetchCollectionProducts({ pageParam, handle, regionId }),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  )

  // if no collection found, return not found
  const queryData = await queryClient.getQueryData([`get_collection`, handle])

  if (!queryData) {
    return {
      props: {
        notFound: true,
      },
    }
  }

  return {
    props: {
      // Work around see – https://github.com/TanStack/query/issues/1458#issuecomment-747716357
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

export default CollectionPage
