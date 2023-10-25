import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout } from "types/global"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"
import MarkdownContent from "@modules/common/components/markdown-content"
import { importFile } from "@lib/util/import-file"

const FAQ: NextPageWithLayout = ({}) => {
  
  const filePath = process.env.NEXT_PUBLIC_FAQ_PATH

  const { data: markdown } = useQuery(
    ["faq", filePath],
    () => importFile(filePath),
    {
      enabled: true,
      staleTime: Infinity,
    }
  )

  return (
    <>
      <Head title="FAQ" description="Frequently asked questions." />
      <div className="flex justify-center py-4">
        <div className="max-w-4xl mx-auto mb-6">
          <div></div>
          <MarkdownContent markdown={markdown} />
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const queryClient = new QueryClient()

  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  // prefetch page-specific params
  const filePath = process.env.NEXT_PUBLIC_FAQ_PATH
  await queryClient.prefetchQuery(["faq", filePath], () => importFile(filePath))

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

FAQ.getLayout = (page) => <Layout>{page}</Layout>

export default FAQ
