import { Form, FormInstance, Modal, ModalProps, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyCenterModel } from "model/warranty/warranty.model";
import React from "react";

export type initialFormModalWarrantiesCenterType = {
  warranty_center_id: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalWarrantiesCenterType;
  warrantyCenters?: WarrantyCenterModel[];
};

function WarrantyCenterModal(props: PropTypes) {
  const {
    onCancel,
    onOk,
    form,
    handleOk,
    handleCancel,
    initialFormValues,
    warrantyCenters,
    ...rest
  } = props;

  return (
    <Modal title="Chuyển trung tâm bảo hành" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item name="warranty_center_id">
          <CustomSelect
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn trung tâm bảo hành"
          >
            {warrantyCenters &&
              warrantyCenters.length > 0 &&
              warrantyCenters.map((center) => (
                <Select.Option key={center.id} value={center.id}>
                  {`${center.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(WarrantyCenterModal);
