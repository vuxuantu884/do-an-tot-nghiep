import {
  Button, Form, FormInstance,
  Input,
  Modal, Select
} from "antd";
import NumberInput from "component/custom/number-input.custom";
import React, { createRef, useEffect, useState } from "react";
// import { useDispatch } from 'react-redux';
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";

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
  const { visible, onCancelDiscountModal, onOkDiscountModal, type, value, rate, amount} = props;
  const [_type, setType] = useState<string>(type);
  const [_value, setValue] = useState<number>(value);
  const [_rate, setRate] = useState<number>(rate);
  const formRef = createRef<FormInstance>();
  const onSubmit = () => {
    if (_type === "money" && _value > amount) {
      showError("Chiết khấu không lớn hơn giá trị đơn hàng!");
      return;
    } else if(_type === "rate" &&_rate > 100 ) {
      showError("Chiết khấu không lớn hơn 100%!");
      return;
    }
    onOkDiscountModal(_type, _value, _rate, "");
  };

  const handleChangeSelect = (type: string) => {
    setType(type);
  };

  const onchangeDiscount = (value: number|null) => {
    if(value === null) {
      return;
    }
    if (_type === "money") {
      if(value > amount) {
        showError("Chiết khấu không lớn hơn giá trị đơn hàng!");
      }
      setValue(value);
    } else {
      if(value > 100) {
        showError("Chiết khấu không lớn hơn 100%!");
      }
      setRate(value);
    }
  };
  const handleEnterToSubmit = (key: any) => {
    if (key === 13) {
      onSubmit();
    }
  };
  useEffect(() => {
    if (_type === "money") {
      if(_value > amount) {
        setValue(amount);
      } else if(_value < 0) {
        setValue(0)
      }
    } else {
      if(_rate > 100) {
        setRate(100);
      }
    }
  }, [_rate, _type, _value, amount])

  useEffect(() => {
    if(visible) {
      let element = document.getElementById("inputDiscountModal");
      element?.focus();
    }
  }, [visible])

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
        <div className="site-input-group-wrapper saleorder-input-group-wrapper">
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
              
              <NumberInput
                value={_type === "money" ? _value : _rate}
                id="inputDiscountModal"
                style={{ width: "83%" }}
                format={(a: string) =>
                  formatCurrency(a)
                }
                replace={(a: string) =>
                  replaceFormatString(a)
                }
                className="hide-number-handle"
                onFocus={(e) => e.target.select()}
                min={0}
                max={_type === "money" ? props.amount : 100}
                onChange={onchangeDiscount}
              />
             
            </Input.Group>
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default PickDiscountModal;
