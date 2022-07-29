import { Button } from "antd";
import UrlConfig from "config/url.config";
import React from "react";
import { Link } from "react-router-dom";
import IconBack from "./images/iconBack.svg";
import IconConnect from "./images/iconConnect.svg";
import IconCancelConnect from "./images/iconCancelConnect.svg";
import { StyledComponent } from "./styles";

type PropTypes = {
  onSubmit: () => void;
  onConnect: () => void;
  onCancelConnect: () => void;
  isConnected: boolean;
};

function BottomBar(props: PropTypes) {
  const { onSubmit, onConnect, onCancelConnect, isConnected } = props;

  const renderButtonConnect = () => {
    if (isConnected) {
      return (
        <Button
          danger
          onClick={() => {
            onCancelConnect();
          }}
        >
          <img src={IconCancelConnect} alt="" style={{ marginRight: 5 }} />
          Hủy kết nối
        </Button>
      );
    } else {
      return (
        <Button
          danger
          onClick={() => {
            onConnect();
          }}
        >
          <img src={IconConnect} alt="" style={{ marginRight: 5 }} />
          Kết nối
        </Button>
      );
    }
  };
  return (
    <StyledComponent>
      <div className="bottomBar">
        <div className="bottomBar__left">
          <Link to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}`} className="back">
            <img src={IconBack} alt="" style={{ marginRight: 10 }} />
            Quay lại danh sách
          </Link>
        </div>
        <div className="bottomBar__right">
          {renderButtonConnect()}
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
