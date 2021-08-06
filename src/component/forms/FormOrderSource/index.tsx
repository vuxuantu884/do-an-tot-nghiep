import { Checkbox, Form, Input, Select } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { CustomModalFormModel } from "model/modal/modal.model";
import { OrderSourceCompanyModel } from "model/response/order/order-source.response";
import { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

type FormValueType = {
  channel_id: number;
  channel: string;
  company_id: number;
  company: string;
  name: string;
  active: boolean;
  default: boolean;
};

const FormOrderSource: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const DEFAULT_PARAM = {
    channel_id: 4,
    channel: "Admin",
  };
  const { modalAction, formItem, form, visible, ...args } = props;
  const [isVisibleFieldDefault, setIsVisibleFieldDefault] = useState(false);
  const listOrderCompanies: OrderSourceCompanyModel[] =
    args.moreFormArguments.listOrderCompanies;
  const defaultCompanyIndex = 0;
  const isCreateForm = modalAction === "create";
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          channel_id: DEFAULT_PARAM.channel_id,
          channel: DEFAULT_PARAM.channel,
          company_id: formItem.id,
          company: formItem.company,
          name: formItem.name,
          active: formItem.active,
          default: formItem.default,
        }
      : {
          channel_id: DEFAULT_PARAM.channel_id,
          channel: DEFAULT_PARAM.channel,
          company_id: listOrderCompanies[defaultCompanyIndex].id,
          company: listOrderCompanies[defaultCompanyIndex].name,
          name: "",
          active: false,
          default: false,
        };

  /**
   * when change company, set company name
   */
  const handleChangeCompany = (value: string) => {
    const selectedCompany = listOrderCompanies.find((singleCompany) => {
      return singleCompany.name === value;
    });
    if (selectedCompany) {
      form.setFieldsValue({ company_id: selectedCompany.id });
    }
  };
  /**
   * when change company, set visible field Default
   */
  const handleChangeCheckFieldActive = (checkedValue: CheckboxChangeEvent) => {
    setIsVisibleFieldDefault(checkedValue.target.checked);
    if (!checkedValue.target.checked) {
      form.setFieldsValue({ default: false });
    }
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
        initialValues={initialFormValue}
      >
        <Form.Item name="channel_id" label="channel_id" hidden>
          <Input
            type="number"
            placeholder="channel_id"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item name="channel" label="channel" hidden>
          <Input
            type="number"
            placeholder="channel"
            style={{ width: "100%" }}
          />
        </Form.Item>
        {listOrderCompanies?.length && (
          <Form.Item
            name="company"
            label="Doanh nghiệp"
            rules={[
              { required: true, message: "Vui lòng chọn doanh nghiệp !" },
            ]}
          >
            <Select
              placeholder="Chọn doanh nghiệp"
              allowClear
              onChange={handleChangeCompany}
            >
              {listOrderCompanies &&
                listOrderCompanies.map((singleOrderCompany) => {
                  return (
                    <Select.Option
                      value={singleOrderCompany.name}
                      key={singleOrderCompany.name}
                    >
                      {singleOrderCompany.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        )}
        <Form.Item name="company_id" label="company" hidden>
          <Input type="number" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="channel" label="channel" hidden>
          <Input
            type="number"
            placeholder="channel"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="Tên nguồn đơn hàng"
          rules={[
            { required: true, message: "Vui lòng điền tên nguồn đơn hàng !" },
            { max: 255, message: "Không được nhập quá 255 ký tự" },
          ]}
        >
          <Input
            placeholder="Nhập tên nguồn đơn hàng"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          name="active"
          valuePropName="checked"
          style={{ marginBottom: 10 }}
        >
          <Checkbox onChange={handleChangeCheckFieldActive}>
            Áp dụng cho đơn hàng
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="default"
          valuePropName="checked"
          style={{ marginBottom: 10 }}
          className={isVisibleFieldDefault ? "show" : "hidden"}
        >
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </StyledComponent>
  );
};

export default FormOrderSource;
