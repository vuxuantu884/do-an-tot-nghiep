import { Button, Checkbox, Col, Form, Input, Modal, Radio, Row } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { showSuccess } from "utils/ToastUtils";
import {
  PoPaymentCreateAction,
  PoPaymentDeleteAction,
  PoPaymentUpdateAction,
} from "domain/actions/po/po-payment.action";
import { PoPaymentMethod, PoPaymentStatus } from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import moment from "moment";
import { POUtils } from "utils/POUtils";
import { DeleteOutlined } from "@ant-design/icons";
import ModalConfirm from "component/modal/ModalConfirm";
import { HttpStatus } from "config/http-status.config";

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
};
const { Item } = Form;
const PaymentModal: React.FC<PaymentModalProps> = (
  props: PaymentModalProps
) => {
  const dispatch = useDispatch();
  const {
    poId,
    purchasePayment,
    visible,
    onCancel,
    onOk,
    remainPayment,
    poData,
  } = props;
  const [formPayment] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [disabledRef, setDisabledRef] = React.useState(false);
  const [isVisibleModalDeleteWarning, setIsVisibleModalDeleteWarning] =
    React.useState(false);

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
    (values: PurchasePayments) => {
      setConfirmLoading(true);
      let data = formPayment.getFieldsValue(true);
      values.status_po = POUtils.calculatePOStatus(
        poData,
        null,
        values,
        "update"
      );

      if (data.id) {
        if (data.status === PoPaymentStatus.REFUND) data.amount = -data.amount;
        dispatch(PoPaymentUpdateAction(poId, data.id, data, updateCallback));
      } else {
        values.status = PoPaymentStatus.UNPAID;
        dispatch(PoPaymentCreateAction(poId, values, createCallback));
      }
    },
    [createCallback, dispatch, formPayment, poData, poId, updateCallback]
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
    }
  }, [formPayment, prevVisible, visible]);
  useEffect(() => {
    if (visible) {
      if (purchasePayment) {
        formPayment.setFieldsValue(purchasePayment);
      }
    }
  }, [formPayment, purchasePayment, visible]);
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
          <Button
            danger
            onClick={() => {
              setIsVisibleModalDeleteWarning(true);
            }}
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
        <Row gutter={24}>
          <Col>
            <Item valuePropName="checked" name="is_refund" noStyle>
              <Checkbox>Yêu cầu nhà cung cấp hoàn tiền</Checkbox>
            </Item>
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
