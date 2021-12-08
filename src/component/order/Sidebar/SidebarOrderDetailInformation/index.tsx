import {Card, Col, Row} from "antd";
import UrlConfig from "config/url.config";
import {OrderResponse} from "model/response/order/order.response";
import React from "react";
import {Link} from "react-router-dom";
import {StyledComponent} from "./styles";

type PropType = {
  OrderDetail: OrderResponse | null;
};

function SidebarOrderDetailInformation(props: PropType) {
  const {OrderDetail} = props;
  const renderSplitOrder = () => {
    const splitCharacter = "-";
    if (!OrderDetail?.linked_order_code) {
      return;
    }
    let result = OrderDetail.linked_order_code.split(splitCharacter);
    if (result.length > 1) {
      return (
        <Row gutter={5}>
          <Col span={10}>Đơn tách:</Col>
          <Col span={14}>
            {result.map((single, index) => {
              return (
                <React.Fragment>
                  <Link target="_blank" to={`${UrlConfig.ORDER}/${single}`}>
                    <strong>{single}</strong>
                  </Link>
                  {index < result.length - 1 && ", "}
                </React.Fragment>
              );
            })}
          </Col>
        </Row>
      );
    } else {
      return (
        <Row gutter={5}>
          <Col span={10}>Đơn gốc tách đơn:</Col>
          <Col span={14}>
            <Link
              target="_blank"
              to={`${UrlConfig.ORDER}/${OrderDetail.linked_order_code}`}
            >
              <strong>{OrderDetail.linked_order_code}</strong>
            </Link>
          </Col>
        </Row>
      );
    }
  };
  return (
    <StyledComponent>
      <Card title="THÔNG TIN ĐƠN HÀNG">
        <Row className="" gutter={5}>
          <Col span={10}>Cửa hàng:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
              <Link target="_blank" to={`${UrlConfig.STORE}/${OrderDetail?.store_id}`}>
                {OrderDetail?.store}
              </Link>
            </span>
          </Col>
        </Row>
				{OrderDetail?.order_return_origin?.order_id && (
					<Row className="rowDetail" gutter={5}>
						<Col span={10}>Mã đơn đổi hàng:</Col>
						<Col span={14}>
							<span style={{fontWeight: 500, color: "#2A2A86"}} className="text-focus">
								{OrderDetail?.order_return_origin?.order_id ? (
									<Link to={`${UrlConfig.ORDER}/${OrderDetail?.order_return_origin?.order_id}`} target="_blank">
										{OrderDetail?.order_return_origin?.order_code}
									</Link>
								) : (
									"-"
								)}
							</span>
						</Col>
					</Row>
				)}
        {OrderDetail?.ecommerce_shop_name && (
          <Row gutter={5}>
            <Col span={10}>Gian hàng TMĐT:</Col>
            <Col span={14}>
              <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
                {OrderDetail?.ecommerce_shop_name}
              </span>
            </Col>
          </Row>
        )}
        <Row gutter={5}>
          <Col span={10}>Điện thoại:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}}>
              {OrderDetail?.store_phone_number}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Địa chỉ:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}}>
              {OrderDetail?.store_full_address}
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>NV bán hàng:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.assignee_code}`}
              >
                {OrderDetail?.assignee_code} - {OrderDetail?.assignee}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>NV marketing:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.marketer_code}`}
              >
                {OrderDetail?.marketer_code} - {OrderDetail?.marketer}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>NV điều phối:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.coordinator_code}`}
              >
                {OrderDetail?.coordinator_code} - {OrderDetail?.coordinator}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Người tạo:</Col>
          <Col span={14}>
            <span style={{fontWeight: 500, color: "#222222"}} className="text-focus">
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${OrderDetail?.account_code}`}
              >
                {OrderDetail?.account_code} - {OrderDetail?.account}
              </Link>
            </span>
          </Col>
        </Row>
        <Row gutter={5}>
          <Col span={10}>Tham chiếu:</Col>
          <Col span={14} style={{wordWrap: "break-word"}}>
            {OrderDetail?.url ? (
              <a href={OrderDetail?.url}>{OrderDetail?.reference_code}</a>
            ) : (
              <span className="text-focus">{OrderDetail?.reference_code}</span>
            )}
          </Col>
        </Row>
        {OrderDetail?.reason_name && (
          <Row gutter={5}>
            <Col span={10}>Lý do huỷ:</Col>
            <Col span={14}>
              <span style={{fontWeight: 500, color: "rgb(226, 67, 67)"}} className="text-focus">
                {OrderDetail?.reason_name}
              </span>
            </Col>
          </Row>
        )}
        {renderSplitOrder()}
      </Card>
    </StyledComponent>
  );
}

export default SidebarOrderDetailInformation;
