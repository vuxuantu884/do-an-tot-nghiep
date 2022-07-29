import { Form, Input, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { useEffect } from "react";
import * as CONSTANTS from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { StyledComponent } from "./styles";

type FormValuesType = {
  code: string;
  name: string | undefined;
  channel_type_id: number | undefined;
};

function FormOrderSourceChannel(props: CustomModalFormModel) {
  const { modalAction, formItem, form, visible, moreFormArguments } = props;
  const { listChannelTypes } = moreFormArguments;
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {
          name: formItem.name,
          code: formItem.code,
          channel_type_id: formItem.channel_type_id,
        }
      : {
          name: "",
          code: "",
          channel_type_id: undefined,
        };

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  return (
    <StyledComponent>
      <Form form={form} name="control-hooks" layout="vertical" initialValues={initialFormValues}>
        <Form.Item
          name="name"
          label="Tên kênh"
          rules={[
            { required: true, message: "Vui lòng điền tên kênh!" },
            { max: 255, message: "Không được nhập quá 255 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tên kênh" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="code"
          label="Mã nguồn"
          rules={[
            { required: true, message: "Vui lòng điền mã nguồn!" },
            () => ({
              validator(_, value) {
                if (RegUtil.ONLY_STRING.test(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Chỉ nhập kí tự chữ và in hoa!"));
              },
            }),
            { len: 4, message: "Nhập 4 ký tự!" },
          ]}
        >
          <Input
            type="text"
            placeholder="Nhập mã nguồn"
            style={{ width: "100%", textTransform: "uppercase" }}
          />
        </Form.Item>
        <Form.Item
          name="channel_type_id"
          label="Loại kênh"
          rules={[{ required: true, message: "Vui lòng chọn loại kênh!" }]}
        >
          <Select
            showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="Chọn loại kênh"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            notFoundContent="Không tìm thấy loại kênh"
          >
            {listChannelTypes &&
              listChannelTypes.map((single: any) => {
                return (
                  <Select.Option value={single.id} key={single.id}>
                    {single.name}
                  </Select.Option>
                );
              })}
          </Select>
        </Form.Item>
      </Form>
    </StyledComponent>
  );
}

export default FormOrderSourceChannel;
