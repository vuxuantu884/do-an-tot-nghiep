import { Col, Row, Form, Divider } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  DeliveryServiceResponse,
  GHNFeeResponse,
  OrderResponse,
  ShippingGHTKResponse,
  VTPFeeResponse,
} from "model/response/order/order.response";
import React from "react";
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
  infoGHTK: ShippingGHTKResponse[];
  infoGHN: GHNFeeResponse | null;
  infoVTP: VTPFeeResponse[];
  changeServiceType: (id: number, code: string, item: any, fee: number) => void;
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
    infoGHTK,
    infoGHN,
    infoVTP,
    changeServiceType,
  } = props;
  console.log("props", props);
  const totalAmountPaid = () => {
    let total = 0;
    if (payments) {
      payments.forEach((p) => (total = total + p.amount));
    }
    return total;
  };
  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        <Row gutter={20}>
          <Col span={24}>
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
          <Col span={24}>
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
                            <td style={{ width: 100 }}>
                              <img
                                style={{ width: 100}}
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
                                      onChange={(e) =>
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "standard",
                                          infoGHTK.length > 1
                                            ? infoGHTK[0].fee
                                            : 0
                                        )
                                      }
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
                                      onChange={(e) =>
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "express",
                                          infoGHTK.length > 1
                                            ? infoGHTK[1].fee
                                            : 0
                                        )
                                      }
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
                                    value={`${single.code}_standard`}
                                    onChange={(e) =>
                                      changeServiceType(
                                        single.id,
                                        single.code,
                                        "standard",
                                        20000
                                      )
                                    }
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
                                      onChange={(e) =>
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "standard",
                                          infoGHTK.length > 1
                                            ? infoGHTK[0].fee
                                            : 0
                                        )
                                      }
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
                                      onChange={(e) =>
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "express",
                                          infoGHTK.length > 1
                                            ? infoGHTK[1].fee
                                            : 0
                                        )
                                      }
                                    />
                                    <span className="checkmark"></span>6 giờ
                                  </label>
                                  <Divider style={{ margin: "8px 0" }} />
                                  <label className="radio-container">
                                    <input
                                      type="radio"
                                      name="tt"
                                      className="radio-delivery"
                                      value="express"
                                      onChange={(e) =>
                                        changeServiceType(
                                          single.id,
                                          single.code,
                                          "express",
                                          infoGHTK.length > 1
                                            ? infoGHTK[1].fee
                                            : 0
                                        )
                                      }
                                    />
                                    <span className="checkmark"></span>
                                    12 giờ
                                  </label>
                                </div>
                              )}
                              {single.code === "dhl" && (
                                <label className="radio-container">
                                  <input
                                    type="radio"
                                    name="tt"
                                    className="radio-delivery"
                                    value={`${single.code}_standard`}
                                    onChange={(e) =>
                                      changeServiceType(
                                        single.id,
                                        single.code,
                                        "standard",
                                        20000
                                      )
                                    }
                                  />
                                  <span className="checkmark"></span>
                                  Chuyển phát nhanh PDE
                                </label>
                              )}
                            </td>
                            <td style={{ padding: 0, textAlign: "right" }}>
                              {single.code === "ghtk" && (
                                <div>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoGHTK && infoGHTK.length > 0
                                      ? formatCurrency(infoGHTK[0].fee)
                                      : 0}
                                  </div>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoGHTK && infoGHTK.length > 1
                                      ? formatCurrency(infoGHTK[1].fee)
                                      : 0}
                                  </div>
                                </div>
                              )}
                              {single.code === "ghn" && (
                                <div>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoGHN
                                      ? formatCurrency(infoGHN.total)
                                      : 0}
                                  </div>
                                </div>
                              )}
                              {single.code === "vtp" && (
                                <>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoVTP && infoVTP.length > 0
                                      ? formatCurrency(infoVTP[0].GIA_CUOC)
                                      : 0}
                                  </div>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoVTP && infoVTP.length > 1
                                      ? formatCurrency(infoVTP[2].GIA_CUOC)
                                      : 0}
                                  </div>
                                  <div
                                    style={{ padding: "8px 16px" }}
                                    className="custom-table__has-border-bottom custom-table__has-select-radio"
                                  >
                                    {infoVTP && infoVTP.length > 1
                                      ? formatCurrency(infoVTP[1].GIA_CUOC)
                                      : 0}
                                  </div>
                                </>
                              )}
                              {single.code === "dhl" && (
                                <div
                                  style={{ padding: "8px 16px" }}
                                  className="custom-table__has-border-bottom custom-table__has-select-radio"
                                >
                                  100.000
                                </div>
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
