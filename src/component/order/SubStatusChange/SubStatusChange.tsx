import ModalConfirm from "component/modal/ModalConfirm";
import { setSubStatusAction } from "domain/actions/order/order.action";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ORDER_SUB_STATUS, SUB_STATUS_CANCEL_CODE } from "utils/Order.constants";
import { StyledComponent } from "./SubStatusChange.styles";

type PropTypes = {
  orderId?: number;
  toSubStatus?: string;
  changeSubStatusCallback: (value: string) => void;
  setToSubStatusCode: (value: string | undefined) => void;
};

let isConfirmedChangeSubStatus = false;
function SubStatusChange(props: PropTypes): JSX.Element {
  const { orderId, toSubStatus, changeSubStatusCallback, setToSubStatusCode } = props;
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [subText, setSubText] = useState("");

  const dispatch = useDispatch();

  const checkIfCanChange = useCallback(() => {
    if (!toSubStatus) {
      return;
    }
    let isChange = false;
    if (SUB_STATUS_CANCEL_CODE.includes(toSubStatus)) {
      isChange = false;
      setIsShowModalConfirm(true);
      setSubText(
        "Đơn hàng trạng thái khách hàng hủy, HVC hủy, Hệ thống hủy sẽ không thao tác được nữa."
      );
    } else if (toSubStatus === ORDER_SUB_STATUS.out_of_stock) {
      setSubText("Đơn hàng trạng thái Hết Hàng sẽ không thao tác được nữa.");
      setIsShowModalConfirm(true);
      isChange = false;
    } else {
      isChange = true;
    }
    return isChange;
  }, [toSubStatus]);

  const resetValues = useCallback(() => {
    setIsShowModalConfirm(false);
    isConfirmedChangeSubStatus = false;
    setToSubStatusCode(undefined);
  }, [setToSubStatusCode]);

  const changeOrderSubStatus = useCallback(() => {
    if (!toSubStatus) {
      return;
    }
    let isChange = checkIfCanChange();
    if (isChange || isConfirmedChangeSubStatus) {
      if (orderId) {
        dispatch(
          setSubStatusAction(
            orderId,
            toSubStatus,
            () => {
              resetValues();
              changeSubStatusCallback(toSubStatus);
              setToSubStatusCode(undefined);
            },
            () => {
              resetValues();
              setToSubStatusCode(undefined);
            }
          )
        );
      }
    }
  }, [
    changeSubStatusCallback,
    checkIfCanChange,
    dispatch,
    orderId,
    resetValues,
    setToSubStatusCode,
    toSubStatus,
  ]);

  useEffect(() => {
    if (toSubStatus) {
      changeOrderSubStatus();
    } else {
      setIsShowModalConfirm(false);
    }
  }, [changeOrderSubStatus, toSubStatus]);

  return (
    <StyledComponent>
      <ModalConfirm
        onCancel={() => {
          resetValues();
        }}
        onOk={() => {
          isConfirmedChangeSubStatus = true;
          changeOrderSubStatus();
          resetValues();
        }}
        okText="Đồng ý"
        cancelText="Hủy"
        title={`Bạn chắc chắn muốn đổi trạng thái?`}
        subTitle={subText}
        visible={isShowModalConfirm}
      />
    </StyledComponent>
  );
}

export default SubStatusChange;
