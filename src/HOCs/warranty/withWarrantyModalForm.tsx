import { Form, FormInstance } from "antd";
import React, { FunctionComponent, useEffect } from "react";

type initFormValuesTypes = any;

type PropTypes<T> = {
  initialFormValues: T;
  visible: boolean;
  onOk: (values: any) => void;
  onCancel: () => void;
  record: any | undefined;
  [key: string]: any;
};

type ComponentPropTypes = {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initFormValuesTypes;
  okText: string;
  record: any | undefined;
};

function withWarrantyModalForm(Component: FunctionComponent<ComponentPropTypes>) {
  return function (props: PropTypes<any>): JSX.Element {
    const { initialFormValues, onOk, onCancel, record, ...rest } = props;
    const [form] = Form.useForm();
    const handleOk = () => {
      form.validateFields().then(() => {
        const values = form.getFieldsValue();
        onOk(values);
      });
    };

    const handleCancel = () => {
      form.setFieldsValue(initialFormValues);
      onCancel();
    };

    useEffect(() => {
      form.setFieldsValue(initialFormValues);
    }, [form, initialFormValues]);

    return (
      <Component
        handleCancel={handleCancel}
        handleOk={handleOk}
        form={form}
        initialFormValues={initialFormValues}
        record={record}
        okText="Cập nhật"
        {...rest}
      />
    );
  };
}

export default withWarrantyModalForm;
