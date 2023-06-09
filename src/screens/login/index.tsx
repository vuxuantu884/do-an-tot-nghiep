import { useCallback, useEffect, useState } from "react";
import { Redirect } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { loginRequestAction } from "domain/actions/auth/auth.action";
import { useQuery } from "utils/useQuery";
import UrlConfig from "config/url.config";
import { AppConfig, hotlineCBNumber, hotlineNumber } from "config/app.config";
import { LoginWeb } from "./LoginWeb";
import { LoginMobile } from "./LoginMobile";

const Login = () => {
  const query = useQuery();
  const dispatch = useDispatch();

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  //page state
  const [isTabletMobileScreen, setIsTabletMobileScreen] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    if (
      screenWidth < 900 ||
      ((AppConfig.ENV === "DEV" || AppConfig.ENV === "UAT") && screenWidth < 1100)
    ) {
      setIsTabletMobileScreen(true);
    } else {
      setIsTabletMobileScreen(false);
    }
  }, [screenWidth]);

  const [loading, setLoading] = useState(false);
  let { isLogin } = userReducer;
  const onFinish = useCallback(
    (values) => {
      dispatch(loginRequestAction(values.username, values.password, setLoading));
    },
    [dispatch],
  );
  if (isLogin) {
    let url = query.get("returnUrl");
    if (url?.startsWith("http://") || url?.startsWith("https://")) {
      window.location.href = url;
      return null;
    }
    return <Redirect to={url !== null ? url : UrlConfig.HOME} />;
  }
  window.onresize = () => {
    setScreenWidth(window.innerWidth);
  };

  const callHotlineSupport = () => {
    window.location.href = `tel:${hotlineNumber}`;
  };

  const callHotlineCBSupport = () => {
    window.location.href = `tel:${hotlineCBNumber}`;
  };

  return (
    <>
      {window.screen.width <= 992 ? (
        <LoginMobile
          callHotlineSupport={callHotlineSupport}
          callHotlineCBSupport={callHotlineCBSupport}
          onFinish={onFinish}
          loading={loading}
        />
      ) : (
        <LoginWeb
          callHotlineCBSupport={callHotlineCBSupport}
          callHotlineSupport={callHotlineSupport}
          onFinish={onFinish}
          loading={loading}
        />
      )}
    </>
  );
};

export default Login;
