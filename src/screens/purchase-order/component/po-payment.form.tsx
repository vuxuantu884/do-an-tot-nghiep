import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Checkbox, Col, Form, Row, Space, Timeline } from "antd";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";

const POPaymentForm: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <Form form={form} name="po-payment">
      <Card
        className="po-form margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THANH TOÁN</span>
          </div>
        }
      >
        <div className="padding-20">
          <Row gutter={24} className="margin-bottom-40">
            <Col md={12}>
              {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
              <span className="text-field margin-right-10">
                Điều khoản thanh toán:
              </span>
              <span>
                {" "}
                <strong className="po-payment-row-title">Sau 15 ngày</strong>
              </span>
            </Col>
            <Col md={12}>
              <span className="text-field margin-right-10">Diễn giải:</span>
              <span>Sau 15 ngày</span>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={24}>
              <Timeline>
                <Timeline.Item color="green">
                  <Row gutter={24}>
                    <Col md={8}>
                      {" "}
                      <strong className="po-payment-row-title">
                        Tiền cần trả
                      </strong>
                    </Col>
                    <Col md={8}>
                      {" "}
                      <strong className="po-payment-row-title">
                        1.000.000
                      </strong>
                    </Col>
                    <Col md={8} style={{ color: "#27AE60" }}>
                      {" "}
                      <CheckCircleOutlined style={{ fontSize: "18px" }} /> Đã
                      duyệt
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col md={8}>Tiền mặt</Col>
                    <Col md={8}>1000.0000</Col>
                    <Col md={8}> Đã duyệt</Col>
                  </Row>
                </Timeline.Item>
              </Timeline>
            </Col>
          </Row>
        </div>
      </Card>
    </Form>
  );
};

export default POPaymentForm;
