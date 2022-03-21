import { Col, Collapse, Row, Tooltip, Typography } from "antd";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import { TrackingLogFulfillmentResponse } from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import { copyTextToClipboard } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./TrackingLog.styles";

type PropTypes = {
  trackingLogFulfillment: TrackingLogFulfillmentResponse[];
  trackingCode: string;
};

function TrackingLog(props: PropTypes): JSX.Element {
  const { trackingLogFulfillment, trackingCode } = props;

  return (
    <StyledComponent>
      <Collapse ghost defaultActiveKey={['1']}>
        <Collapse.Panel
          header={
            <Row>
              <Col style={{ display: "flex", width: "100%", alignItems: "center" }}>
                <span
                  style={{
                    marginRight: "10px",
                    color: "#222222",
                  }}>
                  Mã vận đơn:
                </span>
                <Typography.Link
                  className="text-field"
                  style={{
                    color: "#2A2A86",
                    fontWeight: 500,
                    fontSize: 16,
                  }}>
                  {trackingCode}
                </Typography.Link>
                <div
                  style={{
                    width: 30,
                    padding: "0 4px",
                  }}>
                    <Tooltip title="Click để copy">
                      <img
                        onClick={(e) => {
                          copyTextToClipboard(e, trackingCode);
                          showSuccess("Đã copy mã vận đơn!")
                        }}
                        src={copyFileBtn}
                        alt=""
                        style={{ width: 23 }}
                      />

                    </Tooltip>
                </div>
              </Col>
            </Row>
          }
          key="1"
          className="custom-css-collapse">
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
            defaultActiveKey={["0"]}>
            {trackingLogFulfillment?.map((item, index) => (
              <Collapse.Panel
                className={`orders-timeline-custom orders-dot-status ${
                  index === 0 ? "currentTimeline 333" : ""
                } ${item.status === "failed" ? "hasError" : ""}`}
                header={
                  <React.Fragment>
                    <b
                      style={{
                        paddingLeft: "14px",
                        color: "#222222",
                      }}>
                      {item.shipping_status ? item.shipping_status : item.partner_note}
                    </b>
                    <i
                      className="icon-dot"
                      ></i>{" "}
                    <span style={{ color: "#737373" }}>
                      {moment(item.created_date).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </React.Fragment>
                }
                key={index}
                showArrow={false}></Collapse.Panel>
            ))}
          </Collapse>
        </Collapse.Panel>
      </Collapse>
    </StyledComponent>
  );
}

export default TrackingLog;
