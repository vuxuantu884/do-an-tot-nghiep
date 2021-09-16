import { Button } from "antd";
import { StyledComponent } from "./styles";

type PropType = {
  onSubmit: () => void;
  onCancel: () => void;
  isCanSubmit: boolean;
  isExchange: boolean;
  isStepExchange: boolean;
  handleIsStepExchange: (value: boolean) => void;
};

function ReturnBottomBar(props: PropType) {
  const {
    onSubmit,
    onCancel,
    isCanSubmit,
    isExchange,
    isStepExchange,
    handleIsStepExchange,
  } = props;
  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left"></div>
        <div className="bottomBar__right">
          {isExchange && isStepExchange && (
            <Button
              onClick={() => {
                handleIsStepExchange(false);
              }}
            >
              Quay lại
            </Button>
          )}
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
              if (isExchange) {
                handleIsStepExchange(true);
              } else {
                onSubmit();
              }
            }}
            disabled={!isExchange && !isCanSubmit}
          >
            {!isExchange
              ? "Trả hàng"
              : isStepExchange
              ? "Tạo đơn"
              : "Tiếp theo"}
          </Button>
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
