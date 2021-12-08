import { Button } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  onReturn: () => void;
  onReturnAndExchange: () => void;
  onCancel: () => void;
  isCanExchange: boolean;
  isExchange: boolean;
  isStepExchange: boolean;
  setIsStepExchange: (value: boolean) => void;
	handleIsStepExchange: (value: boolean) => void;
};

function ReturnBottomBar(props: PropType) {
  const {
    onReturn,
    onReturnAndExchange,
    onCancel,
    isExchange,
    isStepExchange,
    setIsStepExchange,
		handleIsStepExchange
  } = props;

  const renderReturnButtons = () => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={() => {
            onReturn();
          }}
        >
          Trả hàng
        </Button>
      </React.Fragment>
    );
  };

  const renderExchangeButtons = () => {
    return (
      <React.Fragment>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          Hủy
        </Button>
        {!isStepExchange && (
          <Button
            type="primary"
            onClick={() => {
              handleIsStepExchange(true);
            }}
          >
            Tiếp theo
          </Button>
        )}
        {isStepExchange && (
					<React.Fragment>
						<Button
            onClick={() => {
              setIsStepExchange(false);
            }}
          >
            Quay lại
          </Button>
          <Button
            type="primary"
            onClick={() => {
              onReturnAndExchange();
            }}
          >
            Trả và đổi hàng
          </Button>
					</React.Fragment>
        )}
      </React.Fragment>
    );
  };
  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left"></div>
        <div className="bottomBar__right">
          {!isExchange && renderReturnButtons()}
          {isExchange && renderExchangeButtons()}
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
