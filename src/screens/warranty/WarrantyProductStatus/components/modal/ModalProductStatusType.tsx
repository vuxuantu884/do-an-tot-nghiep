import { Form, FormInstance, Modal, ModalProps, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import React from "react";
import { WARRANTY_PRODUCT_STATUS_TYPE } from "utils/Warranty.constants";

export type initialFormModalProductStatusTypeType = {
  type: string;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalProductStatusTypeType;
};

function ModalProductStatusType(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, ...rest } = props;

  return (
    <Modal title="Cập nhật loại" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="type"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn loại",
            },
          ]}
        >
          <CustomSelect
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn lý do"
          >
            {WARRANTY_PRODUCT_STATUS_TYPE.length > 0 &&
              WARRANTY_PRODUCT_STATUS_TYPE.map((reason) => (
                <Select.Option key={reason.code} value={reason.code}>
                  {`${reason.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalProductStatusType);
