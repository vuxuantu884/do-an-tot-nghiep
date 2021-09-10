import { actionGetConfigurationShippingServiceAndShippingFeeDetail } from "domain/actions/settings/order-settings.action";
import { CreateShippingServiceConfigReQuestModel } from "model/request/settings/order-settings.resquest";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import {
  LAYOUT_CREATE_AND_DETAIL,
  ORDER_SETTINGS_STATUS,
} from "utils/OrderSettings.constants";
import LayoutEditAndDetail from "../components/LayoutEditAndDetail";

type PropType = {};

function OrderSettingsShippingServicesAndShippingFeeDetail(props: PropType) {
  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  const dispatch = useDispatch();
  const [initialFormValue, setInitialFormValue] =
    useState<CreateShippingServiceConfigReQuestModel>({
      status: ORDER_SETTINGS_STATUS.inactive,
      start_date: "",
      end_date: "",
      program_name: "",
      shipping_fee_configs: [
        {
          from_price: 0,
          to_price: 0,
          city_name: "",
          transport_fee: 0,
        },
      ],
      external_service_transport_type_ids: [],
    });

  useEffect(() => {
    dispatch(
      actionGetConfigurationShippingServiceAndShippingFeeDetail(
        +id,
        (response) => {
          let valueConvertResponseToInitialFormValue = {
            status: response.status,
            start_date: response.start_date,
            end_date: response.end_date,
            program_name: response.program_name,
            shipping_fee_configs: response.shipping_fee_configs.map(
              (single) => {
                return {
                  from_price: single.from_price,
                  to_price: single.to_price,
                  city_name: single.city_name,
                  transport_fee: single.transport_fee,
                };
              }
            ),
            external_service_transport_type_ids:
              response.external_service_transport_types.map((single) => {
                return single.id;
              }),
          };

          setInitialFormValue(valueConvertResponseToInitialFormValue);
        }
      )
    );
  }, [dispatch, id]);

  return (
    <LayoutEditAndDetail
      layoutType={LAYOUT_CREATE_AND_DETAIL.detail}
      initialFormValue={initialFormValue}
      id={+id}
    />
  );
}

export default OrderSettingsShippingServicesAndShippingFeeDetail;
