import {  Select } from 'antd'
import NumberInput from 'component/custom/number-input.custom'
import { formatCurrency, replaceFormatString } from 'utils/AppUtils'
import './currency-input.scss'

interface IProp {
  position?: string
  placeholder?: string
  currency?: string[]
  onChange?: (value: number | null) => void
  value?: number
  onChangeCurrencyType?: (value: string) => void
  style?: any
}

const CurrencyInput = (props: IProp) => {
  return (
    <div className="currency-input">
      <NumberInput
        className={`conversion-input currency-input__${props.position}`}
        format={(a: string) => formatCurrency(a)}
        replace={(a: string) =>
          replaceFormatString(a)
        }
        placeholder={props.placeholder}
        onChange={(value) => props.onChange && props.onChange(value)}
        value={props.value}
        style={props.style}
        max={100}
      />
      {
        props.currency && props.currency.length > 1 ? (
          <Select
            className="dropdown-select"
            defaultValue={props.currency[0]}
            onChange={(value) => props.onChangeCurrencyType && props.onChangeCurrencyType(value)}
          >
            {
              props.currency.map(c => (
                <Select.Option value={c}>{c}</Select.Option>
              ))
            }
          </Select>
        ) : (
          <span className={`currency currency-${props.position}`}>{props.currency}</span>
        )
      }
    </div>
  )
}

export default CurrencyInput
