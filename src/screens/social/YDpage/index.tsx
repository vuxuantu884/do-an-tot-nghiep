import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { useQuery } from "utils/useQuery";
import { getToken, getYdpageSource, setYdpageSource } from "utils/LocalStorageUtils";
import { hideLoading } from "domain/actions/loading.action";
import ContentContainer from "component/container/content.container";
import SplashScreen from "screens/splash.screen";
import { allSource } from "screens/social/helper";
import { SocialStyled } from "screens/social/styles";
import YodySocial from "assets/img/yody_social.svg";
import ydpageImg from "assets/img/ydpage.svg";

const YDPAGE_URL = AppConfig.ydPageUrl;

const YDpage: React.FC = () => {
  const dispatch = useDispatch();
  const queryString = useQuery();
  const fbCode = queryString.get("code");
  const [source, setSource] = useState<String | null>(getYdpageSource());
  const [loadingYdpage, setLoadingYdpage] = useState<Boolean | null>(false);
  const [isLogining, setIsLogining] = useState<Boolean | null>(false);

  const goToFacebookYDpage = () => {
    setSource(allSource.FACEBOOK);
    setYdpageSource(allSource.FACEBOOK);
    setIsLogining(true);
    window.location.href = YDPAGE_URL + "auth/facebook";
  };

  function setYdpagePath(path: any) {
    const url = new URL(window.location.href);
    url.searchParams.set("path", path);
    window.history.pushState({}, "", url.toString());
  }

  function getYdPageUrl() {
    const pathParam = new URLSearchParams(window.location.search).get("path");
    const path = pathParam ? pathParam : "/chat";
    return new URL(YDPAGE_URL || "").origin + "/#" + path;
  }

  useEffect(() => {
    dispatch(hideLoading());
  }, [dispatch]);

  useEffect(() => {
    function handleEvent(event: any) {
      const { data } = event;
      const { cmd, route } = data;
      switch (cmd) {
        case "save_route_path":
          setYdpagePath(route.path);
          setLoadingYdpage(false);
          break;
        case "hide_sidebar_menu":
          const settingApp = JSON.parse(localStorage.setting_app || "{}");
          if (!settingApp.collapse) {
            const toggleSideBtn: HTMLElement | null = document.querySelector("header button");
            toggleSideBtn?.click();
          }
          setLoadingYdpage(false);
          break;
        case "ydpage_loaded":
          setLoadingYdpage(false);
          break;
        case "YDpage_logout":
          setYdpageSource("");
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
    if (loadingYdpage === false) {
      const token = getToken();
      const iframe: HTMLIFrameElement | null = document.querySelector('[name="ydpage-iframe"]');
      const ydpageWindow = iframe?.contentWindow;
      ydpageWindow?.postMessage(
        {
          service: "token",
          params: {
            token,
          },
        },
        "*",
      );
    }
  }, [loadingYdpage]);

  useEffect(() => {
    const iframe: HTMLIFrameElement | null = document.querySelector(
      '[name="ydpage-callback-iframe"]',
    );
    iframe?.addEventListener("load", function () {
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.pushState({}, "", url.toString());
    });

    if (!iframe && source) {
      setLoadingYdpage(true);
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
                onClick={goToFacebookYDpage}
              >
                <img src={ydpageImg} style={{ marginRight: "12px" }} alt="" />
                <div>
                  <div className="text-button-title">
                    Kết nối <span style={{ color: "#2A2A86" }}>Facebook</span> với YDPAGE
                  </div>
                  <div className="description-text">
                    Ứng dụng quản lý và bán hàng trên Facebook dành riêng cho YODY.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentContainer>
      )}
      {loadingYdpage && <SplashScreen />}
      {source === allSource.FACEBOOK && !fbCode && !isLogining && (
        <iframe
          name="ydpage-iframe"
          className="ydpage-iframe"
          title="ydpage"
          src={getYdPageUrl()}
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      )}
      {source === allSource.FACEBOOK && fbCode && !isLogining && (
        <iframe
          name="ydpage-callback-iframe"
          className="ydpage-iframe"
          title="ydpage"
          src={`${YDPAGE_URL}auth/facebook/callback?code=${fbCode}`}
          style={{ width: "100%", height: "100%" }}
        ></iframe>
      )}
    </SocialStyled>
  );
};

export default YDpage;
