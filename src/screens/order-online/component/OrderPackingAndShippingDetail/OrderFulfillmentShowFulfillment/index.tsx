import { Col, Collapse, Row, Typography } from "antd";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import { getTrackingLogFulfillmentAction } from "domain/actions/order/order.action";
import {
  FulFillmentResponse,
  TrackingLogFulfillmentResponse
} from "model/response/order/order.response";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { copyTextToClipboard } from "utils/AppUtils";
import { ShipmentMethod } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import {
  checkIfFulfillmentCancelled,
  getTrackingCodeFulfillment
} from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse;
};

function OrderFulfillmentShowFulfillment(props: PropTypes) {
  const { fulfillment } = props;

  const dispatch = useDispatch();

  const [trackingLogFulfillment, setTrackingLogFulfillment] =
    useState<Array<TrackingLogFulfillmentResponse> | null>(null);

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  // copy button
  // const copyOrderID = (e: any, data: string | null) => {
  //   e.stopPropagation();
  //   e.target.style.width = "26px";
  //   const decWidth = setTimeout(() => {
  //     e.target.style.width = "23px";
  //   }, 100);
  //   clearTimeout(decWidth);
  //   navigator.clipboard.writeText(data ? data : "").then(() => {});
  //   showSuccess("Đã copy mã vận đơn!")
  // };

  const checkIfFulfillmentExternalOrShopee = () => {
    return (
      fulfillment.shipment?.delivery_service_provider_type ===
        ShipmentMethod.EXTERNAL_SERVICE ||
      fulfillment.shipment?.delivery_service_provider_type ===
        ShipmentMethod.SHOPEE
    );
  };

  const checkIfShowFulfillment = () => {
    return (
      checkIfFulfillmentExternalOrShopee() &&
      !checkIfFulfillmentCancelled(fulfillment)
    );
  };

  useEffect(() => {
    if (
      fulfillment.shipment?.tracking_code !== "Đang xử lý" &&
      fulfillment.code
    ) {
      dispatch(
        getTrackingLogFulfillmentAction(
          fulfillment.code,
          setTrackingLogFulfillment,
        ),
      );
    }
  }, [dispatch, fulfillment.code, fulfillment.shipment?.tracking_code]);

  if (!checkIfShowFulfillment()) {
    return null;
  }

  return (
    <StyledComponent>
      <Row className="fulfillmentRow" gutter={24}>
        <Col span={24}>
          <Collapse ghost defaultActiveKey={1}>
            <Collapse.Panel
              header={
                <Row>
                  <Col className="fulfillmentCol">
                    <span className="fulfillmentCodeTitle">Mã vận đơn:</span>
                    <Typography.Link className="text-field fulfillmentCode">
                      {getTrackingCodeFulfillment(fulfillment)}
                    </Typography.Link>
                    <div className="copyButton">
                      <img
                        onClick={(e) =>{
                          copyTextToClipboard(
                            e,
                            getTrackingCodeFulfillment(fulfillment)!,
                          )
                          showSuccess("Đã copy mã vận đơn!");
                        }}
                        src={copyFileBtn}
                        alt=""
                        style={{ width: 23 }}
                      />
                    </div>
                  </Col>
                </Row>
              }
              key="1"
              className="custom-css-collapse"
            >
              <Collapse
                className="orders-timeline"
                expandIcon={({ isActive }) => (
                  <img
                    src={doubleArrow}
                    alt=""
                    style={{
                      transform: isActive ? "rotate(0deg)" : "rotate(270deg)",
                      float: "right",
                    }}
                  />
                )}
                ghost
                defaultActiveKey={["0"]}
              >
                {trackingLogFulfillment?.map((item, index) => (
                  <Collapse.Panel
                    className={`orders-timeline-custom orders-dot-status ${
                      index === 0 ? "currentTimeline 333" : ""
                    } ${item.status === "failed" ? "hasError" : ""}`}
                    header={
                      <React.Fragment>
                        <b className="trackingNoteText">
                          {item.shipping_status
                            ? item.shipping_status
                            : item.partner_note}
                        </b>
                        <i className="icon-dot iconDot"></i>{" "}
                        <span className="fulfillmentTrackingLogDate">
                          {moment(item.created_date).format(dateFormat)}
                        </span>
                      </React.Fragment>
                    }
                    key={index}
                    showArrow={false}
                  ></Collapse.Panel>
                ))}
              </Collapse>
            </Collapse.Panel>
          </Collapse>
        </Col>
      </Row>
    </StyledComponent>
  );
}

export default OrderFulfillmentShowFulfillment;
