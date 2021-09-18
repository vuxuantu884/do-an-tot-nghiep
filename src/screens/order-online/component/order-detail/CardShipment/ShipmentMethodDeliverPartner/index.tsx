import { Col, Row, Form, Divider } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  FeesResponse,
} from "model/response/order/order.response";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

type PropType = {
  amount: number;
  shippingFeeCustomer: number | null;
  discountValue: number | null;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[];
  setShippingFeeInformedCustomer: (value: number | null) => void;
  deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  changeServiceType: (id: number, code: string, item: any, fee: number) => void;
  fulfillments: FulFillmentResponse[];
  isCloneOrder?: boolean;
};
function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    amount,
    shippingFeeCustomer,
    discountValue,
    OrderDetail,
    payments,
    setShippingFeeInformedCustomer,
    deliveryServices,
    infoFees,
    changeServiceType,
    fulfillments,
    isCloneOrder,
  } = props;

  // console.log("propsShipmentmethod", props);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState("");

  const totalAmountPaid = () => {
    let total = 0;
    if (payments) {
      payments.forEach((p) => (total = total + p.amount));
    }
    return total;
  };

  const checkServiceFee = useCallback(
    (service: string, type: string) => {
      console.log(service, type);
      const delivery = infoFees.find(
        (item) =>
          item.delivery_service_code === service && item.transport_type === type
      );
      if (delivery) return delivery.total_fee;
      return 0;
    },
    [infoFees]
  );

  const serciveFees = useMemo(() => {
    return {
      ghtk_standard: checkServiceFee("ghtk", "road"),
      ghtk_express: checkServiceFee("ghtk", "fly"),
      ghn_standard: checkServiceFee("ghnn", "2"),
      vtp_standard: checkServiceFee("vtp", "standard"),
      vtp_express: checkServiceFee("vtp", "express"),
      dhl_standard: checkServiceFee("dhl", "standard"),
    };
  }, [checkServiceFee]);

  useEffect(() => {
    if (isCloneOrder) {
      switch (fulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls) {
        case checkServiceFee("ghtk", "road"):
          setSelectedShipmentMethod("ghtk_standard");
          break;
        case checkServiceFee("ghtk", "fly"):
          setSelectedShipmentMethod("ghtk_express");
          break;
        case checkServiceFee("ghn", "2"):
          setSelectedShipmentMethod("ghn_standard");
          break;
        case checkServiceFee("vtp", "standard"):
          setSelectedShipmentMethod("ghtk_express");
          break;
        case checkServiceFee("vtp", "express"):
          setSelectedShipmentMethod("vtp_express");
          break;
        case checkServiceFee("dhl", "standard"):
          setSelectedShipmentMethod("dhl_standard");
          break;
        default:
          break;
      }
    }
  }, [checkServiceFee, fulfillments, infoFees, isCloneOrder]);

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item label="Tiền thu hộ:">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  amount +
                  (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                  (discountValue ? discountValue : 0) -
                  (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
                  totalAmountPaid()
                }
                className="formInputAmount"
                maxLength={999999999999}
                minLength={0}
              />
            </Form.Item>
          </Col>
          <Col md={12}>
            <Form.Item
              label="Phí ship báo khách"
              name="shipping_fee_informed_to_customer"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                className="formInputAmount"
                maxLength={15}
                minLength={0}
                onChange={setShippingFeeInformedCustomer}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="ant-table ant-table-bordered custom-table">
          <div className="ant-table-container">
            <div className="ant-table-content">
              <table
                className="table-bordered"
                style={{ width: "100%", tableLayout: "auto" }}
              >
                <thead className="ant-table-thead">
                  <tr>
                    <th className="ant-table-cell">Hãng vận chuyển</th>
                    <th className="ant-table-cell">Dịch vụ chuyển phát</th>
                    <th
                      className="ant-table-cell"
                      style={{ textAlign: "right" }}
                    >
                      Cước phí
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {deliveryServices &&
                    deliveryServices.map((single, index) => {
                      return (
                        <React.Fragment key={index}>
                          <tr>
                            <td>
                              <img
                                className="logoHVC"
                                src={single.logo ? single.logo : ""}
                                alt=""
                              />
                            </td>
                            <td style={{ padding: 0 }}>
                              {single.code === "ghtk" && (
                                <div>
                                  <label className="radio-container">
                                    <input
                                      type="radio"
                                      name="tt"
                                      className="radio-delivery"
                                      value="standard"
                                      checked={
                                        selectedShipmentMethod ===
                                        "ghtk_standard"
                                      }
                                      onChange={(e) => {
                                        setSelectedShipmentMethod(
                                          "ghtk_standard"
                                        );
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "road",
                                          serciveFees.ghtk_standard
                                        );
                                      }}
                                    />
                                    <span className="checkmark"></span>
                                    Đường bộ
                                  </label>
                                  <Divider style={{ margin: "8px 0" }} />
                                  <label className="radio-container">
                                    <input
                                      type="radio"
                                      name="tt"
                                      className="radio-delivery"
                                      value="express"
                                      checked={
                                        selectedShipmentMethod ===
                                        "ghtk_express"
                                      }
                                      onChange={(e) => {
                                        setSelectedShipmentMethod(
                                          "ghtk_express"
                                        );
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "fly",
                                          serciveFees.ghtk_express
                                        );
                                      }}
                                    />
                                    <span className="checkmark"></span>
                                    Đường bay
                                  </label>
                                </div>
                              )}
                              {single.code === "ghn" && (
                                <label className="radio-container">
                                  <input
                                    type="radio"
                                    name="tt"
                                    className="radio-delivery"
                                    value="standard"
                                    checked={
                                      selectedShipmentMethod ===
                                      `${single.code}_standard`
                                    }
                                    onChange={(e) => {
                                      setSelectedShipmentMethod(
                                        `${single.code}_standard`
                                      );
                                      changeServiceType(
                                        single.id,
                                        single.code,
                                        "2",
                                        serciveFees.ghn_standard
                                      );
                                    }}
                                  />
                                  <span className="checkmark"></span>
                                  Chuyển phát nhanh PDE
                                </label>
                              )}
                              {single.code === "vtp" && (
                                <div style={{ margin: "8px 0" }}>
                                  <label className="radio-container">
                                    <input
                                      type="radio"
                                      name="tt"
                                      className="radio-delivery"
                                      value="standard"
                                      checked={
                                        selectedShipmentMethod ===
                                        "vtp_standard"
                                      }
                                      onChange={(e) => {
                                        setSelectedShipmentMethod(
                                          "vtp_standard"
                                        );
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          // "standard",
                                          "standard",
                                          serciveFees.vtp_standard
                                        );
                                      }}
                                    />
                                    <span className="checkmark"></span>2 giờ
                                  </label>
                                  <Divider style={{ margin: "8px 0" }} />
                                  <label className="radio-container">
                                    <input
                                      type="radio"
                                      name="tt"
                                      className="radio-delivery"
                                      value="express"
                                      onChange={(e) => {
                                        setSelectedShipmentMethod(
                                          "vtp_express"
                                        );
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "express",
                                          serciveFees.vtp_express
                                        );
                                      }}
                                    />
                                    <span className="checkmark"></span>6 giờ
                                  </label>
                                </div>
                              )}
                              {single.code === "dhl" && (
                                <label className="radio-container">
                                  <input
                                    type="radio"
                                    name="tt"
                                    className="radio-delivery"
                                    value={`standard`}
                                    onChange={(e) => {
                                      setSelectedShipmentMethod(
                                        `${single.code}_standard`
                                      );
                                      changeServiceType(
                                        single.id,
                                        single.code,
                                        "standard",
                                        serciveFees.dhl_standard
                                      );
                                    }}
                                  />
                                  <span className="checkmark"></span>
                                  Chuyển phát nhanh PDE
                                </label>
                              )}
                            </td>
                            <td style={{ padding: 0, textAlign: "right" }}>
                              {single.code === "ghtk" && (
                                <>
                                  {/* {serciveFees.ghtk_standard && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.ghtk_standard}
                                  </div>
                                  {/* } */}
                                  {/* {serciveFees.ghtk_express && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.ghtk_express}
                                  </div>
                                  {/* } */}
                                </>
                              )}
                              {single.code === "ghn" && (
                                <>
                                  {/* {serciveFees.ghn_standard && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.ghn_standard}
                                  </div>
                                  {/* } */}
                                </>
                              )}
                              {single.code === "vtp" && (
                                <>
                                  {/* {serciveFees.vtp_standard && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.vtp_standard}
                                  </div>
                                  {/* } */}
                                  {/* {serciveFees.vtp_express && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.vtp_express}
                                  </div>
                                  {/* } */}
                                  {/* <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoFees && infoFees.length > 1
                                      ? formatCurrency(0)
                                      : 0}
                                  </div> */}
                                </>
                              )}
                              {single.code === "dhl" && (
                                <>
                                  {/* {serciveFees.dhl_standard && */}
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {serciveFees.dhl_standard}
                                  </div>
                                  {/* } */}
                                </>
                              )}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodDeliverPartner;
