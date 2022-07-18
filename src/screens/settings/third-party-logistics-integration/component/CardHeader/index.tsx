import React from "react";
import { StyledComponent } from "./styles";

type PropTypes = {
  logoUrl?: string;
  title?: string;
  guideUrl: string;
};

function SingleLogisticCardHeader(props: PropTypes) {
  const {
    logoUrl,
    title,
    //guideUrl
  } = props;
  return (
    <StyledComponent>
      <div className="cardHeader">
        <div className="cardHeader__left">
          <div className="logoSingleThirdPartyLogistic">
            <img src={logoUrl} alt="" style={{ width: 100 }} />
          </div>
          <h4 className="name">{title}</h4>
        </div>
        {/* <div className="cardHeader__right">
          <a href={guideUrl} target="_blank" rel="noreferrer" className="link">
            Xem hướng dẫn kết nối
          </a>
        </div> */}
      </div>
    </StyledComponent>
  );
}

export default SingleLogisticCardHeader;
