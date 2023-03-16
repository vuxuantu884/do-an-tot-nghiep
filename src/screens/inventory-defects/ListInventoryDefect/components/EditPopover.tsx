import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Popover } from "antd";
import React, { useState } from "react";

type EditPopoverProps = {
  content: any;
  title?: string;
  color?: string;
  isDisable?: boolean;
  isHaveEditPermission?: boolean;
  onOk: (newContent: string) => void;
  label?: string;
  isRequire?: boolean;
  isHideContent?: boolean;
  maxLength?: number;
};
const EditPopover: React.FC<EditPopoverProps> = (props: EditPopoverProps) => {
  const [form] = Form.useForm();
  const {
    content,
    title,
    onOk,
    isDisable = false,
    label,
    isHaveEditPermission = true,
    isRequire,
    isHideContent = false,
    maxLength
  } = props;
  const [visible, setVisible] = useState(false);
  const [newContent, setNewContent] = useState(content);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
  };

  const onChangeContent = (e: any) => {
    setNewContent(e.target.value);
  };

  return (
    <div className="wrapper">
      <Popover
        content={
          <Form
            initialValues={{
              note: newContent
            }}
            form={form}
            onFinish={() => {
              onOk(newContent);
              setVisible(false);
              isRequire && !newContent && setNewContent(content);
            }}
          >
            <Form.Item
              name="note"
              rules={[
                {
                  max: maxLength, message: `Không được nhập quá ${maxLength} ký tự`
                },
              ]}
            >
              <Input.TextArea
                value={newContent}
                onChange={(e) => onChangeContent(e)}
                style={{ width: 300 }}
                disabled={isDisable}
              />
            </Form.Item>
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                htmlType="submit"
                type="primary"
                style={{ marginRight: 10 }}
                disabled={isDisable}
              >
                Lưu
              </Button>
              <Button
                onClick={() => {
                  setNewContent(content);
                  setVisible(false);
                }}
              >
                Huỷ
              </Button>
            </div>
          </Form>
        }
        title={title ?? "Sửa ghi chú"}
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        {isHaveEditPermission && (
          <EditOutlined
            style={{ marginRight: 5, color: props.color }}
            title={title ?? "Sửa ghi chú"}
          />
        )}
      </Popover>
      <span>
        {label && <strong>{label}</strong>}
        {!isHideContent && (
          <span className="noteText">{content}</span>
        )}
      </span>
    </div>
  );
};

export default EditPopover;
