import * as React from "react"

import { MEDUSA_BACKEND_URL, queryClient } from "@lib/config"
import { AccountProvider } from "@lib/context/account-context"
import { CartDropdownProvider } from "@lib/context/cart-dropdown-context"
import { MobileMenuProvider } from "@lib/context/mobile-menu-context"
import { StoreProvider } from "@lib/context/store-context"
import { Hydrate } from "@tanstack/react-query"
import { CartProvider, MedusaProvider } from "medusa-react"
import "styles/globals.css"
import { AppPropsWithLayout } from "types/global"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/legacy/production.js").then(
    (d) => ({
      default: d.ReactQueryDevtools,
    })
  )
)

function App({
  Component,
  pageProps,
}: AppPropsWithLayout<{ dehydratedState?: unknown }>) {
  const getLayout = Component.getLayout ?? ((page) => page)
  const [showDevtools, setShowDevtools] = React.useState(false)

  React.useEffect(() => {
    // @ts-ignore
    window.toggleDevtools = () => setShowDevtools((old) => !old)
  }, [])

  return (
    <MedusaProvider
      baseUrl={MEDUSA_BACKEND_URL}
      publishableApiKey={process.env.NEXT_PUBLIC_MEDUSA_API_KEY}
      queryClientProviderProps={{
        client: queryClient,
      }}
    >
      <Hydrate state={pageProps.dehydratedState}>
        <CartDropdownProvider>
          <MobileMenuProvider>
            <CartProvider>
              <StoreProvider>
                <AccountProvider>
                  {getLayout(<Component {...pageProps} />)}
                </AccountProvider>
              </StoreProvider>
            </CartProvider>
          </MobileMenuProvider>
          {showDevtools && (
            <React.Suspense fallback={null}>
              <ReactQueryDevtoolsProduction />
            </React.Suspense>
          )}
        </CartDropdownProvider>
      </Hydrate>
    </MedusaProvider>
  )
}

export default App
