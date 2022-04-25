import { Form, FormInstance, Modal, ModalProps } from "antd";
import NumberInput from "component/custom/number-input.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import React from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";

export type initialFormModalReasonPriceType = {
  price: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalReasonPriceType;
};

function ModalWarrantyReasonsPrice(props: PropTypes) {
  const {
    onCancel,
    onOk,
    form,
    handleOk,
    handleCancel,
    initialFormValues,
    ...rest
  } = props;

  return (
    <Modal
      title="Cập nhật phí thực tế"
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item name="price">
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="Nhập phí thực tế"
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

export default withWarrantyModalForm(ModalWarrantyReasonsPrice);
