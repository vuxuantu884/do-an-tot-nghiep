import { Popover, Tooltip } from "antd";
import React, { useCallback, useState } from "react";

import iconDeliveryProgress from "assets/icon/delivery/tientrinhgiaohang.svg";
import { getFulfillmentActive } from "utils/OrderUtils";
import { useDispatch } from "react-redux";
import { getTrackingLogFulfillmentAction } from "domain/actions/order/order.action";
import {
  FulFillmentResponse,
  TrackingLogFulfillmentResponse,
} from "model/response/order/order.response";
import TrackingLog from "component/order/DeliveryProgress/TrackingLog/TrackingLog";

type Props = {
  fulfillments: FulFillmentResponse[] | FulFillmentResponse;
  setTrackingOrderData?: (v: TrackingLogFulfillmentResponse[] | null) => void;
};
const DeliveryProgress: React.FC<Props> = (props: Props) => {
  const { fulfillments, setTrackingOrderData } = props;
  const dispatch = useDispatch();

  const [trackingLog, setTrackingLog] = useState<Array<TrackingLogFulfillmentResponse> | null>(
    null,
  );
  const [isShowTrackingLog, setIsShowTrackingLog] = useState<boolean>(false);

  const getFulfillment = (_fulfillments: FulFillmentResponse[] | FulFillmentResponse) => {
    let fulfillment = undefined;
    if (Array.isArray(_fulfillments)) {
      fulfillment = getFulfillmentActive(_fulfillments);
    } else {
      fulfillment = _fulfillments;
    }

    return fulfillment;
  };

  const getCheckingLogFulfillment = useCallback(
    (_fulfillments: FulFillmentResponse[] | FulFillmentResponse) => {
      let fulfillment = getFulfillment(_fulfillments);

      if (!fulfillment?.code) {
        return;
      }
      dispatch(
        getTrackingLogFulfillmentAction(fulfillment?.code, (response) => {
          setIsShowTrackingLog(true);
          setTrackingLog(response);
          setTrackingOrderData && setTrackingOrderData(response);
        }),
      );
    },
    [dispatch, setTrackingOrderData],
  );

  const renderOrderTrackingLog = (
    _fulfillments: FulFillmentResponse[] | FulFillmentResponse,
    _isShowTrackingLog: boolean,
    _trackingLog: Array<TrackingLogFulfillmentResponse> | null,
  ) => {
    if (!_fulfillments || !isShowTrackingLog) {
      return "không có thông tin";
    }
    const trackingLogFulfillment = _trackingLog;

    let fulfillment = getFulfillment(_fulfillments);

    const trackingCode = fulfillment?.shipment?.tracking_code;
    if (!trackingCode) {
      return " Không có mã vận đơn!";
    }
    if (!trackingLogFulfillment) {
      return " Không có log tiến trình đơn hàng!";
    }
    let html = null;
    if (trackingLogFulfillment) {
      html = (
        <TrackingLog trackingLogFulfillment={trackingLogFulfillment} trackingCode={trackingCode} />
      );
    }
    return html;
  };

  return (
    <React.Fragment>
      <Popover
        placement="left"
        content={renderOrderTrackingLog(fulfillments, isShowTrackingLog, trackingLog)}
        trigger="click"
      >
        <Tooltip title="Tiến trình giao hàng">
          <img
            src={iconDeliveryProgress}
            alt=""
            className="trackingCodeImg"
            onClick={() => {
              getCheckingLogFulfillment(fulfillments);
            }}
          />
        </Tooltip>
      </Popover>
    </React.Fragment>
  );
};

export default DeliveryProgress;
