import { Col, Row, Typography } from "antd";
import IconStoreBlue from "assets/img/storeBlue.svg";
import { StoreCustomResponse } from "model/response/order/order.response";
import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  storeDetail?: StoreCustomResponse | null;
  isCancelValidateDelivery?: boolean;
  renderButtonCreateActionHtml: () => JSX.Element | null;
};

function ShipmentMethodReceiveAtStore(props: PropTypes) {
  const { storeDetail, renderButtonCreateActionHtml } = props;

  const showStore = [
    {
      title: "Tên cửa hàng",
      value: <Typography.Link>{storeDetail?.name}</Typography.Link>,
    },
    {
      title: "Số điện thoại",
      value: storeDetail?.hotline,
    },
    {
      title: "Địa chỉ",
      value: storeDetail?.address,
    },
  ];
  return (
    <StyledComponent>
      <div className="receive-at-store">
        <b>
          <img src={IconStoreBlue} alt="" /> THÔNG TIN CỬA HÀNG
        </b>

        <div className="storeInformation">
          {showStore.map((single, index) => {
            return (
              <Row className="row-info" key={index}>
                <Col md={6} lg={6} xxl={6}>
                  <div>{`${single.title}:`}</div>
                </Col>
                <Col md={18} lg={18} xxl={18}>
                  <b className="row-info-content">{single.value}</b>
                </Col>
              </Row>
            );
          })}
        </div>
        {renderButtonCreateActionHtml && renderButtonCreateActionHtml()}
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodReceiveAtStore;
