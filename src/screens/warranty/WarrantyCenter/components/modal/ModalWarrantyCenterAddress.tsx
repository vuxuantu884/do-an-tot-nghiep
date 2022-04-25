import { Form, FormInstance, Input, Modal, ModalProps } from "antd";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import React from "react";

export type initialFormModalCenterAddressType = {
  address: string;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalCenterAddressType;
};

function ModalWarrantyCenterAddress(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, ...rest } = props;

  return (
    <Modal title="Cập nhật địa chỉ" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          labelAlign={"left"}
          name="address"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập địa chỉ",
            },
          ]}
        >
          <Input placeholder="Nhập địa chỉ" maxLength={250} minLength={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalWarrantyCenterAddress);
