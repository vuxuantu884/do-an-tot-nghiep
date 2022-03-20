import { Col, Collapse, Row, Tooltip, Typography } from "antd";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import { OrderExtraModel } from "model/order/order.model";
import moment from "moment";
import React from "react";
import { TrackingCode } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./SubStatus.styles";

type PropTypes = {
  record: OrderExtraModel;
};

function SubStatus(props: PropTypes): JSX.Element {
  const { record } = props;

  const trackingLogFulfillment = record?.trackingLog;
  // copy button
  const copyOrderID = (e: any, data: string | null) => {
    e.stopPropagation();
    e.target.style.width = "26px";
    const decWidth = setTimeout(() => {
      e.target.style.width = "23px";
    }, 100);
    clearTimeout(decWidth);
    navigator.clipboard.writeText(data ? data : "").then(() => {});
    showSuccess("Đã copy mã vận đơn!")
  };

  return (
    <StyledComponent>
      <Collapse ghost>
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
                  {TrackingCode(record)}
                </Typography.Link>
                <div
                  style={{
                    width: 30,
                    padding: "0 4px",
                  }}>
                    <Tooltip title="Click để copy">
                      <img
                        onClick={(e) => copyOrderID(e, TrackingCode(record)!)}
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

export default SubStatus;
