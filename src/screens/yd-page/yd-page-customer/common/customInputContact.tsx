import React, { useCallback } from "react";
import { Form, Input, Row, Col } from "antd";
import { RegUtil } from "utils/RegUtils";

function CustomInputContact(props: any) {
  const { form } = props;

  const [contactName, setContactName] = React.useState<string>();
  const [contactPhone, setContactPhone] = React.useState<string>();
  const [contactEmail, setContactEmail] = React.useState<string>();
  const [contactNote, setContactNote] = React.useState<string>();

  const handleChangeName = useCallback((v: any) => {
    setContactName(v.trim());
    if (v === "" && contactPhone === "") setContactPhone(undefined);
  }, [contactPhone])

  const handleBlurName = (v: any) => {
    setContactName(v.trim());
    form?.setFieldsValue({ contact_name: contactName });
  };
  const handleChangePhone = useCallback((v: any) => {
    setContactPhone(v);
    if (v === "" && contactName === "") setContactName(undefined);
  },[contactName]);
  React.useEffect(() => {
    form.setFieldsValue({ contact_name: contactName });
  }, [contactName, form, handleChangeName]);

  React.useEffect(() => {
    form.setFieldsValue({ contact_phone: contactPhone });
  }, [contactPhone, form, handleChangePhone]);

  return (
    <>
      <Col span={24}>
        <Form.Item
          label={<b>Họ và tên:</b>}
          name="contact_name"
          rules={[
            {
              required:
                contactPhone || contactEmail || contactNote ? true : false,
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
      <Col span={24}>
        <Form.Item
          label={<b>Số điện thoại:</b>}
          name="contact_phone"
          rules={[
            {
              required:
                contactName || contactEmail || contactNote ? true : false,
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
      <Col span={24}>
        <Form.Item
          label={<b>Email:</b>}
          name="contact_email"
          rules={[
            {
              pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
              message: "Vui lòng nhập đúng định dạng email",
            },
          ]}
        >
          <Input
            maxLength={255}
            placeholder="Nhập email"
            onChange={(value: any) => {
              setContactEmail(value.target.value);
              if (contactName === "") setContactName(undefined);
              if (contactPhone === "") setContactPhone(undefined);
            }}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item label={<b>Ghi chú:</b>} name="contact_note">
          <Input.TextArea
            maxLength={500}
            placeholder="Nhập ghi chú"
            onChange={(value: any) => {
              setContactNote(value.target.value);
              if (contactName === "") setContactName(undefined);
              if (contactPhone === "") setContactPhone(undefined);
            }}
          />
        </Form.Item>
      </Col>
      <Col span={24} style={{ padding: "0 1rem" }}>
        <Row gutter={8}></Row>
      </Col>
    </>
  );
}

export default CustomInputContact;
