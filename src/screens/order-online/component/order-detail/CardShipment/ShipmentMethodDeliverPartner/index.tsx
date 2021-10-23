import { Col, Form, FormInstance, Row } from "antd";
import LogoDHL from "assets/img/LogoDHL.svg";
import LogoGHN from "assets/img/LogoGHN.svg";
import LogoGHTK from "assets/img/LogoGHTK.svg";
import LogoVTP from "assets/img/LogoVTP.svg";
import NumberInput from "component/custom/number-input.custom";
import { CustomerResponse } from "model/response/customer/customer.response";
import { FeesResponse } from "model/response/order/order.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { useCallback, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
import { StyledComponent } from "./styles";

type PropType = {
  totalAmountCustomerNeedToPay: number | undefined;
  serviceType3PL?: string | null;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  infoFees: FeesResponse[];
  addressError: string;
  levelOrder?: number;
  orderPrice?: number;
  customer: CustomerResponse | null;
  form: FormInstance<any>;
  changeServiceType: (
    id: number,
    code: string,
    item: any,
    fee: number,
    name: string
  ) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
};

function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    totalAmountCustomerNeedToPay,
    shippingServiceConfig,
    setShippingFeeInformedToCustomer,
    infoFees,
    serviceType3PL,
    changeServiceType,
    addressError,
    levelOrder = 0,
    orderPrice,
    customer,
    form,
  } = props;

  console.log("propsShipmentmethod", props);

  const [selectedShipmentMethod, setSelectedShipmentMethod] = useState(serviceType3PL);

  // const totalAmountPaid = () => {
  //   let total = 0;
  //   if (payments) {
  //     payments.forEach((p) => (total = total + p.amount));
  //   }
  //   return total;
  // };

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

  // const totalAmountCustomerNeedToPaySelfDelivery = () => {
  //   return (
  //     (amount ? amount : 0) +
  //     (shippingFeeCustomer ? shippingFeeCustomer : 0) -
  //     (discountValue ? discountValue : 0) -
  //     (totalPaid ? totalPaid : 0) -
  //     // totalAmountPaid() -
  //     (totalAmountReturnProducts ? totalAmountReturnProducts : 0)
  //   );
  // };

  /**
   * check cấu hình đơn hàng để tính phí ship báo khách
   */

  const shippingFeeApplyOrderSetting = useCallback(
    (transportType: string) => {
      const customerShippingAddress = customer?.shipping_addresses.find(
        (single) => single.default
      );
      if (!customerShippingAddress || orderPrice === undefined) {
        return;
      }
      const customerShippingAddressCityId = customerShippingAddress.city_id;

      if (!shippingServiceConfig || !customerShippingAddress) {
        return;
      }
      //check thời gian
      const checkIfIsInTimePeriod = (startDate: any, endDate: any) => {
        const now = moment();
        const checkIfTodayAfterStartDate = moment(startDate).isBefore(now);
        const checkIfTodayBeforeEndDate = moment(now).isBefore(endDate);
        return checkIfTodayAfterStartDate && checkIfTodayBeforeEndDate;
      };

      // check dịch vụ
      const checkIfListServicesContainSingle = (
        listServices: any[],
        singleService: string
      ) => {
        let result = false;
        let checkCondition = listServices.some((single) => {
          return single.code === singleService;
        });
        if (checkCondition) {
          result = true;
        }
        return result;
      };

      // check tỉnh giao hàng ( config -1 là tất cả tỉnh thành)
      const checkIfSameCity = (
        configShippingAddressCityId: number,
        customerShippingAddressCityId: number
      ) => {
        if (configShippingAddressCityId === -1) {
          return true;
        }
        return customerShippingAddressCityId === configShippingAddressCityId;
      };

      // check giá
      const checkIfPrice = (orderPrice: number, fromPrice: number, toPrice: number) => {
        return fromPrice <= orderPrice && orderPrice <= toPrice;
      };

      // filter thời gian, active
      const filteredShippingServiceConfig = shippingServiceConfig.filter((single) => {
        return (
          checkIfIsInTimePeriod(single.start_date, single.end_date) &&
          single.status === ORDER_SETTINGS_STATUS.active &&
          single.external_service_transport_types &&
          checkIfListServicesContainSingle(
            single.external_service_transport_types,
            transportType
          )
        );
      });

      console.log("filteredShippingServiceConfig", filteredShippingServiceConfig);

      // filter city
      let listCheckedShippingFeeConfig = [];

      if (filteredShippingServiceConfig) {
        for (const singleOnTimeShippingServiceConfig of filteredShippingServiceConfig) {
          const checkedShippingFeeConfig =
            singleOnTimeShippingServiceConfig.shipping_fee_configs.filter((single) => {
              console.log("single", single);
              console.log("customerShippingAddressCityId", customerShippingAddressCityId);
              console.log(
                "checkIfPrice(orderPrice, single.from_price, single.to_price)",
                checkIfPrice(orderPrice, single.from_price, single.to_price)
              );
              return (
                checkIfSameCity(single.city_id, customerShippingAddressCityId) &&
                checkIfPrice(orderPrice, single.from_price, single.to_price)
              );
            });
          console.log("checkedShippingFeeConfig", checkedShippingFeeConfig);
          listCheckedShippingFeeConfig.push(checkedShippingFeeConfig);
        }
      }

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
        form?.setFieldsValue({ shipping_fee_informed_to_customer: result });
        setShippingFeeInformedToCustomer(result);
      } else {
        form?.setFieldsValue({ shipping_fee_informed_to_customer: 0 });
        setShippingFeeInformedToCustomer(0);
      }
    },
    [
      customer?.shipping_addresses,
      form,
      orderPrice,
      setShippingFeeInformedToCustomer,
      shippingServiceConfig,
    ]
  );

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner" style={{ marginTop: 20 }}>
        {addressError && (
          <div style={{ margin: "0 0 10px 0", color: "#ff4d4f" }}>{addressError}</div>
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
                  totalAmountCustomerNeedToPay && totalAmountCustomerNeedToPay > 0
                    ? totalAmountCustomerNeedToPay
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
              label="Phí ship báo khách:"
              name="shipping_fee_informed_to_customer"
            >
              <NumberInput
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="0"
                className="formInputAmount"
                maxLength={15}
                minLength={0}
                onChange={(value) => {
                  if (value) {
                    setShippingFeeInformedToCustomer(value);
                  } else {
                    setShippingFeeInformedToCustomer(0);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <div
          className="ant-table ant-table-bordered custom-table"
          style={{ marginTop: 20 }}
        >
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
                    <th className="ant-table-cell" style={{ textAlign: "right" }}>
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
                                  src={(deliveryService as any)[deliveryServiceName].logo}
                                  alt=""
                                />
                              </td>
                              <td style={{ padding: 0 }}>
                                {(sercivesFee as any)[deliveryServiceName].map(
                                  (service: any, index: number) => {
                                    return (
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                        key={index}
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
                                              console.log("change shipping");
                                              console.log("sercivesFee", sercivesFee);
                                              console.log(
                                                "service.transport_type",
                                                service.transport_type
                                              );
                                              console.log(
                                                "deliveryServiceName",
                                                deliveryServiceName
                                              );
                                              shippingFeeApplyOrderSetting(
                                                service.transport_type
                                              );
                                              setSelectedShipmentMethod(
                                                service.transport_type
                                              );
                                              changeServiceType(
                                                (deliveryService as any)[
                                                  deliveryServiceName
                                                ].id,
                                                deliveryServiceName,
                                                service.transport_type,
                                                service.total_fee,
                                                (deliveryService as any)[
                                                  deliveryServiceName
                                                ].name
                                              );
                                            }}
                                            disabled={
                                              service.total_fee === 0 || levelOrder > 3
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
                                  (service: any, index: number) => {
                                    return (
                                      <React.Fragment key={index}>
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
                                      </React.Fragment>
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
