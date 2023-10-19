import CheckoutTemplate from "@modules/checkout/templates"
import Head from "@modules/common/components/head"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"

const Checkout = () => {
  return (
    <>
      <Head title="Checkout" />
      <CheckoutTemplate />
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const queryClient = new QueryClient()

  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

export default Checkout
