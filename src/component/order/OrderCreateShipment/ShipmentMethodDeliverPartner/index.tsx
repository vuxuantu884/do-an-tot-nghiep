import { Col, Form, FormInstance, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { changeOrderThirdPLAction } from "domain/actions/order/order.action";
import { thirdPLModel } from "model/order/shipment.model";
import { CustomerResponse } from "model/response/customer/customer.response";
import { DeliveryServiceResponse, FeesResponse } from "model/response/order/order.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useMemo } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { formatCurrency, handleCalculateShippingFeeApplyOrderSetting, replaceFormatString } from "utils/AppUtils";
import { StyledComponent } from "./styles";

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

  const dispatch = useDispatch();

  const serviceFees = useMemo(() => {
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

  const shippingAddress = useMemo(() => {
    const address = customer?.shipping_addresses.find((item) => {
      return item.default;
    })
    if(address) {
      return address
    } else {
      return null
    }
  }, [customer?.shipping_addresses])

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
								disabled
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
                {serviceFees.map(
                    (serviceFee: any) => {
                      return (
                        <React.Fragment key={serviceFee.code}>
                          <tr>
                            <td>
                              <img
                                className="logoHVC"
                                src={serviceFee.logo}
                                alt=""
                              />
                            </td>
                            <td style={{ padding: 0 }}>
                              {serviceFee.fees.map(
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
                                            handleCalculateShippingFeeApplyOrderSetting(shippingAddress?.city_id, orderPrice, shippingServiceConfig,
                                              fee.transport_type, form, setShippingFeeInformedToCustomer
                                            );
                                            const thirdPLResult = {
                                              delivery_service_provider_id: serviceFee.id,
                                              delivery_service_provider_code: serviceFee.code,
                                              insurance_fee: fee.insurance_fee,
                                              service: fee.transport_type,
                                              shipping_fee_paid_to_three_pls: fee.total_fee,
                                              delivery_service_provider_name: serviceFee.name,
                                              delivery_transport_type: fee.transport_type_name,
                                            }
                                            setThirdPL(thirdPLResult);
                                            dispatch(changeOrderThirdPLAction(thirdPLResult))
                                          }}
                                          disabled={
                                            // fee.total_fee === 0 || levelOrder > 3
                                            levelOrder > 3
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
                              {serviceFee.fees?.map(
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
