import { formatAmount } from "medusa-react"
import { useMemo } from "react"
import { CalculatedVariant } from "types/medusa"
import { useRegions } from "@lib/hooks/use-layout-data"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"

type useProductPriceProps = {
  product: PricedProduct
  variantId?: string
}

const useProductPrice = ({ product, variantId }: useProductPriceProps) => {
  const { data: regions } = useRegions()
  const region = regions?.[0]

  const getPercentageDiff = (original: number, calculated: number) => {
    const diff = original - calculated
    const decrease = (diff / original) * 100

    return decrease.toFixed()
  }

  const cheapestPrice = useMemo(() => {
    if (!product || !product.variants?.length || !region ) {
      return null
    }

    const variants = product.variants as unknown as CalculatedVariant[]

    const cheapestVariant = variants.reduce((prev, curr) => {
      return prev.calculated_price < curr.calculated_price ? prev : curr
    })

    return {
      calculated_price: formatAmount({
        amount: cheapestVariant.calculated_price,
        region: region,
        includeTaxes: false,
      }),
      original_price: formatAmount({
        amount: cheapestVariant.original_price,
        region: region,
        includeTaxes: false,
      }),
      price_type: cheapestVariant.calculated_price_type,
      percentage_diff: getPercentageDiff(
        cheapestVariant.original_price,
        cheapestVariant.calculated_price
      ),
    }
  }, [product, region])

  const variantPrice = useMemo(() => {
    if (!product || !variantId || !region) {
      return null
    }

    const variant = product.variants.find(
      (v) => v.id === variantId || v.sku === variantId
    ) as unknown as CalculatedVariant

    if (!variant) {
      return null
    }

    return {
      calculated_price: formatAmount({
        amount: variant.calculated_price,
        region: region,
        includeTaxes: false,
      }),
      original_price: formatAmount({
        amount: variant.original_price,
        region: region,
        includeTaxes: false,
      }),
      price_type: variant.calculated_price_type,
      percentage_diff: getPercentageDiff(
        variant.original_price,
        variant.calculated_price
      ),
    }
  }, [product, variantId, region])

  return {
    product,
    cheapestPrice,
    variantPrice,
  }
}

export default useProductPrice
