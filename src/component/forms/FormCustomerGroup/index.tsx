import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import * as CONSTANTS from "utils/Constants";
import { StyledComponent } from "./styles";
import { RegUtil } from "utils/RegUtils";
import CustomInput from "screens/customer/customInput";

type FormValueType = {
  code: string;
  name?: string;
  active?: boolean;
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
          active: formItem?.active,
          note: formItem?.note,
        }
      : {
          code: "",
          name: "",
          note: "",
          active: true,
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
            {/* <Form.Item
              name="name"
              label="Tên nhóm khách hàng 1"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhóm khách hàng!",
                },
                { max: 254, message: "Không được nhập quá 255 ký tự!" },
                {
                  pattern: RegUtil.NO_ALL_SPACE,
                  message: "Tên không được có khoảng trống ở đầu",
                },
              ]}
            >
              <Input
                placeholder="Nhập tên nhóm khách hàng"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item> */}
            <CustomInput
                name="name"
                label="Tên nhóm khách hàng:"
                form={form}
                message="Vui lòng nhập tên nhóm khách hàng"
                placeholder="Nhập tên nhóm khách hàng"
                isRequired={true}
                maxLength={255}
              />
            <Form.Item
              name="note"
              label={<b>Mô tả:</b>}
              rules={[{ max: 499, message: "Không được nhập quá 500 ký tự!" }]}
            >
              <Input.TextArea
                maxLength={500}
                rows={10}
                placeholder="Nhập mô tả"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormCustomerGroup;
