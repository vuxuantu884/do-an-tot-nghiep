import { CreateShippingServiceConfigReQuestFormModel } from "model/request/settings/order-settings.resquest";
import { LAYOUT_CREATE_AND_DETAIL, ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
import LayoutEditAndDetail from "../components/LayoutEditAndDetail";

type PropType = {};

function OrderSettingsShippingServicesAndShippingFeeCreate(props: PropType) {
  const initialFormValue: CreateShippingServiceConfigReQuestFormModel = {
    status: ORDER_SETTINGS_STATUS.inactive,
    start_date: null,
    end_date: null,
    program_name: "",
    shipping_fee_configs: [
      {
        from_price: undefined,
        to_price: undefined,
        city_name: undefined,
        city_id: undefined,
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
