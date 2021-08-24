import { Button } from "antd";
import UrlConfig from "config/UrlConfig";
import React from "react";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";

type PropType = {
  onSubmit: () => void;
  onCancelConnect: () => void;
};

function BottomBar(props: PropType) {
  const { onSubmit, onCancelConnect } = props;
  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left">
          <Link to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`}>
            Quay lại danh sách
          </Link>
        </div>
        <div className="bottomBar__right">
          <Button
            onClick={() => {
              onCancelConnect();
            }}
          >
            Hủy kết nối
          </Button>
          <Button
            type="primary"
            onClick={() => {
              onSubmit();
            }}
          >
            Lưu
          </Button>
        </div>
      </div>
    </StyledComponent>
  );
}

export default BottomBar;
