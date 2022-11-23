import { Button } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import React from "react";
import { useSelector } from "react-redux";
import { StyledComponent } from "./styles";

type PropTypes = {
  onReturn: () => void;
  onReturnAndPrint: () => void;
  onReturnAndExchange: () => void;
  onReturnAndExchangeAndPrint: () => void;
  onCancel: () => void;
  isExchange: boolean;
  isDisableReturnButton: boolean;
};

function ReturnBottomBar(props: PropTypes) {
  const {
    onReturn,
    onReturnAndPrint,
    onReturnAndExchange,
    onReturnAndExchangeAndPrint,
    onCancel,
    isExchange,
    isDisableReturnButton,
  } = props;

  const isLoadingDiscount = useSelector(
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount,
  );

  const renderReturnButtons = () => {
    if (!isExchange) {
      return (
        <React.Fragment>
          <Button
            type="primary"
            ghost
            onClick={() => {
              onReturn();
            }}
            id="btn-return"
            disabled={isDisableReturnButton}
          >
            Trả hàng (F9)
          </Button>
          <Button
            type="primary"
            onClick={() => {
              onReturnAndPrint();
            }}
            id="btn-return-print"
            disabled={isDisableReturnButton}
          >
            Trả hàng và in hóa đơn (F10)
          </Button>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        <Button
          type="primary"
          ghost
          onClick={() => {
            onReturnAndExchange();
          }}
          disabled={isLoadingDiscount}
          id="btn-return"
        >
          Trả và đổi hàng (F9)
        </Button>
        <Button
          type="primary"
          onClick={() => {
            onReturnAndExchangeAndPrint();
          }}
          disabled={isLoadingDiscount}
          id="btn-return-print"
        >
          Trả và đổi hàng và in hóa đơn (F10)
        </Button>
      </React.Fragment>
    );
  };

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
          {renderReturnButtons()}
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
