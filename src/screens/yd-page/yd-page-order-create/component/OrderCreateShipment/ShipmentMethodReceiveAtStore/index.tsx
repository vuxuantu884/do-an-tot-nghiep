import { Col, Row, Typography } from "antd";
import IconStoreBlue from "assets/img/storeBlue.svg";
import { StoreCustomResponse } from "model/response/order/order.response";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  storeDetail?: StoreCustomResponse | null;
  isCancelValidateDelivery?: boolean;
  renderButtonCreateActionHtml: () => JSX.Element | null;
};

function ShipmentMethodReceiveAtStore(props: PropType) {
  const {storeDetail, renderButtonCreateActionHtml} = props;
  return (
    <StyledComponent>
      <div className="receive-at-store">
        <b>
          <img src={IconStoreBlue} alt="" /> THÔNG TIN CỬA HÀNG
        </b>

        <Row style={{paddingTop: "19px"}}>
          <Col md={6} lg={6} xxl={6}>
            <div>Tên cửa hàng:</div>
          </Col>
          <Col md={18} lg={18} xxl={18}>
            <b className="row-info-content">
              <Typography.Link style={{color: "#222222"}}>
                {storeDetail?.name}
              </Typography.Link>
            </b>
          </Col>
        </Row>
        <Row className="row-info padding-top-10">
          <Col md={6} lg={6} xxl={6}>
            <div>Số điện thoại:</div>
          </Col>
          <Col md={18} lg={18} xxl={18}>
            <b className="row-info-content">{storeDetail?.hotline}</b>
          </Col>
        </Row>
        <Row className="row-info padding-top-10">
          <Col md={6} lg={6} xxl={6}>
            <div>Địa chỉ:</div>
          </Col>
          <Col md={18} lg={18} xxl={18}>
            <b className="row-info-content">{storeDetail?.address}</b>
          </Col>
        </Row>
        {renderButtonCreateActionHtml && renderButtonCreateActionHtml()}
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodReceiveAtStore;
