import {
  Button, Form, FormInstance,
  Input, Modal
} from "antd";
import React, { createRef, useEffect, useState } from "react";

type PropType = {
  visible: boolean;
  onCancelCouponModal: (e: React.MouseEvent<HTMLElement>) => void;
  onOkCouponModal: (type: string, value: number, rate: number, coupon: string) => void;
  couponInputText?: string;
  coupon?: string;
};

function PickCouponModal(props: PropType){
  const { visible, onCancelCouponModal, onOkCouponModal, couponInputText } = props;
  const [_coupon, setCoupon] = useState<string>(couponInputText || "");

  const formRef = createRef<FormInstance>();
  const onSubmit = () => {
    onOkCouponModal("", 0, 0, _coupon);
    // setCoupon(_coupon);
  };

  const onchangeCoupon = (e: any) => {
    setCoupon(e.target.value);
  };
  const handleEnterToSubmit = (key: any) => {
    if (key === 13) {
      onSubmit();
    }
  };

  useEffect(() => {
    if(couponInputText !==undefined) {
			setCoupon(couponInputText)
		}
  }, [couponInputText])

  return (
    <Modal
      title="Mã giảm giá"
      onCancel={(e) => {
        onCancelCouponModal(e)
      }}
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
        <Input
          placeholder="Mã giảm giá"
          onFocus={(e) => e.target.select()}
          style={{ width: "99%" }}
          value={_coupon}
          onChange={onchangeCoupon}
        />
      </Form>
    </Modal>
  );
};

export default PickCouponModal;
