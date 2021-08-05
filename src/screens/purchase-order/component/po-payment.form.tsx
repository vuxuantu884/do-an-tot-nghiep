import { Card, Col, Form, Row, Timeline } from "antd";

const POPaymentForm: React.FC = () => {
  return (
    <Card
      className="po-form margin-top-20"
      title={
        <div className="d-flex">
          <span className="title-card">THANH TOÁN</span>
        </div>
      }
    >
      <div className="padding-20">
        <Row gutter={24}>
          <Col md={12}>
            <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item label="Diễn giải">
              {" "}
              Thanh toán sau 15 nhận hàng
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col md={24}>
            <Timeline>
              <Timeline.Item color="green">
                Create a services site 2015-09-01
              </Timeline.Item>
              <Timeline.Item color="green">
                Create a services site 2015-09-01
              </Timeline.Item>
              <Timeline.Item color="red">
                <p>Solve initial network problems 1</p>
                <p>Solve initial network problems 2</p>
                <p>Solve initial network problems 3 2015-09-01</p>
              </Timeline.Item>
              <Timeline.Item>
                <p>Technical testing 1</p>
                <p>Technical testing 2</p>
                <p>Technical testing 3 2015-09-01</p>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <p>Technical testing 1</p>
                <p>Technical testing 2</p>
                <p>Technical testing 3 2015-09-01</p>
              </Timeline.Item>
              <Timeline.Item color="gray">
                <p>Technical testing 1</p>
                <p>Technical testing 2</p>
                <p>Technical testing 3 2015-09-01</p>
              </Timeline.Item>
            </Timeline>
          </Col>
        </Row>
      </div>
    </Card>
  );
};

export default POPaymentForm;
