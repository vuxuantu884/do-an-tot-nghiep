import {Checkbox, Col, Form, Input, Row, Select} from "antd";
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import {CustomModalFormModel} from "model/modal/modal.model";
import {useEffect, useState} from "react";
import * as CONSTANTS from "utils/Constants";
import {RegUtil} from "utils/RegUtils";
import {StyledComponent} from "./styles";

type FormValuesType = {
  company_id: number;
  company: string;
  name: string;
  code: string;
  department_id: string;
  department: string;
  channel_id: number;
  is_active: boolean;
  is_default: boolean;
};

const FormOrderSource: React.FC<CustomModalFormModel> = (props: CustomModalFormModel) => {
  const DEFAULT_FORM_VALUE = {
    company_id: CONSTANTS.DEFAULT_FORM_VALUE.company_id,
    company: CONSTANTS.DEFAULT_FORM_VALUE.company,
  };

  const {modalAction, formItem, form, visible, moreFormArguments} = props;

  const {listChannels, listDepartments} = moreFormArguments;
  const [isVisibleFieldDefault, setIsVisibleFieldDefault] = useState(false);
  const isCreateForm = modalAction === CONSTANTS.MODAL_ACTION_TYPE.create;
  const initialFormValues: FormValuesType =
    !isCreateForm && formItem
      ? {
          channel_id: formItem.channel_id,
          company_id: formItem.company_id,
          company: DEFAULT_FORM_VALUE.company,
          name: formItem.name,
          code: formItem.code,
          department_id: formItem.department_id,
          department: formItem.department,
          is_active: formItem.active,
          is_default: formItem.default,
        }
      : {
          channel_id: undefined,
          company_id: DEFAULT_FORM_VALUE.company_id,
          company: DEFAULT_FORM_VALUE.company,
          name: "",
          code: "",
          department_id: undefined,
          department: "",
          is_active: false,
          is_default: false,
        };

  /**
   * when change company, set visible field Default
   */
  const handleChangeCheckFieldActive = (checkedValue: CheckboxChangeEvent) => {
    setIsVisibleFieldDefault(checkedValue.target.checked);
    if (!checkedValue.target.checked) {
      form.setFieldsValue({is_default: false});
    }
  };

  useEffect(() => {
    form.resetFields();
  }, [form, formItem, visible]);

  useEffect(() => {
    if (form.getFieldValue("is_active")) {
      setIsVisibleFieldDefault(true);
    } else {
      setIsVisibleFieldDefault(false);
    }
  }, [form, visible]);

  return (
    <StyledComponent>
      <Form
        form={form}
        name="control-hooks"
        layout="vertical"
        initialValues={initialFormValues}
      >
        <Form.Item name="channel_id" label="channel_id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company_id" label="company_id" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="company" label="company" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="department" hidden noStyle>
          <Input />
        </Form.Item>
        <Row gutter={30}>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
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
                {min: 4, message: "Nhập ít nhất 4 ý tự!"},
                {max: 4, message: "Nhập nhiều nhất 15 ký tự!"},
              ]}
            >
              <Input
                type="text"
                placeholder="Nhập mã nguồn"
                style={{width: "100%", textTransform: "uppercase"}}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              name="channel_id"
              label="Kênh bán"
              rules={[{required: true, message: "Vui lòng chọn kênh!"}]}
            >
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
                {listChannels &&
                  listChannels.map((single: any) => {
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
            <Form.Item
              name="department_id"
              label="Phòng ban"
              rules={[
                { required: true, message: "Vui lòng chọn phòng ban!" }
              ]}
            >
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
                onChange={(value, option: any) => {
                  form.setFieldsValue({department: option.children});
                }}
              >
                {listDepartments &&
                  listDepartments.map((single: any) => {
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
        <Form.Item name="is_active" valuePropName="checked" style={{marginBottom: 10}}>
          <Checkbox onChange={handleChangeCheckFieldActive}>
            Áp dụng cho đơn hàng
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="is_default"
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
