import { Input, Select, Typography } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useState } from "react";
import {
	formatCurrency,
	getLineAmountAfterLineDiscount,
	getLineItemDiscountAmount,
	getLineItemDiscountRate,
	getLineItemDiscountValue,
	replaceFormatString
} from "utils/AppUtils";
import { MoneyType } from "utils/Constants";
import "./discount-group.scss"
import _ from "lodash";
import {showError} from "utils/ToastUtils";

type DiscountGroupProps = {
	price: number;
	index: number;
	discountRate: number;
	discountAmount: number;
	items: Array<OrderLineItemRequest>;
	handleCardItems: (_items: Array<OrderLineItemRequest>) => void;
	disabled?: boolean;
};

const DiscountGroup: React.FC<DiscountGroupProps> = (
	props: DiscountGroupProps
) => {
	const { items, disabled = false } = props;
	const { Text } = Typography;
	const [selected, setSelected] = useState(MoneyType.MONEY);

	const changeDiscountType = (value: string) => {
		setSelected(value);
	};

	const ChangeValueDiscount = useCallback(
		(v) => {
			if (!items || v === null) {
				return;
			}
			if (v < 0) v = -v;
			if (selected === MoneyType.PERCENT) {
				v = Math.round(v * 100) / 100;
			} else {
				v = Math.round(v);
			}
			// let _items = [...items];
			let _items = _.cloneDeep(items)
			let _item = _items[props.index];
			if (_item.discount_items.length === 0) {
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
				if (v === _itemDiscount.amount) {
					return;
				}
				if (v > _items[props.index].amount) {
					showError("Chiết khấu không lớn hơn giá sản phẩm!");
					// _itemDiscount.amount = 0;
					// _itemDiscount.rate = 0;
					// return;
				}
				_itemDiscount.amount = v;
				_itemDiscount.rate = (v / _items[props.index].amount) * 100;
				_itemDiscount.value = (v / _items[props.index].quantity);

			} else {
				if (v === _itemDiscount.rate) {
					return;
				}
				if (v > 100) {
					// v = 100 ;
					showError("Chiết khấu không lớn hơn 100%!");
				}
				_itemDiscount.value = Math.round((v * _price) / 100);
				_itemDiscount.amount = _itemDiscount.value * _item.quantity;
				_itemDiscount.rate = v;
			}
			_item.discount_value = getLineItemDiscountValue(_item);
			_item.discount_amount = getLineItemDiscountAmount(_item);
			_item.discount_rate = getLineItemDiscountRate(_item);
			_item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);

			// console.log('_items', _items)
			props.handleCardItems(_items);
		},
		[items, props, selected]
	);

	return (
		<div className="yd-discount-group">
			<Input.Group compact>
				<Select
					onChange={(value: string) => changeDiscountType(value)}
					value={selected}
					suffixIcon={null}
					className="discount-group-select"
				>
					<Select.Option value={MoneyType.PERCENT} style={{ padding: "5px", textAlign: "center" }}>%</Select.Option>
					<Select.Option value={MoneyType.MONEY} style={{ padding: "5px", textAlign: "center" }}>₫</Select.Option>
				</Select>

				<NumberInput
					style={{width:"100%"}}
					className="hide-number-handle "
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
					max={selected === MoneyType.PERCENT ? 100 : (props.price * items[props.index]?.quantity)}
					value={
						selected === MoneyType.PERCENT
							? props.discountRate
							: Math.round(props.discountAmount)
					}
					onChange={ChangeValueDiscount}
				/>
			</Input.Group>

			<div className="discount-rate-convert">
				<Text type="danger">
					{selected === MoneyType.MONEY
						? (Math.round(props.discountRate * 100) / 100) + "%"
						: formatCurrency(props.discountAmount) + " ₫"}
				</Text>
			</div>
		</div>
	);
};

export default DiscountGroup;
