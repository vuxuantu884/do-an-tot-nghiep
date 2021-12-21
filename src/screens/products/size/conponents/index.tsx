import {Col, Form, Input, Row, } from "antd";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useEffect, } from "react";
import * as CONSTANTS from "utils/Constants"; 

type FormValuesType = { 
  code: string | null; 
  version: number | null
};

const FormSize: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const {modalAction, formItem, form, visible} = props;

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {code: formItem.code, 
        version: formItem.version } : { code: null,version: null};
 

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);
 
  return (
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValues}
      > 
        <Row gutter={30}> 
           <Col span={24}>
           <Form.Item hidden noStyle label="Kích cỡ" name="version">
             <Input />
           </Form.Item>
           <Form.Item name="code" label="Kích cỡ" rules={
             [
              {required: true, message: "Vui lòng nhập kích cỡ."}
             ]
           }>
              <Input placeholder="Nhập kích cỡ" />
            </Form.Item> 
           </Col>
        </Row> 
      </Form>
  );
};

export default FormSize;
