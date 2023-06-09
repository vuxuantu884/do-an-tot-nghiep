import { setSubStatusAction } from "domain/actions/order/order.action";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useChangeOrderSubStatus(
  orderId: number,
  toSubStatus: string,
  isShouldChangeSubStatus: boolean,
  isConfirmedChangeSubStatus: boolean,
  callbackSuccessFunction: () => void,
  callbackFailFunction: () => void,
) {
  const [isShowModalConfirmCancelOrder, setIsShowModalConfirmCancelOrder] = useState(false);
  const [isShowModalConfirmOutOfStock, setIsShowModalConfirmOutOfStock] = useState(false);
  const dispatch = useDispatch();

  const checkIfCanChange = useCallback(() => {
    const cancelArr = ["customer_cancelled", "system_cancelled", "delivery_service_cancelled"];
    let isChange = false;
    if (cancelArr.includes(toSubStatus)) {
      isChange = false;
      setIsShowModalConfirmCancelOrder(true);
    } else if (toSubStatus === "out_of_stock") {
      isChange = false;
      setIsShowModalConfirmOutOfStock(true);
    } else {
      isChange = true;
    }
    return isChange;
  }, [toSubStatus]);

  const changeOrderSubStatus = useCallback(() => {
    if (!isShouldChangeSubStatus) {
      return;
    }
    let isChange = checkIfCanChange();
    console.log("444");
    if (isChange || isConfirmedChangeSubStatus) {
      if (orderId) {
        console.log("55");
        dispatch(
          setSubStatusAction(
            orderId,
            toSubStatus,
            () => {
              // setIsShowModalConfirmCancelOrder(false)
              // setIsShowModalConfirmOutOfStock(false)
              callbackSuccessFunction();
            },
            () => {
              // setIsShowModalConfirmCancelOrder(false)
              // setIsShowModalConfirmOutOfStock(false)
              callbackFailFunction();
            },
          ),
        );
      }
    }
  }, [
    callbackFailFunction,
    callbackSuccessFunction,
    checkIfCanChange,
    dispatch,
    isConfirmedChangeSubStatus,
    isShouldChangeSubStatus,
    orderId,
    toSubStatus,
  ]);

  useEffect(() => {
    changeOrderSubStatus();
  }, [changeOrderSubStatus, isConfirmedChangeSubStatus]);

  return {
    isShowModalConfirmCancelOrder,
    isShowModalConfirmOutOfStock,
    setIsShowModalConfirmCancelOrder,
    setIsShowModalConfirmOutOfStock,
    handleChange: changeOrderSubStatus,
  };
}

export default useChangeOrderSubStatus;
