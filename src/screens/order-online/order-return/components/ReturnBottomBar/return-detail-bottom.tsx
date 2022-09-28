import { Button } from "antd";
import React from "react";
import { StyledComponent } from "./styles";

type ReturnDetailBottomType = {
  onOk?: () => void;
  onCancel?: () => void;
  hiddenButtonRemove?: boolean;
};
const ReturnDetailBottom: React.FC<ReturnDetailBottomType> = (props: ReturnDetailBottomType) => {
  const { onOk } = props;

  return (
    <StyledComponent>
      <div className="bottomBar bottomBar-detail">
        <Button danger className="btn-detail" onClick={onOk}>
          Xóa
        </Button>
      </div>
    </StyledComponent>
  );
};
export default ReturnDetailBottom;
