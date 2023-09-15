import { medusaClient } from "@lib/config";
import { LOGIN_VIEW, useAccount } from "@lib/context/account-context";
import Button from "@modules/common/components/button";
import Input from "@modules/common/components/input";
import Spinner from "@modules/common/icons/spinner"
import { useRouter } from "next/router";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

interface ForgotPasswordCredentials extends FieldValues {
  email: string
}

const ForgotPassword = () => {
  const { loginView, refetchCustomer } = useAccount()
  const [_, setCurrentView] = loginView
  type FormStatus = "idle" | "error" | "success"
  const [authStatus, setAuthStatus] = useState<FormStatus>("idle")
  const [authError, setAuthError] = useState<string | undefined>(undefined)
  const router = useRouter()

  const handleError = () => {
    setAuthError("An error occurred. Please try again.")
    setAuthStatus("error")
  }

  const handleSuccess = () => {
    setAuthError(undefined)
    setAuthStatus("success")
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordCredentials>();

  const onSubmit = handleSubmit(async (credentials) => {
    await medusaClient.customers
      .generatePasswordToken({ email: credentials.email })
      .then(handleSuccess)
      .catch(handleError)
  })

  return (
    <div className="max-w-sm flex flex-col items-center mt-12">
      {isSubmitting && (
        <div className="z-10 fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <Spinner size={24} />
        </div>
      )}
      <h1 className="text-large-semi uppercase mb-6">Forgot Password</h1>
      <p className="text-center text-base-regular text-gray-700 mb-8">
        Enter your email address to reset your password.
      </p>
      <form className="w-full" onSubmit={onSubmit}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            {...register("email", { required: "Email is required" })}
            autoComplete="email"
            errors={errors}
          />
        </div>
        {authStatus === "error" && (
          <div>
            <span className="text-rose-500 w-full text-small-regular">
              {authError}
            </span>
          </div>
        )}
        {authStatus === "success" && (
          <div>
            <span className="text-rose-500 w-full text-small-regular">
              If you are registered, check your email for a password reset link.
              This link will expire in 15 minutes.
            </span>
          </div>
        )}
        <Button className="mt-6">Reset Password</Button>
      </form>
      <span className="text-center text-gray-700 text-small-regular mt-6">
        Remembered your password?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign In
        </button>
      </span>
    </div>
  );
};

export default ForgotPassword;
