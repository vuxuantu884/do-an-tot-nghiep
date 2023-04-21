import { Col, Form, FormInstance, Row } from "antd";
import NumberInput from "component/custom/number-input.custom";
import { changeOrderThirdPLAction } from "domain/actions/order/order.action";
import {
  ChangeShippingFeeApplyOrderSettingParamModel,
  OrderPageTypeModel,
} from "model/order/order.model";
import { thirdPLModel } from "model/order/shipment.model";
import { CustomerResponse } from "model/response/customer/customer.response";
import { DeliveryServiceResponse, FeesResponse } from "model/response/order/order.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useMemo } from "react";
import NumberFormat from "react-number-format";
import { useDispatch } from "react-redux";
import { formatCurrency, getShippingAddressDefault, replaceFormatString } from "utils/AppUtils";
// import { checkIfOrderPageType } from "utils/OrderUtils";
import { StyledComponent } from "./styles";
import { dangerColor } from "utils/global-styles/variables";

type PropTypes = {
  totalAmountCustomerNeedToPay: number | undefined;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  deliveryServices: DeliveryServiceResponse[] | null;
  infoFees: FeesResponse[];
  addressError: string;
  levelOrder?: number;
  orderProductsAmount?: number;
  customer: CustomerResponse | null;
  form: FormInstance<any>;
  thirdPL: thirdPLModel | undefined;
  setThirdPL: (thirdPl: thirdPLModel) => void;
  setShippingFeeInformedToCustomer: (value: number) => void;
  renderButtonCreateActionHtml: () => JSX.Element | null;
  orderPageType: OrderPageTypeModel;
  handleChangeShippingFeeApplyOrderSettings: (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => void;
};

interface DeliveryServiceWithFeeModel extends DeliveryServiceResponse {
  fees: FeesResponse[];
  suggest: boolean;
}

function ShipmentMethodDeliverPartner(props: PropTypes) {
  const {
    totalAmountCustomerNeedToPay,
    // shippingServiceConfig,
    deliveryServices,
    infoFees,
    addressError,
    levelOrder = 0,
    // orderProductsAmount,
    customer,
    // form,
    thirdPL,
    setThirdPL,
    // setShippingFeeInformedToCustomer,
    renderButtonCreateActionHtml,
    // orderPageType,
    handleChangeShippingFeeApplyOrderSettings,
  } = props;

  // const isOrderUpdatePage = checkIfOrderPageType.isOrderUpdatePage(orderPageType);

  const dispatch = useDispatch();

  const shippingAddress = getShippingAddressDefault(customer);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChangeThirdPLService = (
    serviceFee: DeliveryServiceWithFeeModel,
    fee: FeesResponse,
  ) => {
    handleChangeShippingFeeApplyOrderSettings({
      customerShippingAddressCityId: shippingAddress?.city_id,
      transportService: fee.transport_type,
    });
    const thirdPLResult = {
      delivery_service_provider_id: serviceFee.id,
      delivery_service_provider_code: serviceFee.code,
      insurance_fee: fee.insurance_fee,
      service: fee.transport_type,
      shipping_fee_paid_to_three_pls: fee.total_fee,
      delivery_service_provider_name: serviceFee.name,
      delivery_transport_type: fee.transport_type_name,
    };
    setThirdPL(thirdPLResult);
    dispatch(changeOrderThirdPLAction(thirdPLResult));
  };

  const serviceFees = useMemo(() => {
    let services: DeliveryServiceWithFeeModel[] = [];

    deliveryServices?.forEach((deliveryService) => {
      const service = infoFees.filter(
        (item) => item.delivery_service_code === deliveryService.code,
      );
      const isSuggest = service.filter((item) => item.is_suggested);
      if (service.length) {
        services.push({
          ...deliveryService,
          fees: service,
          suggest: isSuggest.length ? true : false,
        });
      }
      if (isSuggest.length) {
        handleChangeThirdPLService(
          {
            ...deliveryService,
            fees: service,
            suggest: isSuggest.length ? true : false,
          },
          isSuggest[0],
        );
      }
    });
    const newServices = services.sort((a: any, b: any) => b.suggest - a.suggest);

    return newServices;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryServices, infoFees]);

  const renderTableBody = () => {
    return serviceFees.map((serviceFee) => {
      return (
        <React.Fragment key={serviceFee.code}>
          <tr>
            <td>
              <img className="logoHVC" src={serviceFee.logo} alt="" />
            </td>
            <td className="serviceFeeInformation">
              {serviceFee.fees.map((fee) => {
                return (
                  <div className="custom-table__has-border-bottom custom-table__has-select-radio tableCell">
                    <label
                      className={`radio-container ${fee.total_fee === 0 ? "disabledRadio" : ""}`}
                    >
                      <input
                        type="radio"
                        name="tt"
                        className="radio-delivery"
                        value={fee.transport_type}
                        checked={thirdPL?.service === fee.transport_type}
                        onChange={(e) => {
                          handleChangeThirdPLService(serviceFee, fee);
                        }}
                        disabled={
                          fee.total_fee === 0 || levelOrder > 3
                          // levelOrder > 3
                        }
                      />
                      <span className="checkmark"></span>
                      <span>{fee.transport_type_name}</span>
                      <span style={{ color: dangerColor, fontWeight: 500 }}>
                        {fee.is_suggested ? " - HVC gợi ý" : ""}
                      </span>
                    </label>
                  </div>
                );
              })}
            </td>
            <td className="cell__fee">
              {serviceFee.fees?.map((fee) => {
                return (
                  <div className="custom-table__has-border-bottom custom-table__has-select-radio tableCell">
                    <NumberFormat value={formatCurrency(fee.total_fee)} displayType={"text"} />
                  </div>
                );
              })}
            </td>
          </tr>
        </React.Fragment>
      );
    });
  };

  return (
    <StyledComponent>
      <div className="shipmentMethod__deliverPartner">
        {addressError && <div className="addressError">{addressError}</div>}
        {levelOrder > 3 && (
          <div className="shipmentMethod__note">
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
                max={999999999999}
                min={0}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="ant-table ant-table-bordered custom-table">
          <div className="ant-table-container">
            <div className="ant-table-content">
              <table className="table-bordered deliverPartner__table">
                <thead className="ant-table-thead">
                  <tr>
                    <th className="ant-table-cell">Hãng vận chuyển</th>
                    <th className="ant-table-cell">Dịch vụ chuyển phát</th>
                    <th className="ant-table-cell cell__fee">Cước phí</th>
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">{renderTableBody()}</tbody>
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
