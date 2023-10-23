import { medusaClient } from "@lib/config"
import { GetStaticPaths, GetStaticProps } from "next";
import { IS_BROWSER } from "@lib/constants"
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { Region } from "@medusajs/medusa"
import { dehydrate, QueryClient, useQuery } from "@tanstack/react-query"
import { getCategoryHandles } from "@lib/util/get-category-handles"
import SkeletonCategoryPage from "@modules/skeletons/templates/skeleton-category-page"
import CategoryTemplate from "@modules/categories/templates"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout, PrefetchedPageProps } from "../types/global"
import { useRegions, fetchCollectionData, fetchRegionsData, fetchCategoryData, formatProducts } from "@lib/hooks/use-layout-data"
import { ReactElement } from 'react';
import { ProductPreviewType } from "types/global"


interface Params extends ParsedUrlQuery {
  handle: string[] ;
}

export const fetchCategoryProducts = async (
  region: Region,
  handle: string,
  ): Promise<ProductPreviewType[]> => {
  // retrieve the category by its handle
  const categories = await medusaClient.productCategories.list({ handle })
  const category = categories.product_categories[0];
  const categoryId = category.id
  
  // use the ID of the retrieved category to list the products
  const { products } = await medusaClient.products.list({
    category_id: [categoryId],
    region_id: region.id,
  })

  return formatProducts(products, region)
}

const CategoryPage: NextPageWithLayout<PrefetchedPageProps> = ({
  notFound,
}) => {
  const router = useRouter()
  const handles = router.query.handle || undefined
  const handle = handles?.[handles.length - 1]

  // fetch regions to format products
  const{ data: regions } = useRegions()
  const region = regions?.[0]
  
  // fetch category data for page
  const { data: categories, isError, isSuccess } = useQuery(
    ["navigation_categories"],
    () => fetchCategoryData(2)
  )
  const categoryData = categories 
    ? (handles && handles.length === 1 && handles[0] !== undefined
        ? categories.find((category) => category.handle === handles[0])
        : (handles && handles[1] !== undefined)
          ? categories.find((category) => category.handle === handles[0])?.category_children?.find((child) => child.handle === handles[1])
          : undefined)
    : undefined;
  
  const { data: categoryProducts } = useQuery(
    [`category-products-${handle}`, region, handle],
    () => fetchCategoryProducts(region!, handle!)
  )
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
        <CategoryTemplate
          handle={handles}
          categoryData={categoryData ?? { handle: '', name: '' }}
          categoryProducts={categoryProducts}
        />
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
  const handles = context.params?.handle as string[]
  const handle = handles[handles.length - 1]
  const queryClient = new QueryClient()
  
  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  // grab regionId to use in query for products list
  const regions = queryClient.getQueryData<any>(["regions"])
  const region = regions[0] // TODO: switch to regionId, however currently region is needed for the formatting code

  // prefetch page-specific params
  await queryClient.prefetchQuery([`category-products-${handle}`, region, handle], () =>
    fetchCategoryProducts(region, handle)
  )

  // if no collection found, return not found
  const queryData = await queryClient.getQueryData([`category-products-${handle}`, region, handle])
  if (!queryData) {
    console.log("products not found")
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

export default CategoryPage
