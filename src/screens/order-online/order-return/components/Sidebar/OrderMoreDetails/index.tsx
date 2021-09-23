import { Card, Col, Row, Tag } from "antd";
import { OrderResponse } from "model/response/order/order.response";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderMoreDetails(props: PropType) {
  const { OrderDetail } = props;
  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN BỔ SUNG</span>
          </div>
        }
      >
        <div className="padding-24">
          <Row className="" gutter={5} style={{ flexDirection: "column" }}>
            <Col span={24} style={{ marginBottom: 6 }}>
              <b>Ghi chú nội bộ:</b>
            </Col>
            <Col span={24}>
              <span className="text-focus" style={{ wordWrap: "break-word" }}>
                {OrderDetail?.note !== ""
                  ? OrderDetail?.note
                  : "Không có ghi chú"}
              </span>
            </Col>
          </Row>

          <Row
            className="margin-top-10"
            gutter={5}
            style={{ flexDirection: "column" }}
          >
            <Col span={24} style={{ marginBottom: 6 }}>
              <b>Tags:</b>
            </Col>
            <Col span={24}>
              <span className="text-focus">
                {OrderDetail?.tags
                  ? OrderDetail?.tags.split(",").map((item, index) => (
                      <Tag
                        key={index}
                        className="orders-tag"
                        style={{
                          backgroundColor: "#F5F5F5",
                          color: "#737373",
                          padding: "5px 10px",
                        }}
                      >
                        {item}
                      </Tag>
                    ))
                  : "Không có tags"}
              </span>
            </Col>
          </Row>
        </div>
      </Card>
    </StyledComponent>
  );
}

export default OrderMoreDetails;
