import { Button } from "antd";
import UrlConfig from "config/url.config";
import React from "react";
import { Link } from "react-router-dom";
import IconBack from "./images/iconBack.svg";
import IconCancelConnect from "./images/iconCancelConnect.svg";
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
