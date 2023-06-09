import { OrderPaymentRequest } from "model/request/order.request";
import { useEffect } from "react";
import { ShipmentMethodOption } from "utils/Constants";
import {
  checkIfExpiredOrCancelledPayment,
  checkIfFinishedPayment,
  checkIfMomoPayment,
} from "utils/OrderUtils";

/**
 * nếu có thanh toán momo thì chọn giao hàng sau
 */
function useHandleMomoCreateShipment(
  setShipmentMethod: (value: number) => void,
  payments: OrderPaymentRequest[] | OrderPaymentRequest[],
) {
  useEffect(() => {
    const checkIfPaymentsHaveNotFinishedMomo = () => {
      return payments.some((payment) => {
        return (
          checkIfMomoPayment(payment) &&
          payment.paid_amount > 0 &&
          !checkIfExpiredOrCancelledPayment(payment) &&
          !checkIfFinishedPayment(payment)
        );
      });
    };
    if (checkIfPaymentsHaveNotFinishedMomo()) {
      setShipmentMethod(ShipmentMethodOption.DELIVER_LATER);
    }
  }, [payments, setShipmentMethod]);
}

export default useHandleMomoCreateShipment;
