import { Checkbox, Col, Form, FormInstance, Input, Modal, Row, Select } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { DepartmentResponse } from "model/account/department.model";
import { OrderSourceModel } from "model/response/order/order-source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { useEffect, useState } from "react";
import * as CONSTANTS from "utils/Constants";
import { RegUtil } from "utils/RegUtils";
import { StyledComponent } from "./styles";

type PropType = {
  visible: boolean;
  onCreate: (formValue: OrderSourceModel) => void;
  onCancel: () => void;
  listChannels: ChannelResponse[];
  listDepartments: DepartmentResponse[];
  form: FormInstance<any>;
}

type FormValuesType = {
  company_id: number;
  company: string;
  name: string;
  code: string;
  department_id: string|undefined;
  department: string|undefined;
  channel_id: number|undefined;
  is_active: boolean;
  is_default: boolean;
};

function ModalCreateOrderSource(props: PropType) {
  const DEFAULT_COMPANY = {
    company_id: CONSTANTS.DEFAULT_COMPANY.company_id,
    company: CONSTANTS.DEFAULT_COMPANY.company,
  };

  const {form, visible, listChannels, listDepartments, onCreate,onCancel } = props;
  /**
  * hiển thị trường đặt làm mặc định
  */
  const [isVisibleFieldDefault, setIsVisibleFieldDefault] = useState(false);
  const initialFormValues: FormValuesType =
  {
    channel_id: undefined,
    company_id: DEFAULT_COMPANY.company_id,
    company: DEFAULT_COMPANY.company,
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
    if (form.getFieldValue("is_active")) {
      setIsVisibleFieldDefault(true);
    } else {
      setIsVisibleFieldDefault(false);
    }
  }, [form, visible]);

  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title="Title"
    >
      
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
              label="Tên nguồn đơn hàng 2"
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
                { len: 4, message: "Nhập 4 ký tự!" },
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
    </Modal>
  );
};

export default ModalCreateOrderSource;
