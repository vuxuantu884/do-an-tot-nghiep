import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useEffect, useState} from "react";
import * as CONSTANTS from "utils/Constants";
import {StyledComponent} from "./styles";

type FormValueType = {
  channel_id: number;
  channel: string;
  company_id: number;
  company: string;
  name: string;
  active: boolean;
  default: boolean;
};

const FormOrderSource: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const DEFAULT_FORM_VALUE = {
    channel_id: 4,
    channel: "Admin",
    company_id: CONSTANTS.DEFAULT_FORM_VALUE.company_id,
    company: CONSTANTS.DEFAULT_FORM_VALUE.company,
  };

  const listCompany = [
    {
      id: 1,
      name: "phòng IT",
    },
    {
      id: 2,
      name: "phòng Nhân sự",
    },
  ];
  const {modalAction, formItem, form, visible} = props;
  const [isVisibleFieldDefault, setIsVisibleFieldDefault] = useState(false);
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          channel_id: DEFAULT_FORM_VALUE.channel_id,
          channel: DEFAULT_FORM_VALUE.channel,
          company_id: DEFAULT_FORM_VALUE.company_id,
          company: DEFAULT_FORM_VALUE.company,
          name: formItem.name,
          active: formItem.active,
          default: formItem.default,
        }
      : {
          channel_id: DEFAULT_FORM_VALUE.channel_id,
          channel: DEFAULT_FORM_VALUE.channel,
          company_id: DEFAULT_FORM_VALUE.company_id,
          company: DEFAULT_FORM_VALUE.company,
          name: "",
          active: false,
          default: false,
        };

  /**
   * when change company, set visible field Default
   */
  const handleChangeCheckFieldActive = (checkedValue: CheckboxChangeEvent) => {
    setIsVisibleFieldDefault(checkedValue.target.checked);
    if (!checkedValue.target.checked) {
      form.setFieldsValue({default: false});
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
          <Input />
        </Form.Item>
        <Form.Item name="channel" label="channel" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company_id" label="company_id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company" label="company" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="name"
          label="Tên nguồn đơn hàng"
          rules={[
            {required: true, message: "Vui lòng điền tên nguồn đơn hàng!"},
            {max: 255, message: "Không được nhập quá 255 ký tự!"},
          ]}
        >
          <Input placeholder="Nhập tên nguồn đơn hàng" style={{width: "100%"}} />
        </Form.Item>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item name="phongban" label="Phòng ban">
              <Select
                showSearch
                allowClear
                style={{width: "100%"}}
                placeholder="Chọn phòng ban"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent="Không tìm thấy phòng ban"
              >
                {listCompany &&
                  listCompany.map((single) => {
                    return (
                      <Select.Option value={single.id} key={single.id}>
                        {single.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="danhsachkenh" label="Danh sách kênh">
              <Select
                showSearch
                allowClear
                style={{width: "100%"}}
                placeholder="Chọn danh sách kênh"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                notFoundContent="Không tìm thấy phòng ban"
              >
                {listCompany &&
                  listCompany.map((single) => {
                    return (
                      <Select.Option value={single.id} key={single.id}>
                        {single.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="active" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox onChange={handleChangeCheckFieldActive}>
            Áp dụng cho đơn hàng
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="default"
          valuePropName="checked"
          style={{marginBottom: 0}}
          className={isVisibleFieldDefault ? "show" : "hidden"}
        >
          <Checkbox>Đặt làm mặc định</Checkbox>
        </Form.Item>
      </Form>
    </StyledComponent>
  );
};

export default FormOrderSource;
