import React from "react";

import ContentContainer from "component/container/content.container";

import { StyledYDpage } from "screens/YDpage/StyledYDpage";
import YDpageConnect from "assets/img/ydpage-connect.svg";
import FacebookIcon from "assets/icon/facebook.svg";
import InstagramIcon from "assets/icon/instagram.svg";
import ZaloIcon from "assets/icon/zalo.svg";


const YDPAGE_URL = "https://vpage.yody.io/";

const YDpage: React.FC = () => {

  const goToFacebookYDpage = () => {
    window.open(YDPAGE_URL, "_blank");
  }

  return (
    <StyledYDpage>
      <ContentContainer
        title="Danh sách kênh trên YDPage"
      >
        <div className="ydpage-body">
          <div className="left-body">
            <div className="title">
              <div className="label">Chọn kênh Social</div>
              <div className="description">Bạn muốn kết nối</div>
            </div>
            <img className="image" src={YDpageConnect} alt="" />
          </div>

          <div className="right-body">
            <div>
              <div className="row-button">
                <div className="social-button facebook" onClick={goToFacebookYDpage}>
                  <img className="image" src={FacebookIcon} style={{ marginRight: "15px", height: "40px" }} alt="" />
                  <span className="text-button">Facebook</span>
                </div>
                <div className="social-button" style={{ display: "none"}}>
                  <img className="image" src={InstagramIcon} style={{ marginRight: "15px", height: "40px" }} alt="" />
                  <span className="text-button">Instagram</span>
                </div>
              </div>

              <div className="row-button">
                <div className="social-button" style={{ display: "none"}}>
                  <img className="image" src={ZaloIcon} style={{ marginRight: "15px", height: "40px" }} alt="" />
                  <span className="text-button">Zalo</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </ContentContainer>
    </StyledYDpage>
  );
};

export default YDpage;
