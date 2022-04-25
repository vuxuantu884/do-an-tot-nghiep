import { Form, FormInstance, Modal, ModalProps } from "antd";
import NumberInput from "component/custom/number-input.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import React from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

export type initialFormModalReasonCustomerFeeType = {
  customer_fee: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalReasonCustomerFeeType;
};

function ModalWarrantyReasonsCustomerFee(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, ...rest } = props;

  return (
    <Modal title="Cập nhật phí báo khách" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item name="customer_fee">
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="Nhập phí báo khách"
            style={{
              textAlign: "left",
            }}
            maxLength={14}
            minLength={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalWarrantyReasonsCustomerFee);
