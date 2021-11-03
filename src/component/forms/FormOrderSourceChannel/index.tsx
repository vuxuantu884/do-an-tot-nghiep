import { Form, Input } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { ChannelModel } from "model/response/order/order-source.response";
import { useEffect } from "react";
import * as CONSTANTS from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { StyledComponent } from "./styles";

function FormOrderSourceChannel(props: CustomModalFormModel) {

  const {modalAction, formItem, form, visible} = props;
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: ChannelModel =
    !isCreateForm && formItem
      ? {
          name: formItem.name,
          code: formItem.code,
          type: formItem.type,
        }
      : {
          name: "",
          code: "",
          type: "",
        };

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  return (
    <StyledComponent>
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValues}
      >
        <Form.Item
          name="name"
          label="Tên kênh"
          rules={[
            {required: true, message: "Vui lòng điền tên kênh!"},
            {max: 255, message: "Không được nhập quá 255 ký tự!"},
          ]}
        >
          <Input placeholder="Nhập tên kênh" style={{width: "100%"}} />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã nguồn"
          rules={[
            {required: true, message: "Vui lòng điền mã nguồn!"},
            () => ({
              validator(_, value) {
                if (RegUtil.ONLY_STRING.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Chỉ nhập kí tự chữ và in hoa!"));
              },
            }),
            {len: 4, message: "Nhập 4 ký tự!"},
          ]}
        >
          <Input
            type="text"
            placeholder="Nhập mã nguồn"
            style={{width: "100%", textTransform: "uppercase"}}
          />
        </Form.Item>
        <Form.Item
          name="type"
          label="Loại kênh"
          rules={[
            {required: true, message: "Vui lòng điền loại kênh!"},
          ]}
        >
          <Input
            type="text"
            placeholder="Nhập loại kênh"
            style={{width: "100%", textTransform: "uppercase"}}
          />
        </Form.Item>
      </Form>
    </StyledComponent>
  );
}

export default FormOrderSourceChannel;
