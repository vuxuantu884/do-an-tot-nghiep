import { Col, Row, Typography } from "antd";
import IconStoreBlue from "assets/img/storeBlue.svg";
import { StoreCustomResponse } from "model/response/order/order.response";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  storeDetail?: StoreCustomResponse | null;
};

function ShipmentMethodReceiveAtHome(props: PropType) {
  const { storeDetail } = props;
  return (
    <StyledComponent>
      <div className="receive-at-store">
        <b>
          <img src={IconStoreBlue} alt="" /> THÔNG TIN CỬA HÀNG
        </b>

        <Row style={{ paddingTop: "19px" }}>
          <Col md={3} lg={3} xxl={2}>
            <div>Tên cửa hàng:</div>
          </Col>
          <b className="row-info-content">
            <Typography.Link style={{ color: "#222222" }}>
              {storeDetail?.name}
            </Typography.Link>
          </b>
        </Row>
        <Row className="row-info padding-top-10">
          <Col md={3} lg={3} xxl={2}>
            <div>Số điện thoại:</div>
          </Col>
          <b className="row-info-content">{storeDetail?.hotline}</b>
        </Row>
        <Row className="row-info padding-top-10">
          <Col md={3} lg={3} xxl={2}>
            <div>Địa chỉ:</div>
          </Col>
          <b className="row-info-content">{storeDetail?.address}</b>
        </Row>
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodReceiveAtHome;
