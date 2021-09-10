import { CreateShippingServiceConfigReQuestModel } from "model/request/settings/order-settings.resquest";
import {
  LAYOUT_CREATE_AND_DETAIL,
  ORDER_SETTINGS_STATUS,
} from "utils/OrderSettings.constants";
import LayoutEditAndDetail from "../components/LayoutEditAndDetail";

type PropType = {};

function OrderSettingsShippingServicesAndShippingFeeCreate(props: PropType) {
  const initialFormValue: CreateShippingServiceConfigReQuestModel = {
    status: ORDER_SETTINGS_STATUS.inactive,
    start_date: "",
    end_date: "",
    program_name: "",
    shipping_fee_configs: [
      {
        from_price: undefined,
        to_price: undefined,
        city_name: "",
        transport_fee: undefined,
      },
    ],
    external_service_transport_type_ids: [],
  };

  return (
    <LayoutEditAndDetail
      layoutType={LAYOUT_CREATE_AND_DETAIL.create}
      initialFormValue={initialFormValue}
    />
  );
}

export default OrderSettingsShippingServicesAndShippingFeeCreate;
