import ModalConfirm from "component/modal/ModalConfirm";
import { setSubStatusAction } from "domain/actions/order/order.action";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { SUB_STATUS_CANCEL_CODE } from "utils/Order.constants";
import { StyledComponent } from "./SubStatusChange.styles";

type PropTypes = {
  orderId?: number;
  toSubStatus?: string;
  isShouldChangeSubStatus: boolean;
  changeSubStatusCallback: (value: string) => void;
};

let isConfirmedChangeSubStatus = false;
function SubStatusChange(props: PropTypes): JSX.Element {
  const { orderId, toSubStatus, isShouldChangeSubStatus, changeSubStatusCallback } = props;
  const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
  const [subText, setSubText] = useState("");

  console.log("toSubStatus", toSubStatus);
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
    } else if (toSubStatus === "out_of_stock") {
      setSubText("Đơn hàng trạng thái Hết Hàng sẽ không thao tác được nữa.");
      setIsShowModalConfirm(true);
      isChange = false;
    } else {
      isChange = true;
    }
    return isChange;
  }, [toSubStatus]);

  const resetValues = () => {
    setIsShowModalConfirm(false);
    isConfirmedChangeSubStatus = false;
  };

  const changeOrderSubStatus = useCallback(() => {
    if (!isShouldChangeSubStatus) {
      return;
    }
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
            },
            () => {
              resetValues();
            }
          )
        );
      }
    }
  }, [
    changeSubStatusCallback,
    checkIfCanChange,
    dispatch,
    isShouldChangeSubStatus,
    orderId,
    toSubStatus,
  ]);

  useEffect(() => {
    changeOrderSubStatus();
  }, [changeOrderSubStatus]);

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
