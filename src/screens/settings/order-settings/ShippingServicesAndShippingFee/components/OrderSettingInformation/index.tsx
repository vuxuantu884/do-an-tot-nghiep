import {
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Switch,
} from "antd";
import { CreateShippingServiceConfigReQuestFormModel } from "model/request/settings/order-settings.resquest";
import moment from "moment";
import { useState } from "react";
import { ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
import { StyledComponent } from "./styles";

type PropType = {
  form: FormInstance<any>;
  initialFormValue: CreateShippingServiceConfigReQuestFormModel;
};

function OrderSettingInformation(props: PropType) {
  const datePickerPlaceholder = "dd/mm/yyyy hh:mm";
  const datePickerFormat = "DD-MM-YYYY HH:mm";
  const { form, initialFormValue } = props;
  const [isActive, setIsActive] = useState(
    initialFormValue.status === ORDER_SETTINGS_STATUS.active ? true : false
  );
  const onChangeStatus = (checked: any) => {
    setIsActive(checked);
    if (checked) {
      form.setFieldsValue({ status: ORDER_SETTINGS_STATUS.active });
    } else {
      form.setFieldsValue({ status: ORDER_SETTINGS_STATUS.inactive });
    }
  };

  const disabledDate = (current: any) => {
    // Can not select days before today and today
    return current && current < moment().startOf("day");
  };

  const renderCardExtra = () => {
    return (
      <div>
        Trạng thái{" "}
        <Switch
          defaultChecked={isActive}
          onChange={onChangeStatus}
          className="ant-switch-primary"
          style={{ margin: "0 10px" }}
        />
        <Form.Item name="status" hidden>
          <Input />
        </Form.Item>
        <div className="textExtra">
          <span className={`shortText ${isActive ? "active" : "inactive"}`}>
            Hoạt động
          </span>
          <span className={`longText ${isActive ? "inactive" : "active"}`}>
            Dừng hoạt động
          </span>
        </div>
      </div>
    );
  };

  return (
    <StyledComponent>
      <Card title="Thông tin chương trình" extra={renderCardExtra()}>
        <Form.Item
          name="program_name"
          label="Tên chương trình:"
          rules={[
            { required: true, message: "Vui lòng nhập tên chương trình" },
          ]}
        >
          <Input type="text" placeholder="Nhập tên chương trình" />
        </Form.Item>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              name="start_date"
              label="Ngày bắt đầu:"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              <DatePicker
                placeholder={datePickerPlaceholder}
                format={datePickerFormat}
                showTime={true}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="end_date"
              label="Ngày kết thúc:"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc" },
              ]}
            >
              <DatePicker
                placeholder={datePickerPlaceholder}
                format={datePickerFormat}
                showTime={true}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default OrderSettingInformation;
