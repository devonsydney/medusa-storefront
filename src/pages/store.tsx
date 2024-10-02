import { StoreGetProductsParams } from "@medusajs/medusa"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import InfiniteProducts from "@modules/products/components/infinite-products"
import RefinementList from "@modules/store/components/refinement-list"
import { useState } from "react"
import { NextPageWithLayout } from "types/global"
import { GetStaticProps } from "next"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchCollectionData, fetchRegionsData, fetchCategoryData, fetchAllProducts } from "@lib/hooks/use-layout-data"
import fs from 'fs'
import path from 'path'
import { ProductPreviewType } from "types/global"

const Store: NextPageWithLayout = () => {
  const [params, setParams] = useState<StoreGetProductsParams>({})
  
  return (
    <>
      <Head title="Store" description="Explore all of our products." />
      <div className="flex flex-col small:flex-row small:items-start py-6">
        {process.env.NEXT_PUBLIC_FF_FILTERS && <RefinementList refinementList={params} setRefinementList={setParams} /> }
        <InfiniteProducts refinementList={params}/>
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
  const queryClient = new QueryClient()

  // prefetch common params
  await queryClient.prefetchQuery(["regions"], () => fetchRegionsData())
  await queryClient.prefetchQuery(["navigation_collections"], () => fetchCollectionData())
  await queryClient.prefetchQuery(["navigation_categories"], () => fetchCategoryData(2))

  // grab regionId to use in query for products list
  const regions = queryClient.getQueryData<any>(["regions"])
  const region = regions[0] // TODO: switch to regionId, however currently region is needed for the formatting code

  // prefetch page-specific params
  await queryClient.prefetchQuery(["all_products"], () => fetchAllProducts(region,process.env.NEXT_PUBLIC_STORE_PRODUCTS_ORDER))

  // Generate JSON file
  const products = queryClient.getQueryData<ProductPreviewType[]>(["all_products"])
  if (products) {
    const formattedProducts = products.map(product => {
      const cheapestPrice = product.cheapestPrice?.calculated_price || 'N/A'
      const mostExpensivePrice = product.mostExpensivePrice?.calculated_price || 'N/A'

      let description = ''
      if (cheapestPrice === mostExpensivePrice) {
        description = `${cheapestPrice}`
      } else {
        description = `${cheapestPrice} - ${mostExpensivePrice}`
      }

      return {
        id: product.id,
        title: product.title,
        link: `${process.env.NEXT_PUBLIC_STORE_URL}/products/${product.handle}`,
        description: description,
        image_link: product.thumbnail || '',
      }
    })

    const jsonContent = JSON.stringify(formattedProducts, null, 2)
    const filePath = path.join(process.cwd(), 'public', 'products.json')
    fs.writeFileSync(filePath, jsonContent)
  }

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      notFound: false,
    },
  }
}

Store.getLayout = (page) => <Layout>{page}</Layout>

export default Store
