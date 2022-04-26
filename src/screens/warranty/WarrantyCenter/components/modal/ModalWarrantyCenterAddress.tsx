import { Form, FormInstance, Input, Modal, ModalProps } from "antd";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyCenterModel } from "model/warranty/warranty.model";
import React from "react";

export type initialFormModalCenterAddressType = {
  address: string;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalCenterAddressType;
  record?: WarrantyCenterModel | undefined;
};

function ModalWarrantyCenterAddress(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, record, ...rest } = props;

  return (
    <Modal 
    title={`Cập nhật địa chỉ trung tâm "${record?.name}"`}
    onCancel={handleCancel} onOk={handleOk} {...rest}>
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
