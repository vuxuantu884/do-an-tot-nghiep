import React from "react";
import { StyledComponent } from "./styles";

type PropType = {
  logoUrl: string;
  title: string;
};

function SingleLogisticCardHeader(props: PropType) {
  const { logoUrl, title } = props;
  return (
    <StyledComponent>
      <div className="cardHeader">
        <div className="cardHeader__left">
          <div className="logoSingleThirdPartyLogistic">
            <img src={logoUrl} alt="" />
          </div>
          <h4 className="name">{title}</h4>
        </div>
        <div className="cardHeader__right">
          <a
            href="https://vnexpress.net/"
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            Xem hướng dẫn kết nối
          </a>
        </div>
      </div>
    </StyledComponent>
  );
}

export default SingleLogisticCardHeader;
