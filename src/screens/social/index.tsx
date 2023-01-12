import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppConfig } from "config/app.config";
import {
  getUnichatSource,
  getYdpageSource,
  setUnichatSource,
  setYdpageSource,
} from "utils/LocalStorageUtils";
import ContentContainer from "component/container/content.container";
import { SocialStyled } from "screens/social/styles";
import { allSource } from "screens/social/helper";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import YodySocial from "assets/img/yody_social.svg";
import ydpageImg from "assets/img/ydpage.svg";
import yodyUnichatImg from "assets/img/yody_unichat.svg";

const SocialNetworkChannel: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hideLoading());
  }, [dispatch]);

  const goToFacebookYDpage = () => {
    dispatch(showLoading());
    if (getYdpageSource() === allSource.FACEBOOK) {
      window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.YDPAGE}`;
    } else {
      setYdpageSource(allSource.FACEBOOK);
      window.location.href = AppConfig.ydPageUrl + "auth/facebook";
    }
  };

  const goToFacebookUnichat = () => {
    dispatch(showLoading());
    if (getUnichatSource() === allSource.UNICHAT) {
      window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.SOCIAL}${UrlConfig.UNICHAT}`;
    } else {
      setUnichatSource(allSource.UNICHAT);
      window.location.href = AppConfig.unichatApi + "auth/facebook";
    }
  };

  return (
    <SocialStyled>
      <ContentContainer title="">
        <div className="ydpage-body">
          <img className="image" src={YodySocial} alt="" />
          <div className="text-description">
            <div className="label">Chọn kênh Social bạn muốn kết nối</div>
            <div className="description">Kết nối với tất cả khách hàng mọi lúc!</div>
          </div>

          <div className="button-option">
            <div className="social-button" onClick={goToFacebookYDpage}>
              <img src={ydpageImg} style={{ marginRight: "12px" }} alt="" />
              <div>
                <div className="text-button-title">Kết nối <span style={{ color: "#2f54eb" }}>Facebook</span> với YDPAGE</div>
                <div className="description-text">Ứng dụng quản lý và bán hàng trên Facebook dành riêng cho YODY.</div>
              </div>
            </div>

            <div className="social-button" onClick={goToFacebookUnichat}>
              <img src={yodyUnichatImg} style={{ marginRight: "12px" }} alt="" />
              <div>
                <div className="text-button-title">
                  <span>Kết nối <span style={{ color: "#2f54eb" }}>Facebook</span> với Unichat </span>
                  <span className={"beta-text"}>Beta</span>
                </div>
                <div className="description-text">
                  <div>Ứng dụng quản lý và bán hàng trên Facebook dành riêng cho YODY.</div>
                  <div className={"text-bold"}>(Chỉ áp dụng với các đơn vị thử nghiệm)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
    </SocialStyled>
  );
};

export default SocialNetworkChannel;
