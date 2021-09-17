import { Button } from "antd";
import UrlConfig from "config/url.config";
import React from "react";
import { Link } from "react-router-dom";
import IconBack from "./images/iconBack.svg";
import IconCancelConnect from "./images/iconCancelConnect.svg";
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
          <Link
            to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`}
            className="back"
          >
            <img src={IconBack} alt="" style={{ marginRight: 10 }} />
            Quay lại danh sách
          </Link>
        </div>
        <div className="bottomBar__right">
          <Button
            danger
            onClick={() => {
              onCancelConnect();
            }}
          >
            <img src={IconCancelConnect} alt="" style={{ marginRight: 5 }} />
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
