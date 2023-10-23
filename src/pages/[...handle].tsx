import { GetStaticPaths, GetStaticProps } from "next";
import { IS_BROWSER } from "@lib/constants"
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"
import { getCategoryHandles } from "@lib/util/get-category-handles"
import SkeletonCategoryPage from "@modules/skeletons/templates/skeleton-category-page"
import CategoryTemplate from "@modules/categories/templates"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout, PrefetchedPageProps } from "../types/global"

import { fetchCollectionData, fetchRegionsData, fetchCategoryData } from "@lib/hooks/use-layout-data"
import { ReactElement } from 'react';

interface Params extends ParsedUrlQuery {
  handle: string[] ;
}

const CategoryPage: NextPageWithLayout<PrefetchedPageProps> = ({
  notFound,
}) => {
  const router = useRouter()
  const handle = router.query.handle || undefined

  // fetch category data for page
  const { data, isError, isSuccess } = useQuery(
    ["navigation_categories"],
    () => fetchCategoryData(2)
  )
  const categoryData = data 
    ? (handle && handle.length === 1 && handle[0] !== undefined
        ? data.find((category) => category.handle === handle[0])
        : (handle && handle[1] !== undefined)
          ? data.find((category) => category.handle === handle[0])?.category_children?.find((child) => child.handle === handle[1])
          : undefined)
    : undefined;

  if (notFound) {
    if (IS_BROWSER) {
      router.replace("/404")
    }

    return <SkeletonCategoryPage />
  }

  if (isError) {
    router.replace("/404")
  }

  if (isSuccess) {
    return (
      <>
        <Head title={categoryData?.name ?? ''} description={`${categoryData?.name ?? ''} category`} />
        <CategoryTemplate handle={handle} categoryData={categoryData ?? { handle: '', name: '' }} />
      </>
    )
  }

  return <></>
}

CategoryPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const handles = await getCategoryHandles()
  const paths = handles.map((handle) => ({ params: { handle } }))

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const handle = context.params?.handle as string[];
  const queryClient = new QueryClient()
  
  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  /* TODO: add a search for handle in navigation_categories
  if (!handleExists) {
    return {
      props: {
        notFound: true,
      },
    }
  } */

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

export default CategoryPage
