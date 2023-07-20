import { medusaClient } from "@lib/config"
import { useAccount } from "@lib/context/account-context"
import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/router"
import { useState } from "react"
import { FieldValues, useForm } from "react-hook-form"

interface ResetPasswordCredentials extends FieldValues {
	email: string
	password: string
}

const ResetPassword = () => {
	const { refetchCustomer } = useAccount()
	type ResetStatus = "idle" | "error" | "success"
	const [resetStatus, setResetStatus] = useState<ResetStatus>("idle")
	const [resetError, setResetError] = useState<string | undefined>(undefined)
	const router = useRouter()

	const handleResetError = (e: Error) => {
		setResetError("An error occured. Please try again.")
		setResetStatus("error")
	}

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordCredentials>()

	const onSubmit = handleSubmit(async (credentials) => {
	  // Extract the token from the URL query parameters
    const { token } = router.query;
		if (typeof token === "string") {
			await medusaClient.customers
				.resetPassword({
					email: credentials.email,
					password: credentials.password,
					token: token
				})
				.then(({ customer }) => {
			    setResetStatus("success")
			    setTimeout(() => {
			        router.push("/account/login")
			    }, 2000) // 2 seconds delay
			    //router.replace(router.asPath.split("?")[0]); // replace the current URL removing the query param
				})
				.catch(handleResetError)
		} else {
	    handleResetError()
		}
	})
	return (
		<div className="max-w-sm flex flex-col items-center">
			{isSubmitting && (
				<div className="z-10 fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
					<Spinner size={24} />
				</div>
			)}
      <h1 className="text-large-semi uppercase mb-6">Reset Password</h1>
      <p className="text-center text-base-regular text-gray-700 mb-8">
        Enter your email address and a new password.
      </p>
      <form className="w-full" onSubmit={onSubmit}>
				<div className="flex flex-col w-full gap-y-2">
					<Input
						label="Email"
						{...register("email", { required: "Email is required" })}
						autoComplete="email"
						errors={errors}
					/>
					<Input
						label="New Password"
						{...register("password", {
							required: "Password is required",
						})}
						type="password"
						autoComplete="new-password"
						errors={errors}
					/>
				</div>
				{resetStatus === "error" && (
					<div>
						<span className="text-rose-500 w-full text-small-regular">
							{resetError}
						</span>
					</div>
				)}
				{resetStatus === "success" && (
					<div>
						<span className="text-rose-500 w-full text-small-regular">
							<b>Success!</b> Redirecting you to log in.
						</span>
					</div>
				)}
				<Button className="mt-6">Reset Password</Button>
    	</form>
		</div>
	)
}

export default ResetPassword
