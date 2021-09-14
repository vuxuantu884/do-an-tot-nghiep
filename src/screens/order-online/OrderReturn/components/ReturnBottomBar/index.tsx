import { Button } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  onSubmit: () => void;
  onCancel: () => void;
};

function ReturnBottomBar(props: PropType) {
  const { onSubmit, onCancel } = props;
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
              console.log("click");
              onSubmit();
            }}
          >
            Trả hàng
          </Button>
        </div>
      </div>
    </StyledComponent>
  );
}

export default ReturnBottomBar;
