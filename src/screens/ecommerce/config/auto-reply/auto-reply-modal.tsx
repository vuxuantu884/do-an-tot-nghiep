import { Button, Form, Input, Modal } from "antd";
import { useEffect, useMemo } from "react";
import { ModalStyled } from "./auto-reply-modal.styled";

type FormValueType = {
  [key: string]: any;
};
type AutoReplyModalPropTypes = {
  visible: boolean;
  type: string;
  autoReplyData: any;
  onOk: (values: FormValueType) => void;
  onCancel: () => void;
};

function AutoReplyModal(props: AutoReplyModalPropTypes) {
  const { visible, type, autoReplyData, onOk, onCancel } = props;
  const initialFormValues = {
    content: "",
  };
  const [form] = Form.useForm();

  const okText = useMemo(() => {
    switch (type) {
      case "create":
        return "Thêm mới";
      case "edit":
        return "Chỉnh sửa";
      case "delete":
        return "Xoá";
      default:
        return "";
    }
  }, [type]);

  const titleText = useMemo(() => {
    switch (type) {
      case "create":
        return "Thêm mới phản hồi";
      case "edit":
        return "Chỉnh sửa phản hồi";
      case "delete":
        return "Xoá phản hồi";
      default:
        return "";
    }
  }, [type]);

  const onSubmit = () => {
    form.validateFields().then((values) => {
      onOk(values);
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        content: autoReplyData.template,
      });
    }
  }, [autoReplyData.template, form, visible]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={() => onSubmit()}
      visible={visible}
      okText={okText}
      cancelText="Huỷ"
      cancelButtonProps={{}}
      okButtonProps={{
        style:
          type === "delete"
            ? { color: "#ffffff", background: "#e24343", borderColor: "#e24343" }
            : {},
      }}
      title={titleText}
      width={600}
      closable
    >
      <ModalStyled>
        <Form form={form} layout="vertical" initialValues={initialFormValues}>
          <Form.Item
            name="content"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập phản hồi!",
              },
            ]}
          >
            <Input.TextArea rows={4} readOnly={type === "delete"}></Input.TextArea>
          </Form.Item>
          {type !== "delete" && (
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
                    content: contentStart + `{{{ SHOP }}}` + contentEnd,
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
                    content: contentStart + `{{{ KHACH_HANG }}}` + contentEnd,
                  });
                }}
              >
                Chèn tên khách hàng
              </Button>
            </div>
          )}
        </Form>
      </ModalStyled>
    </Modal>
  );
}

export default AutoReplyModal;
