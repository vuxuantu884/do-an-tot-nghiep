import { Col, Form, Input, Modal, Radio, Row } from "antd";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import CustomDatepicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { showSuccess } from "utils/ToastUtils";
import {
  PoPaymentCreateAction,
  PoPaymentUpdateAction,
} from "domain/actions/po/po-payment.action";
import { PoPaymentMethod } from "utils/Constants";

type PaymentModalProps = {
  visible: boolean;
  poId: number;
  purchasePayment?: PurchasePayments;
  onCancel: () => void;
  onOk: () => void;
};
const { Item } = Form;
const PaymentModal: React.FC<PaymentModalProps> = (
  props: PaymentModalProps
) => {
  const dispatch = useDispatch();
  const { poId,purchasePayment, visible, onCancel, onOk } = props;
  const [formPayment] = Form.useForm();

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
        showSuccess("Thêm mới dữ liệu thành công");
        onOk();
        formPayment.resetFields();
      }
    },
    [formPayment, onOk]
  );
  const updateCallback = useCallback(
    (result: PurchasePayments | null) => {
      if (result !== null && result !== undefined) {
        showSuccess("cập nhật dữ liệu thành công");
        onOk();
        formPayment.resetFields();
      }
    },
    [formPayment, onOk]
  );
  const onFinish = useCallback(
    (values: PurchasePayments) => {
      let data = formPayment.getFieldsValue(true);
      debugger;
      if (data.id) {
        dispatch(
          PoPaymentUpdateAction(
            poId,
            data.id,
            values,
            updateCallback
          )
        );
      } else {
        dispatch(
          PoPaymentCreateAction(poId, values, createCallback)
        );
      }
    },
    [createCallback, dispatch, formPayment, poId, updateCallback]
  );

  const prevVisibleRef = useRef(false);
  useEffect(() => {
    prevVisibleRef.current = visible;
  }, [visible]);
  const prevVisible = prevVisibleRef.current;
  useEffect(() => {
    if (!visible && prevVisible) {
      debugger;
      formPayment.resetFields();
    }
  }, [formPayment, prevVisible, visible]);
  useEffect(() => {
    if (visible) {
      debugger;
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
              name="payment_method_code"
            >
              <Radio.Group>
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
