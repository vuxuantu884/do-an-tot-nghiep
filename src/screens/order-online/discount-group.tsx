import { Input, InputNumber, Select, Typography } from "antd";
import { OrderItemModel } from "model/other/Order/order-model";
import React, {useCallback, useState} from "react";
import {formatCurrency, replaceFormat} from "../../utils/AppUtils";

type DiscountGroupProps = {
  price: number
  index: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  items: Array<OrderItemModel>;
  setItems: (_items:Array<OrderItemModel>) => void;
}

const DiscountGroup: React.FC<DiscountGroupProps> = (props: DiscountGroupProps) => {
  const { Text } = Typography;
  const [selected, setSelected ] = useState('money');
  const [showResult, setShowResult ] = useState(true);

  const changeDiscountType = (value: string) => {
    setSelected(value);
  }

  const ChangeValueDiscount = useCallback((v) => {
    console.log(v)
    let _items = [...props.items]
    let _item = _items[props.index].discount_items[0]
    let _price = _items[props.index].price
    if(selected === 'money'){
      _item.value = v
      _item.rate = Math.round(v/_price*100*100)/100
      _item.amount = v
    }else{
      _item.value = v*_price/100
      _item.rate = v
      _item.amount = v*_price/100
    }
    props.setItems(_items)
  },[props,selected]
  )

  return (
    <div>
      <Input.Group compact>
        <Select onChange={(value: string) => changeDiscountType(value)} value={selected}>
          <Select.Option value="percent">%</Select.Option>
          <Select.Option value="money">₫</Select.Option>
        </Select>
        <InputNumber
          formatter={value => formatCurrency(value ? value : '0')}
          style={{height: '42px', width: '100%'}}
          value={selected === "percent" ? props.discountRate : formatCurrency(props.discountValue) }
          max = {selected === "percent" ? 100 : props.price}
          onChange={ChangeValueDiscount}
          parser={value => replaceFormat(value ? value : "0")}
          className="yody-table-discount-input hide-number-handle"
          onFocus={(e) => {
            e.target.setSelectionRange(0, e.target.value.length)
          }}
        />
      </Input.Group>
      {
        showResult && (
          <div className="d-flex justify-content-end yody-table-discount-converted">
            <Text type="danger">{selected === "money" ? props.discountRate + '%' : formatCurrency(props.discountValue)}</Text>
          </div>
        )
      }
    </div>
  )
}

export default DiscountGroup;
