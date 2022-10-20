import React, { useEffect } from "react";
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select } from "antd";
import { CustomerFamilyInfoRequest } from "model/customer/customer.request";
import { GENDER_OPTIONS } from "utils/Constants";
import { ACTION_TYPE, RELATION_LIST } from "screens/customer/helper";
import { CustomerFamilyInfoResponse } from "model/customer/customer.response";
import moment from "moment";


type CustomerFamilyFormModalType = {
  visible: boolean;
  actionType: string;
  onCancelModal: () => void;
  onOkModal: (formValue: CustomerFamilyInfoRequest) => void;
  familyMemberInfo: CustomerFamilyInfoResponse | null;
}


const CustomerFamilyFormModal = (props: CustomerFamilyFormModalType) => {
  const {
    visible,
    actionType,
    onCancelModal,
    onOkModal,
    familyMemberInfo,
  } = props;
  
  const [form] = Form.useForm();
  const isCreate = actionType === ACTION_TYPE.CREATE;

  useEffect(() => {
    if (isCreate) {
      form.setFieldsValue(
        {
          name: "",
          birthday: null,
          gender: null,
          relation_type: null,
        }
      );
    } else {
      form.setFieldsValue(
        {
          name: familyMemberInfo?.name || "",
          birthday: familyMemberInfo?.birthday ? moment(familyMemberInfo?.birthday) : null,
          gender: familyMemberInfo?.gender || null,
          relation_type: familyMemberInfo?.relation_type || null,
        }
      );
    }
  }, [form, familyMemberInfo, isCreate]);


  const handleSubmitForm = (value: CustomerFamilyInfoRequest) => {
    value.birthday = value.birthday?.toISOString() || null;
    // value.birthday = value.birthday ? moment(value.birthday).utc().startOf("day").toISOString() : null;
    onOkModal && onOkModal(value);
    form.resetFields();
  };
  
  const handleCancelModal = () => {
    onCancelModal && onCancelModal();
    form.resetFields();
  };
  

  return (
    <Modal
      visible={visible}
      title={`${isCreate ? "Thêm mới" : "Cập nhật"} thông tin người thân`}
      onCancel={handleCancelModal}
      maskClosable={false}
      width="600px"
      footer={
        <div className="">
          <Button key="cancel" type="default" onClick={handleCancelModal}>
            Thoát
          </Button>
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {isCreate ? "Tạo mới" : "Cập nhật"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        onFinish={handleSubmitForm}
        name="customer-family-form-modal"
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={<span className="fw-500">Tên người thân</span>}
            >
              <Input placeholder="Nhập tên người thân" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="birthday"
              label={<b>Ngày sinh</b>}
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
            >
              <DatePicker
                style={{ width: "100%", borderRadius: 2 }}
                placeholder="Chọn ngày sinh"
                format={"DD/MM/YYYY"}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="gender"
              label={<b>Giới tính</b>}
              rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
            >
              <Select placeholder="Chọn giới tính" allowClear>
                {GENDER_OPTIONS.map((gender: any) => (
                  <Select.Option key={gender.value} value={gender.value}>
                    {gender.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="relation_type"
              label={<b>Mối quan hệ</b>}
              rules={[{ required: true, message: "Vui lòng chọn mối quan hệ" }]}
            >
              <Select placeholder="Chọn mối quan hệ" allowClear>
                {RELATION_LIST.map((gender: any) => (
                  <Select.Option key={gender.value} value={gender.value}>
                    {gender.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CustomerFamilyFormModal;
