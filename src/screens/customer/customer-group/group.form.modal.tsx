import {Col, Form, Input, Row } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { useEffect } from "react";
import * as CONSTANTS from "utils/Constants";
import CustomInput from "screens/customer/common/customInput";
import { CustomerGroupPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";


const updateCustomerGroupPermission = [CustomerGroupPermission.groups_update];

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

  const [allowUpdateCustomerGroup] = useAuthorization({
    acceptPermissions: updateCustomerGroupPermission,
    not: false,
  });
  
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

  useEffect(() => {
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
              disabled={!isCreateForm && !allowUpdateCustomerGroup}
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
                disabled={!isCreateForm && !allowUpdateCustomerGroup}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
  );
};

export default FormCustomerGroup;
