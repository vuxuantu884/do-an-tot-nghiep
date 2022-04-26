import { Form, FormInstance, Input, Modal, ModalProps } from "antd";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyCenterModel } from "model/warranty/warranty.model";
import React from "react";
import { RegUtil } from "utils/RegUtils";

export type initialFormModalCenterPhoneType = {
  phone: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalCenterPhoneType;
  record?: WarrantyCenterModel | undefined;
};

function ModalWarrantyCenterPhone(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, record, ...rest } =
    props;

  return (
    <Modal
      title={`Cập nhật số điện thoại trung tâm "${record?.name}"`}
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          label={"Số điện thoại"}
          labelCol={{ span: 24 }}
          labelAlign={"left"}
          name="phone"
          rules={[
            {
              required: true,
              message: "Vui lòng số điện thoại",
            },
            {
              pattern: RegUtil.PHONE,
              message: "Số điện thoại chưa đúng định dạng",
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalWarrantyCenterPhone);
