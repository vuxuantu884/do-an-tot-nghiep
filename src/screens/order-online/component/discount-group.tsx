import { Input, InputNumber, Select, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import { formatCurrency } from "utils/AppUtils";
import { MoneyType } from "utils/Constants";

type DiscountGroupProps = {
  price: number;
  index: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  items: Array<OrderLineItemRequest>;
  setItems: (_items: Array<OrderLineItemRequest>) => void;
};

const DiscountGroup: React.FC<DiscountGroupProps> = ( props: DiscountGroupProps ) => {
  const { Text } = Typography;
  const [selected, setSelected] = useState(MoneyType.MONEY);
  let showResult = true;

  const changeDiscountType = (value: string) => {
    setSelected(value);
  };

const ChangeValueDiscount = useCallback(
      (v) => {
      if(v < 0) v = -v
      let _items = [...props.items]; 
      let _item = _items[props.index].discount_items[0];
      let _price = _items[props.index].price;
      if (selected === MoneyType.MONEY) {
        _item.value = v;
        _item.rate = Math.round((v / _price) * 100 * 100) / 100;
        _item.amount = v;
      } else {
        _item.value = (v * _price) / 100;
        _item.rate = v;
        _item.amount = (v * _price) / 100;
      }
      props.setItems(_items);
    },
    [props, selected]
  );

  return (
    <div>
      <Input.Group compact>
        <Select
          onChange={(value: string) => changeDiscountType(value)}
          value={selected}
          
        >
          <Select.Option value={MoneyType.PERCENT}>%</Select.Option>
          <Select.Option value={MoneyType.MONEY}>₫</Select.Option>
        </Select>
        <InputNumber
          className="hide-number-handle "
          formatter={(value) => formatCurrency(value ? value : "0")}
          style={{ width: "100%", textAlign: "right", minHeight:"38px", color:"#222222", fontWeight:500 }}
          value={
            selected === MoneyType.PERCENT
              ? props.discountRate
              : formatCurrency(props.discountValue)
          }
          max={selected === MoneyType.PERCENT ? 100 : props.price}
          onChange={ChangeValueDiscount}
          onFocus={(e) => {
            e.target.setSelectionRange(0, e.target.value.length);
          }}
        />
      </Input.Group>
      {showResult && (
        <div className="d-flex justify-content-end yody-table-discount-converted">
          <Text type="danger">
            {selected === MoneyType.MONEY
              ? props.discountRate + "%"
              : formatCurrency(props.discountValue)}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DiscountGroup;
