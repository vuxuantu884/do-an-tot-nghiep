import { Input, Select, Typography } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import { formatCurrency, getLineAmountAfterLineDiscount, getLineItemDiscountAmount, getLineItemDiscountRate, getLineItemDiscountValue, replaceFormatString } from "utils/AppUtils";
import _ from "lodash";
import { MoneyType } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import OrderNumberInputCustom from "component/custom/order/order-number-input.custom";

type DiscountGroupProps = {
  price: number;
  index: number;
  discountRate: number;
  discountAmount: number;
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (_items: Array<OrderLineItemRequest>) => void;
  disabled?: boolean;
  onBlur: () => void;
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
      console.log('v1111', v)
      if (!items) {
        return;
      }
      if (v < 0) v = -v;
      if(selected === MoneyType.PERCENT) {
        v =Math.round(v*100) / 100;
      } else {
        v= Math.round(v);
      }
      // let _items = [...items];
      let _items = _.cloneDeep(items)
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
        if(_items[props.index].amount < v) {
					showError("Chiết khấu không lớn hơn giá sản phẩm!");
          v = _items[props.index].amount;
				}
        _itemDiscount.amount = v;
        _itemDiscount.rate = (v / _items[props.index].amount) * 100;
        _itemDiscount.value = (v / _items[props.index].quantity);
       
      } else {
        if(100 < v) {
					v = 100 ;
          showError("Chiết khấu không lớn hơn 100%!");
				}
        _itemDiscount.value = Math.round((v * _price) / 100);
        _itemDiscount.rate = v;
        _itemDiscount.amount = v * _items[props.index].amount / 100;
      }
			_item.discount_value = getLineItemDiscountValue(_item);
			_item.discount_amount = getLineItemDiscountAmount(_item);
			_item.discount_rate = getLineItemDiscountRate(_item);
			_item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
      
      console.log('_items', _items)
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
				<OrderNumberInputCustom
					className="hide-number-handle "
					onChange={ChangeValueDiscount}
					format={(a: string) =>
						formatCurrency(a)
					}
					replace={(a: string) =>
						replaceFormatString(a)
					}
					placeholder="VD: 100,000"
					disabled={disabled}
					onFocus={(e) => {
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          min={0}
					max={selected === MoneyType.PERCENT ? 100 : (props.items ? props.items[props.index].price * props.items[props.index].quantity : 0)}
					value={
            selected === MoneyType.PERCENT
              ? props.discountRate
              : Math.round(props.discountAmount)
          }
          onBlur = {props.onBlur}
				/>
      </Input.Group>
      {showResult && (
        <div className="d-flex justify-content-end yody-table-discount-converted">
          <Text type="danger">
            {selected === MoneyType.MONEY
							? (Math.round(props.discountRate * 100) / 100) + "%"
              : formatCurrency(props.discountAmount)}
          </Text>
        </div>
      )}
    </div>
  );
};

export default DiscountGroup;
