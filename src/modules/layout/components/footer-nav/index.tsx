import clsx from "clsx"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"
import Link from "next/link"
import CountrySelect from "../country-select"
import Image from "next/image"

const FooterNav = () => {
  const { data: collections, isLoading: loadingCollections } =
    useNavigationCollections()
    const { data: categories } =
    useNavigationCategories()

  return (
    <div className="content-container flex flex-col gap-y-8 pt-16 pb-8">
      <div className="flex flex-row gap-x-16 w-full justify-between">
        <div className="flex flex-col gap-y-6 gap-x-4 xsmall:flex-row items-start justify-start">
          <Link href="/">
              <div className="flex items-center h-full gap-x-4">
                {process.env.NEXT_PUBLIC_STORE_LOGO && (
                  <Image
                    src={process.env.NEXT_PUBLIC_STORE_LOGO}
                    alt="Logo"
                    width={65}
                    height={65}
                  />
                )}
                {/* <div className="text-xl-semi" style={{ whiteSpace: "nowrap" }}>
                  {process.env.NEXT_PUBLIC_STORE_NAME}
                </div> */}
              </div>
            </Link>
        </div>
        <div>
          <div className="flex flex-col gap-y-6 gap-x-16 xsmall:flex-row items-start justify-end">
            {(categories?.length || 0 > 0) && (
              <div className="text-small-regular grid grid-cols-1 gap-x-16">
                <div className="flex flex-col gap-y-2">
                  <span className="text-base-semi">Categories</span>
                    <ul className="grid grid-cols-1 gap-y-2">
                      {categories?.map((category) => (
                        <div key={category.id} className="pb-2 pl-2">
                          <Link href={`/${category.handle}`}>
                            {category.name}
                          </Link>
                          {category.category_children && category.category_children.map((child, childIndex) => (
                            <div key={child.id} className={`pl-4 ${childIndex < (category.category_children ?? []).length ? 'mt-2' : ''}`}>
                              <div>
                                <Link href={`/${category.handle}/${child.handle}`}>
                                  {child.name}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </ul>
                </div>
              </div>
            )}
            {(collections?.length || 0 > 0) && (
              <div className="text-small-regular grid grid-cols-1 gap-x-16">
                <div className="flex flex-col gap-y-2">
                  <span className="text-base-semi">Collections</span>
                  <ul
                    className={clsx("grid grid-cols-1 gap-y-2", {
                      "grid-cols-2": (collections?.length || 0) > 4,
                    })}
                  >
                    {collections?.map((c) => (
                      <li key={c.id}>
                        <Link href={`/collections/${c.handle}`}>{c.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {false && (
              <div className="text-small-regular grid grid-cols-1 gap-x-16">
                <div className="flex flex-col gap-y-2">
                  <span className="text-base-semi">Medusa</span>
                  <ul className="grid grid-cols-1 gap-y-2">
                    <li>
                      <a
                        href="https://github.com/medusajs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://docs.medusajs.com"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/medusajs/nextjs-starter-medusa"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source code
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-y-4 justify-center xsmall:items-center xsmall:flex-row xsmall:items-end xsmall:justify-between">
        <span className="text-xsmall-regular text-gray-500">
          © Copyright {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME}
        </span>
        <div className="min-w-[316px] flex xsmall:justify-end">
          <CountrySelect />
        </div>
      </div>
    </div>
  )
}

export default FooterNav
