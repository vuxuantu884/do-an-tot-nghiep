import { Checkbox, Form, Input, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { OrderSourceCompanyModel } from "model/response/order/order-source.response";
import { StyledComponent } from "./styles";

type FormValueType = {
  channel_id: number;
  company_id?: number;
  id?: number;
  name?: string;
  is_active?: boolean;
  is_default?: boolean;
};

const FormOrderSource: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const { modalAction, formItem, form, ...args } = props;
  const listOrderCompanies: OrderSourceCompanyModel[] =
    args.moreFormArguments.listOrderCompanies;
  const isCreateForm = modalAction === "create";
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          channel_id: 4,
          company_id: formItem.id,
          id: formItem.id,
          name: formItem.name,
          is_active: formItem.is_active,
          is_default: formItem.is_default,
        }
      : {
          channel_id: 4,
          company_id: undefined,
          id: undefined,
          name: "",
          is_active: false,
          is_default: false,
        };

  return (
    <StyledComponent>
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Form.Item name="channel_id" label="channel_id" hidden>
          <Input
            type="number"
            placeholder="channel_id"
            style={{ width: "100%" }}
          />
        </Form.Item>
        {listOrderCompanies?.length && (
          <Form.Item
            name="company_id"
            label="Doanh nghiệp"
            rules={[
              { required: true, message: "Vui lòng chọn doanh nghiệp !" },
            ]}
          >
            <Select
              placeholder="Chọn doanh nghiệp"
              // onChange={this.onGenderChange}
              allowClear
            >
              {listOrderCompanies &&
                listOrderCompanies.map((singleOrderCompany) => {
                  return (
                    <Select.Option
                      value={singleOrderCompany.id}
                      key={singleOrderCompany.id}
                    >
                      {singleOrderCompany.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name="name"
          label="Tên nguồn đơn hàng"
          rules={[
            { required: true, message: "Vui lòng điền tên nguồn đơn hàng !" },
            { max: 500, message: "Không được nhập quá 500 ký tự" },
          ]}
        >
          <Input
            placeholder="Nhập tên nguồn đơn hàng"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="is_active"
          valuePropName="checked"
          style={{ marginBottom: 10 }}
        >
          <Checkbox>Áp dụng cho đơn hàng</Checkbox>
        </Form.Item>
        <Form.Item
          name="is_default"
          valuePropName="checked"
          style={{ marginBottom: 10 }}
        >
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </StyledComponent>
  );
};

export default FormOrderSource;
