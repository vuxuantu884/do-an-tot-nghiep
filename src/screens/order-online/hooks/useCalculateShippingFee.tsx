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
  orderProductsAmount: number,
  form: FormInstance<any>,
  setShippingFeeInformedToCustomer: (value: number | null) => void,
  isOrderUpdatePage: boolean,
) {
  const transportServiceFromReducer = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service,
  );

  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);
  const dispatch = useDispatch();

  const [isShippingFeeAlreadyChanged, setIsShippingFeeAlreadyChanged] = useState(false);

  const handleChangeShippingFeeApplyOrderSettings = (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => {
    if (isShippingFeeAlreadyChanged) {
      return;
    }
    // nếu có truyền orderProductsAmount ở value thì lấy, ko thì lấy giá trị ở file ngoài
    const resultOrderProductsAmount = value.orderProductsAmount
      ? value.orderProductsAmount
      : orderProductsAmount;

    // nếu có truyền resultTransportService ở value thì lấy, ko thì lấy giá trị ở reducer
    const resultTransportService = value.transportService
      ? value.transportService
      : transportServiceFromReducer;

    handleCalculateShippingFeeApplyOrderSetting(
      value.customerShippingAddressCityId,
      resultOrderProductsAmount,
      shippingServiceConfig,
      resultTransportService,
      form,
      setShippingFeeInformedToCustomer,
      isOrderUpdatePage,
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
