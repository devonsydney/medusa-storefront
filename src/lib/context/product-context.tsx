import { canBuy } from "@lib/util/can-buy"
import { findCheapestPrice } from "@lib/util/prices"
import isEqual from "lodash/isEqual"
import { formatVariantPrice } from "medusa-react"
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Product, Variant } from "types/medusa"
import { useStore } from "./store-context"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { useRegions } from "@lib/hooks/use-layout-data"

interface ProductContext {
  formattedPrice: string
  quantity: number
  disabled: boolean
  inStock: boolean
  variant?: Variant
  maxQuantityMet: boolean
  options: Record<string, string>
  updateOptions: (options: Record<string, string>) => void
  increaseQuantity: () => void
  decreaseQuantity: () => void
  addToCart: () => void
}

const ProductActionContext = createContext<ProductContext | null>(null)

interface ProductProviderProps {
  children?: React.ReactNode
  product: PricedProduct
}

export const ProductProvider = ({
  product,
  children,
}: ProductProviderProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [options, setOptions] = useState<Record<string, string>>({})
  const [maxQuantityMet, setMaxQuantityMet] = useState<boolean>(false)
  const [inStock, setInStock] = useState<boolean>(true)

  const { addItem } = useStore()
  const { data: regions } = useRegions()
  const region = regions?.[0]

  const variants = product.variants as unknown as Variant[]

  useEffect(() => {
    // initialize the option state
    const optionObj: Record<string, string> = {}
    for (const option of (product.options || [])) {
      Object.assign(optionObj, { [option.id]: undefined })
    }
    setOptions(optionObj)
  }, [product])

  // memoized record of the product's variants
  const variantRecord = useMemo(() => {
    const map: Record<string, Record<string, string>> = {}

    for (const variant of variants) {
      const tmp: Record<string, string> = {}

      for (const option of variant.options) {
        tmp[option.option_id] = option.value
      }

      map[variant.id] = tmp
    }

    return map
  }, [variants])

  // memoized function to check if the current options are a valid variant
  const variant = useMemo(() => {
    let variantId: string | undefined = undefined

    for (const key of Object.keys(variantRecord)) {
      if (isEqual(variantRecord[key], options)) {
        variantId = key
      }
    }

    return variants.find((v) => v.id === variantId)
  }, [options, variantRecord, variants])

  // if product has one variant in stock, select it. otherwise, set the last in-stock variant
  useEffect(() => {
    if (variants.length === 1) {
      if (variants[0].inventory_quantity > 0) {
        setOptions(variantRecord[variants[0].id])
      }
    } else if (variants.length > 1) {
      for (let i = variants.length - 1; i >= 0; i--) {
        const variant = variants[i]
        const variantOptions = variantRecord[variant.id]
        if (variantOptions && variant.inventory_quantity > 0) {
          setOptions(variantOptions)
          break
        }
      }
    }
  }, [variants, variantRecord])

  // if the selected variant has inventory_quantity < quantity selected, reduce quantity selected
  useEffect(() => {
    if (variant && quantity > variant.inventory_quantity) {
      setQuantity(variant.inventory_quantity);
    }
  }, [variant, quantity]);

  const disabled = useMemo(() => {
    return !variant
  }, [variant])

  // memoized function to get the price of the current variant
  const formattedPrice = useMemo(() => {
    if (variant && region) {
      return formatVariantPrice({ variant, region })
    } else if (region) {
      return findCheapestPrice(variants, region)
    } else {
      // if no variant is selected, or we couldn't find a price for the region/currency
      return "N/A"
    }
  }, [variant, variants, region])

  useEffect(() => {
    if (variant) {
      setInStock(canBuy(variant))
    }
  }, [variant])

  const updateOptions = (update: Record<string, string>) => {
    setOptions({ ...options, ...update })
  }

  const addToCart = () => {
    if (variant) {
      addItem({
        variantId: variant.id,
        quantity,
      })
    }
  }

  const increaseQuantity = () => {
    const maxQuantity = variant?.inventory_quantity || 0

    if (maxQuantity > quantity) {
      setQuantity(quantity + 1)
    } else {
      setMaxQuantityMet(true)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)

      if (maxQuantityMet) {
        setMaxQuantityMet(false)
      }
    }
  }

  return (
    <ProductActionContext.Provider
      value={{
        quantity,
        maxQuantityMet,
        disabled,
        inStock,
        options,
        variant,
        addToCart,
        updateOptions,
        decreaseQuantity,
        increaseQuantity,
        formattedPrice,
      }}
    >
      {children}
    </ProductActionContext.Provider>
  )
}

export const useProductActions = () => {
  const context = useContext(ProductActionContext)
  if (context === null) {
    throw new Error(
      "useProductActionContext must be used within a ProductActionProvider"
    )
  }
  return context
}
