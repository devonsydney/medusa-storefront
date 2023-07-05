import clsx from "clsx"
import { useNavigationCollections } from "@lib/hooks/use-layout-data"
import Link from "next/link"
import CountrySelect from "../country-select"

const FooterNav = () => {
  const { data: collections, isLoading: loadingCollections } =
    useNavigationCollections()

  return (
    <div className="content-container flex flex-col gap-y-8 pt-16 pb-8">
      <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between">
        <div>
          <Link href="/">
            <a className="text-xl-semi uppercase">{process.env.NEXT_PUBLIC_STORE_NAME}</a>
          </Link>
        </div>
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
                  <Link href={`/collections/${c.id}`}>{c.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          {/*<div className="flex flex-col gap-y-2">
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
          </div>*/}
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
