import { Form, FormInstance, Modal, ModalProps } from "antd";
import NumberInput from "component/custom/number-input.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyReasonModel } from "model/warranty/warranty.model";
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
  record?: WarrantyReasonModel | undefined;
};

function ModalWarrantyReasonsPrice(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, record, ...rest } =
    props;

  return (
    <Modal
      title={`Cập nhật phí thực tế lý do  "${record?.name}"`}
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="price"
          rules={[
            {
              required: true,
              message: "Vui lòng điền phí thực tế!",
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
            placeholder="Nhập phí thực tế"
            style={{
              textAlign: "left",
            }}
            maxLength={10}
            minLength={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalWarrantyReasonsPrice);
