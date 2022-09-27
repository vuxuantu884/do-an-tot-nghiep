import { Col, Row } from "antd";
import storeBlueIcon from "assets/img/storeBlue.svg";
import { OrderPageTypeModel } from "model/order/order.model";
import {
  DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import React, { useCallback } from "react";
import useGetStoreDetail from "screens/order-online/hooks/useGetStoreDetail";
import { formatCurrency, isOrderFromPOS } from "utils/AppUtils";
import { ShipmentMethod, SHIPPING_TYPE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { dangerColor, successColor, yellowColor } from "utils/global-styles/variables";
import { FULFILLMENT_PUSHING_STATUS } from "utils/Order.constants";
import {
  calculateSumWeightResponse,
  checkIfFulfillmentCancelled,
  checkIfFulfillmentIsAtStore,
  checkIfOrderPageType,
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
  fulfillment: FulFillmentResponse;
  deliveryServices: DeliveryServiceResponse[];
  requirementNameView: string | null;
  orderPageType: OrderPageTypeModel;
};

function OrderFulfillmentDetail(props: PropTypes) {
  const { orderDetail, fulfillment, deliveryServices, requirementNameView, orderPageType } = props;

  const isOrderUpdatePage = checkIfOrderPageType.isOrderUpdatePage(orderPageType);

  const returnStoreDetail = useGetStoreDetail(orderDetail?.returned_store_id);

  // console.log("fulfillment", fulfillment);

  const dateFormat = DATE_FORMAT.fullDate;

  const getImageDeliveryService = useCallback(
    (service_code: string | undefined | null) => {
      const service = deliveryServices.find((item) => item.code === service_code);
      return service?.logo;
    },
    [deliveryServices],
  );

  /**
   * Lấy ra đối tác
   */
  const renderDeliverServiceProvider = (fulfillment: FulFillmentResponse) => {
    switch (fulfillment.shipment?.delivery_service_provider_type) {
      case ShipmentMethod.EXTERNAL_SERVICE:
      case ShipmentMethod.SHOPEE:
        return (
          <img
            src={getImageDeliveryService(fulfillment.shipment.delivery_service_provider_code)}
            alt="Logo HVC"
            className="imageDeliveryService"
          />
        );
      case ShipmentMethod.EXTERNAL_SHIPPER:
        return (
          <span>
            {fulfillment.shipment.shipper_code} - {fulfillment.shipment.shipper_name}
          </span>
        );
      case ShipmentMethod.EMPLOYEE:
        return <span>{fulfillment.shipment.info_shipper}</span>;
      default:
        break;
    }
  };

  const getPushingStatus = (fulfillment: FulFillmentResponse) => {
    if (isOrderUpdatePage) {
      return null;
    }
    if (fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SERVICE) {
      let color = "";
      switch (fulfillment.shipment.pushing_status) {
        case FULFILLMENT_PUSHING_STATUS.failed:
          color = dangerColor;
          break;
        case FULFILLMENT_PUSHING_STATUS.waiting:
          color = yellowColor;
          break;
        case FULFILLMENT_PUSHING_STATUS.completed:
          color = successColor;
          break;
        default:
          break;
      }
      return (
        <p>
          <b className="text-field" style={{ color }}>
            {fulfillment?.shipment.pushing_note}
            {/* {failedFulfillment?.shipment.delivery_service_note ? ` - ${failedFulfillment?.shipment.delivery_service_note}` : null} */}
          </b>
        </p>
      );
    }
  };

  const renderHtml = (arr: { title: string; value: React.ReactNode }[]) => {
    return (
      <Row gutter={24}>
        {arr.map((single) => {
          if (!single.title || !single.value) {
            return null;
          }
          return (
            <Col md={12} key={single.title}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">{single.title}:</p>
                </Col>
                <Col span={14}>
                  <p>
                    <b className="text-field">{single.value}</b>
                  </p>
                </Col>
              </Row>
            </Col>
          );
        })}
      </Row>
    );
  };

  const renderIfFulfillmentIsAtStore = () => {
    const detailArrAtStore = [
      {
        title: "Tên cửa hàng",
        value: orderDetail?.store,
      },
      {
        title: "Số điện thoại",
        value: orderDetail?.store_phone_number,
      },
      {
        title: "Địa chỉ",
        value: orderDetail?.store_full_address,
      },
      {
        title: "Phí ship báo khách",
        value: formatCurrency(orderDetail?.shipping_fee_informed_to_customer || 0),
      },
      {
        title: "Loại đơn giao hàng",
        value:
          fulfillment.shipment?.service === SHIPPING_TYPE.DELIVERY_4H ? (
            <span className="fourHourDelivery">Đơn giao 4H</span>
          ) : (
            "Đơn giao bình thường"
          ),
      },
      {
        title: "Trạng thái",
        value: getPushingStatus(fulfillment),
      },
      {
        title: "Trọng lượng",
        value:
          orderDetail?.fulfillments && orderDetail?.fulfillments.length > 0 && orderDetail.items
            ? `${calculateSumWeightResponse(orderDetail.items)} g`
            : null,
      },
      {
        title: !checkIfFulfillmentCancelled(fulfillment) ? "Ngày tạo" : "Ngày hủy",
        value: !checkIfFulfillmentCancelled(fulfillment)
          ? ConvertUtcToLocalDate(fulfillment.shipment?.created_date, dateFormat)
          : ConvertUtcToLocalDate(fulfillment?.cancel_date, dateFormat),
      },
      {
        title: "Lý do hủy",
        value: fulfillment?.reason_name ? (
          <React.Fragment>
            {fulfillment?.reason_name}
            {fulfillment?.sub_reason_name && <span> - {fulfillment?.sub_reason_name}</span>}
          </React.Fragment>
        ) : null,
      },
      {
        title: "Yêu cầu",
        value: requirementNameView ? requirementNameView : null,
      },
      {
        title: "Hàng hoàn về kho",
        value: returnStoreDetail?.name,
      },
    ];
    return (
      <React.Fragment>
        <Row gutter={24} className="atStoreTitle">
          <Col md={24}>
            <b>
              <img style={{ marginRight: 12 }} src={storeBlueIcon} alt="" />
              NHẬN TẠI CỬA HÀNG
            </b>
          </Col>
        </Row>
        {renderHtml(detailArrAtStore)}
      </React.Fragment>
    );
  };

  const renderIfFulfillmentIsNotAtStore = () => {
    const detailArrNotAtStore = [
      {
        title: "Đối tác giao hàng",
        value: renderDeliverServiceProvider(fulfillment),
      },
      {
        title: "Dịch vụ",
        value:
          fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SERVICE
            ? fulfillment.shipment?.delivery_transport_type
            : null,
      },
      {
        title: "Phí ship trả HVC",
        value: formatCurrency(
          fulfillment.shipment?.shipping_fee_paid_to_three_pls
            ? fulfillment.shipment?.shipping_fee_paid_to_three_pls
            : 0,
        ),
      },
      {
        title: "Phí ship báo khách",
        value: formatCurrency(orderDetail?.shipping_fee_informed_to_customer || 0),
      },
      {
        title: "Loại đơn giao hàng",
        value:
          fulfillment.shipment?.service === SHIPPING_TYPE.DELIVERY_4H ? (
            <span className="fourHourDelivery">Đơn giao 4H</span>
          ) : (
            "Đơn giao bình thường"
          ),
      },
      {
        title: "Trạng thái",
        value: getPushingStatus(fulfillment),
      },
      {
        title: "Trọng lượng",
        value:
          orderDetail?.fulfillments && orderDetail?.fulfillments.length > 0 && orderDetail.items
            ? `${calculateSumWeightResponse(orderDetail.items)} g`
            : null,
      },
      {
        title: !checkIfFulfillmentCancelled(fulfillment) ? "Ngày tạo" : "Ngày hủy",
        value: !checkIfFulfillmentCancelled(fulfillment)
          ? ConvertUtcToLocalDate(fulfillment.shipment?.created_date, dateFormat)
          : ConvertUtcToLocalDate(fulfillment?.cancel_date, dateFormat),
      },
      {
        title: "Lý do hủy",
        value: fulfillment?.reason_name ? (
          <React.Fragment>
            {fulfillment?.reason_name}
            {fulfillment?.sub_reason_name && <span> - {fulfillment?.sub_reason_name}</span>}
          </React.Fragment>
        ) : null,
      },
      {
        title: "Yêu cầu",
        value: requirementNameView ? requirementNameView : null,
      },
      {
        title: "Hàng hoàn về kho",
        value: returnStoreDetail?.name,
      },
    ];
    return renderHtml(detailArrNotAtStore);
  };

  if (!fulfillment) {
    return null;
  }

  return (
    <StyledComponent>
      {checkIfFulfillmentIsAtStore(fulfillment) || isOrderFromPOS(orderDetail)
        ? renderIfFulfillmentIsAtStore()
        : renderIfFulfillmentIsNotAtStore()}
    </StyledComponent>
  );
}

export default OrderFulfillmentDetail;
