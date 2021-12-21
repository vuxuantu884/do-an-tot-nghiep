import React, { useCallback } from "react";
import { Form, Input, Card, Collapse } from "antd";
import { RegUtil } from "utils/RegUtils";

const { Panel } = Collapse;

function CustomerContactInfo(props: any) {
  const { form, isLoading } = props;

  const [contactName, setContactName] = React.useState<string>();
  const [contactPhone, setContactPhone] = React.useState<string>();
  const [contactEmail, setContactEmail] = React.useState<string>();
  const [contactNote, setContactNote] = React.useState<string>();

  const [isCollapseActive, setCollapseActive] = React.useState<boolean>(true);

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
  }, [contactName]);
  
  React.useEffect(() => {
    form.setFieldsValue({ contact_name: contactName });
  }, [contactName, form, handleChangeName]);

  React.useEffect(() => {
    form.setFieldsValue({ contact_phone: contactPhone });
  }, [contactPhone, form, handleChangePhone]);

  const handleCollapseChage = () => {
    setCollapseActive(!isCollapseActive);
  };

  return (
    <Card className="customer-contact">
      <Collapse
        onChange={handleCollapseChage}
        expandIconPosition="right"
        activeKey={[isCollapseActive ? "1" : ""]}
      >
        <Panel
          header={
            <span className="card-title">THÔNG TIN LIÊN HỆ</span>
          }
          key="1"
        >
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
              disabled={isLoading}
              maxLength={255}
              placeholder="Nhập họ và tên"
              onChange={(value: any) => handleChangeName(value.target.value)}
              onBlur={(value: any) => handleBlurName(value.target.value)}
            />
          </Form.Item>

          <div className="phone-number-email">
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
              className="left-item"
            >
              <Input
                disabled={isLoading}
                style={{ borderRadius: 5, width: "100%" }}
                minLength={9}
                maxLength={15}
                placeholder="Nhập số điện thoại"
                onChange={(value: any) => handleChangePhone(value.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={<b>Email:</b>}
              name="contact_email"
              rules={[
                {
                  pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                  message: "Vui lòng nhập đúng định dạng email",
                },
              ]}
              className="right-item"
            >
              <Input
                disabled={isLoading}
                maxLength={255}
                placeholder="Nhập email"
                onChange={(value: any) => {
                  setContactEmail(value.target.value);
                  if (contactName === "") setContactName(undefined);
                  if (contactPhone === "") setContactPhone(undefined);
                }}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={<b>Ghi chú:</b>}
            name="contact_note"
            className="contact-note"
          >
            <Input.TextArea
              disabled={isLoading}
              maxLength={500}
              placeholder="Nhập ghi chú"
              onChange={(value: any) => {
                setContactNote(value.target.value);
                if (contactName === "") setContactName(undefined);
                if (contactPhone === "") setContactPhone(undefined);
              }}
            />
          </Form.Item>
        </Panel>
      </Collapse>
    </Card>
  );
}

export default CustomerContactInfo;
