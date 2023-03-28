import useGetChannels from "hook/order/useGetChannels";
import { OrderSearchQuery } from "model/order/order.model";
import { useMemo } from "react";
import { withRouter } from "react-router-dom";
import { POS } from "utils/Constants";
import { ORDER_TYPES } from "utils/Order.constants";
import { checkIfECommerceByOrderChannelCode } from "utils/OrderUtils";
import OrderList from "../component/OrderList";

type PropTypes = {
  location: any;
};
function OrdersScreen(props: PropTypes) {
  const { location } = props;

  const channels = useGetChannels();

  const initChannelCodes = channels
    .map((single) => single.code)
    .filter((single) => {
      return (
        !checkIfECommerceByOrderChannelCode(single) &&
        single.toLowerCase() !== POS.channel_code.toLowerCase()
      );
    });

  const pageTitle = {
    title: "Danh sách đơn hàng online",
    breadcrumb: [
      {
        name: "Đơn hàng online",
      },
      {
        name: "Danh sách đơn hàng online",
      },
    ],
  };

  const initQuery: OrderSearchQuery = useMemo(() => {
    return {
      page: 1,
      limit: 30,
      is_online: "true",
      sort_type: null,
      sort_column: null,
      code: null,
      customer_ids: [],
      store_ids: [],
      source_ids: [],
      variant_ids: [],
      issued_on_min: null,
      issued_on_max: null,
      issued_on_predefined: null,
      finalized_on_min: null,
      finalized_on_max: null,
      finalized_on_predefined: null,
      last_coordinator_confirm_on_min: null,
      last_coordinator_confirm_on_max: null,
      ship_on_min: null,
      ship_on_max: null,
      ship_on_predefined: null,
      expected_receive_on_min: null,
      expected_receive_on_max: null,
      expected_receive_predefined: null,
      returning_date_min: null,
      returning_date_max: null,
      returned_date_min: null,
      returned_date_max: null,
      completed_on_min: null,
      completed_on_max: null,
      completed_on_predefined: null,
      cancelled_on_min: null,
      cancelled_on_max: null,
      cancelled_on_predefined: null,
      order_status: [],
      sub_status_code: [],
      fulfillment_status: [],
      payment_status: [],
      return_status: [],
      account_codes: [],
      coordinator_codes: [],
      marketer_codes: [],
      assignee_codes: [],
      price_min: undefined,
      price_max: undefined,
      payment_method_ids: [],
      delivery_types: [],
      delivery_provider_ids: [],
      order_carer_codes: [],
      special_types: [],
      violation_types: [],
      shipper_codes: [],
      note: null,
      customer_note: null,
      tags: [],
      marketing_campaign: [],
      reference_code: null,
      search_term: "",
      services: [],
      channel_codes: initChannelCodes,
      tracking_codes: [],
      searched_product: "",
      discount_code: [],
      in_goods_receipt: undefined,
      is_expired_payment: null,
      expired_at: null,
      returned_store_ids: [],
      types: [],
    };
  }, [initChannelCodes]);

  return initChannelCodes.length > 0 ? (
    <OrderList
      initQuery={initQuery}
      location={location}
      pageTitle={pageTitle}
      isHideTab
      orderType={ORDER_TYPES.online}
      initChannelCodes={initChannelCodes}
      channels={channels}
    />
  ) : null;
}
export default withRouter(OrdersScreen);
