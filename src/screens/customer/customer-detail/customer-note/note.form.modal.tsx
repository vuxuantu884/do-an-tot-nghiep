import { Col, Form, Row} from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import React from "react";
import * as CONSTANTS from "utils/Constants";
import CustomInput from "screens/customer/common/customInput";

type FormValueType = {
  content: string;
};

const FormCustomerShippingAddress: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const { modalAction, formItem, form, visible } = props;

  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  // const DEFAULT_COMPANY = {
  //   company_id: 1,
  //   company: "YODY",
  // };
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          content: formItem?.content,
        }
      : {
          content: "",
        };

  // const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  React.useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  return (
      <Form
        form={form}
        name="form-order-processing-status"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Row gutter={20}>
          <Col span={24}>
            <CustomInput
              type="textarea"
              name="content"
              label="Ghi chú:"
              form={form}
              message="Vui lòng nhập ghi chú"
              placeholder="Nhập ghi chú"
              isRequired={true}
              maxLength={255}
            />
          </Col>
        </Row>
      </Form>
  );
};

export default FormCustomerShippingAddress;
