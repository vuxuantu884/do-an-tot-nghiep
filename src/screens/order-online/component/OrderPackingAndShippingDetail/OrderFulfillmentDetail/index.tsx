import { Col, Row } from "antd";
import storeBlueIcon from "assets/img/storeBlue.svg";
import {
  DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
} from "model/response/order/order.response";
import React, { useCallback } from "react";
import { CheckShipmentType, formatCurrency, isOrderFromPOS } from "utils/AppUtils";
import { ShipmentMethod, SHIPPING_TYPE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import {
  dangerColor,
  successColor,
  yellowColor,
} from "utils/global-styles/variables";
import { FULFILLMENT_PUSHING_STATUS } from "utils/Order.constants";
import {
  calculateSumWeightResponse,
  checkIfFulfillmentCancelled,
  checkIfFulfillmentIsAtStore,
} from "utils/OrderUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  orderDetail?: OrderResponse | null;
  fulfillment: FulFillmentResponse;
  deliveryServices: DeliveryServiceResponse[];
  requirementNameView: string | null;
  isUpdateOrder: boolean;
};

function OrderFulfillmentDetail(props: PropTypes) {
  const {
    orderDetail,
    fulfillment,
    deliveryServices,
    requirementNameView,
    isUpdateOrder,
  } = props;

  console.log("fulfillment", fulfillment);

  const dateFormat = DATE_FORMAT.fullDate;

  const getImageDeliveryService = useCallback(
    (service_code: string | undefined | null) => {
      const service = deliveryServices.find(
        (item) => item.code === service_code,
      );
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
            src={getImageDeliveryService(
              fulfillment.shipment.delivery_service_provider_code,
            )}
            alt="Logo HVC"
            className="imageDeliveryService"
          />
        );
      case ShipmentMethod.EXTERNAL_SHIPPER:
        return (
          <span>
            {fulfillment.shipment.shipper_code} -{" "}
            {fulfillment.shipment.shipper_name}
          </span>
        );
      case ShipmentMethod.EMPLOYEE:
        return <span>{fulfillment.shipment.info_shipper}</span>;
      default:
        break;
    }
  };

  const renderPushingStatus = (fulfillment: FulFillmentResponse) => {
    if (isUpdateOrder) {
      return null;
    }
    if (
      fulfillment.shipment?.delivery_service_provider_type ===
      ShipmentMethod.EXTERNAL_SERVICE
    ) {
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
        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field">Trạng thái:</p>
            </Col>
            <Col span={14}>
              <p>
                <b className="text-field" style={{ color }}>
                  {fulfillment?.shipment.pushing_note}
                  {/* {failedFulfillment?.shipment.delivery_service_note ? ` - ${failedFulfillment?.shipment.delivery_service_note}` : null} */}
                </b>
              </p>
            </Col>
          </Row>
        </Col>
      );
    }
  };

  const renderIfFulfillmentIsAtStore = () => {
    return (
      <div>
        <Row gutter={24}>
          <Col md={24}>
            <b>
              <img style={{ marginRight: 12 }} src={storeBlueIcon} alt="" />
              NHẬN TẠI CỬA HÀNG
            </b>
          </Col>
        </Row>
        
        <Row gutter={24} style={{ paddingTop: "15px" }}>
          <Col md={12}>
            <Row>
              <Col span={10}>
                <p className="text-field">Tên cửa hàng:</p>
              </Col>
              <Col span={14}>
                <b>{orderDetail?.store}</b>
              </Col>
            </Row>
          </Col>

          <Col md={12}>
            <Row>
              <Col span={10}>
                <p className="text-field">Số điện thoại:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">{orderDetail?.store_phone_number}</b>
              </Col>

            </Row>
          </Col>

          <Col md={12}>
            <Row>
              <Col span={10}>
                <p className="text-field">Địa chỉ:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">{orderDetail?.store_full_address}</b>
              </Col>

            </Row>
          </Col>
        </Row>
      </div>
    );
  };

  const renderIfFulfillmentIsNotAtStore = () => {
    return (
      <Row gutter={24}>
        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field doi-tac">Đối tác giao hàng:</p>
            </Col>
            <Col span={14}>
              <b>
                {/* Lấy ra đối tác */}
                {renderDeliverServiceProvider(fulfillment)}
              </b>
            </Col>
          </Row>
        </Col>
        {/* {CheckShipmentType(orderDetail!) === "external_service" && ( */}
        {fulfillment.shipment?.delivery_service_provider_type ===
          ShipmentMethod.EXTERNAL_SERVICE && (
          <Col md={12}>
            <Row gutter={30}>
              <Col span={10}>
                <p className="text-field">Dịch vụ:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">
                  {/* {getServiceName(orderDetail!)} */}
                  {fulfillment.shipment?.delivery_transport_type}
                </b>
              </Col>
            </Row>
          </Col>
        )}

        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field">Phí ship trả HVC:</p>
            </Col>
            <Col span={14}>
              <b className="text-field">
                {orderDetail?.fulfillments &&
                  formatCurrency(
                    fulfillment.shipment?.shipping_fee_paid_to_three_pls
                      ? fulfillment.shipment?.shipping_fee_paid_to_three_pls
                      : 0,
                  )}
              </b>
            </Col>
          </Row>
        </Col>

        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field">Phí ship báo khách:</p>
            </Col>
            <Col span={14}>
              <b className="text-field">
                {formatCurrency(
                  orderDetail?.shipping_fee_informed_to_customer || 0,
                )}
              </b>
            </Col>
          </Row>
        </Col>
        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field">Loại đơn giao hàng:</p>
            </Col>
            <Col span={14}>
              <b
                className="text-field"
                style={{
                  color:
                    fulfillment.shipment?.service === SHIPPING_TYPE.DELIVERY_4H
                      ? "#E24343"
                      : "",
                }}
              >
                {fulfillment.shipment?.service === SHIPPING_TYPE.DELIVERY_4H
                  ? "Đơn giao 4H"
                  : "Đơn giao bình thường"}
              </b>
            </Col>
          </Row>
        </Col>
        {renderPushingStatus(fulfillment)}
        {CheckShipmentType(orderDetail!) ===
          ShipmentMethod.EXTERNAL_SERVICE && (
          <Col md={12}>
            <Row gutter={30}>
              <Col span={10}>
                <p className="text-field">Trọng lượng:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">
                  {orderDetail?.fulfillments &&
                    orderDetail?.fulfillments.length > 0 &&
                    formatCurrency(
                      orderDetail.items &&
                        calculateSumWeightResponse(orderDetail.items),
                    )}
                  g
                </b>
              </Col>
            </Row>
          </Col>
        )}
        <Col md={12}>
          <Row gutter={30}>
            <Col span={10}>
              <p className="text-field">
                {!checkIfFulfillmentCancelled(fulfillment)
                  ? "Ngày tạo"
                  : "Ngày hủy"}
                :
              </p>
            </Col>
            <Col span={14}>
              <b className="text-field">
                {!checkIfFulfillmentCancelled(fulfillment)
                  ? ConvertUtcToLocalDate(
                      fulfillment.shipment?.created_date,
                      dateFormat,
                    )
                  : ConvertUtcToLocalDate(fulfillment?.cancel_date, dateFormat)}
              </b>
            </Col>
          </Row>
        </Col>

        {fulfillment?.reason_name && (
          <Col md={12}>
            <Row gutter={30}>
              <Col span={10}>
                <p className="text-field">Lý do hủy:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">
                  {fulfillment?.reason_name}
                  {fulfillment?.sub_reason_name && (
                    <span> - {fulfillment?.sub_reason_name}</span>
                  )}
                </b>
              </Col>
            </Row>
          </Col>
        )}

        {requirementNameView && (
          <Col md={12}>
            <Row gutter={30}>
              <Col span={10}>
                <p className="text-field">Yêu cầu:</p>
              </Col>
              <Col span={14}>
                <b className="text-field">{requirementNameView}</b>
              </Col>
            </Row>
          </Col>
        )}
      </Row>
    );
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
