import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Popover } from "antd";
import React, { useEffect, useState } from "react";
import TextWithLineBreak from "../TextWithLineBreak";
import { StyledComponent } from "./styles";

type FormValueType = {
  note: string | null | undefined;
  customer_note: string | null | undefined;
};
type PropTypes = {
  note: any;
  title?: string;
  color?: string;
  isDisable?: boolean;
  isGroupButton?: boolean;
  isHaveEditPermission?: boolean;
  onOk: (values: FormValueType) => void;
  noteFormValue: FormValueType;
};

function EditOrderNote(props: PropTypes) {
  const {
    note,
    title,
    onOk,
    isDisable = false,
    isGroupButton = false,
    isHaveEditPermission = true,
    noteFormValue,
  } = props;

  const [form] = Form.useForm();

  const initialFormValues = {
    note: "",
    customer_note: "",
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
      console.log("values", values);
      onOk(values);
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...noteFormValue,
      });
    }
  }, [form, noteFormValue, visible]);

  return (
    <StyledComponent>
      <div className="wrapper">
        <Popover
          content={
            <StyledComponent>
              <Form form={form} layout="vertical" initialValues={initialFormValues}>
                <div className="formInner">
                  <Form.Item
                    name="customer_note"
                    label="Ghi chú của khách hàng"
                    //rules={[{ max: 255, message: "Không được nhập quá 255 ký tự!" }]}
                  >
                    <Input.TextArea disabled={isDisable} rows={3} />
                  </Form.Item>
                  <Form.Item
                    name="note"
                    label="Ghi chú nội bộ"
                    //rules={[{ max: 255, message: "Không được nhập quá 255 ký tự!" }]}
                  >
                    <Input.TextArea disabled={isDisable} rows={3} />
                  </Form.Item>
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
                      disabled={isDisable}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              </Form>
            </StyledComponent>
          }
          title="Sửa ghi chú"
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
          {!isGroupButton && isHaveEditPermission && (
            <EditOutlined className="iconEdit" style={{ color: props.color }} title="Sửa ghi chú" />
          )}

          {isGroupButton && (
            <Button className="custom-group-btn">
              <React.Fragment>
                <EditOutlined title="Sửa ghi chú" />
                <span>
                  {title && <strong>{title}</strong>}
                  <span className="noteText">
                    <TextWithLineBreak note={note} />
                  </span>
                </span>
              </React.Fragment>
            </Button>
          )}
        </Popover>

        {!isGroupButton && (
          <span>
            {title && <strong>{title}</strong>}
            <span className="noteText">
              <TextWithLineBreak note={note} />
            </span>
          </span>
        )}
      </div>
    </StyledComponent>
  );
}

export default EditOrderNote;
