import { Col, Row, Form } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { OrderPaymentRequest } from "model/request/order.request";
import {
  // DeliveryServiceResponse,
  FulFillmentResponse,
  OrderResponse,
  FeesResponse,
} from "model/response/order/order.response";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

import LogoGHTK from "assets/img/LogoGHTK.svg";
import LogoGHN from "assets/img/LogoGHN.svg";
import LogoVTP from "assets/img/LogoVTP.svg";
import LogoDHL from "assets/img/LogoDHL.svg";
import NumberFormat from "react-number-format";
import { OrderCreateContext } from "contexts/order-create-context";
import moment from "moment";
import { ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";

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
  totalAmountReturnProducts?: number;
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
    levelOrder = 0,
    totalAmountReturnProducts,
  } = props;

  console.log("propsShipmentmethod", props);

  const createOrderContext = useContext(OrderCreateContext);
  console.log("createOrderContext", createOrderContext);

  const [selectedShipmentMethod, setSelectedShipmentMethod] =
    useState(serviceType);

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
        logo: LogoGHTK,
        name: "Giao hàng tiết kiệm",
      },
      ghn: {
        code: "ghn",
        id: 2,
        logo: LogoGHN,
        name: "Giao hàng nhanh",
      },
      vtp: {
        code: "vtp",
        id: 3,
        logo: LogoVTP,
        name: "Viettel Post",
      },
      dhl: {
        code: "dhl",
        id: 4,
        logo: LogoDHL,
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

  const totalAmountCustomerNeedToPaySelfDelivery = () => {
    return (
      (amount ? amount : 0) +
      (shippingFeeCustomer ? shippingFeeCustomer : 0) -
      (discountValue ? discountValue : 0) -
      (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
      totalAmountPaid() -
      (totalAmountReturnProducts ? totalAmountReturnProducts : 0)
    );
  };

  const customerShippingAddress = createOrderContext?.shipping.shippingAddress;

  /**
   * check cấu hình đơn hàng để tính phí ship báo khách
   */
  useEffect(() => {
    const fakeCity = "TP. Hà Nội";
    const fakePrice = 500000;
    if (
      !createOrderContext?.shipping.shippingServiceConfig ||
      !customerShippingAddress
    ) {
      return;
    }
    //check thời gian
    const checkIfIsInTimePeriod = (startDate: any, endDate: any) => {
      const now = moment();
      const checkIfTodayAfterStartDate = moment(startDate).isBefore(now);
      const checkIfTodayBeforeEndDate = moment(now).isBefore(endDate);
      console.log("checkIfTodayAfterStartDate", checkIfTodayAfterStartDate);
      console.log("checkIfTodayBeforeEndDate", checkIfTodayBeforeEndDate);
      return checkIfTodayAfterStartDate && checkIfTodayAfterStartDate;
    };

    // check tỉnh giao hàng
    const checkIfSameProvince = (
      customerShippingAddressProvince: string,
      configShippingAddressProvince: string
    ) => {
      return customerShippingAddressProvince === configShippingAddressProvince;
    };

    // check giá
    const checkIfPrice = (
      orderPrice: number,
      fromPrice: number,
      toPrice: number
    ) => {
      console.log("fromPrice", fromPrice);
      console.log("toPrice", toPrice);
      console.log("orderPrice", orderPrice);
      console.log(fromPrice <= orderPrice && orderPrice <= toPrice);
      return fromPrice <= orderPrice && orderPrice <= toPrice;
    };

    // filter thời gian
    const onTimeShippingServiceConfig =
      createOrderContext?.shipping.shippingServiceConfig.filter((single) => {
        return (
          checkIfIsInTimePeriod(single.start_date, single.end_date) &&
          single.status === ORDER_SETTINGS_STATUS.active
        );
      });

    console.log("onTimeShippingServiceConfig", onTimeShippingServiceConfig);

    // filter city
    let listCheckedShippingFeeConfig = [];

    if (onTimeShippingServiceConfig) {
      for (const singleOnTimeShippingServiceConfig of onTimeShippingServiceConfig) {
        const checkedShippingFeeConfig =
          singleOnTimeShippingServiceConfig.shipping_fee_configs.filter(
            (single) => {
              console.log("single", single);
              return (
                checkIfSameProvince(single.city_name, fakeCity) &&
                checkIfPrice(fakePrice, single.from_price, single.to_price)
              );
            }
          );
        console.log("checkedShippingFeeConfig", checkedShippingFeeConfig);
        listCheckedShippingFeeConfig.push(checkedShippingFeeConfig);
      }
    }
    console.log("listCheckedShippingFeeConfig", listCheckedShippingFeeConfig);

    //https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
    const flattenArray = (arr: any) => {
      return arr.reduce(function (flat: any, toFlatten: any) {
        return flat.concat(
          Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten
        );
      }, []);
    };

    const listCheckedShippingFeeConfigFlatten = flattenArray(
      listCheckedShippingFeeConfig
    );
    console.log(
      "listCheckedShippingFeeConfigFlatten",
      listCheckedShippingFeeConfigFlatten
    );

    // lấy số nhỏ nhất
    if (
      listCheckedShippingFeeConfigFlatten &&
      listCheckedShippingFeeConfigFlatten.length > 0
    ) {
      let result = listCheckedShippingFeeConfigFlatten[0].transport_fee;
      listCheckedShippingFeeConfigFlatten.forEach((single: any) => {
        if (single.transport_fee < result) {
          result = single.transport_fee;
        }
      });
      console.log("result", result);
    }
  }, [
    createOrderContext?.shipping.shippingAddress,
    createOrderContext?.shipping.shippingServiceConfig,
    customerShippingAddress,
  ]);

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        {addressError && (
          <div style={{ margin: "10px 0", color: "#ff4d4f" }}>
            {addressError}
          </div>
        )}
        {levelOrder > 3 && (
          <div style={{ margin: "10px 0", color: "#ff4d4f" }}>
            Huỷ đơn giao để thực hiện các thay đổi giao hàng
          </div>
        )}
        <Row gutter={20}>
          <Col md={12}>
            <Form.Item label="Tiền thu hộ:">
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                value={
                  totalAmountCustomerNeedToPaySelfDelivery() > 0
                    ? totalAmountCustomerNeedToPaySelfDelivery()
                    : 0
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
                                            disabled={
                                              service.total_fee === 0 ||
                                              levelOrder > 3
                                            }
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
