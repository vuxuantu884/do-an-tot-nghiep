import {Col, Form, FormInstance, Row} from "antd";
import NumberInput from "component/custom/number-input.custom";
import {thirdPLModel} from "model/order/shipment.model";
import {CustomerResponse} from "model/response/customer/customer.response";
import {DeliveryServiceResponse, FeesResponse} from "model/response/order/order.response";
import {ShippingServiceConfigDetailResponseModel} from "model/response/settings/order-settings.response";
import moment from "moment";
import React, {useCallback, useMemo} from "react";
import NumberFormat from "react-number-format";
import {formatCurrency, replaceFormatString} from "utils/AppUtils";
import {ORDER_SETTINGS_STATUS} from "utils/OrderSettings.constants";
import {StyledComponent} from "./styles";

type PropType = {
  totalAmountCustomerNeedToPay: number | undefined;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  addressError: string;
  levelOrder?: number;
  orderPrice?: number;
  customer: CustomerResponse | null;
  form: FormInstance<any>;
  thirdPL: thirdPLModel | undefined;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  renderButtonCreateActionHtml: () => JSX.Element | null;
};

function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    totalAmountCustomerNeedToPay,
    shippingServiceConfig,
    deliveryServices,
    infoFees,
    addressError,
    levelOrder = 0,
    orderPrice,
    customer,
    form,
    thirdPL,
    setThirdPL,
    setShippingFeeInformedToCustomer,
    renderButtonCreateActionHtml,
  } = props;

  const sercivesFee = useMemo(() => {
    let services: any = []
    deliveryServices?.forEach(deliveryService => {
      const service = infoFees.filter((item) => item.delivery_service_code === deliveryService.code)
      if (service.length) {
        services.push({
          ...deliveryService,
          fees: service
        })
      }
    })
    return services;
  }, [deliveryServices, infoFees]);

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
          return single.code.toLowerCase() === singleService.toLowerCase();
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
          single.transport_types &&
          checkIfListServicesContainSingle(
            single.transport_types,
            transportType
          )
        );
      });

      // filter city
      let listCheckedShippingFeeConfig = [];

      if (filteredShippingServiceConfig) {
        for (const singleOnTimeShippingServiceConfig of filteredShippingServiceConfig) {
          const checkedShippingFeeConfig =
            singleOnTimeShippingServiceConfig.shipping_fee_configs.filter((single) => {
              return (
                checkIfSameCity(single.city_id, customerShippingAddressCityId) &&
                checkIfPrice(orderPrice, single.from_price, single.to_price)
              );
            });
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
        form?.setFieldsValue({shipping_fee_informed_to_customer: result});
        setShippingFeeInformedToCustomer(result);
      } else {
        form?.setFieldsValue({shipping_fee_informed_to_customer: 0});
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
      <div className="shipmentMethod__deliverPartner" style={{marginTop: 20}}>
        {addressError && (
          <div style={{margin: "0 0 10px 0", color: "#ff4d4f"}}>{addressError}</div>
        )}
        {levelOrder > 3 && (
          <div style={{margin: "10px 0", color: "#ff4d4f"}}>
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
          style={{marginTop: 20}}
        >
          <div className="ant-table-container">
            <div className="ant-table-content">
              <table
                className="table-bordered"
                style={{width: "100%", tableLayout: "auto"}}
              >
                <thead className="ant-table-thead">
                  <tr>
                    <th className="ant-table-cell">Hãng vận chuyển</th>
                    <th className="ant-table-cell">Dịch vụ chuyển phát</th>
                    <th className="ant-table-cell" style={{textAlign: "right"}}>
                      Cước phí
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                {sercivesFee.map(
                    (serciveFee: any) => {
                      return (
                        <React.Fragment key={serciveFee.code}>
                          <tr>
                            <td>
                              <img
                                className="logoHVC"
                                src={serciveFee.logo}
                                alt=""
                              />
                            </td>
                            <td style={{ padding: 0 }}>
                              {serciveFee.fees.map(
                                (fee: any) => {
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
                                          value={fee.transport_type}
                                          checked={
                                            thirdPL?.service ===
                                            fee.transport_type
                                          }
                                          onChange={(e) => {
                                            shippingFeeApplyOrderSetting(
                                              fee.transport_type
                                            );
                                            setThirdPL({
                                              delivery_service_provider_id: serciveFee.id,
                                              delivery_service_provider_code: serciveFee.code,
                                              insurance_fee: fee.insurance_fee,
                                              service: fee.transport_type,
                                              shipping_fee_paid_to_three_pls: fee.total_fee,
                                              delivery_service_provider_name: serciveFee.name,
                                              delivery_transport_type: fee.transport_type_name,
                                            });
                                          }}
                                          disabled={
                                            fee.total_fee === 0 || levelOrder > 3
                                          }
                                        />
                                        <span className="checkmark"></span>
                                        {fee.transport_type_name}
                                      </label>
                                    </div>
                                  );
                                }
                              )}
                            </td>
                            <td style={{ padding: 0, textAlign: "right" }}>
                              {serciveFee.fees?.map(
                                (fee: any) => {
                                  return (
                                    <>
                                      <div
                                        style={{ padding: "8px 16px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio"
                                      >
                                        {/* {service.total_fee} */}
                                        <NumberFormat
                                          value={fee.total_fee}
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
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {renderButtonCreateActionHtml && renderButtonCreateActionHtml()}
      </div>
    </StyledComponent>
  );
}

export default ShipmentMethodDeliverPartner;
