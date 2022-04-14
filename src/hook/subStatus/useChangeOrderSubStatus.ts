import { setSubStatusAction } from "domain/actions/order/order.action";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function useChangeOrderSubStatus(
  orderId: number,
  toSubStatus: string,
	isShouldChangeSubStatus: boolean,
  callbackSuccessFunction: () => void,
  callbackFailFunction: () => void
) {
  const [isShowModalConfirmCancel, setIsShowModalConfirmCancel] = useState(false);
  const [isShowModalConfirmOutOfStock, setIsShowModalConfirmOutOfStock] = useState(false);
  const dispatch = useDispatch();

	const checkIfCanChange = useCallback(
		() => {
			const cancelArr = ["customer_cancelled", "system_cancelled", "delivery_service_cancelled"];
			let isChange = false;
			if (cancelArr.includes(toSubStatus)) {
				isChange = false;
				setIsShowModalConfirmCancel(true);
			} else if (toSubStatus === "out_of_stock") {
				isChange = false;
				setIsShowModalConfirmOutOfStock(true);
			} else {
				isChange = true;
			}
			return isChange;
		},
		[toSubStatus],
	)

	const changeOrderSubStatus = useCallback(
		() => {
			if(!isShouldChangeSubStatus) {
				return;
			}
			let isChange = checkIfCanChange();
			console.log('444')
			if (isChange) {
				if (orderId) {
					console.log('55')
				  dispatch(
				    setSubStatusAction(
				      orderId,
				      toSubStatus,
				      () => callbackSuccessFunction(),
				      () => callbackFailFunction()
				    )
				  );
				}
			}
		},
		[callbackFailFunction, callbackSuccessFunction, checkIfCanChange, dispatch, orderId, toSubStatus],
	)

	useEffect(() => {
		changeOrderSubStatus()
	}, [changeOrderSubStatus])
	

  return {
    isShowModalConfirmCancel,
    isShowModalConfirmOutOfStock,
    handleChange: changeOrderSubStatus,
  };
}

export default useChangeOrderSubStatus;
