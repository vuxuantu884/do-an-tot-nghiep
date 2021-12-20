import { Input, InputNumber, Select, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import { formatCurrency, getLineItemDiscountAmount, getLineItemDiscountRate, getLineItemDiscountValue } from "utils/AppUtils";
import { MoneyType } from "utils/Constants";

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

const DiscountGroup: React.FC<DiscountGroupProps> = (
  props: DiscountGroupProps
) => {
  const { items, disabled = false } = props;
  const { Text } = Typography;
  const [selected, setSelected] = useState(MoneyType.MONEY);
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
      if(selected === MoneyType.PERCENT) {
        v =Math.round(v*100) / 100;
      } else {
        v= Math.round(v);
      }
      let _items = [...items];
      let _item = _items[props.index];
			if(_item.discount_items.length === 0) {
				_item.discount_items = [{
					rate: 0,
					value: 0,
					amount: 0,
					promotion_id: undefined,
					reason: "",
					discount_code: undefined,
				}]
			}
			let _itemDiscount = _item.discount_items[0];
      let _price = _items[props.index].price;
      if (selected === MoneyType.MONEY) {
				if(_itemDiscount.value === v) {
					return;
				}
        _itemDiscount.value = v;
        _itemDiscount.rate = (v / _price) * 100;
       
      } else {
				if(_itemDiscount.rate === v) {
					return;
				}
        _itemDiscount.value = Math.round((v * _price) / 100);
        _itemDiscount.rate = v;
      }
			_itemDiscount.amount =  _itemDiscount.value * _item.quantity;
			_item.discount_value = getLineItemDiscountValue(_item);
			_item.discount_amount = getLineItemDiscountAmount(_item);
			_item.discount_rate = getLineItemDiscountRate(_item);
      props.handleCardItems(_items);
    },
    [items, props, selected]
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
          style={{
            width: "100%",
            textAlign: "right",
            minHeight: "38px",
            color: "#222222",
            fontWeight: 500,
          }}
          value={
            selected === MoneyType.PERCENT
              ? props.discountRate
              : formatCurrency(Math.round(props.discountValue))
          }
          max={selected === MoneyType.PERCENT ? 100 : props.price}
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
            {selected === MoneyType.MONEY
							? (Math.round(props.discountRate * 100) / 100) + "%"
              : formatCurrency(props.discountValue)}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DiscountGroup;
