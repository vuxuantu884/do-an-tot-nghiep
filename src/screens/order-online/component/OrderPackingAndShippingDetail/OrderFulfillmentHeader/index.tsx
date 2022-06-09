import { Tooltip } from "antd";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import { OrderSettingsModel } from "model/other/order/order-model";
import {
  FulFillmentResponse,
  OrderResponse
} from "model/response/order/order.response";
import moment from "moment";
import React from "react";
import FulfillmentStatusTag from "screens/order-online/component/order-detail/FulfillmentStatusTag";
import PrintShippingLabel from "screens/order-online/component/order-detail/PrintShippingLabel";
import { sortFulfillments } from "utils/AppUtils";
import { FulFillmentStatus, ShipmentMethod } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { checkIfFulfillmentCancelled } from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
  fulfillment: FulFillmentResponse;
  orderSettings: OrderSettingsModel | undefined;
  onPrint: () => void;
};

function OrderFulfillmentHeader(props: PropTypes) {
  const { orderDetail, fulfillment, orderSettings, onPrint } = props;

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;
  // copy button
  const copyOrderID = (e: any, data: string | null) => {
    e.stopPropagation();
    e.target.style.width = "26px";
    const decWidth = setTimeout(() => {
      e.target.style.width = "23px";
    }, 100);
    clearTimeout(decWidth);
    navigator.clipboard.writeText(data ? data : "").then(() => {});
  };

  const sortedFulfillments = sortFulfillments(orderDetail?.fulfillments);

  const checkIfFulfillmentAtStore = () => {
    return (
      sortedFulfillments &&
      sortedFulfillments[0]?.shipment?.delivery_service_provider_type ===
        ShipmentMethod.PICK_AT_STORE
    );
  };

  const checkIfNotShowFulfillmentShippingPrint = () => {
    if (!fulfillment.status) {
      return true;
    }
    const notPrintStatusArr = [
      FulFillmentStatus.CANCELLED,
      FulFillmentStatus.RETURNING,
      FulFillmentStatus.RETURNED,
      FulFillmentStatus.SHIPPING,
      FulFillmentStatus.SHIPPED,
    ];
    return (
      notPrintStatusArr.includes(fulfillment.status) ||
      checkIfFulfillmentAtStore()
    );
  };

  const renderFulfillmentShippingPrint = () => {
    if (!checkIfNotShowFulfillmentShippingPrint()) {
      return (
        <PrintShippingLabel
          fulfillment={fulfillment}
          orderSettings={orderSettings}
          orderId={orderDetail?.id}
          onPrint={onPrint}
        />
      );
    }
  };

  const renderFulfillmentDate = () => {
    if (checkIfFulfillmentCancelled(fulfillment)) {
      return (
        <span>
          <span className="fulfillmentHeaderDateLabel">Ngày huỷ:</span>
          <span className="fulfillmentHeaderDateValue">
            {fulfillment.cancel_date
              ? moment(fulfillment.cancel_date).format(dateFormat)
              : ""}
          </span>
        </span>
      );
    }
    return (
      <span>
        <span className="fulfillmentHeaderDateLabel">Ngày tạo:</span>
        <span className="fulfillmentHeaderDateValue">
          {moment(fulfillment.shipment?.created_date).format(dateFormat)}
        </span>
      </span>
    );
  };

  return (
    <StyledComponent>
      <div className="saleorder-header-content">
        <div className="saleorder-header-content__info">
          <span className="text-field fulfillmentCode">{fulfillment.code}</span>
          <div className="buttonCopy">
            <Tooltip title="Sao chép mã vận đơn">
              <img
                onClick={(e) => {
                  copyOrderID(e, fulfillment.code);
                  showSuccess("Đã copy mã vận đơn!");
                }}
                src={copyFileBtn}
                alt=""
                style={{ width: 23 }}
              />
            </Tooltip>
          </div>
          <FulfillmentStatusTag fulfillment={fulfillment} />
          {renderFulfillmentShippingPrint()}
        </div>
        <div className="saleorder-header-content__date">
          {renderFulfillmentDate()}
        </div>
      </div>
    </StyledComponent>
  );
}

export default OrderFulfillmentHeader;
