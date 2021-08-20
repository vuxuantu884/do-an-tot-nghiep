import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";

type FormValueType = {
  code: string;
  name?: string;
  status?:string;
  note?: string;
};

const FormCustomerGroup: React.FC<CustomModalFormModel> = (
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
          code: formItem?.code,
          name: formItem?.name,
          status: formItem?.status,
          note: formItem?.note,
        }
      : {
          code: "",
          name: "",
          note: "",
          status: "active"
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
          <Col span={12}>
          <Form.Item
              name="code"
              label="Mã nhóm khách hàng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền tên mã nhóm khách hàng!",
                },
                { max: 255, message: "Không được nhập quá 255 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập mã nhóm khách hàng"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên nhóm khách hàng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền tên nhóm khách hàng!",
                },
                { max: 255, message: "Không được nhập quá 255 ký tự!" },
              ]}
            >
              <Input
                placeholder="Nhập tên nhóm khách hàng"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="status"
              valuePropName="active"
              style={{ marginBottom: 10 }}
            >
              <Checkbox>Áp dụng </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ max: 500, message: "Không được nhập quá 500 ký tự!" }]}
            >
              <Input.TextArea rows={10} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormCustomerGroup;
