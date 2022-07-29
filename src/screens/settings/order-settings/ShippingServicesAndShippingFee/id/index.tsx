import { actionGetConfigurationShippingServiceAndShippingFeeDetail } from "domain/actions/settings/order-settings.action";
import { CreateShippingServiceConfigReQuestFormModel } from "model/request/settings/order-settings.resquest";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { LAYOUT_CREATE_AND_DETAIL, ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
import LayoutEditAndDetail from "../components/LayoutEditAndDetail";

type PropType = {};

function OrderSettingsShippingServicesAndShippingFeeDetail(props: PropType) {
  const paramsId = useParams<{ id: string }>();
  const { id } = paramsId;
  const dispatch = useDispatch();
  const [initialFormValue, setInitialFormValue] =
    useState<CreateShippingServiceConfigReQuestFormModel>({
      status: ORDER_SETTINGS_STATUS.inactive,
      start_date: null,
      end_date: null,
      program_name: "",
      shipping_fee_configs: [
        {
          from_price: undefined,
          to_price: undefined,
          city_name: "",
          city_id: undefined,
          transport_fee: undefined,
        },
      ],
      external_service_transport_type_ids: [],
    });

  useEffect(() => {
    dispatch(
      actionGetConfigurationShippingServiceAndShippingFeeDetail(+id, (response) => {
        let valueConvertResponseToInitialFormValue: CreateShippingServiceConfigReQuestFormModel = {
          status: response.status,
          start_date: moment(response.start_date),
          end_date: moment(response.end_date),
          program_name: response.program_name,
          shipping_fee_configs: response.shipping_fee_configs.map((single) => {
            return {
              from_price: single.from_price,
              to_price: single.to_price,
              city_name: single.city_name,
              city_id: single.city_id,
              transport_fee: single.transport_fee,
            };
          }),
          external_service_transport_type_ids: response.transport_types.map((single) => {
            return single.id;
          }),
          // response.external_service_transport_types.map((single) => {
          //   if (single.status === ORDER_SETTINGS_STATUS.active) {
          //     return single.code;
          //   }
          // }),
        };

        setInitialFormValue(valueConvertResponseToInitialFormValue);
      }),
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
