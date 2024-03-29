import { Popover, Transition } from "@headlessui/react"
import { useNavigationCollections, useNavigationCategories } from "@lib/hooks/use-layout-data"
import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState } from "react"

const DropdownMenu = () => {
  const [open, setOpen] = useState(false)
  const { push } = useRouter()
  const { data: collections } = useNavigationCollections()
  const { data: categories } = useNavigationCategories()

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="h-full"
    >
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          <>
            <Link href="/store" className="relative flex h-full" passHref>
              <Popover.Button
                className={clsx(
                  "relative h-full flex items-center transition-all ease-out duration-200"
                )}
                onClick={() => push("/store")}
              >
                All Products
              </Popover.Button>
            </Link>

            <Transition
              show={open}
              as={React.Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Popover.Panel
                static
                className="absolute top-full left-0 text-sm text-gray-700 z-30"
              >
                <div className="grid grid-cols-[auto,1fr]">
                  <div className="bg-white py-8">
                  <div className="flex items-start content-container">
                    <div className="flex flex-col flex-1 max-w-[30%]">
                      {(categories?.length || 0 > 0) &&
                        <div>
                          <h3 className="text-base-semi text-gray-900 mb-4">
                            Categories
                          </h3>
                          <div className="flex items-start">
                            <ul className="min-w-[152px] max-w-[200px] pr-4">
                              {categories?.map((category) => (
                                <div key={category.id} className="pb-3 pl-2">
                                  <Link href={`/${category.handle}`} onClick={() => setOpen(false)}>
                                    {category.name}
                                  </Link>
                                  {category.category_children && category.category_children.map((child, childIndex) => (
                                    <div key={child.id} className={`pb-1 pl-4 ${childIndex < (category.category_children ?? []).length ? 'mt-2' : ''}`}>
                                      <div>
                                        <Link href={`/${category.handle}/${child.handle}`} onClick={() => setOpen(false)}>
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
                      }
                      {(collections?.length || 0  > 0) &&
                        <div>
                          <h3 className="text-base-semi text-gray-900 mb-4">
                            Collections
                          </h3>
                          <div className="flex items-start">
                            <ul className="min-w-[152px] max-w-[200px] pr-4">
                              {collections?.map((collection) => (
                                <div key={collection.id} className="pb-3">
                                  <Link
                                    href={`/collections/${collection.handle}`}
                                    onClick={() => setOpen(false)}
                                  >
                                    {collection.title}
                                  </Link>
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
                  <div className="col-span-1 bg-white bg-opacity-50">
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        </Popover>
      </div>
    </div>
  )
}

export default DropdownMenu
