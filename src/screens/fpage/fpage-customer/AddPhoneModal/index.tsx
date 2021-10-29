import React, { useState, useCallback } from "react";
import { Modal, Space, Input, Button, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { StyledComponent } from "./styles";
import PhoneRow from "./PhoneRow";
import { RegUtil } from "utils/RegUtils";

type AddPhoneModalProps = {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  addFpPhone: (p: string) => void;
  deleteFpPhone: (p: string) => void;
  setFpDefaultPhone: (p: string) => void;
  customerPhones?: Array<string>;
  customerPhone: string;
};

const AddPhoneModal: React.FC<AddPhoneModalProps> = (props: AddPhoneModalProps) => {
  const {
    visible,
    onOk,
    onCancel,
    customerPhone,
    customerPhones,
    addFpPhone,
    deleteFpPhone,
    setFpDefaultPhone,
  } = props;
  const [form] = Form.useForm();
  const [newPhone, setNewPhone] = useState<string>("");
  const onNewPhoneChange = useCallback(
    (e) => {
      setNewPhone(e.target.value);
    },
    [setNewPhone]
  );
  const addNewPhone = useCallback(() => {
    form.validateFields().then(() => {
      addFpPhone(newPhone);
    });
  }, [addFpPhone, newPhone, form]);
  return (
    <Modal
      width="400px"
      visible={visible}
      title={"Danh sách số điện thoại"}
      onOk={onOk}
      onCancel={onCancel}
      footer={null}
    >
      <StyledComponent>
        <Form form={form}>
          <Space direction="vertical">
            <div className="text-muted">
              Lưu ý: số điện thoại mới được cập nhật sẽ tự động đặt làm mặc định và sẽ ở
              trên cùng
            </div>
            <div className="phone-add-container">
              <Form.Item
                name="phone-item"
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
                  className="phone-input"
                  placeholder="Nhập số điện thoại mới"
                  allowClear
                  onChange={onNewPhoneChange}
                />
              </Form.Item>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                className="ant-btn-background-ghost"
                onClick={addNewPhone}
              >
                Lưu
              </Button>
            </div>
            {customerPhones &&
              customerPhones.map((phone, index) => {
                return (
                  <PhoneRow
                    key={index}
                    phone={phone}
                    isDefaultPhone={customerPhone === phone}
                    onDelete={() => {
                      deleteFpPhone(phone);
                    }}
                    onSetDefault={() => {
                      setFpDefaultPhone(phone);
                    }}
                  />
                );
              })}
          </Space>
        </Form>
      </StyledComponent>
    </Modal>
  );
};

export default AddPhoneModal;
