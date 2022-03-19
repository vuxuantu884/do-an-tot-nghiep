import { Col, Form, FormInstance, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { thirdPLModel } from "model/order/shipment.model";
import { CustomerResponse } from "model/response/customer/customer.response";
import {DeliveryServiceResponse, FeesResponse} from "model/response/order/order.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import {handleCalculateShippingFeeApplyOrderSetting, replaceFormatString, formatCurrency} from "utils/AppUtils";
import { StyledComponent } from "./styles";
import {changeOrderThirdPLAction, DeliveryServicesGetList} from "domain/actions/order/order.action";
import {useDispatch} from "react-redux";

type PropType = {
  totalAmountCustomerNeedToPay: number | undefined;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  infoFees: FeesResponse[];
  addressError: string;
  levelOrder?: number;
  orderPrice?: number;
  customer: CustomerResponse | null;
  form: FormInstance<any>;
  thirdPL: thirdPLModel | undefined;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
	shippingFeeInformedToCustomer: number | null;
  renderButtonCreateActionHtml: () => JSX.Element | null;
};

function ShipmentMethodDeliverPartner(props: PropType) {
  const {
    totalAmountCustomerNeedToPay,
    shippingServiceConfig,
    infoFees,
    addressError,
    levelOrder = 0,
    orderPrice,
    customer,
    form,
    thirdPL,
    setThirdPL,
    setShippingFeeInformedToCustomer,
		shippingFeeInformedToCustomer,
    renderButtonCreateActionHtml,
  } = props;

  const dispatch = useDispatch();

  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

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
          <Col span={12}
           style={{padding: "0 5px 0 10px"}}
          >
            <Form.Item className="form-input-deliver">
              <NumberInput
                style={{textAlign: "left"}}
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="COD"
                value={
                  totalAmountCustomerNeedToPay && totalAmountCustomerNeedToPay >= 0
                    ? totalAmountCustomerNeedToPay
                    : undefined
                }
                className="formInputAmount"
                maxLength={999999999999}
                minLength={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}
           style={{padding: "0 10px 0 5px"}}
          >
            <Form.Item className="form-input-deliver">
              <NumberInput
                style={{textAlign: "left"}}
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                placeholder="Phí ship báo khách"
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
								value={shippingFeeInformedToCustomer ?? ''}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="ant-table ant-table-bordered custom-table">
          <div className="ant-table-container">
            <div className="ant-table-content">
              <table
                className="table-bordered"
                style={{width: "100%", tableLayout: "auto"}}
              >
                <thead className="ant-table-thead">
                  <tr>
                    <th style={{ padding: "5px", textAlign: "center"}}>Hãng vận chuyển</th>
                    <th style={{ padding: 0}}>
                      <div className="delivery-method-item" style={{height: "56px"}}>
                        <div className="method method-th" style={{textAlign: "center"}}>Dịch vụ chuyển phát</div>
                        <div className="cost method-th" style={{borderBottom: "unset", textAlign: "center"}}>Cước phí</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {serviceFees.map(
                    (serviceFee: any) => {
                      return (
                        <React.Fragment key={serviceFee.code}>
                          <tr>
                            <td style={{ width: "100px", padding: "5px", textAlign: "center" }}>
                              <strong>{serviceFee.name}</strong>
                            </td>
                            <td style={{ padding: 0 }}>
                              {serviceFee.fees.map(
                                (fee: any) => {
                                  return (
                                    <div className="delivery-method-item">
                                      <div
                                        style={{ padding: "5px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio method"
                                      >
                                        <label className="radio-container" style={{ marginLeft: "0 !important"}}>
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
                                              fee.total_fee === 0 || levelOrder > 3
                                              // levelOrder > 3
                                            }
                                            style={{ marginLeft: "0 !important" }}
                                          />
                                          <span
                                            className="checkmark"
                                            style={fee.total_fee === 0 ? { backgroundColor: "#f0f0f0", border: 'none' } : {}}>
                                          </span>
                                          <span>{fee.transport_type_name}</span>
                                        </label>
                                      </div>

                                      <div
                                        style={{ padding: "5px", width: "75px" }}
                                        className="custom-table__has-border-bottom custom-table__has-select-radio cost"
                                      >
                                        {/* {service.total_fee} */}
                                        <NumberFormat
                                          value={fee.total_fee}
                                          className="foo"
                                          displayType={"text"}
                                          thousandSeparator={true}
                                        />
                                      </div>
                                    </div>
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
