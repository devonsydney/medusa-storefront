import { ProductVariant } from "@medusajs/medusa"

type LineItemOptionsProps = { variant: ProductVariant }

// TODO: proper typing for options representing the data structure 

const LineItemOptions = ({ variant }: LineItemOptionsProps) => {
  return (
    <div className="text-small-regular text-gray-700">
      {variant.options.map((option: any) => {
        const optionName =
          variant.product.options.find((opt: any) => opt.id === option.option_id)
            ?.title || "Option"
        return (
          <div key={option.id}>
            <span>
              {optionName}: {option.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default LineItemOptions
