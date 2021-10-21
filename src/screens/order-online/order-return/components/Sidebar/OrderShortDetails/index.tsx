import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { OrderResponse } from "model/response/order/order.response";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

/**
 * Input: OrderDetail
 */
function OrderShortDetails(props: PropType) {
  const { OrderDetail } = props;
  console.log("OrderDetail", OrderDetail);
  return (
    <StyledComponent>
      <Card className="card-block card-block-normal" title="THÔNG TIN ĐƠN HÀNG">
        <Row className="" gutter={5}>
          <Col span={10}>Cửa hàng:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              <Link target="_blank" to={`${UrlConfig.STORE}/${OrderDetail?.store_id}`}>{OrderDetail?.store}</Link>
            </span>
          </Col>
        </Row>
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>Điện thoại:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }}>
              {OrderDetail?.customer_phone_number}
            </span>
          </Col>
        </Row>
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>Địa chỉ:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }}>
              {OrderDetail?.shipping_address?.full_address}
            </span>
          </Col>
        </Row>
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>NV bán hàng:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.assignee_code}`}>
                {OrderDetail?.assignee_code} - {OrderDetail?.assignee}
              </Link>
            </span>
          </Col>
        </Row>
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>NV marketing:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.marketer_code}`}>
                {OrderDetail?.marketer_code} - {OrderDetail?.marketer}
              </Link>
            </span>
          </Col>
        </Row>
        {/* <Row className="margin-top-10" gutter={5}>
          <Col span={10}>Nhân viên điều phối:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
              {OrderDetail?.coordinator}
            </span>
          </Col>
        </Row> */}
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>Người tạo:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#222222" }} className="text-focus">
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.account_code}`}>
                {OrderDetail?.account_code} - {OrderDetail?.account}
              </Link>
            </span>
          </Col>
        </Row>
        <Row className="margin-top-10" gutter={5}>
          <Col span={10}>Đường dẫn:</Col>
          <Col span={14} style={{ wordWrap: "break-word" }}>
            {OrderDetail?.url ? (
              <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
            ) : (
              <span className="text-focus">-</span>
            )}
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default OrderShortDetails;
