import { useCheckout } from "@lib/context/checkout-context"
import Button from "@modules/common/components/button"
import Spinner from "@modules/common/icons/spinner"
import ShippingAddress from "../shipping-address"

const Addresses = () => {
  const {
    editAddresses: { state: isEdit, toggle: setEdit },
    setAddresses,
    handleSubmit,
    cart,
  } = useCheckout()
  return (
    <div className="bg-white">
      <div className="text-xl-semi flex items-center gap-x-4 px-8 pb-6 pt-8">
        <div className="bg-gray-900 w-8 h-8 rounded-full text-white flex justify-center items-center text-sm">
          1
        </div>
        <h2>Shipping address</h2>
      </div>
      {isEdit ? (
        <div className="px-8 pb-8">
          <ShippingAddress />
          <Button
            className="max-w-[200px] mt-6"
            onClick={handleSubmit(setAddresses)}
          >
            Continue to delivery
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 px-8 py-6 text-small-regular">
          {cart && cart.shipping_address ? (
            <div className="flex items-start gap-x-8">
              <div className="bg-green-400 rounded-full min-w-[24px] h-6 flex items-center justify-center text-white text-small-regular">
                ✓
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex flex-col">
                  <span>
                    {cart.shipping_address.first_name}{" "}
                    {cart.shipping_address.last_name}
                  </span>
                  <span>
                    {cart.shipping_address.address_1}{" "}
                    {cart.shipping_address.address_2}
                  </span>
                  <span>
                    {cart.shipping_address.city},{" "}
                    {cart.shipping_address.province?.toUpperCase()}
                  </span>
                  <span>
                    {cart.shipping_address.postal_code},{" "}
                    {cart.shipping_address.country_code?.toUpperCase()}
                  </span>
                  <div className="mt-4 flex flex-col">
                    <span>{cart.email}</span>
                  </div>
                </div>
                <div>
                  <button onClick={setEdit}>Edit</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="">
              <Spinner />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Addresses
