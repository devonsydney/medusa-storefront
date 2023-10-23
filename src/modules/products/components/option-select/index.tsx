import { onlyUnique } from "@lib/util/only-unique"
import { ProductOption } from "@medusajs/medusa"
import clsx from "clsx"
import React from "react"

type OptionSelectProps = {
  option: ProductOption
  current: string
  updateOption: (option: Record<string, string>) => void
  title: string
  variantMap: Array<{ variant_id: string, variant_rank: number, inventory_quantity?: number }>
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  variantMap
}) => {
  const sortedOptions = option.values
  .map((value) => {
    const { variant_id } = value;
    const { variant_rank, inventory_quantity } = variantMap.find((v) => v.variant_id === variant_id) || {
      variant_rank: 0,
      inventory_quantity: 0,
    };
    const inStock = inventory_quantity ?? 0 > 0;
    
    return {
      ...value,
      variant_rank,
      inventory_quantity,
      in_stock: inStock,
    };
  })
  .sort((a, b) => a.variant_rank - b.variant_rank);

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-base-semi">Select {title}</span>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {sortedOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption({ [option.id]: v.value })}
              key={v.value}
              className={clsx(
                "border-gray-200 border text-xsmall-regular h-[50px] transition-all duration-200",
                { "border-gray-900": v.value === current },
                { "bg-gray-200": !v.in_stock } 
              )}
              disabled={!v.in_stock}
            >
              {v.value}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
