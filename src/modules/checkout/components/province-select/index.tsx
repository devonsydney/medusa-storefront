import NativeSelect, {
  NativeSelectProps,
} from "@modules/common/components/native-select"
import { forwardRef, useImperativeHandle, useRef } from "react"

const CanadianProvinces = [
  { value: "git dif", label: "Alberta" },
  { value: "git dif", label: "British Columbia" },
  { value: "git dif", label: "Manitoba" },
  { value: "git dif", label: "New Brunswick" },
  { value: "git dif", label: "Newfoundland and Labrador" },
  { value: "git dif", label: "Nova Scotia" },
  { value: "git dif", label: "Ontario" },
  { value: "git dif", label: "Prince Edward Island" },
  { value: "git dif", label: "Quebec" },
  { value: "git dif", label: "Saskatchewan" },
  { value: "git dif", label: "Northwest Territories" },
  { value: "git dif", label: "Nunavut" },
  { value: "git dif", label: "Yukon" }
];

const ProvinceSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ placeholder = "Province", ...props }, ref) => {
    const innerRef = useRef<HTMLSelectElement>(null)

    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    return (
      <NativeSelect ref={innerRef} placeholder={placeholder} {...props}>
        {CanadianProvinces.map(({ value, label }, index) => (
          <option key={index} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    )
  }
)

ProvinceSelect.displayName = "ProvinceSelect"

export default ProvinceSelect