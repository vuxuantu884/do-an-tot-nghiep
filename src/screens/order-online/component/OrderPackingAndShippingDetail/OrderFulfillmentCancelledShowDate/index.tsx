import { FulFillmentResponse } from "model/response/order/order.response";
import React from "react";
import { FulFillmentStatus } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { checkIfFulfillmentCancelled } from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  fulfillment: FulFillmentResponse;
};

function OrderFulfillmentCancelledShowDate(props: PropTypes) {
  const { fulfillment } = props;

  const dateFormat = DATE_FORMAT.fullDate;

  const renderDateEnd = () => {
    switch (fulfillment.status_before_cancellation) {
      case FulFillmentStatus.SHIPPING:
        return (
          <React.Fragment>
            <div
              className={
                fulfillment.status === FulFillmentStatus.RETURNED
                  ? "saleorder-steps-two saleorder-steps dot-active hide-steps-two-line"
                  : "saleorder-steps-two saleorder-steps dot-active"
              }
            >
              <span>Ngày hủy giao </span>
              <span>
                {ConvertUtcToLocalDate(fulfillment?.cancel_date, dateFormat)}
              </span>
            </div>
            {fulfillment.return_status === FulFillmentStatus.RETURNED && (
              <div className="saleorder-steps-three saleorder-steps dot-active">
                <span>Ngày nhận lại</span>
                <span>
                  {ConvertUtcToLocalDate(
                    fulfillment?.receive_cancellation_on,
                    dateFormat,
                  )}
                </span>
              </div>
            )}
          </React.Fragment>
        );

      default:
        return (
          <div className="saleorder-steps-three saleorder-steps dot-active">
            <span>Ngày hủy giao</span>
            <span>
              {ConvertUtcToLocalDate(fulfillment?.cancel_date, dateFormat)}
            </span>
          </div>
        );
    }
  };

  if (!checkIfFulfillmentCancelled(fulfillment)) {
    return null;
  }

  return (
    <StyledComponent>
      <div className="saleorder-custom-steps">
        <div className="saleorder-steps-one saleorder-steps dot-active">
          <span>Ngày tạo</span>
          <span>
            {ConvertUtcToLocalDate(fulfillment?.created_date, dateFormat)}
          </span>
        </div>
        {renderDateEnd()}
      </div>
    </StyledComponent>
  );
}

export default OrderFulfillmentCancelledShowDate;
