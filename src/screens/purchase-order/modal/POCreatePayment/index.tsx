/* eslint-disable @typescript-eslint/no-unused-vars */
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Typography,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import CustomInputChange from "component/custom/custom-input-change";
import CustomDatepicker from "component/custom/date-picker.custom";
import { POField } from "model/purchase-order/po-field";
import {
  PurchasePayments,
  PurchasePaymentsCreate,
} from "model/purchase-order/purchase-payment.model";
import moment from "moment";
import React, { useCallback, useEffect, useRef } from "react";
import { formatCurrency } from "utils/AppUtils";
import { PoPaymentMethod, PoPaymentStatus } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import { POCreatePaymentModalStyled } from "./styles";

const initPOCreatePaymentValue = {
  payment_method_code: PoPaymentMethod.BANK_TRANSFER,
  amount: 0,
  reference: "",
  transaction_date: "",
  note: "",
  is_refund: false,
};

type POCreatePaymentModalProps = {
  isEditPage: Boolean;
  visible: boolean;
  formMain: FormInstance;
  remainPayment: number;
  purchasePayment?: any;
  indexPurchasePayment: string;
  onCancel: () => void;
  onChangeDataPayments: (item: Array<PurchasePayments>) => void;
  deletePayment?: (value: number) => void;
};
const { Item } = Form;
const POCreatePaymentModal: React.FC<POCreatePaymentModalProps> = (
  props: POCreatePaymentModalProps,
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
  // const [remainPaymentNumber, setRemainPaymentNumber] = React.useState(0);
  // const [totalPayment, setTotalPayment] = React.useState(0);
  const [formPayment] = Form.useForm();
  const [dataValue, setDataValue] = React.useState<Array<any>>([]);
  const [percentPayment, setPercentPayment] = React.useState<string>("");

  const onFinish = useCallback(() => {
    const paymentNewData = {
      payment_method_code: formPayment.getFieldValue("payment_method_code"),
      transaction_date: formPayment.getFieldValue("transaction_date"),
      amount: formPayment.getFieldValue("amount"),
      reference: formPayment.getFieldValue("reference"),
      note: formPayment.getFieldValue("note"),
      is_refund: formPayment.getFieldValue("is_refund"),
      status: PoPaymentStatus.DRAFT,
    };
    let old_payments: any = formMain.getFieldValue("payments");
    if (!old_payments || old_payments === null) {
      old_payments = [];
    }
    paymentNewData.amount = parseInt(paymentNewData.amount.replace(/\D/g, ""));
    if (paymentNewData.amount < 1000) {
      showError("Thanh toán không được nhỏ hơn 1.000");
      return;
    }
    if (indexPurchasePayment) {
      old_payments[indexPurchasePayment] = paymentNewData;
      onChangeDataPayments(old_payments);
    } else {
      const new_payments = [...old_payments];
      new_payments.push(paymentNewData);
      onChangeDataPayments(new_payments);
    }
    onCancel();
  }, [formMain, formPayment, onCancel, indexPurchasePayment, onChangeDataPayments]);

  const onOkPress = useCallback(() => {
    formPayment.submit();
  }, [formPayment]);

  const handleCancel = () => {
    onCancel();
    setPercentPayment("");
    setDataValue([]);
  };

  // const loadRemainPayment = useCallback(() => {
  //   let remainPaymentTotal = formMain.getFieldValue(POField.total);
  //   setTotalPayment(remainPaymentTotal);
  //   const payments = formMain.getFieldValue(POField.payments);

  //   if (payments && payments.length > 0) {
  //     payments.forEach((element: any) => {
  //       remainPaymentTotal -= element.amount;
  //     });

  //     if (indexPurchasePayment) {
  //       remainPaymentTotal += payments[indexPurchasePayment].amount;
  //     }

  //     setRemainPaymentNumber(remainPaymentTotal);
  //   }
  //   setRemainPaymentNumber(remainPaymentTotal);
  // }, [formMain, indexPurchasePayment]);

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
      // loadRemainPayment();
      if (purchasePayment) {
        purchasePayment.amount = purchasePayment.amount?.toLocaleString();
        formPayment.setFieldsValue(purchasePayment);
      } else formPayment.setFieldsValue(initPOCreatePaymentValue);
    }
  }, [formPayment, purchasePayment, visible]);

  const handleSearch = (value: number) => {
    const dataArray = [
      { percentage: value, text: `${value}% - Không bao gồm VAT`, tax: false },
      { percentage: value, text: `${value}% - Bao gồm VAT`, tax: true },
      { percentage: 100, text: "Thanh toán lần cuối", tax: true },
    ];
    if (value > 100) {
      setDataValue([]);
      formPayment.setFieldsValue({ amount: value.toLocaleString() });
    } else {
      setDataValue(dataArray);
    }
    const amountPercent = ((value / remainPayment) * 100).toFixed(2) + " %";
    setPercentPayment(amountPercent);
  };

  const handleSelect = (data: string) => {
    const poData = formMain.getFieldsValue(true);
    const totalPaid = poData.total_paid ?? 0;
    const remainPayment = poData.total_payment - totalPaid;
    const array = data.split("-");
    const number = parseInt(array[0]);
    const taxed = array[1];
    let percentage = "";
    if (taxed === "true" && number === 100) {
      formPayment.setFieldsValue({
        amount: Math.round(remainPayment).toLocaleString(),
      });
      percentage = ((remainPayment / poData.total_payment) * 100).toFixed(2) + "%";
    } else if (taxed === "false") {
      const untaxedAmount = Math.round((poData.untaxed_amount * number) / 100);
      formPayment.setFieldsValue({ amount: untaxedAmount.toLocaleString() });
      percentage = ((untaxedAmount / poData.total_payment) * 100).toFixed(2) + "%";
    } else {
      const amount = Math.round((poData.total_payment * number) / 100);
      percentage = ((amount / poData.total_payment) * 100).toFixed(2) + "%";
      formPayment.setFieldsValue({ amount: amount.toLocaleString() });
    }
    setPercentPayment(percentage);
  };

  const options = dataValue.map((d: any, i) => (
    <Select.Option key={i} value={`${d.percentage}-${d.tax}`}>
      {d.text}
    </Select.Option>
  ));

  return (
    <Modal
      title={purchasePayment ? "Sửa yêu cầu hoàn tiền " : "Tạo thanh toán mới"}
      visible={visible}
      centered
      cancelText="Hủy"
      okText="Tạo thanh toán"
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
            Thoát
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
                style={{ width: "100%" }}
              >
                <Radio.Group onChange={onChangePaymentMethod}>
                  <Radio value={PoPaymentMethod.BANK_TRANSFER} key={PoPaymentMethod.BANK_TRANSFER}>
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
                rules={[{ required: true, message: "Vui lòng nhập ngày thanh toán" }]}
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
                tooltip={{
                  title: "<b>Thanh toán</b> là % sẽ tính dựa trên tổng tiền",
                  icon: <InfoCircleOutlined />,
                }}
                help={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <div className="text-muted">
                      {`Số tiền còn phải trả: ${formatCurrency(Math.round(remainPayment))}`}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Typography.Text type="danger">
                        {percentPayment ? "~" + percentPayment : ""}
                      </Typography.Text>
                    </div>
                  </div>
                }
              >
                {/* <CustomInputChange totalPayment={totalPayment} placeholder="0" remainPayment={Math.round(remainPaymentNumber)}/> */}
                <AutoComplete
                  style={{
                    textAlign: "right",
                    width: "100%",
                    direction: "rtl",
                  }}
                  placeholder="0"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  onSelect={handleSelect}
                  onChange={(value) => {
                    const number = Number(
                      value.trim().replaceAll(",", "").replaceAll(".", "").replace(/\D+/g, ""),
                    );
                    if (!number || isNaN(number)) {
                      setDataValue([]);
                      setPercentPayment("");
                      formPayment.setFieldsValue({ amount: "0" });
                      return;
                    } else {
                      if (remainPayment && number >= remainPayment) {
                        const poData = formMain.getFieldsValue(true);
                        const percentage =
                          ((remainPayment / poData.total_payment) * 100).toFixed(2) + "%";
                        setPercentPayment(percentage);
                        formPayment.setFieldsValue({
                          amount: Math.round(remainPayment).toLocaleString(),
                        });
                        return remainPayment;
                      }
                      handleSearch(number);
                      formPayment.setFieldsValue({
                        amount: number.toLocaleString(),
                      });
                    }
                  }}
                  notFoundContent={null}
                  dropdownAlign="right"
                >
                  {options}
                </AutoComplete>
              </Item>
            </Col>
            <Col xs={24} lg={12}>
              <Item name="reference" label="Số tham chiếu">
                <Input placeholder="Nhập số tham chiếu" disabled={disabledRef} maxLength={255} />
              </Item>
            </Col>
            <Col xs={24} lg={24}>
              <Item name="note" label="Ghi chú">
                <TextArea rows={2} maxLength={255} placeholder="Nhập ghi chú" />
              </Item>
            </Col>
          </Row>
        </Form>
      </POCreatePaymentModalStyled>
    </Modal>
  );
};

export default POCreatePaymentModal;
