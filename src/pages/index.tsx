import Head from "@modules/common/components/head"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Layout from "@modules/layout/templates"
import { ReactElement } from "react"
import { NextPageWithLayout } from "types/global"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchFeaturedProducts } from "@lib/hooks/use-layout-data"

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Head
        title="Home"
        description={process.env.NEXT_PUBLIC_STORE_DESCRIPTION}
      />
      <Hero />
      <FeaturedProducts />
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const queryClient = new QueryClient()

  // prefetch common params
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())  

  // grab regionId to use in query for products list
  const regions = queryClient.getQueryData<any>(["regions"])
  const regionId = regions[0].id

  // prefetch page-specific params
  await queryClient.prefetchQuery(["featured_products"], () => fetchFeaturedProducts(regionId))

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

Home.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default Home
