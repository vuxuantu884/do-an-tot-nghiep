import { Col, Form, Input, Modal, Radio, Row } from "antd";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";

type PaymentModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
};
const { Item } = Form;
const PaymentModal: React.FC<PaymentModalProps> = (
  props: PaymentModalProps
) => {
  const dispatch = useDispatch();
  const { visible, onCancel, onOk } = props;
  const [formPayment] = Form.useForm();
  const onOkPress = useCallback(() => {
    // onOk();
    formPayment.submit();
  }, [formPayment]);

  const handleCancel = () => {
    onCancel();
  };

  const onFinish = useCallback(
    (values: PurchasePayments) => {
    
    },
    []
  );

  useEffect(() => {}, []);

  return (
    <Modal
      title="Tạo thanh toán "
      visible={visible}
      centered
      okText="Tạo thanh toán"
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      onCancel={handleCancel}
    >
      <Form
        layout="vertical"
        form={formPayment}
        scrollToFirstError
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại nhà cung cấp",
                },
              ]}
              label="Hình thức thanh toán"
              name="payment_method_id"
            >
              <Radio.Group>
                <Radio value="1" key="1">
                  Chuyển khoản
                </Radio>
                <Radio value="2" key="2">
                  Tiền mặt
                </Radio>
              </Radio.Group>
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              name="transaction_date"
              label="Ngày thanh toán"
              rules={[
                { required: true, message: "Vui lòng nhập ngày thanh toán" },
              ]}
            >
              <CustomDatepicker style={{ width: "100%" }} />
            </Item>
          </Col>

          <Col xs={24} lg={12}>
            <Item
              name="amount"
              label="Số tiền thanh toán"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền thanh toán" },
              ]}
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder=""
              />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item name="reference" label="Số tham chiếu">
              <Input />
            </Item>
          </Col>
          <Col xs={24} lg={24}>
            <Item name="note" label="Ghi chú">
              <Input.TextArea />
            </Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PaymentModal;
