import { Checkbox, Col, Form, Input, Row, Select } from "antd";
import { CustomModalFormModel } from "model/modal/modal.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { StyledComponent } from "./styles";

type FormValueType = {
  company_id: number;
  company: string;
  sub_status?: string;
  status?: string;
  is_active?: boolean;
  note?: string;
};

const FormOrderProcessingStatus: React.FC<CustomModalFormModel> = (
  props: CustomModalFormModel
) => {
  const { modalAction, formItem, form } = props;
  const isCreateForm = modalAction === "create";
  const initialFormValue: FormValueType =
    !isCreateForm && formItem
      ? {
          company_id: 1,
          company: "YODY",
          sub_status: formItem?.sub_status,
          status: formItem?.status,
          is_active: formItem?.is_active,
          note: formItem?.note,
        }
      : {
          company_id: 1,
          company: "YODY",
          sub_status: "",
          status: undefined,
          is_active: false,
          note: "",
        };
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_STATUS = bootstrapReducer.data?.order_main_status;

  useEffect(() => {
    form.resetFields();
  }, [form, formItem]);

  return (
    <StyledComponent>
      <Form
        form={form}
        name="form-order-processing-status"
        layout="vertical"
        initialValues={initialFormValue}
      >
        <Row gutter={20}>
          <Col span={12}>
            <Form.Item name="company_id" label="company_id" hidden>
              <Input
                type="number"
                placeholder="company_id"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item name="company" label="company" hidden>
              <Input placeholder="company" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="sub_status"
              label="Tên trạng thái"
              rules={[
                {
                  required: true,
                  message: "Vui lòng điền tên nguồn đơn hàng !",
                },
                { max: 500, message: "Không được nhập quá 500 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập tên trạng thái"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái đơn hàng"
              rules={[
                { required: true, message: "Vui lòng chọn trạng thái !" },
              ]}
            >
              <Select
                placeholder="Chọn trạng thái"
                // onChange={this.onGenderChange}
                allowClear
              >
                {LIST_STATUS &&
                  LIST_STATUS.map((singleStatus) => {
                    return (
                      <Select.Option
                        value={singleStatus.value}
                        key={singleStatus.value}
                      >
                        {singleStatus.name}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>
            <Form.Item
              name="is_active"
              valuePropName="checked"
              style={{ marginBottom: 10 }}
            >
              <Checkbox>Áp dụng </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ max: 500, message: "Không được nhập quá 500 ký tự" }]}
            >
              <Input.TextArea rows={10} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </StyledComponent>
  );
};

export default FormOrderProcessingStatus;
