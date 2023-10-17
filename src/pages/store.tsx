import { StoreGetProductsParams } from "@medusajs/medusa"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import InfiniteProducts from "@modules/products/components/infinite-products"
import RefinementList from "@modules/store/components/refinement-list"
import { useState } from "react"
import { NextPageWithLayout } from "types/global"
import { fetchProductsList } from "@lib/data"
import { GetStaticPaths, GetStaticProps } from "next"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"

const Store: NextPageWithLayout = () => {
  const [params, setParams] = useState<StoreGetProductsParams>({})

  return (
    <>
      <Head title="Store" description="Explore all of our products." />
      <div className="flex flex-col small:flex-row small:items-start py-6">
        <RefinementList refinementList={params} setRefinementList={setParams} />
        <InfiniteProducts params={params} />
      </div>
    </>
  )
}

// export const getStaticPaths: GetStaticPaths<Params> = async () => {
//   const handles = await getProductHandles()
//   return {
//     paths: handles.map((handle) => ({ params: { handle } })),
//     fallback: true,
//   }
// }

export const getStaticProps: GetStaticProps = async (context) => {
  const handle = context.params?.handle as string
  const queryClient = new QueryClient()

  const queryParams: StoreGetProductsParams = {
    limit: 12,
    offset: 0,
    order: "title",
    is_giftcard: false,
  }

  await queryClient.prefetchInfiniteQuery(
    ["get_collection_products", queryParams],
    ({ pageParam }) => fetchProductsList({ pageParam, queryParams }),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  )

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

Store.getLayout = (page) => <Layout>{page}</Layout>

export default Store
