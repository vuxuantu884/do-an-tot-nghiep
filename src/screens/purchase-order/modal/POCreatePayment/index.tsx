/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Row,
} from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PoPaymentMethod } from "utils/Constants";
import moment from "moment";
import { POCreatePaymentModalStyled } from "./styles";
import {
  PurchasePayments,
  PurchasePaymentsCreate,
} from "model/purchase-order/purchase-payment.model";
import { DeleteOutlined } from "@ant-design/icons";
import { POField } from "model/purchase-order/po-field";

const initPOCreatePaymentValue = {
  payment_method_code: "",
  amount: 0,
  reference: "",
  transaction_date: "",
  note: "",
  is_refund: false
};

type POCreatePaymentModalProps = {
  isEditPage: Boolean;
  visible: boolean;
  formMain: FormInstance;
  remainPayment: number;
  purchasePayment?: PurchasePaymentsCreate;
  indexPurchasePayment: string;
  onCancel: () => void;
  onChangeDataPayments: (item: Array<PurchasePayments>) => void;
  deletePayment?: (value: number) => void;
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
    isEditPage,
    deletePayment,
  } = props;
  const [disabledRef, setDisabledRef] = React.useState(false);
  const [remainPaymentNumber, setRemainPaymentNumber] = React.useState(0);
  const [formPayment] = Form.useForm();

  const onFinish = useCallback(() => {
    const paymentNewData = {
      payment_method_code: formPayment.getFieldValue("payment_method_code"),
      transaction_date: formPayment.getFieldValue("transaction_date"),
      amount: formPayment.getFieldValue("amount"),
      reference: formPayment.getFieldValue("reference"),
      note: formPayment.getFieldValue("note"),
      is_refund: formPayment.getFieldValue("is_refund")
    };
    if (indexPurchasePayment) {
      const old_payments = formMain.getFieldValue("payments");
      old_payments[indexPurchasePayment] = paymentNewData;
      onChangeDataPayments(old_payments);
    } else {
      const old_payments = formMain.getFieldValue("payments");
      const new_payments = [...old_payments];
      new_payments.push(paymentNewData);
      onChangeDataPayments(new_payments);
    }
    onCancel();
  }, [
    formMain,
    formPayment,
    onCancel,
    indexPurchasePayment,
    onChangeDataPayments,
  ]);

  const onOkPress = useCallback(() => {
    formPayment.submit();
  }, [formPayment]);

  const handleCancel = () => {
    onCancel();
  };

  const loadRemainPayment = useCallback(() => {
    let remainPaymentTotal = formMain.getFieldValue(POField.total);
    const payments = formMain.getFieldValue(POField.payments);

    if (payments && payments.length > 0) {
      payments.forEach((element: any) => {
        remainPaymentTotal -= element.amount;
      });

      if (indexPurchasePayment) {
        remainPaymentTotal += payments[indexPurchasePayment].amount;
      }

      setRemainPaymentNumber(remainPaymentTotal);
    }
    setRemainPaymentNumber(remainPaymentTotal);
  }, [formMain, indexPurchasePayment]);

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
      loadRemainPayment();
      if (purchasePayment) {
        formPayment.setFieldsValue(purchasePayment);
      } else formPayment.setFieldsValue(initPOCreatePaymentValue);
    }
  }, [formPayment, loadRemainPayment, purchasePayment, visible]);

  return (
    <Modal
      title={purchasePayment ? "Sửa yêu cầu hoàn tiền " : "Tạo thanh toán "}
      visible={visible}
      centered
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      onCancel={handleCancel}
      footer={
        purchasePayment && [
          <Button
            danger
            onClick={() => {
              deletePayment && deletePayment(parseInt(indexPurchasePayment));
            }}
            className="edit-delete-button"
            style={{ float: "left" }}
          >
            <DeleteOutlined /> Xoá
          </Button>,
          <Button key="back" onClick={handleCancel}>
            Huỷ
          </Button>,
          <Button key="submit" type="primary" onClick={onOkPress}>
            {purchasePayment ? "Lưu thanh toán " : "Tạo thanh toán "}
          </Button>,
        ]
      }
    >
      <POCreatePaymentModalStyled>
        <Form
          form={formPayment}
          initialValues={initPOCreatePaymentValue}
          onFinish={onFinish}
          className="update-customer-modal"
          autoComplete="off"
          layout="vertical"
        >
          <Item noStyle name="is_refund" hidden>
            <Input />
          </Item>
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
                style={{ width: "100%"}}
              >
                <Radio.Group onChange={onChangePaymentMethod}>
                  <Radio
                    value={PoPaymentMethod.BANK_TRANSFER}
                    key={PoPaymentMethod.BANK_TRANSFER}
                  >
                    Chuyển khoản
                  </Radio>
                  <Radio
                    value={PoPaymentMethod.CASH}
                    key={PoPaymentMethod.CASH}
                  >
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
                  {
                    required: true,
                    message: "Vui lòng nhập số tiền thanh toán",
                  },
                ]}
                help={
                  <div className="text-muted">
                    {`Số tiền còn phải trả: ${formatCurrency(
                      remainPaymentNumber
                    )}`}
                  </div>
                }
              >
                <NumberInput
                  format={(a: string) =>
                    formatCurrency(a ? Math.abs(parseInt(a)) : 0)
                  }
                  replace={(a: string) => replaceFormatString(a)}
                  min={0}
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
