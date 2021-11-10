import {
  Modal,
  Form,
  Select,
  Button,
  FormInstance,
  Input,
  InputNumber,
} from "antd";
import React, { createRef, useState } from "react";
// import { useDispatch } from 'react-redux';
import { formatCurrency } from "utils/AppUtils";

type PickDiscountModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (type: string, value: number, rate: number, coupon: string) => void;
  type: string;
  value?: number;
  rate?: number;
  coupon: string;
  amount: number;
};

const PickDiscountModal: React.FC<PickDiscountModalProps> = (
  props: PickDiscountModalProps
) => {
  const { visible, onCancel, onOk, type, value = 0, rate = 0, coupon } = props;
  const [_type, setType] = useState<string>(type);
  const [_value, setValue] = useState<number>(value);
  const [_rate, setRate] = useState<number>(rate);
  const [_coupon, setCoupon] = useState<string>(coupon);

  const formRef = createRef<FormInstance>();
  const onSubmit = () => {
    onOk(_type, _value, _rate, _coupon);
  };

  const handleChangeSelect = (type: string) => {
    setType(type);
  };

  const onchangeDiscount = (value: number) => {
    value=Math.round(value);
    if (_type === "money") {
      setValue(Math.round(value * 100) / 100);
      setRate(Math.round((value / props.amount) * 100 * 100) / 100);
    } else {
      setRate(Math.round(value * 100) / 100);
      setValue(Math.round(((value * props.amount) / 100) * 100) / 100);
    }
  };

  const onchangeCoupon = (e: any) => {
    setCoupon(e.target.value);
  };
  const handleEnterToSubmit = (key: any) => {
    if (key === 13) {
      onSubmit();
    }
  };
  return (
    <Modal
      title=""
      onCancel={onCancel}
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
        <div className="site-input-group-wrapper saleorder-input-group-wrapper">
          <Form.Item label="Chiết khấu đơn hàng">
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
                style={{ width: "83%" }}
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
        <div className="site-input-group-wrapper saleorder-input-group-wrapper">
          <Form.Item label="Mã giảm giá">
            <Input
              placeholder="Mã giảm giá"
              onFocus={(e) => e.target.select()}
              style={{ width: "99%" }}
              value={_coupon}
              onChange={onchangeCoupon}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default PickDiscountModal;
