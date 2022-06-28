import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";

function useCheckIfCanCreateMoneyRefund(isReceivedReturnProducts: boolean) {
  const [allowCreateMoneyReturn] = useAuthorization({
    acceptPermissions: [ODERS_PERMISSIONS.CREATE_MONEY_REFUND],
    not: false,
  });
  
  const canCreateMoneyRefund = allowCreateMoneyReturn && isReceivedReturnProducts

  return canCreateMoneyRefund;
}

export default useCheckIfCanCreateMoneyRefund;
