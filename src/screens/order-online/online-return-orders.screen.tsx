import { ReturnSearchQuery } from "model/order/return.model";
import OrderReturnList from "./component/OrderReturnList/OrderReturnList";

const initQuery: ReturnSearchQuery = {
  page: 1,
  limit: 30,
  sort_type: null,
  sort_column: null,
  search_term: null,
  created_on_min: null,
  created_on_max: null,
  // created_on_predefined: null,
  received_on_min: null,
  received_on_max: null,
  received_predefined: null,
  payment_status: [],
  assignee_code: [],
  price_min: null,
  price_max: null,
  store_ids: [],
  is_received: [],
  account_codes: [],
  reason_ids: [],
  is_online: true,
  source_ids: [],
  channel_codes: []
};

function OnlineReturnOrdersScreen() {
    return <OrderReturnList initQuery={initQuery}/>
};

export default OnlineReturnOrdersScreen;
