import { AutoComplete, Button, Col, Form, Input, Modal, Radio, Row, Select, Switch, Typography } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import CustomDatepicker from "component/custom/date-picker.custom";
import { formatCurrency } from "utils/AppUtils";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  PoPaymentCreateAction,
  PoPaymentDeleteAction,
  PoPaymentUpdateAction,
} from "domain/actions/po/po-payment.action";
import { PoPaymentMethod, PoPaymentStatus } from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import moment from "moment";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ModalConfirm from "component/modal/ModalConfirm";
import { HttpStatus } from "config/http-status.config";
// import CustomInputChange from "component/custom/custom-input-change";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import TextArea from "antd/lib/input/TextArea";

type PaymentModalProps = {
  visible: boolean;
  poId: number;
  remainPayment: number;
  indexPaymentItem: string;
  purchasePayment?: PurchasePayments;
  poData: PurchaseOrder;
  onCancel: () => void;
  deletePayment: () => void;
  onOk: (isLoad: boolean) => void;
  initValue: PurchasePayments | null,
};
const { Item } = Form;
const PaymentModal: React.FC<PaymentModalProps> = (
  props: PaymentModalProps
) => {
  const dispatch = useDispatch();
  const {
    poId,
    poData,
    purchasePayment,
    visible,
    onCancel,
    onOk,
    remainPayment,
  } = props;
  const [formPayment] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [disabledRef, setDisabledRef] = React.useState(false);
  const [isVisibleModalDeleteWarning, setIsVisibleModalDeleteWarning] =
    React.useState(false);
  const [dataValue, setDataValue] = React.useState<Array<any>>([])
  const [percentPayment, setPercentPayment] = React.useState<string>("")

  const onOkPress = useCallback(() => {
    // onOk();
    formPayment.submit();
  }, [formPayment]);

  const handleCancel = () => {
    onCancel();
  };
  const createCallback = useCallback(
    (result: PurchasePayments | null) => {
      if (result !== null && result !== undefined) {
        setConfirmLoading(false);
        showSuccess("Thêm mới dữ liệu thành công");
        onOk(true);
        formPayment.resetFields();
      }
    },
    [formPayment, onOk]
  );

  const updateCallback = useCallback(
    (result: PurchasePayments | null) => {
      if (result !== null && result !== undefined) {
        setConfirmLoading(false);
        showSuccess("cập nhật dữ liệu thành công");
        onOk(true);
        formPayment.resetFields();
      }
    },
    [formPayment, onOk]
  );

  const deleteCallback = useCallback(
    (result) => {
      if (result === HttpStatus.SUCCESS) {
        setConfirmLoading(false);
        showSuccess("Xoá thành công");
        onOk(true);
        formPayment.resetFields();
      }
    },
    [formPayment, onOk]
  );

  const onFinish = useCallback(
    (values: any) => {
      setConfirmLoading(true);
      let data = formPayment.getFieldsValue(true);
      data.amount = parseInt(data.amount.replace(/\D/g, ''))
      if (data.id) {
        if (data.amount < 1000) {
          showError("Thanh toán không được nhỏ hơn 1.000")
          return
        }
        dispatch(PoPaymentUpdateAction(poId, data.id, data, updateCallback));
      } else {
        values.status = PoPaymentStatus.UNPAID;
        values.amount = parseInt(values.amount?.replace(/\D/g, ''))
        if (values.amount < 1000) {
          showError("Thanh toán không được nhỏ hơn 1.000")
          return
        }
        dispatch(PoPaymentCreateAction(poId, values, createCallback));
      }
    },
    [createCallback, dispatch, formPayment, poId, updateCallback]
  );

  const onDeletePayment = useCallback(() => {
    let data = formPayment.getFieldsValue(true);
    if (data.id) {
      dispatch(PoPaymentDeleteAction(poId, data.id, deleteCallback));
    }
  }, [dispatch, formPayment, poId, deleteCallback]);

  const onChangePaymentMethod = (e: any) => {
    if (e.target.value === PoPaymentMethod.BANK_TRANSFER) {
      setDisabledRef(false);
    } else {
      formPayment.setFieldsValue({ reference: "" });
      setDisabledRef(true);
    }
    // setValue(e.target.value);
  };

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;
  useEffect(() => {
    if (!visible && prevVisible) {
      formPayment.resetFields();
      setPercentPayment("")
      // setInputNumber("")
      setDataValue([])
    }
  }, [formPayment, prevVisible, visible]);
  useEffect(() => {
    if (visible) {
      if (purchasePayment) {
        if (purchasePayment.is_refund && purchasePayment.amount) {
          purchasePayment.amount = Math.abs(purchasePayment.amount);
        }
        formPayment.setFieldsValue(purchasePayment);
        const amount = purchasePayment.amount ?? 0
        const percentage = ((amount / poData.total_payment) * 100).toFixed(2) + "%"
        setPercentPayment(percentage)
        formPayment.setFieldsValue({ amount: purchasePayment?.amount?.toLocaleString() });
      } else {
        formPayment.setFieldsValue({ payment_method_code: PoPaymentMethod.BANK_TRANSFER })
      }
    }
  }, [formPayment, poData.total_payment, purchasePayment, visible]);
  useEffect(() => {
    if (props.initValue) {
      formPayment.setFieldsValue(props.initValue);
    }
  }, [formPayment, props.initValue])

  const handleSearch = (value: number) => {
    const dataArray = [
      { percentage: value, text: `${value}% - Không bao gồm VAT`, tax: false },
      { percentage: value, text: `${value}% - Bao gồm VAT`, tax: true },
      { percentage: 100, text: "Thanh toán lần cuối", tax: true },
    ]
    if (value > 100) {
      setDataValue([])
      formPayment.setFieldsValue({ amount: value.toLocaleString() });
    } else {
      setDataValue(dataArray)
    }
    const amountPercent = ((value / poData.total_payment) * 100).toFixed(2) + " %"
    setPercentPayment(amountPercent)
  }

  const handleSelect = (data: string) => {
    const array = data.split("-")
    const number = parseInt(array[0])
    const taxed = array[1];
    let percentage: string;
    if (taxed === "true" && number === 100) {
      formPayment.setFieldsValue({ amount: Math.round(remainPayment).toLocaleString() });
      percentage = ((remainPayment / poData.total_payment) * 100).toFixed(2) + "%"
    } else if (taxed === "false") {
      const untaxedAmount = Math.round((poData.untaxed_amount * number) / 100)
      formPayment.setFieldsValue({ amount: untaxedAmount.toLocaleString() });
      percentage = ((untaxedAmount / poData.total_payment) * 100).toFixed(2) + "%"
    } else {
      const amount = Math.round((poData.total_payment * number) / 100)
      percentage = ((amount / poData.total_payment) * 100).toFixed(2) + "%"
      formPayment.setFieldsValue({ amount: amount.toLocaleString() });
    }
    setPercentPayment(percentage)
  }
  const options = dataValue.map((d: any, i) => <Select.Option key={i} value={`${d.percentage}-${d.tax}`}>{d.text}</Select.Option>);
  return (
    <Modal
      title={purchasePayment?.id ? "Sửa thanh toán " : "Tạo thanh toán "}
      visible={visible}
      centered
      okText={purchasePayment?.id ? "Lưu thanh toán " : "Tạo thanh toán "}
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      confirmLoading={confirmLoading}
      onCancel={handleCancel}
      footer={
        purchasePayment && [
          <AuthWrapper acceptPermissions={[PurchaseOrderPermission.payments_delete]}>
            <Button
              danger
              onClick={() => {
                setIsVisibleModalDeleteWarning(true);
              }}
              style={{ float: "left" }}
            >
              <DeleteOutlined /> Xoá
            </Button>
          </AuthWrapper>
          ,
          <Button key="back" onClick={handleCancel}>
            Thoát
          </Button>,
          <Button key="submit" type="primary" onClick={onOkPress}>
            {purchasePayment ? "Lưu thanh toán " : "Tạo thanh toán "}
          </Button>,
        ]
      }
    >
      <Form
        layout="vertical"
        initialValues={{
          is_refund: false
        }}
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
              tooltip={{
                title: (<div><b>Số thanh toán</b> là <b>%</b> sẽ tính dựa trên tổng tiền</div>),
                icon: <InfoCircleOutlined />,
              }}
              help={
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <div className="text-muted mt-10 mb-10">
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
              {/* <CustomInputChange totalPayment={poData.total_payment} placeholder="0" remainPayment={Math.round(remainPayment)}/> */}
              <AutoComplete
                style={{ textAlign: 'right', width: '100%', direction: "rtl" }}
                placeholder="0"
                defaultActiveFirstOption={false}
                showArrow={false}
                onSelect={handleSelect}
                onChange={(value) => {
                  const number = Number(value.trim()
                    .replaceAll(",", "")
                    .replaceAll(".", "")
                    .replace(/\D+/g, ""),
                  );

                  if (!number || isNaN(number)) {
                    setDataValue([]);
                    setPercentPayment("");
                    formPayment.setFieldsValue({ amount: "0" });
                    return;
                  } else {
                    if (remainPayment && number >= remainPayment) {
                      const percentage = ((remainPayment / poData.total_payment) * 100).toFixed(2) + "%"
                      setPercentPayment(percentage)
                      formPayment.setFieldsValue({ amount: Math.round(remainPayment).toLocaleString() });
                      return remainPayment
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
              <Input
                placeholder="Nhập số tham chiếu"
                disabled={disabledRef}
                maxLength={255}
              />
            </Item>
          </Col>
          <Col xs={24} lg={24}>
            <Item name="note" label="Ghi chú">
              <TextArea rows={2} maxLength={255} placeholder="Nhập ghi chú" />
            </Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Item valuePropName="checked" name="is_refund" noStyle>
                <Switch className="ant-switch-success" />
              </Item>
              <span style={{ marginLeft: 5 }}>Yêu cầu nhà cung cấp hoàn tiền</span>
            </div>
          </Col>
        </Row>
      </Form>
      <ModalConfirm
        onCancel={() => {
          setIsVisibleModalDeleteWarning(false);
        }}
        onOk={() => {
          onDeletePayment();
          setIsVisibleModalDeleteWarning(false);
        }}
        okText="Đồng ý"
        cancelText="Hủy"
        title={`Bạn có muốn xoá thanh toán không?`}
        subTitle=""
        visible={isVisibleModalDeleteWarning}
      />
    </Modal>
  );
};

export default PaymentModal;
