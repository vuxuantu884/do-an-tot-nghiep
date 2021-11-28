import { Col, Form, Input, Row } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { useEffect } from "react";
import * as CONSTANTS from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import CustomInput from "screens/customer/common/customInput";

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
  // const DEFAULT_COMPANY = {
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
              label={<b>Tên người liên hệ:</b>}
              rules={[{ required: true, message: "Vui lòng nhập tên liên hệ" }]}
            >
              <Input
                placeholder="Nhập tên người liên hệ"
                style={{ width: "100%" }}
                maxLength={255}
              />
            </Form.Item> */}
          <CustomInput
            name="name"
            label={<span className="fw-500">Tên người liên hệ:</span>}
            form={form}
            message="Vui lòng nhập tên liên hệ"
            placeholder="Nhập tên người liên hệ"
            isRequired={true}
            maxLength={255}
          />
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label={<span className="fw-500">Số điện thoại:</span>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern: RegUtil.PHONE,
                    message: "Số điện thoại chưa đúng định dạng",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  style={{ width: "100%" }}
                  minLength={9}
                  maxLength={15}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label={<span className="fw-500">Email:</span>}
                rules={[
                  {
                    pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                    message: "Vui lòng nhập đúng định dạng email",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập Email"
                  style={{ width: "100%" }}
                  maxLength={255}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="title"
            label={<span className="fw-500">Chức vụ/phòng ban:</span>}
            rules={[]}
          >
            <Input
              maxLength={255}
              placeholder="Nhập chức vụ/phòng ban"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="note"
            label={<span className="fw-500">Ghi chú:</span>}
            rules={[{ max: 500, message: "Không được nhập quá 500 ký tự!" }]}
          >
            <Input.TextArea
              rows={5}
              maxLength={255}
              placeholder="Nhập ghi chú"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default FormCustomerContact;
