import React, { useState } from "react";
import { Form, Input, Row, Col } from "antd";
import { RegUtil } from "utils/RegUtils";

function CustomInputContact(props: any) {
  const { form } = props;

  const [contactName, setContactName] = React.useState<string>();
  const [contactPhone, setContactPhone] = React.useState<string>();

  const handleChangeName = (v: any) => {
    setContactName(v.trim());
    if(v === "" && contactPhone === "") setContactPhone(undefined)
  };

  const handleBlurName = (v: any) => {
    setContactName(v.trim());
    form?.setFieldsValue({ contact_name: contactName });
  };
  const handleChangePhone = (v: any) => {
    setContactPhone(v)
    if(v === "" && contactName === "") setContactName(undefined)
  };
  React.useEffect(() => {
    form.setFieldsValue({ contact_name: contactName });
  }, [contactName, handleChangeName]);

  React.useEffect(() => {
    form.setFieldsValue({ contact_phone: contactPhone });
  }, [contactPhone, handleChangePhone]);

  return (
    <>
      <Col span={24}>
        <Form.Item
          label={<b>Họ và tên:</b>}
          name="contact_name"
          rules={[
            {
              required: contactPhone ? true : false,
              message: "Vui lòng nhập họ tên khách hàng",
            },
          ]}
        >
          <Input
            maxLength={255}
            placeholder="Nhập họ và tên"
            onChange={(value: any) => handleChangeName(value.target.value)}
            onBlur={(value: any) => handleBlurName(value.target.value)}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label={<b>Số điện thoại:</b>}
          name="contact_phone"
          rules={[
            {
              required: contactName ? true : false,
              message: "Vui lòng nhập số điện thoại",
            },
            {
              pattern: RegUtil.PHONE,
              message: "Số điện thoại chưa đúng định dạng",
            },
          ]}
        >
          <Input
            style={{ borderRadius: 5, width: "100%" }}
            minLength={9}
            maxLength={15}
            placeholder="Nhập số điện thoại"
            onChange={(value: any) => handleChangePhone(value.target.value)}
          />
        </Form.Item>
      </Col>
    </>
  );
}

export default CustomInputContact;
