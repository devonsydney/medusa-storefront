import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import { useCart } from "medusa-react"
import { useRegions } from "@lib/hooks/use-layout-data"
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

const CountrySelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Country", ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const { data: regions } = useRegions()

    const { cart } = useCart()

    const countryOptions = useMemo(() => {
      const currentRegion = regions?.find((r) => r.id === cart?.region_id)

      if (!currentRegion) {
        return []
      }

      return currentRegion.countries.map((country) => ({
        value: country.iso_2,
        label: country.display_name,
      }))
    }, [regions, cart])

    // TODO: Fix this so the 'disabled' function works on both the profile shipping address and checkout shipping address
    //const isDisabled = countryOptions.length === 1;

    return (
      <NativeSelect
        ref={innerRef}
        placeholder={placeholder}
        {...props}
        // TODO: Bring this back if it can be fixed
        //disabled={isDisabled}
        //defaultValue={isDisabled ? countryOptions[0].value : undefined}
      >
        {countryOptions.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    )
  }
)

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
