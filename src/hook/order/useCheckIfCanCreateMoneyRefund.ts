import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";
import { OrderResponse } from "model/response/order/order.response";
import { isOrderFromPOS } from "utils/AppUtils";

function useCheckIfCanCreateMoneyRefund(
  isReceivedReturnProducts: boolean,
  orderDetail: OrderResponse | null,
) {
  const [allowCreateMoneyReturn] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.CREATE_MONEY_REFUND],
    not: false,
  });

  const canCreateMoneyRefund =
    (isOrderFromPOS(orderDetail) || allowCreateMoneyReturn) && isReceivedReturnProducts;
  console.log("allowCreateMoneyReturn", allowCreateMoneyReturn);
  console.log("canCreateMoneyRefund", canCreateMoneyRefund);
  return canCreateMoneyRefund;
}

export default useCheckIfCanCreateMoneyRefund;
