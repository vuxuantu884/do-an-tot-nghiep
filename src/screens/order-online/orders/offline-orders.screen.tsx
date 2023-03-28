import { OrderSearchQuery } from "model/order/order.model";
import React from "react";
import { withRouter } from "react-router-dom";
import { ORDER_TYPES } from "utils/Order.constants";
import OrderList from "../component/OrderList";

type PropTypes = {
  location: any;
};
function PosOrders(props: PropTypes) {
  const { location } = props;

  const pageTitle = {
    title: "Danh sách đơn hàng offline",
    breadcrumb: [
      {
        name: "Bán lẻ offline",
      },
      {
        name: "Danh sách đơn hàng offline",
      },
    ],
  };

  const initQuery: OrderSearchQuery = {
    page: 1,
    limit: 30,
    is_online: "false",
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
    order_carer_codes: [],
    price_min: undefined,
    price_max: undefined,
    payment_method_ids: [],
    delivery_types: [],
    delivery_provider_ids: [],
    shipper_codes: [],
    note: null,
    customer_note: null,
    tags: [],
    marketing_campaign: [],
    reference_code: null,
    search_term: "",
    services: [],
    channel_codes: [],
    discount_codes: [],
    special_types: [],
    violation_types: [],
  };

  return (
    <OrderList
      initQuery={initQuery}
      location={location}
      pageTitle={pageTitle}
      orderType={ORDER_TYPES.offline}
    />
  );
}
export default withRouter(PosOrders);
