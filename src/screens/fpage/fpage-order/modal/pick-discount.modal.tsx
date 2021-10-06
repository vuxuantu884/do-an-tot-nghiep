import {
  Modal,
  Form,
  Select,
  Button,
  FormInstance,
  Input,
  InputNumber, Col, Row
} from "antd";
import React, { createRef, useState } from "react";
// import { useDispatch } from 'react-redux';
import { formatCurrency } from "utils/AppUtils";

type PickDiscountModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (type: string, value: number, rate: number, coupon: string) => void;
  type: string;
  value: number;
  rate: number;
  coupon: string;
  amount: number;
};

const PickDiscountModal: React.FC<PickDiscountModalProps> = (
  props: PickDiscountModalProps
) => {
  const { visible, onCancel, onOk, type, value, rate, coupon } = props;
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
    if (_type === "money") {
      setValue(Math.round(value * 100) / 100);
      setRate(Math.round((value / props.amount) * 100 * 100) / 100);
    } else {
      setRate(Math.round(value * 100) / 100);
      setValue(Math.round(((value * props.amount) / 100) * 100) / 100);
    }
  };

  const onchangeCounpon = (e: any) => {
    setCoupon(e.target.value);
  };
  const handleEnterToSubmit = (key: any) => {
    if (key === 13) {
      onSubmit();
    }
  };
  return (
    <Modal
      title="Chiết khấu đơn hàng"
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
        <Col span={24}>
          <Form.Item label="CK Đơn hàng">
            <Input.Group >
              <Row style={{alignItems: 'center', justifyContent: "space-between"}}>
              <Col span={6}>
              <Select
                className="fpage-discount-select"
                defaultValue={_type}
                onChange={handleChangeSelect}
              >
                <Select.Option value="percent">%</Select.Option>
                <Select.Option value="money">₫</Select.Option>
              </Select>
              </Col>
              <Col span={18}>
              <InputNumber
                style={{ width: "100%", borderRadius: "0 5px 5px 0", height: 38}}
                onFocus={(e) => e.target.select()}
                value={_type === "money" ? _value : _rate}
                min={0}
                max={_type === "money" ? props.amount : 100}
                formatter={(value) => formatCurrency(value ? value : "0")}
                onChange={onchangeDiscount}
              />
              </Col>
              </Row>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label="Mã giảm giá">
            <Input
              placeholder="Mã giảm giá"
              onFocus={(e) => e.target.select()}
              style={{ width: "99%" }}
              value={_coupon}
              onChange={onchangeCounpon}
            />
          </Form.Item>
        </Col>
      </Form>
    </Modal>
  );
};

export default PickDiscountModal;
