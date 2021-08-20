import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";

type FormValueType = {
  title?: string;
  name: string;
  email?: string;
  phone: string;
  note?: string;
  company_name: string;
  tax_code?: string;
  website?: string;
};

const FormCustomerContact: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const { modalAction, formItem, form, visible } = props;
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  // const DEFAULT_FORM_VALUE = {
  //   company_id: 1,
  //   company: "YODY",
  // };
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
        title: formItem?.title,
        name: formItem?.name,
        email: formItem?.email,
        phone: formItem?.phone,
        note: formItem?.note,
        company_name: formItem?.company_name,
        tax_code: formItem?.tax_code,
        website: formItem?.website,
        }
      : {
        title: "",
        name: "",
        email: "",
        phone: "",
        note: "",
        company_name: "",
        tax_code: "",
        website: "",
        };
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  return (
    <StyledComponent>
      <Form
        form={form}
        name="form-order-processing-status"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[
                
              ]}
            >
              <Input
                placeholder="Nhập tiêu đề"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="name"
              label="Tên người liên hệ"
              rules={[
                
              ]}
            >
              <Input
                placeholder="Nhập tên người liên hệ"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="email"
              label="Thư điện tử"
              rules={[
                
              ]}
            >
              <Input
                placeholder="Nhập thư điện tử"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                
              ]}
            >
              <Input
                placeholder="Nhập số điện thoại"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ max: 500, message: "Không được nhập quá 500 ký tự!" }]}
            >
              <Input.TextArea rows={5} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormCustomerContact;
