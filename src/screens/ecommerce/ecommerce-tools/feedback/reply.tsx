import { Button, Divider, Form, Input, Popover } from "antd";
import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styled";

type FormValueType = {
  [key: string]: any;
};
type PropTypes = {
  type: string;
  content: string;
  record: any;
  onOk: (values: FormValueType) => void;
};

function Reply(props: PropTypes) {
  const { type, content, record, onOk } = props;

  const [form] = Form.useForm();

  const initialFormValues = {
    content: "",
    new_content: "",
  };

  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
    if (!visible) {
      form.resetFields();
    }
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      onOk(values.content);
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        content: content,
      });
    }
  }, [content, form, visible]);

  return (
    <Popover
      content={
        <StyledComponent>
          <Form form={form} layout="vertical" initialValues={initialFormValues}>
            <div className="formInner">
              <Form.Item
                name="content"
                label={type === "edit" ? "Phản hồi khách hàng" : undefined}
                //rules={[{ max: 255, message: "Không được nhập quá 255 ký tự!" }]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              {type === "edit" && (
                <Form.Item
                  name="new_content"
                  label="Sửa phản hồi khách hàng"
                  //rules={[{ max: 255, message: "Không được nhập quá 255 ký tự!" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
              )}
              <div className="actions">
                <Button
                  type="ghost"
                  onClick={() => {
                    const input: any = document.getElementById("content");
                    const value = input.value;
                    const index = value.slice(0, input.selectionStart).length;
                    const contentStart = value.substring(0, index);
                    const contentEnd = value.substring(index);
                    form.setFieldsValue({
                      content: contentStart + ` ${record.shop}` + contentEnd,
                    });
                  }}
                >
                  Chèn tên gian hàng
                </Button>

                <Button
                  type="ghost"
                  onClick={() => {
                    const input: any = document.getElementById("content");
                    const value = input.value;
                    const index = value.slice(0, input.selectionStart).length;
                    const contentStart = value.substring(0, index);
                    const contentEnd = value.substring(index);
                    form.setFieldsValue({
                      content: contentStart + `${record.username}` + contentEnd,
                    });
                  }}
                >
                  Chèn tên khách hàng
                </Button>
              </div>
              <Divider />
              <div className="buttonWrapper">
                <Button
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  Huỷ
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    onSubmit();
                    setVisible(false);
                  }}
                >
                  Lưu
                </Button>
              </div>
            </div>
          </Form>
        </StyledComponent>
      }
      title={"Phản hồi đánh giá"}
      trigger="click"
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <Button type="primary">Phản hồi</Button>
    </Popover>
  );
}

export default Reply;
