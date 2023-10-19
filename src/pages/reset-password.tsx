import ResetPasswordTemplate from "@modules/account/templates/reset-password-template"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout } from "types/global"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"

const ResetPassword: NextPageWithLayout = () => {
  return (
    <>
      <Head title="Reset password" />
      <ResetPasswordTemplate />
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

ResetPassword.getLayout = (page) => {
  return <Layout>{page}</Layout>
}

export default ResetPassword
