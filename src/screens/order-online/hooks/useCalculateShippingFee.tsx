import { FormInstance } from "antd";
import { changeShippingServiceConfigAction } from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { ChangeShippingFeeApplyOrderSettingParamModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleCalculateShippingFeeApplyOrderSetting } from "utils/AppUtils";

function useCalculateShippingFee(
  totalOrderAmount: number,
  form: FormInstance<any>,
  setShippingFeeInformedToCustomer: (value: number | null) => void,
  isOrderUpdatePage: boolean,
  transportService?: string | null | undefined,
) {
  const transportServiceFromReducer = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service,
  );

  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);
  const dispatch = useDispatch();

  const resultTransportService = transportService ? transportService : transportServiceFromReducer;

  const [isShippingFeeAlreadyChanged, setIsShippingFeeAlreadyChanged] = useState(false);

  const handleChangeShippingFeeApplyOrderSettings = (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => {
    if (isShippingFeeAlreadyChanged) {
      return;
    }
    handleCalculateShippingFeeApplyOrderSetting(
      value.customerShippingAddressCityId,
      totalOrderAmount,
      shippingServiceConfig,
      resultTransportService,
      form,
      setShippingFeeInformedToCustomer,
      isOrderUpdatePage,
      false,
    );
  };

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response));
      }),
    );
  }, [dispatch]);

  return {
    handleChangeShippingFeeApplyOrderSettings,
    setIsShippingFeeAlreadyChanged,
    shippingServiceConfig,
  };
}

export default useCalculateShippingFee;
