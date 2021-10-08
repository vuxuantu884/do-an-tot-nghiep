import { Input, InputNumber, Select, Typography, Col, Row } from "antd";
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
      let _items = [...items];
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
      props.handleCardItems(_items);
    },
    [items, props, selected]
  );

  return (
    <div>
      <Input.Group>
      <Row style={{alignItems: 'center', justifyContent: "space-between"}}>
        <Col span={6}>
          <Select
            onChange={(value: string) => changeDiscountType(value)}
            value={selected}
            className="fpage-discount-select"
          >
            <Select.Option value={MoneyType.PERCENT}>%</Select.Option>
            <Select.Option value={MoneyType.MONEY}>₫</Select.Option>
          </Select>
        </Col>
        <Col span={18}>
          <InputNumber
            className="hide-number-handle "
            formatter={(value) => formatCurrency(value ? value : "0")}
            style={{
              width: "100%",
              textAlign: "right",
              height: 38,
              color: "#222222",
              fontWeight: 500,
            }}
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
            disabled={disabled}
          />
        </Col>
        </Row>
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
