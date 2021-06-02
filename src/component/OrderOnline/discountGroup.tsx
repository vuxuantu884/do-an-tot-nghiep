import { Input, InputNumber, Select, Typography } from "antd";
import { OrderItemModel } from "model/other/Order/OrderItemModel";
import React, {useCallback, useState} from "react";
import { SetStateAction } from 'react';
// import {orderDiscountTextChange} from "../../../domain/actions/orderOnline.action";
import {useDispatch} from "react-redux";
import {formatCurrency, replaceFormat} from "../../utils/AppUtils";

type DiscountGroupProps = {
  index: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  items: Array<OrderItemModel>;
  setItems: React.Dispatch<SetStateAction<Array<OrderItemModel>>>;
}

const DiscountGroup: React.FC<DiscountGroupProps> = (props: DiscountGroupProps) => {
  const { Text } = Typography;
  const dispatch = useDispatch();
  const [selected, setSelected ] = useState('money');
  const [showResult, setShowResult ] = useState(true);

  const changeDiscountType = (value: string) => {
    setSelected(value);
  }

  const onChangeValue = useCallback((e:any) => {
    let value = e.target.value
    let _items = [... props.items]
    let _item = _items[props.index].discount_items[0]
    let _price = _items[props.index].price
    if(selected === 'money'){
      _item.value = value
      _item.rate = value/_price
    }else{
      _item.value = value * _price / 100
      _item.rate = value
    }
    props.setItems(_items)
  },[props.items]
  )

  return (
    <div>
      <Input.Group compact>
        <Select onChange={(value: string) => changeDiscountType(value)} value={selected} className="yody-pos-discount-type">
          <Select.Option value="percent">%</Select.Option>
          <Select.Option value="money">₫</Select.Option>
        </Select>
        <InputNumber
          formatter={value => formatCurrency(value ? value : '0')}
          value={selected === "percent" ? props.discountRate : props.discountValue }
          onChange={(e) => onChangeValue}
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
            <Text type="danger">{selected === "money" ? props.discountRate + '%' : formatCurrency(props.totalAmount)}</Text>
          </div>
        )
      }
    </div>
  )
}

export default DiscountGroup;
