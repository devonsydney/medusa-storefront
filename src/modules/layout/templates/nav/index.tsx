import { useMobileMenu } from "@lib/context/mobile-menu-context"
import Hamburger from "@modules/common/components/hamburger"
import CartDropdown from "@modules/layout/components/cart-dropdown"
import DropdownMenu from "@modules/layout/components/dropdown-menu"
import MobileMenu from "@modules/mobile-menu/templates"
import DesktopSearchModal from "@modules/search/templates/desktop-search-modal"
import clsx from "clsx"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Image from "next/image"

const Nav = () => {
  const { pathname } = useRouter()
  const [isHome, setIsHome] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  //useEffect that detects if window is scrolled > 5px on the Y axis
  useEffect(() => {
    if (isHome) {
      const detectScrollY = () => {
        if (window.scrollY > 5) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }

      window.addEventListener("scroll", detectScrollY)

      return () => {
        window.removeEventListener("scroll", detectScrollY)
      }
    }
  }, [isHome])

  useEffect(() => {
    pathname === "/" ? setIsHome(true) : setIsHome(false)
  }, [pathname])

  const { toggle } = useMobileMenu()

  return (
    <div
      className={clsx("sticky top-0 inset-x-0 z-50 group", {
        "!fixed": isHome,
      })}
    >
      <header
        className={clsx(
          "relative h-16 px-8 mx-auto transition-colors bg-transparent border-b border-transparent duration-200 group-hover:bg-white group-hover:border-gray-200",
          {
            "!bg-white !border-gray-200": !isHome || isScrolled,
          },
        )}
      >
        <nav
          className={clsx(
            "text-gray-900 flex items-center justify-between w-full h-full text-small-regular transition-colors duration-200",
            {
              "text-white group-hover:text-gray-900": isHome && !isScrolled,
            },
          )}
        >
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="block small:hidden">
              <Hamburger setOpen={toggle} />
            </div>
            <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-start">
            <div className="hidden small:flex items-center gap-x-6 h-full">
                <DropdownMenu />
                { false && <Link href="/specials">
                  Specials
                </Link>}
              </div>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center h-full gap-x-4">
              {process.env.NEXT_PUBLIC_STORE_LOGO && (
                <Image
                  src={process.env.NEXT_PUBLIC_STORE_LOGO}
                  alt="Logo"
                  width={Number(process.env.NEXT_PUBLIC_STORE_LOGO_WIDTH) || 120}
                  height={1}
                />
              )}
              <div className="hidden small:flex text-xl-semi">
                {process.env.NEXT_PUBLIC_STORE_HEADER_TEXT}
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <Link href={`mailto:${process.env.NEXT_PUBLIC_STORE_EMAIL}`}>
                Contact
              </Link>
              {process.env.NEXT_PUBLIC_FAQ_PATH && (
                <Link href="/faq">
                  FAQ
                </Link>
              )}
              {process.env.NEXT_PUBLIC_ABOUT_PATH && (
                <Link href="/about">
                  About
                </Link> 
              )}
              {process.env.FEATURE_SEARCH_ENABLED && <DesktopSearchModal />}
              <Link href="/account">
                Account
              </Link>
            </div>
            <CartDropdown />
          </div>
        </nav>
        <MobileMenu />
      </header>
    </div>
  )
}

export default Nav
