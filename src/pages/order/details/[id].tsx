import { IS_BROWSER } from "@lib/constants"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import SkeletonOrderConfirmed from "@modules/skeletons/templates/skeleton-order-confirmed"
import { useRouter } from "next/router"
import { ReactElement  } from "react"
import { NextPageWithLayout } from "types/global"
import { useOrder } from "medusa-react"

const Confirmed: NextPageWithLayout = () => {
  const router = useRouter()
  const id = typeof router.query?.id === "string" ? router.query.id : ""
  const { order, isLoading, isSuccess, isError} = useOrder(id)

  if (isLoading) {
    return <SkeletonOrderConfirmed />
  }

  if (isError) {
    if (IS_BROWSER) {
      router.replace("/404")
    }

    return <SkeletonOrderConfirmed />
  }

  if (isSuccess && order) {
    return (
      <>
        <Head
          title={`Order #${order?.display_id}`}
          description="View your order"
        />
        <OrderDetailsTemplate order={order} />
      </>
    )
   }

  return <></>
}

Confirmed.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default Confirmed
