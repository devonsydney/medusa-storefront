import { useMobileMenu } from "@lib/context/mobile-menu-context"
import { useStore } from "@lib/context/store-context"
import useCountryOptions from "@lib/hooks/use-country-options"
import ChevronDown from "@modules/common/icons/chevron-down"
import Search from "@modules/common/icons/search"
import X from "@modules/common/icons/x"
import { useMeCustomer } from "medusa-react"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"
import Link from "next/link"
import ReactCountryFlag from "react-country-flag"
import Image from "next/image"

const MainMenu = () => {
  const { data: collections } = useNavigationCollections()
  const { data: categories } = useNavigationCategories()
  const { customer } = useMeCustomer()
  const { countryCode } = useStore()

  const countries = useCountryOptions()

  const {
    close,
    screen: [_, setScreen],
  } = useMobileMenu()

  const setScreenCountry = () => setScreen("country")
  const setScreenSearch = () => setScreen("search")

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between w-full border-b border-gray-200 py-4 px-6">
        <div className="flex-1 basis-0">
          {process.env.NEXT_PUBLIC_FF_COUNTRIES ? (
            <button
              className="flex items-center gap-x-2"
              onClick={setScreenCountry}
            >
              <ReactCountryFlag countryCode={countryCode || "us"} svg />
              <ChevronDown />
            </button>
          ) : <ReactCountryFlag countryCode={countryCode || "us"} svg /> }
        </div>
        <div className="flex items-center h-full gap-x-4">
            {process.env.NEXT_PUBLIC_STORE_LOGO && (
              <Image
                src={process.env.NEXT_PUBLIC_STORE_LOGO}
                alt="Logo"
                width={65}
                height={65}
              />
            )}
            <h1 className="text-xl-semi">{process.env.NEXT_PUBLIC_STORE_NAME}</h1>
          </div>
        <div className="flex-1 basis-0 flex justify-end">
          <button onClick={close}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-6 flex-1 flex flex-col justify-between p-6">
        {process.env.FEATURE_SEARCH_ENABLED && (
          <button
            className="bg-gray-50 flex items-center px-4 py-2 gap-x-2 text-gray-500"
            onClick={setScreenSearch}
          >
            <Search size={24} />
            <span placeholder="Search products" className="text-base-regular">
              Search products
            </span>
          </button>
        )}

        <div className="flex flex-col flex-1 text-large-regular text-gray-900">
          <ul className="flex flex-col gap-y-2">
            {(categories?.length || 0 > 0) ? (
               <>
                 <div className="flex flex-col gap-y-8 text-small-regular gap-y-4">
                   <span className="text-gray-700 uppercase">Categories</span>
                 </div>
                 {categories?.map((category) => (
                   <li key={category.id} className="bg-gray-50 p-4">
                     <Link href={`/${category.handle}`}>
                       <button
                         className="flex items-center justify-between w-full"
                         onClick={close}
                       >
                         <span className="sr-only">
                           Go to {category.name} category
                         </span>
                         <span>{category.name}</span>
                         <ChevronDown className="-rotate-90" />
                       </button>
                     </Link>
                   </li>
                 ))}
               </>
             ) : null}
            <div className="flex flex-col gap-y-8 text-small-regular gap-y-4">
              <span className="text-gray-700 uppercase">Collections</span>
            </div>
            {(collections?.length || 0 > 0) ? (
              <>
                {collections?.map((collection) => (
                  <li key={collection.id} className="bg-gray-50 p-4">
                    <Link href={`/collections/${collection.handle}`}>
                      <button
                        className="flex items-center justify-between w-full"
                        onClick={close}
                      >
                        <span className="sr-only">
                          Go to {collection.title} collection
                        </span>
                        <span>{collection.title}</span>
                        <ChevronDown className="-rotate-90" />
                      </button>
                    </Link>
                  </li>
                ))}
              </>
            ) : null}
            <li className="bg-gray-50 p-4">
              <Link href="/store">
                <button
                  className="flex items-center justify-between w-full"
                  onClick={close}
                >
                  <span className="sr-only">Go to all products</span>
                  <span>All Products</span>
                  <ChevronDown className="-rotate-90" />
                </button>
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col gap-y-8 text-small-regular">
            <div className="flex flex-col gap-y-4">
              <Link href={`mailto:${process.env.NEXT_PUBLIC_STORE_EMAIL}`} passHref>
                <button
                  className="flex items-center justify-between border-b border-gray-200 py-2 w-full"
                  onClick={close}
                >
                  <span className="sr-only">Contact us</span>
                  <span className="normal-case">Contact</span>
                  <ChevronDown className="-rotate-90" />
                </button>
              </Link>
              {process.env.NEXT_PUBLIC_FAQ_PATH && (
                <Link href={`/faq`} passHref>
                  <button
                    className="flex items-center justify-between border-b border-gray-200 py-2 w-full"
                    onClick={close}
                  >
                    <span className="sr-only">Go to FAQ</span>
                    <span className="normal-case">FAQ</span>
                    <ChevronDown className="-rotate-90" />
                  </button>
                </Link>
              )}
              {process.env.NEXT_PUBLIC_ABOUT_PATH && (
                <Link href={`/about`} passHref>
                  <button
                    className="flex items-center justify-between border-b border-gray-200 py-2 w-full"
                    onClick={close}
                  >
                    <span className="sr-only">About Us</span>
                    <span className="normal-case">About</span>
                    <ChevronDown className="-rotate-90" />
                  </button>
                </Link>
              )}
            </div>

            {!customer ? (
              <div className="flex flex-col gap-y-4">
                <span className="text-gray-700 uppercase">Account</span>
                <Link href={`/account/login`} passHref>
                  <button
                    className="flex items-center justify-between border-b border-gray-200 py-2 w-full"
                    onClick={close}
                  >
                    <span className="sr-only">Go to sign in page</span>
                    <span className="normal-case">Sign in</span>
                    <ChevronDown className="-rotate-90" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-y-4">
                <span className="text-gray-700 uppercase">Signed in as</span>
                <Link href={`/account`} passHref>
                  <button
                    className="flex items-center justify-between border-b border-gray-200 py-2 w-full"
                    onClick={close}
                  >
                    <span className="sr-only">Go to account page</span>
                    <span className="normal-case">{customer.email}</span>
                    <ChevronDown className="-rotate-90" />
                  </button>
                </Link>
              </div>
            )}
            {process.env.NEXT_PUBLIC_FF_COUNTRIES && (
              <div className="flex flex-col gap-y-4">
                <span className="text-gray-700 uppercase">Delivery</span>
                <button
                  className="flex items-center justify-between border-b border-gray-200 py-2"
                  onClick={setScreenCountry}
                >
                  <span className="sr-only">
                    Click to select shipping country
                  </span>
                  <div className="flex items-center gap-x-2">
                    <ReactCountryFlag countryCode={countryCode || "us"} svg />
                    <span className="normal-case">
                      Shipping to{" "}
                      {countries?.find((c) => c.country === countryCode)?.label}
                    </span>
                  </div>
                  <ChevronDown className="-rotate-90" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainMenu
