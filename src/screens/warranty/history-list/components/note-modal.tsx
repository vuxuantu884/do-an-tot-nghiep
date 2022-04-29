import { Form, FormInstance, Input, Modal, ModalProps } from "antd";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyReasonModel } from "model/warranty/warranty.model";
import React from "react";

export type initialFormModalWarrantiesNoteType = {
  note: string;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalWarrantiesNoteType;
  warrantyReasons?: WarrantyReasonModel[];
};

function NoteModal(props: PropTypes) {
  const {
    onCancel,
    onOk,
    form,
    handleOk,
    handleCancel,
    initialFormValues,
    warrantyReasons,
    ...rest
  } = props;

  return (
    <Modal title="Cập nhật ghi chú" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="note"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập ghi chú",
            },
            () => ({
              validator(_, value) {
                if (value && value.trim().length === 0) {
                  return Promise.reject(new Error("Vui lòng nhập ghi chú"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.TextArea placeholder="Nhập ghi chú" rows={5} maxLength={250} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(NoteModal);
