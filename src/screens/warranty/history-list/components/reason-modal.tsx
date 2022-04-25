import { Form, FormInstance, Modal, ModalProps, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyItemModel } from "model/warranty/warranty.model";
import React, { useMemo } from "react";

export type initialFormModalWarrantiesReasonType = {
  reason_ids: number[];
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalWarrantiesReasonType;
  warrantyReasonsConvert?: {
    id: number,
    name: string
  }[];
  record?: WarrantyItemModel | undefined;
};

function ReasonModal(props: PropTypes) {
  const {
    onCancel,
    onOk,
    form,
    handleOk,
    handleCancel,
    initialFormValues,
    warrantyReasonsConvert,
    record,
    ...rest
  } = props;

  let warrantyReasonsResult = useMemo(() => {
    let result = warrantyReasonsConvert ? [...warrantyReasonsConvert].map(reason => ({
      id: reason.id,
      name: reason.name,
    })) : [];
    let arr = warrantyReasonsConvert?.map(single => single.id);
    record?.expenses.forEach(expense => {
      if(!arr?.includes(expense.id)) {
        result.push({
          id: expense.reason_id,
          name: expense.reason,
        }) 
      }
    })
    return result;
  }, [record?.expenses, warrantyReasonsConvert]);

  return (
    <Modal title="Cập nhật lý do" onCancel={handleCancel} onOk={handleOk} {...rest}>
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="reason_ids"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn lý do",
            },
          ]}
        >
          <CustomSelect
            mode="multiple"
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn lý do"
            key={Math.random()}
          >
            {warrantyReasonsResult &&
              warrantyReasonsResult.length > 0 &&
              warrantyReasonsResult.map((reason) => (
                <Select.Option key={reason.id} value={reason.id}>
                  {`${reason.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ReasonModal);
