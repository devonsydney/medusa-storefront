import LoginTemplate from "@modules/account/templates/login-template"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout } from "types/global"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"

const Login: NextPageWithLayout = () => {
  return (
    <>
      <Head title="Sign in" description={`Sign in to your ${process.env.NEXT_PUBLIC_STORE_NAME} account.`} />
      <LoginTemplate />
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

Login.getLayout = (page) => {
  return <Layout>{page}</Layout>
}

export default Login
