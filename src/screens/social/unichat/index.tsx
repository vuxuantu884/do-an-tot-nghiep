import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQuery } from "utils/useQuery";
import { getToken, getUnichatSource, setUnichatSource } from "utils/LocalStorageUtils";
import { hideLoading } from "domain/actions/loading.action";
import ContentContainer from "component/container/content.container";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { AppConfig } from "config/app.config";
import SplashScreen from "screens/splash.screen";
import { allSource } from "screens/social/helper";
import { SocialStyled } from "screens/social/styles";
import YodySocial from "assets/img/yody_social.svg";
import yodyUnichatImg from "assets/img/yody_unichat.svg";

const Unichat: React.FC = () => {
  const dispatch = useDispatch();
  const queryString = useQuery();
  const unichatToken = queryString.get("token");
  const [source, setSource] = useState<String | null>(getUnichatSource());
  const [loadingUnichat, setLoadingUnichat] = useState<Boolean | null>(false);
  const [isLogining, setIsLogining] = useState<Boolean | null>(false);

  const goToFacebookUnichat = () => {
    setSource(allSource.UNICHAT);
    setUnichatSource(allSource.UNICHAT);
    setIsLogining(true);
    window.location.href = AppConfig.unichatApi + "auth/facebook";
  };

  const setUnichatPath = (path: any) => {
    const url = new URL(window.location.href);
    url.searchParams.set("path", path);
    window.history.pushState({}, "", url.toString());
  };

  const getUnichatIframeUrl = () => {
    const pathParam = new URLSearchParams(window.location.search).get("path");
    const path = pathParam ? pathParam : "";
    return new URL(AppConfig.unichatUrl || "").origin + path;
  };

  useEffect(() => {
    dispatch(hideLoading());
    if (unichatToken) {
      setSource(allSource.UNICHAT);
      setUnichatSource(allSource.UNICHAT);
    }
  }, [dispatch, unichatToken]);

  useEffect(() => {
    function handleEvent(event: any) {
      const { data } = event;
      const { cmd, route } = data;
      switch (cmd) {
        case "unichat_save_route_path":
          setUnichatPath(route.path);
          setLoadingUnichat(false);
          break;
        case "unichat_hide_sidebar_menu":
          const settingApp = JSON.parse(localStorage.setting_app || "{}");
          if (!settingApp.collapse) {
            const toggleSideBtn: HTMLElement | null = document.querySelector("header button");
            toggleSideBtn?.click();
          }
          setLoadingUnichat(false);
          break;
        case "unichat_loaded":
          setLoadingUnichat(false);
          break;
        case "unichat_logout":
          setUnichatSource("");
          window.location.href = `${BASE_NAME_ROUTER}${UrlConfig.SOCIAL}`;
          break;
        default:
          break;
      }
    }
    window.addEventListener("message", handleEvent, false);
    return () => {
      window.removeEventListener("message", handleEvent, false);
    };
  }, []);

  useEffect(() => {
    if (loadingUnichat === false) {
      const token = getToken();
      const iframe: HTMLIFrameElement | null = document.querySelector('[name="unichat-iframe"]');
      const ydpageWindow = iframe?.contentWindow;
      ydpageWindow?.postMessage(
        {
          service: "unicorn-token",
          params: {
            token,
          },
        },
        "*",
      );
    }
  }, [loadingUnichat]);

  useEffect(() => {
    const iframe: HTMLIFrameElement | null = document.querySelector(
      '[name="unichat-callback-iframe"]',
    );
    iframe?.addEventListener("load", function () {
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      url.searchParams.delete("unichatEnv");
      window.history.pushState({}, "", url.toString());
    });

    if (!iframe && source) {
      setLoadingUnichat(true);
    }
  }, [source]);

  return (
    <SocialStyled>
      {!source && (
        <ContentContainer title="">
          <div className="ydpage-body">
            <img className="image" src={YodySocial} alt="" />
            <div className="text-description">
              <div className="label">Chọn kênh Social bạn muốn kết nối</div>
              <div className="description">Kết nối với tất cả khách hàng mọi lúc!</div>
            </div>

            <div className="button-option">
              <div
                className="social-button"
                style={{ marginRight: "0" }}
                onClick={goToFacebookUnichat}
              >
                <img src={yodyUnichatImg} style={{ marginRight: "12px" }} alt="" />
                <div>
                  <div className="text-button-title">
                    <span>
                      Kết nối <span style={{ color: "#2A2A86" }}>Facebook</span> với Unichat
                    </span>
                    <span className={"beta-text"}>Beta</span>
                  </div>
                  <div className="description-text">
                    <div>Ứng dụng quản lý và bán hàng trên Facebook dành riêng cho YODY.</div>
                    <div>(Chỉ áp dụng với các đơn vị thử nghiệm)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      )}
      {loadingUnichat && <SplashScreen />}
      {source === allSource.UNICHAT && !unichatToken && !isLogining && (
        <iframe
          name="unichat-iframe"
          className="ydpage-iframe"
          title="unichat"
          src={getUnichatIframeUrl()}
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      )}
      {source === allSource.UNICHAT && unichatToken && !isLogining && (
        <iframe
          name="unichat-callback-iframe"
          className="ydpage-iframe"
          title="unichat"
          src={`${AppConfig.unichatUrl}login-callback?token=${unichatToken}`}
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      )}
    </SocialStyled>
  );
};

export default Unichat;
