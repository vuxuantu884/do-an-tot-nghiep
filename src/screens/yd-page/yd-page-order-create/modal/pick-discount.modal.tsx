import {
  Button, Form, FormInstance,
  Input,
  InputNumber, Modal, Select
} from "antd";
import React, { createRef, useState } from "react";
// import { useDispatch } from 'react-redux';
import { formatCurrency } from "utils/AppUtils";

type PropType = {
  visible: boolean;
  onCancelDiscountModal: (e: React.MouseEvent<HTMLElement>) => void;
  onOkDiscountModal: (type: string, value: number, rate: number, coupon: string) => void;
  type: string;
  value: number;
  rate: number;
  amount: number;
};

function PickDiscountModal (props: PropType) {
  const { visible, onCancelDiscountModal, onOkDiscountModal, type, value, rate} = props;
  const [_type, setType] = useState<string>(type);
  const [_value, setValue] = useState<number>(value);
  const [_rate, setRate] = useState<number>(rate);

  const formRef = createRef<FormInstance>();
  const onSubmit = () => {
    onOkDiscountModal(_type, _value, _rate, "");
  };

  const handleChangeSelect = (type: string) => {
    setType(type);
  };

  const onchangeDiscount = (value: number) => {
    if (_type === "money") {
      setValue(Math.round(value * 100) / 100);
      setRate(Math.round((value / props.amount) * 100 * 100) / 100);
    } else {
      setRate(Math.round(value * 100) / 100);
      setValue(Math.round(((value * props.amount) / 100) * 100) / 100);
    }
  };
  const handleEnterToSubmit = (key: any) => {
    if (key === 13) {
      onSubmit();
    }
  };
  return (
    <Modal
      title="Chiết khấu đơn hàng"
      onCancel={onCancelDiscountModal}
      centered
      visible={visible}
      className="modal-hide-header modal-pick-discount"
      footer={[
        <Button key="submit" type="primary" onClick={onSubmit}>
          Áp dụng
        </Button>,
      ]}
    >
      <Form
        ref={formRef}
        layout="vertical"
        onKeyPress={(e) => handleEnterToSubmit(e.which)}
      >
        <div className="site-input-group-wrapper saleorder-input-group-wrapper yd-page-order-discount-modal">
          <Form.Item>
            <Input.Group size="large">
              <Select
                style={{ width: "17%", height: "37px" }}
                defaultValue={_type}
                onChange={handleChangeSelect}
                className="currency-option"
              >
                <Select.Option value="percent">%</Select.Option>
                <Select.Option value="money">₫</Select.Option>
              </Select>
              <InputNumber
                style={{ width: "100%" }}
                className="hide-number-handle"
                onFocus={(e) => e.target.select()}
                value={_type === "money" ? _value : _rate}
                min={0}
                max={_type === "money" ? props.amount : 100}
                formatter={(value) => formatCurrency(value ? value : "0")}
                onChange={onchangeDiscount}
              />
            </Input.Group>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

export default PickDiscountModal;
