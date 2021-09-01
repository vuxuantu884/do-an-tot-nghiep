import { Card, Switch, Form, Input, DatePicker, Row, Col } from "antd";
import moment from "moment";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderSettingInformation(props: PropType) {
  const renderCardExtra = () => {
    return (
      <div>
        Cho phép bán khi tồn kho <Switch defaultChecked onChange={onChange} />
      </div>
    );
  };
  const onChange = (checked: any) => {
    console.log("checked", checked);
  };

  function range(start: any, end: any) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  function disabledDate(current: any) {
    // Can not select days before today and today
    return current && current < moment().endOf("day");
  }

  function disabledDateTime() {
    return {
      disabledHours: () => range(0, 24).splice(4, 20),
      disabledMinutes: () => range(30, 60),
      disabledSeconds: () => [55, 56],
    };
  }

  return (
    <StyledComponent>
      <Card title="Thông tin chương trình" extra={renderCardExtra()}>
        <Form.Item
          name="name"
          label="Tên chương trình:"
          rules={[
            { required: true, message: "Vui lòng nhập tên chương trình" },
          ]}
        >
          <Input type="text" placeholder="Nhập tên chương trình" />
        </Form.Item>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item name="from_date" label="Ngày bắt đầu:">
              <DatePicker
                placeholder="dd/mm/yyyy  hh:mm"
                format="YYYY-MM-DD HH:mm"
                disabledDate={disabledDate}
                disabledTime={disabledDateTime}
                showTime={{ defaultValue: moment("00:00:00", "HH:mm") }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="to_date" label="Ngày kết thúc:">
              <DatePicker
                placeholder="dd/mm/yyyy  hh:mm"
                format="YYYY-MM-DD HH:mm"
                disabledDate={disabledDate}
                disabledTime={disabledDateTime}
                showTime={{ defaultValue: moment("00:00:00", "HH:mm") }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default OrderSettingInformation;
