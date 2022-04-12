import { Button } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { useSelector } from "react-redux";
import { StyledComponent } from "./styles";

type PropType = {
  onReturn: () => void;
  onReturnAndPrint: () => void;
  onReturnAndExchange: () => void;
  onReturnAndExchangeAndPrint: () => void;
  onCancel: () => void;
  isCanExchange: boolean;
  isExchange: boolean;
};

function ReturnBottomBar(props: PropType) {
  const {
    onReturn,
    onReturnAndPrint,
    onReturnAndExchange,
    onReturnAndExchangeAndPrint,
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
            <React.Fragment>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  onReturn();
                }}
              >
                Trả hàng
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onReturnAndPrint();
                }}
              >
                Trả hàng và in hóa đơn
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button
                type="primary"
                ghost
                onClick={() => {
                  onReturnAndExchange();
                }}
                disabled={isLoadingDiscount}
              >
                Trả và đổi hàng
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  onReturnAndExchangeAndPrint();
                }}
                disabled={isLoadingDiscount}
              >
                Trả và đổi hàng và in hóa đơn
              </Button>
            </React.Fragment>
          )}
          
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
