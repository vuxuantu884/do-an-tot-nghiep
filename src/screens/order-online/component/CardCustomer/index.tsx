import { Card } from "antd";
import SearchCustomerAutoComplete from "component/SearchCustomer";
import { DistrictGetByCountryAction } from "domain/actions/content/content.action";
import { CustomerGroups } from "domain/actions/customer/customer.action";
import { changeOrderCustomerAction } from "domain/actions/order/order.action";
import { modalActionType } from "model/modal/modal.model";
import { ChangeShippingFeeApplyOrderSettingParamModel } from "model/order/order.model";
import { CustomerShippingAddress } from "model/request/customer.request";
import { BillingAddressRequestModel, OrderRequest } from "model/request/order.request";
import { CustomerResponse, ShippingAddress } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse } from "model/response/order/order.response";
import { SourceResponse } from "model/response/order/source.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { MODAL_ACTION_TYPE } from "utils/Constants";
import CreateCustomer from "./CreateCustomer";
import ExtraCardCustomer from "./ExtraCardCustomer";
import { StyleComponent } from "./ExtraCardCustomer/style";
import InfoCustomer from "./InfoCustomer";
import UpdateCustomer from "./UpdateCustomer";

type CardCustomerProps = {
  handleCustomer: (items: CustomerResponse | null) => void;
  ShippingAddressChange: (items: ShippingAddress | null) => void;
  billingAddress: BillingAddressRequestModel | null;
  setBillingAddress: (items: BillingAddressRequestModel | null) => void;
  setVisibleCustomer?: (item: boolean) => void;
  customer: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  loyaltyUsageRules: Array<LoyaltyUsageResponse>;
  levelOrder?: number;
  updateOrder?: boolean;
  isDisableSelectSource?: boolean;
  isVisibleCustomer: boolean;
  shippingAddress: ShippingAddress | any;
  setModalAction?: (item: modalActionType) => void;
  modalAction: modalActionType;
  setOrderSource?: (value: SourceResponse | null) => void;
  OrderDetail?: OrderResponse | null;
  shippingAddressesSecondPhone?: string;
  setShippingAddressesSecondPhone?: (value: string) => void;
  initialForm?: OrderRequest;
  customerChange: boolean;
  setCustomerChange: (value: boolean) => void;
  handleChangeShippingFeeApplyOrderSettings: (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => void;
};

const CardCustomer: React.FC<CardCustomerProps> = (props: CardCustomerProps) => {
  const {
    customer,
    handleCustomer,
    loyaltyPoint,
    loyaltyUsageRules,
    levelOrder = 0,
    isDisableSelectSource = false,
    setVisibleCustomer,
    isVisibleCustomer,
    shippingAddress,
    setModalAction,
    modalAction,
    setOrderSource: setOrderSourceId,
    OrderDetail,
    shippingAddressesSecondPhone,
    setShippingAddressesSecondPhone,
    initialForm,
    customerChange,
    setCustomerChange,
    billingAddress,
    setBillingAddress,
    ShippingAddressChange,
    updateOrder,
    handleChangeShippingFeeApplyOrderSettings,
  } = props;

  const dispatch = useDispatch();

  const [countryId] = React.useState<number>(233);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [keySearchCustomer, setKeySearchCustomer] = useState("");
  useState<CustomerShippingAddress | null>(null);

  const handleUpdateCustomer = useCallback(
    (customers: CustomerResponse | null) => {
      if (customers) {
        handleCustomer(customers);
        dispatch(changeOrderCustomerAction(customers));
        //set Shipping Address
        if (customers.shipping_addresses) {
          customers.shipping_addresses.forEach((item, index2) => {
            if (item.default === true) {
              ShippingAddressChange(item);
            }
          });
        }
      } else {
        ShippingAddressChange(null);
        handleCustomer(null);
        setBillingAddress(null);
        dispatch(changeOrderCustomerAction(null));
      }
    },
    [ShippingAddressChange, dispatch, handleCustomer, setBillingAddress],
  );

  const handleConfirmCustomerCreate = () => {
    if (setModalAction) setModalAction(MODAL_ACTION_TYPE.create as modalActionType);
    if (setVisibleCustomer) setVisibleCustomer(true);
  };

  const handleConfirmCustomerEdit = useCallback(() => {
    if (setModalAction) setModalAction(MODAL_ACTION_TYPE.edit as modalActionType);
    if (setVisibleCustomer) setVisibleCustomer(true);
  }, [setModalAction, setVisibleCustomer]);

  const handleChangeCustomer = useCallback(
    (customers: CustomerResponse | null) => {
      if (customers) {
        handleConfirmCustomerEdit();
        setCustomerChange(false);
      }
      handleUpdateCustomer(customers);
      if (setShippingAddressesSecondPhone) setShippingAddressesSecondPhone("");
    },
    [
      handleConfirmCustomerEdit,
      handleUpdateCustomer,
      setCustomerChange,
      setShippingAddressesSecondPhone,
    ],
  );

  //Delete customer
  const CustomerDeleteInfo = () => {
    handleUpdateCustomer(null);
    if (setVisibleCustomer) setVisibleCustomer(false);

    handleChangeShippingFeeApplyOrderSettings({
      customerShippingAddressCityId: null,
    });
    setKeySearchCustomer("");
    if (setShippingAddressesSecondPhone) setShippingAddressesSecondPhone("");
  };

  useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  useEffect(() => {
    dispatch(CustomerGroups(setGroups));
  }, [dispatch]);

  return (
    <StyleComponent>
      <Card
        title="THÔNG TIN KHÁCH HÀNG"
        extra={
          <ExtraCardCustomer
            orderDetail={OrderDetail}
            setOrderSource={setOrderSourceId}
            isDisableSelectSource={isDisableSelectSource}
            initialForm={initialForm}
            updateOrder={updateOrder}
          />
        }
      >
        {isVisibleCustomer !== true && (
          <SearchCustomerAutoComplete
            keySearch={keySearchCustomer}
            setKeySearch={setKeySearchCustomer}
            id="search_customer"
            onSelect={handleChangeCustomer}
            handleConfirmCreate={handleConfirmCustomerCreate}
          />
        )}

        {customer && (
          <InfoCustomer
            customer={customer}
            loyaltyPoint={loyaltyPoint}
            loyaltyUsageRules={loyaltyUsageRules}
            levelOrder={levelOrder}
            CustomerDeleteInfo={CustomerDeleteInfo}
          />
        )}

        {isVisibleCustomer === true && modalAction === MODAL_ACTION_TYPE.create && (
          <CreateCustomer
            areas={areas}
            groups={groups}
            keySearchCustomer={keySearchCustomer}
            customerChange={customerChange}
            setCustomerChange={setCustomerChange}
            CustomerDeleteInfo={CustomerDeleteInfo}
            handleChangeCustomer={handleChangeCustomer}
          />
        )}

        {isVisibleCustomer === true && modalAction === MODAL_ACTION_TYPE.edit && customer && (
          <UpdateCustomer
            customer={customer}
            areas={areas}
            groups={groups}
            orderDetail={OrderDetail}
            shippingAddress={shippingAddress}
            shippingAddressesSecondPhone={shippingAddressesSecondPhone}
            setShippingAddressesSecondPhone={setShippingAddressesSecondPhone}
            customerChange={customerChange}
            setCustomerChange={setCustomerChange}
            levelOrder={levelOrder}
            handleChangeCustomer={handleChangeCustomer}
            isPageOrderUpdate={OrderDetail ? true : false}
            billingAddress={billingAddress}
            setBillingAddress={setBillingAddress}
            handleChangeShippingFeeApplyOrderSettings={handleChangeShippingFeeApplyOrderSettings}
          />
        )}
      </Card>
    </StyleComponent>
  );
};

export default CardCustomer;
