import { useRouter } from "next/router"
import ResetPassword from "../components/reset-password"

const ResetPasswordTemplate = () => {
  const router = useRouter()

  return (
    <div className="w-full flex justify-center py-24">
      <ResetPassword />
    </div>
  )
}

export default ResetPasswordTemplate
