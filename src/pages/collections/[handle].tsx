import { medusaClient } from "@lib/config"
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
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"

interface Params extends ParsedUrlQuery {
  handle: string
}

const fetchCollection = async (handle: string) => {
  return await medusaClient.collections
    .list({ handle: [handle] })
    .then(({ collections }) => {
      const collection = collections[0];
      return {
        handle: collection.handle,
        title: collection.title,
      };
    });
}

export const fetchCollectionProducts = async ({
  pageParam = 0,
  handle,
  cartId,
}: {
  pageParam?: number
  handle: string
  cartId?: string
}) => {
  // First, retrieve the collection by its handle
  const { collections } = await medusaClient.collections.list({ handle: [handle] });
  const collection = collections[0];

  // Then, use the ID of the retrieved collection to list the products
  const { products, count, offset } = await medusaClient.products.list({
    limit: 12,
    offset: pageParam,
    collection_id: [collection.id],
    cart_id: cartId,
  })

  return {
    response: { products, count },
    nextPage: count > offset + 12 ? offset + 12 : null,
  }
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

  // prefetch page-specific params
  await queryClient.prefetchQuery(["get_collection", handle], () =>
    fetchCollection(handle)
  )

  await queryClient.prefetchInfiniteQuery(
    ["get_collection_products", handle],
    ({ pageParam }) => fetchCollectionProducts({ pageParam, handle }),
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
