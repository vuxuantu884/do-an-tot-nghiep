import { Col, Row, Form } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  // DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  FeesResponse,
} from "model/response/order/order.response";
import React, { useMemo, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

import ImageGHTK from "assets/img/imageGHTK.svg";
import ImageGHN from "assets/img/imageGHN.png";
import ImageVTP from "assets/img/imageVTP.svg";
import ImageDHL from "assets/img/imageDHL.svg";
import NumberFormat from "react-number-format";

type PropType = {
  amount: number | undefined;
  shippingFeeCustomer: number | null;
  discountValue: number | null | undefined;
  OrderDetail?: OrderResponse | null;
  payments?: OrderPaymentRequest[] | null;
  setShippingFeeInformedCustomer: (value: number | null) => void;
  // deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  serviceType?: string | null;
  changeServiceType: (id: number, code: string, item: any, fee: number) => void;
  fulfillments: FulFillmentResponse[] | null | undefined;
  isCloneOrder?: boolean;
  addressError: string;
  levelOrder?: number;
};
function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    amount,
    shippingFeeCustomer,
    discountValue,
    OrderDetail,
    payments,
    setShippingFeeInformedCustomer,
    // deliveryServices,
    infoFees,
    serviceType,
    changeServiceType,
    // fulfillments,
    // isCloneOrder,
    addressError,
    levelOrder = 0
  } = props;

  console.log("propsShipmentmethod", props.serviceType);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState(serviceType);

  const totalAmountPaid = () => {
    let total = 0;
    if (payments) {
      payments.forEach((p) => (total = total + p.amount));
    }
    return total;
  };

  const deliveryService = useMemo(() => {
    return {
      ghtk: {
        code: "ghtk",
        id: 1,
        logo: ImageGHTK,
        name: "Giao hàng tiết kiệm",
      },
      ghn: {
        code: "ghn",
        id: 2,
        logo: ImageGHN,
        name: "Giao hàng nhanh",
      },
      vtp: {
        code: "vtp",
        id: 3,
        logo: ImageVTP,
        name: "Viettel Post",
      },
      dhl: {
        code: "dhl",
        id: 4,
        logo: ImageDHL,
        name: "DHL",
      },
    };
  }, []);
  const sercivesFee = useMemo(() => {
    return {
      ghtk: infoFees.filter((item) => item.delivery_service_code === "ghtk"),
      ghn: infoFees.filter((item) => item.delivery_service_code === "ghn"),
      vtp: infoFees.filter((item) => item.delivery_service_code === "vtp"),
      dhl: infoFees.filter((item) => item.delivery_service_code === "dhl"),
    };
  }, [infoFees]);

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        {addressError && (
          <div style={{ margin: "10px 0", color: "#ff4d4f" }}>
            {addressError}
          </div>
        )}
        {levelOrder > 3 && (
          <div style={{margin: '10px 0', color: '#ff4d4f' }}>Huỷ đơn giao để thực hiện các thay đổi giao hàng</div>
        )}
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item label="Tiền thu hộ:">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  (amount? amount : 0) +
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
                  {["ghtk", "ghn", "vtp", "dhl"].map(
                    (deliveryServiceName: string, index) => {
                      return (
                        ((sercivesFee as any)[deliveryServiceName].length && (
                          <React.Fragment key={deliveryServiceName}>
                            <tr>
                              <td>
                                <img
                                  className="logoHVC"
                                  src={
                                    (deliveryService as any)[
                                      deliveryServiceName
                                    ].logo
                                  }
                                  alt=""
                                />
                              </td>
                              <td style={{ padding: 0 }}>
                                {(sercivesFee as any)[deliveryServiceName].map(
                                  (service: any) => {
                                    return (
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        <label className="radio-container">
                                          <input
                                            type="radio"
                                            name="tt"
                                            className="radio-delivery"
                                            value={service.transport_type}
                                            checked={
                                              selectedShipmentMethod ===
                                              service.transport_type
                                            }
                                            onChange={(e) => {
                                              setSelectedShipmentMethod(
                                                service.transport_type
                                              );
                                              changeServiceType(
                                                (deliveryService as any)[
                                                  deliveryServiceName
                                                ].id,
                                                deliveryServiceName,
                                                service.transport_type,
                                                service.total_fee
                                              );
                                            }}
                                            disabled={service.total_fee === 0}
                                          />
                                          <span className="checkmark"></span>
                                          {service.transport_type_name}
                                        </label>
                                      </div>
                                    );
                                  }
                                )}
                              </td>
                              <td style={{ padding: 0, textAlign: "right" }}>
                                {(sercivesFee as any)[deliveryServiceName].map(
                                  (service: any) => {
                                    return (
                                      <>
                                        <div
                                          style={{ padding: "8px 16px" }}
                                          className="custom-table__has-border-bottom custom-table__has-select-radio"
                                        >
                                          {/* {service.total_fee} */}
                                          <NumberFormat
                                            value={service.total_fee}
                                            className="foo"
                                            displayType={"text"}
                                            thousandSeparator={true}
                                          />
                                        </div>
                                      </>
                                    );
                                  }
                                )}
                              </td>
                            </tr>
                          </React.Fragment>
                        )) ||
                        null
                      );
                    }
                  )}
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
