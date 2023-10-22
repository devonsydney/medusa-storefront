import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { Region } from "@medusajs/medusa"
import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import { formatAmount } from "medusa-react"
import { ProductPreviewType } from "types/global"
import { CalculatedVariant } from "types/medusa"

const transformProductPreview = (
  product: PricedProduct,
  region: Region
): ProductPreviewType => {
  const variants = product.variants as unknown as CalculatedVariant[]

  let cheapestVariant = undefined

  if (variants?.length > 0) {
    cheapestVariant = variants.reduce((acc, curr) => {
      if (acc.calculated_price > curr.calculated_price) {
        return curr
      }
      return acc
    }, variants[0])
  }

  let mostExpensiveVariant = undefined

  if (variants?.length > 0) {
    mostExpensiveVariant = variants.reduce((acc, curr) => {
      if (acc.calculated_price < curr.calculated_price) {
        return curr
      }
      return acc
    }, variants[0])
  }

  return {
    id: product.id!,
    title: product.title!,
    handle: product.handle!,
    thumbnail: product.thumbnail!,
    cheapestPrice: cheapestVariant
      ? {
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
          difference: getPercentageDiff(
            cheapestVariant.original_price,
            cheapestVariant.calculated_price
          ),
          price_type: cheapestVariant.calculated_price_type,
        }
      : undefined,
    mostExpensivePrice: mostExpensiveVariant
      ? {
          calculated_price: formatAmount({
            amount: mostExpensiveVariant.calculated_price,
            region: region,
            includeTaxes: false,
          }),
          original_price: formatAmount({
            amount: mostExpensiveVariant.original_price,
            region: region,
            includeTaxes: false,
          }),
          difference: getPercentageDiff(
            mostExpensiveVariant.original_price,
            mostExpensiveVariant.calculated_price
          ),
          price_type: mostExpensiveVariant.calculated_price_type,
        }
      : undefined,
  }
}

export default transformProductPreview
