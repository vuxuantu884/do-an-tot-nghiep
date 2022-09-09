import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Popover } from "antd";
import React, { useEffect, useState } from "react";
import TextWithLineBreak from "../TextWithLineBreak";
import { StyledComponent } from "./styles";

type FormValueType = {
  [key: string]: any;
};
type PropTypes = {
  note?: any;
  title?: string;
  color?: string;
  isHaveEditPermission?: boolean;
  onOk: (values: FormValueType) => void;
  noteFormValue: FormValueType;
  formItemNode: React.ReactNode;
};

function EditNote(props: PropTypes) {
  const { note, title, onOk, isHaveEditPermission = true, noteFormValue, formItemNode } = props;

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
      // console.log("values", values);
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
                  {formItemNode}
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
          title="Sửa ghi chú"
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
          getPopupContainer={undefined}
        >
          {isHaveEditPermission && (
            <EditOutlined className="iconEdit" style={{ color: props.color }} title="Sửa ghi chú" />
          )}
        </Popover>

        <span>
          {title && <strong>{title}</strong>}
          <span className="noteText">
            <TextWithLineBreak note={note} />
          </span>
        </span>
      </div>
    </StyledComponent>
  );
}

export default EditNote;
