import { Form, FormInstance, Modal, ModalProps } from "antd";
import NumberInput from "component/custom/number-input.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyReasonModel } from "model/warranty/warranty.model";
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
  record?: WarrantyReasonModel | undefined;
};

function ModalWarrantyReasonsCustomerFee(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, record, ...rest } =
    props;

  return (
    <Modal
      title={`Cập nhật phí báo khách lý do  "${record?.name}"`}
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="customer_fee"
          rules={[
            {
              required: true,
              message: "Vui lòng điền phí báo khách!",
            },
            () => ({
              validator(_, value) {
                if (value && value < 1000) {
                  return Promise.reject(new Error("Nhập 0 hoặc ít nhất 4 chữ số!"));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
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
