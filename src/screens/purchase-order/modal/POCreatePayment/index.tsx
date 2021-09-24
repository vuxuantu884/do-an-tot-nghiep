/* eslint-disable @typescript-eslint/no-unused-vars */
import { Col, Form, FormInstance, Input, Modal, Radio, Row } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PoPaymentMethod } from "utils/Constants";
import moment from "moment";
import { POCreatePaymentModalStyled } from "./styles";
import { PurchasePayments, PurchasePaymentsCreate } from "model/purchase-order/purchase-payment.model";

const initPOCreatePaymentValue = {
  payment_method_code: '',
  amount: 0,
  reference: '',
  transaction_date: '',
  note: '',
}

type POCreatePaymentModalProps = {
  visible: boolean;
  formMain: FormInstance;
  remainPayment: number;
  purchasePayment?: PurchasePaymentsCreate;
  indexPurchasePayment?: string;
  onCancel: () => void;
  onChangeDataPayments: (item: Array<PurchasePayments>) => void; 
};
const { Item } = Form;
const POCreatePaymentModal: React.FC<POCreatePaymentModalProps> = (
  props: POCreatePaymentModalProps
) => {
  const {
    visible,
    onCancel,
    remainPayment,
    purchasePayment,
    indexPurchasePayment,
    formMain,
    onChangeDataPayments,
  } = props;
  const [disabledRef, setDisabledRef] = React.useState(false);
  const [formPayment] = Form.useForm();

  const onFinish = useCallback(() => {
    if(indexPurchasePayment){
      const old_payments = formMain.getFieldValue('payments');
      const paymentNewData = {
        payment_method_code: formPayment.getFieldValue('payment_method_code'),
        transaction_date: formPayment.getFieldValue('transaction_date'),
        amount: formPayment.getFieldValue('amount'),
        reference: formPayment.getFieldValue('reference'),
        note: formPayment.getFieldValue('note'),
      }
      old_payments[indexPurchasePayment] = paymentNewData;
      onChangeDataPayments(old_payments);
      
    } else {
      const old_payments = formMain.getFieldValue('payments');
      const paymentData = {
        payment_method_code: formPayment.getFieldValue('payment_method_code'),
        transaction_date: formPayment.getFieldValue('transaction_date'),
        amount: formPayment.getFieldValue('amount'),
        reference: formPayment.getFieldValue('reference'),
        note: formPayment.getFieldValue('note'),
      }
      const new_payments = [...old_payments];
      new_payments.push(paymentData);
      onChangeDataPayments(new_payments);
    }
    onCancel();
  }, [formMain, formPayment, onCancel, indexPurchasePayment, onChangeDataPayments]);

  const onOkPress = useCallback(() => {
    formPayment.submit();
  }, [formPayment]);

  const handleCancel = () => {
    onCancel();
  };

  const onChangePaymentMethod = (e: any) => {
    if (e.target.value === PoPaymentMethod.BANK_TRANSFER) {
      setDisabledRef(false);
    } else {
      setDisabledRef(true);
    }
  };

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (visible) {
      if (purchasePayment) {
        formPayment.setFieldsValue(purchasePayment);
      }
      else formPayment.setFieldsValue(initPOCreatePaymentValue);
    }
  }, [formPayment, purchasePayment, visible]);
  return (
    <Modal
      title={purchasePayment ? "Sửa thanh toán " : "Tạo thanh toán "}
      visible={visible}
      centered
      okText={purchasePayment ? "Lưu thanh toán " : "Tạo thanh toán "}
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      onCancel={handleCancel}
    >
      
      <POCreatePaymentModalStyled>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          form={formPayment}
          initialValues={initPOCreatePaymentValue}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán",
                  },
                ]}
                label="Phương thức thanh toán"
                name="payment_method_code"
              >
                <Radio.Group onChange={onChangePaymentMethod}>
                  <Radio
                    value={PoPaymentMethod.BANK_TRANSFER}
                    key={PoPaymentMethod.BANK_TRANSFER}
                  >
                    Chuyển khoản
                  </Radio>
                  <Radio value={PoPaymentMethod.CASH} key={PoPaymentMethod.CASH}>
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
                <CustomDatepicker
                  disableDate={(date) => date <= moment().startOf("days")}
                  style={{ width: "100%" }}
                  placeholder="dd/mm/yyyy"
                />
              </Item>
            </Col>

            <Col xs={24} lg={12}>
              <Item
                name="amount"
                label="Số tiền thanh toán"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền thanh toán" },
                ]}
                help={
                  <div className="text-muted">
                    {`Số tiền còn phải trả: ${formatCurrency(remainPayment)}`}
                  </div>
                }
              >
                <NumberInput
                  format={(a: string) =>
                    formatCurrency(a ? Math.abs(parseInt(a)) : 0)
                  }
                  replace={(a: string) => replaceFormatString(a)}
                  min={0}
                  max={remainPayment}
                  default={0}
                  placeholder="Nhập số tiền cần thanh toán"
                />
              </Item>
            </Col>
            <Col xs={24} lg={12}>
              <Item name="reference" label="Số tham chiếu">
                <Input
                  placeholder="Nhập số tham chiếu"
                  disabled={disabledRef}
                  maxLength={255}
                />
              </Item>
            </Col>
            <Col xs={24} lg={24}>
              <Item name="note" label="Ghi chú">
                <Input maxLength={255} placeholder="Nhập ghi chú" />
              </Item>
            </Col>
          </Row>
        </Form>
      </POCreatePaymentModalStyled>
    </Modal>
  );
};

export default POCreatePaymentModal;
