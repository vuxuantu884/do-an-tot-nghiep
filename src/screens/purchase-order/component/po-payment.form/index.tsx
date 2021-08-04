import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Progress, Row, Timeline } from "antd";
import { StyledComponent } from "./styles";

const POPaymentForm: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <StyledComponent>
      <Form form={form} name="po-payment">
        <Card
          className="po-form margin-top-20"
          title={
            <div className="d-flex">
              <span className="title-card">THANH TOÁN</span>
            </div>
          }
          extra={
            <Button>
              <CheckCircleOutlined style={{ fontSize: "18px" }} />
              Tạo thanh toán
            </Button>
          }
        >
          <div className="padding-20">
            <div className="card__section shortInformation">
              <Row gutter={24} className="margin-bottom-40">
                <Col md={12}>
                  {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                  <div className="shortInformation__column">
                    <span className="text-field margin-right-10">
                      Điều khoản thanh toán:
                    </span>
                    <span>
                      {" "}
                      <strong className="po-payment-row-title">
                        Sau 15 ngày
                      </strong>
                    </span>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="shortInformation__column">
                    <span className="text-field margin-right-10">
                      Diễn giải:
                    </span>
                    <span>Sau 15 ngày</span>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="card__section checkOut">
              <Row gutter={24}>
                <Col md={14}>
                  {/* <Form.Item label="Điều khoản thanh toán"> Sau 15 ngày</Form.Item> */}
                  <div className="checkOut__column checkOut__progress">
                    <div className="checkOut__progress-bar">
                      <Progress
                        type="line"
                        percent={30}
                        showInfo={false}
                        strokeWidth={21}
                        strokeColor="#5D5D8A"
                        trailColor="#ECEFFA"
                      />
                      <div className="checkOut__progress-bar__value">
                        <span> Thanh toán : 30%</span>
                      </div>
                    </div>
                    <div className="checkOut__progress-text">
                      <CheckCircleOutlined style={{ fontSize: "18px" }} />
                      Đã thanh toán: <strong> 50.220.000</strong>
                    </div>
                  </div>
                </Col>
                <Col md={10}>
                  <div className="checkOut__column">
                    <CheckCircleOutlined style={{ fontSize: "18px" }} />
                    Còn phải trả:{" "}
                    <strong style={{ color: "#E24343" }}> 50.220.000</strong>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="card__section timeline">
              <Row gutter={24}>
                <Col md={24}>
                  <Timeline>
                    <Timeline.Item className="timeline__isFinished">
                      <Row gutter={24}>
                        <Col md={8}>
                          <div className="timeline__colTitle">
                            <h3 className="po-payment-row-title">Tiền mặt</h3>
                            <div>
                              Yêu cầu thanh toán: <br />
                              <strong>15/07/2021</strong>{" "}
                            </div>
                          </div>
                        </Col>
                        <Col md={8}>
                          {" "}
                          <strong className="po-payment-row-title">
                            1.000.000
                          </strong>
                        </Col>
                        <Col md={8}>
                          <div className="timeline__status">
                            <CheckCircleOutlined style={{ fontSize: "18px" }} />{" "}
                            Đã duyệt
                          </div>
                          <div>
                            Duyệt thanh toán <br />
                            <strong>20/07/2021 15:30</strong>
                          </div>
                        </Col>
                      </Row>
                    </Timeline.Item>
                    <Timeline.Item className="timeline__isFinished">
                      <Row gutter={24}>
                        <Col md={8}>
                          <div>
                            <strong className="po-payment-row-title">
                              Chuyển khoản
                            </strong>
                          </div>
                          <div>
                            Yêu cầu thanh toán: <br />
                            <strong>15/07/2021</strong>{" "}
                          </div>
                        </Col>
                        <Col md={8}>
                          <strong className="po-payment-row-title">
                            1.500.000
                          </strong>
                        </Col>
                        <Col md={8}>
                          <div className="timeline__status">
                            <CheckCircleOutlined style={{ fontSize: "18px" }} />{" "}
                            Đã duyệt
                          </div>
                          <div>
                            Duyệt thanh toán <br />
                            <strong>20/07/2021 15:30</strong>
                          </div>
                        </Col>
                      </Row>
                    </Timeline.Item>
                    <Timeline.Item>
                      <Row gutter={24}>
                        <Col md={8}>
                          <div>
                            <strong className="po-payment-row-title">
                              Chuyển khoản
                            </strong>
                          </div>
                          <div>
                            Yêu cầu thanh toán: <br />
                            15/07/2021{" "}
                          </div>
                        </Col>
                        <Col md={8}>
                          {" "}
                          <strong className="po-payment-row-title">
                            1.500.000
                          </strong>
                        </Col>
                        <Col md={8}>
                          <div className="timeline__groupButtons">
                            <Button>
                              <CheckCircleOutlined
                                style={{ fontSize: "18px" }}
                              />{" "}
                              Sửa
                            </Button>
                            <Button>
                              <CheckCircleOutlined
                                style={{ fontSize: "18px" }}
                              />{" "}
                              Duyệt
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Timeline.Item>
                    <Timeline.Item>
                      <Row gutter={24}>
                        <Col md={8}>
                          <div>
                            <strong className="po-payment-row-title">
                              Chuyển khoản
                            </strong>
                          </div>
                          <div>
                            Yêu cầu thanh toán: <br />
                            15/07/2021{" "}
                          </div>
                        </Col>
                        <Col md={8}>
                          {" "}
                          <strong className="po-payment-row-title">
                            1.500.000
                          </strong>
                        </Col>
                        <Col md={8}>
                          <div className="timeline__groupButtons">
                            <Button>
                              <CheckCircleOutlined
                                style={{ fontSize: "18px" }}
                              />{" "}
                              Sửa
                            </Button>
                            <Button>
                              <CheckCircleOutlined
                                style={{ fontSize: "18px" }}
                              />{" "}
                              Duyệt
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Timeline.Item>
                  </Timeline>
                </Col>
              </Row>
            </div>
          </div>
          <div className="card__footer">
            <Button>Kết thúc thanh toán</Button>
          </div>
        </Card>
      </Form>
    </StyledComponent>
  );
};

export default POPaymentForm;
