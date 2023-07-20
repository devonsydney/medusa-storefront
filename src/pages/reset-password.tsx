import ResetPasswordTemplate from "@modules/account/templates/reset-password-template"
import Head from "@modules/common/components/head"
import Layout from "@modules/layout/templates"
import { NextPageWithLayout } from "types/global"

const ResetPassword: NextPageWithLayout = () => {
  return (
    <>
      <Head title="Reset password" />
      <ResetPasswordTemplate />
    </>
  )
}

ResetPassword.getLayout = (page) => {
  return <Layout>{page}</Layout>
}

export default ResetPassword
