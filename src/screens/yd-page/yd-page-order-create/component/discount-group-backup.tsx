import { Input, InputNumber, Select, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import { formatCurrency } from "utils/AppUtils";
import { DISCOUNT_TYPE } from "utils/Constants";

type DiscountGroupProps = {
  price: number;
  index: number;
  discountRate: number;
  discountValue: number;
  totalAmount: number;
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (_items: Array<OrderLineItemRequest>) => void;
  disabled?: boolean;
};

const DiscountGroup: React.FC<DiscountGroupProps> = (props: DiscountGroupProps) => {
  const { items, disabled = false } = props;
  const { Text } = Typography;
  const [selected, setSelected] = useState(DISCOUNT_TYPE.MONEY);
  let showResult = true;

  const changeDiscountType = (value: string) => {
    setSelected(value);
  };

  const ChangeValueDiscount = useCallback(
    (v) => {
      if (!items) {
        return;
      }
      if (v < 0) v = -v;
      v = Math.round(v);
      let _items = [...items];
      let _item = _items[props.index].discount_items[0];
      let _price = _items[props.index].price;
      if (selected === DISCOUNT_TYPE.MONEY) {
        _item.value = v;
        _item.rate = Math.round((v / _price) * 100 * 100) / 100;
        _item.amount = v;
      } else {
        _item.value = (v * _price) / 100;
        _item.rate = v;
        _item.amount = (v * _price) / 100;
      }
      props.handleCardItems(_items);
    },
    [items, props, selected],
  );

  return (
    <div>
      <Input.Group compact>
        <Select onChange={(value: string) => changeDiscountType(value)} value={selected}>
          <Select.Option value={DISCOUNT_TYPE.PERCENT}>%</Select.Option>
          <Select.Option value={DISCOUNT_TYPE.MONEY}>₫</Select.Option>
        </Select>
        <InputNumber
          className="hide-number-handle "
          formatter={(value) => formatCurrency(value ? value : "0")}
          style={{
            width: "100%",
            textAlign: "right",
            minHeight: "38px",
            color: "#222222",
            fontWeight: 500,
          }}
          value={
            selected === DISCOUNT_TYPE.PERCENT
              ? props.discountRate
              : formatCurrency(props.discountValue)
          }
          max={selected === DISCOUNT_TYPE.PERCENT ? 100 : props.price}
          onChange={ChangeValueDiscount}
          onFocus={(e) => {
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          disabled={disabled}
        />
      </Input.Group>
      {showResult && (
        <div className="d-flex justify-content-end yody-table-discount-converted">
          <Text type="danger">
            {selected === DISCOUNT_TYPE.MONEY
              ? props.discountRate + "%"
              : formatCurrency(props.discountValue)}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DiscountGroup;
