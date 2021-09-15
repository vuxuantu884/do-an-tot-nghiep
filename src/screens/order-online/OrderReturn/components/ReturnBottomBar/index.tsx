import { Button } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  onSubmit: () => void;
  onCancel: () => void;
  isCanSubmit: boolean;
};

function ReturnBottomBar(props: PropType) {
  const { onSubmit, onCancel, isCanSubmit } = props;
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
          <Button
            type="primary"
            onClick={() => {
              onSubmit();
            }}
            disabled={!isCanSubmit}
          >
            Trả hàng
          </Button>
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
