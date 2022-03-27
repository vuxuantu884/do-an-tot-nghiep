import { Button } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { useSelector } from "react-redux";
import { StyledComponent } from "./styles";

type PropType = {
  onReturn: () => void;
  onReturnAndExchange: () => void;
  onCancel: () => void;
  isCanExchange: boolean;
  isExchange: boolean;
};

function ReturnBottomBar(props: PropType) {
  const {
    onReturn,
    onReturnAndExchange,
    onCancel,
    isExchange,
  } = props;

  const isLoadingDiscount = useSelector(
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount
  );

  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left"></div>
        <div className="bottomBar__right">
          <Button
            onClick={() => {
              onCancel();
            }}
          >
            Hủy
          </Button>
          {!isExchange ? (
            <Button
              type="primary"
              onClick={() => {
                onReturn();
              }}
            >
              Trả hàng
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={() => {
                onReturnAndExchange();
              }}
              disabled={isLoadingDiscount}
            >
              Trả và đổi hàng
            </Button>
          )}
          
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
