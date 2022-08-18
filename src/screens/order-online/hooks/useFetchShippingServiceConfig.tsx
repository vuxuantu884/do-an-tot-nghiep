import { changeShippingServiceConfigAction } from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useFetchShippingServiceConfig() {
  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response));
      }),
    );
  }, [dispatch]);

  return shippingServiceConfig;
}

export default useFetchShippingServiceConfig;
