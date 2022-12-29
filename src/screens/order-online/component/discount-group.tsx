import { Input, Select, Typography } from "antd";
import OrderNumberInputCustom from "component/custom/order/order-number-input.custom";
import _ from "lodash";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import {
  formatCurrency,
  formatPercentage,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  replaceFormatString,
} from "utils/AppUtils";
import { DISCOUNT_TYPE } from "utils/Constants";
import { showError } from "utils/ToastUtils";

type PropTypes = {
  price: number;
  index: number;
  discountRate: number;
  discountAmount: number;
  discountType: string;
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (_items: Array<OrderLineItemRequest>) => void;
  disabled?: boolean;
  onBlur: () => void;
};

function DiscountGroup(props: PropTypes) {
  const { items, disabled = false } = props;
  const { Text } = Typography;
  console.log("DiscountGroup discountType", props.discountType);
  const [selected, setSelected] = useState(props.discountType);
  let showResult = true;

  const changeDiscountType = (value: string) => {
    setSelected(value);
  };

  const ChangeValueDiscount = useCallback(
    (v) => {
      // console.log('v1111', v)
      if (!items) {
        return;
      }
      if (v < 0) v = -v;
      if (selected === DISCOUNT_TYPE.PERCENT) {
        v = Math.round(v * 100) / 100;
      } else {
        v = Math.round(v);
      }
      // let _items = [...items];
      let _items = _.cloneDeep(items);
      console.log("_items", _items);
      let _item = _items[props.index];
      if (_item.discount_items.length === 0) {
        _item.discount_items = [
          {
            amount: 0,
            value: 0,
            rate: 0,
            reason: "",
            discount_code: "",
            promotion_id: undefined,
          },
        ];
      }
      let _itemDiscount = _item.discount_items[0];

      let _price = _items[props.index].price;
      if (selected === DISCOUNT_TYPE.MONEY) {
        if (_items[props.index].amount < v) {
          showError("Chiết khấu không lớn hơn giá sản phẩm!");
          v = _items[props.index].amount;
        }
        _itemDiscount.amount = v;
        _itemDiscount.rate = (v / _items[props.index].amount) * 100;
        _itemDiscount.value = v / _items[props.index].quantity;
        _itemDiscount.sub_type = DiscountValueType.FIXED_AMOUNT;
      } else {
        if (100 < v) {
          v = 100;
          showError("Chiết khấu không lớn hơn 100%!");
        }
        _itemDiscount.value = Math.round((v * _price) / 100);
        _itemDiscount.rate = v;
        _itemDiscount.amount = (v * _items[props.index].amount) / 100;
        _itemDiscount.sub_type = DiscountValueType.PERCENTAGE;
      }

      _itemDiscount.type = selected;
      _itemDiscount.taxable = false;
      _item.discount_value = getLineItemDiscountValue(_item);
      _item.discount_amount = getLineItemDiscountAmount(_item);
      _item.discount_rate = getLineItemDiscountRate(_item);
      _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
      if (_item.discount_items.length === 0 || !_item.discount_items[0]?.amount) {
        // _item.discount_items = [];
      }
      console.log("_items", _items);
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
        <OrderNumberInputCustom
          className="hide-number-handle "
          onChange={ChangeValueDiscount}
          format={(a: string) => {
            if (selected === DISCOUNT_TYPE.MONEY) {
              return formatCurrency(a);
            } else {
              return formatPercentage(a);
            }
          }}
          replace={(a: string) => replaceFormatString(a)}
          placeholder="VD: 100,000"
          disabled={disabled}
          onFocus={(e) => {
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          min={0}
          max={
            selected === DISCOUNT_TYPE.PERCENT
              ? 100
              : props.items
              ? props.items[props.index].price * props.items[props.index].quantity
              : 0
          }
          value={
            selected === DISCOUNT_TYPE.PERCENT
              ? props.discountRate
              : Math.round(props.discountAmount)
          }
          onBlur={props.onBlur}
        />
      </Input.Group>
      {showResult && (
        <div className="d-flex justify-content-end yody-table-discount-converted">
          <Text type="danger">
            {selected === DISCOUNT_TYPE.MONEY
              ? formatPercentage(props.discountRate) + "%"
              : formatCurrency(props.discountAmount)}
          </Text>
        </div>
      )}
    </div>
  );
}

export default DiscountGroup;
