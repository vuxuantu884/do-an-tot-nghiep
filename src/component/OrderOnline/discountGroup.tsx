import { Input, InputNumber, Select, Typography } from "antd";
import React, {useCallback, useState} from "react";
// import {orderDiscountTextChange} from "../../../domain/actions/orderOnline.action";
import {useDispatch} from "react-redux";
import {formatCurrency, replaceFormat} from "../../utils/AppUtils";

type DiscountGroupProps = {
  index: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
}

const DiscountGroup: React.FC<DiscountGroupProps> = (props: DiscountGroupProps) => {
  const { Text } = Typography;
  const dispatch = useDispatch();
  const [selected, setSelected ] = useState('money');
  const [showResult, setShowResult ] = useState(false);

  const changeDiscountType = (value: string) => {
    setSelected(value);
  }

  const onChangeValue = useCallback((e) => {
    // dispatch(orderDiscountTextChange(props.index, e, selected))
    if(!showResult) {
      setShowResult(true);
    }
  }, [dispatch, props.index, selected, showResult])

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
          onChange={onChangeValue}
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
