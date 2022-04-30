import { Layout } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router";
import LoadingScreen from "screens/loading.screen";
import SidebarContainer from "./side-bar.container";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getBootstrapAction } from "domain/actions/content/bootstrap.action";
import classNames from "classnames";
import { saveSettingAction } from "domain/actions/app.action";
import SplashScreen from "screens/splash.screen";
import UrlConfig, { AccountUrl } from "config/url.config";
import HeaderContainer from "./header.container";
import { Helmet } from "react-helmet";
import { AppConfig } from "config/app.config";
import { showInfo } from "utils/ToastUtils";

type ContainerProps = {
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { children, title } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;

  const prefixTitle = () => {
    if (AppConfig.ENV === "DEV") {
      return "DEV - ";
    } else if (AppConfig.ENV === "UAT") {
      return "UAT - ";
    } else {
      return "";
    }
  }

  const isLogin = useSelector((state: RootReducerType) => state.userReducer.isLogin);
  const isLoadUser = useSelector((state: RootReducerType) => state.userReducer.isLoad);
  const isFirstChangePassword = useSelector((state: RootReducerType) => state.userReducer.account?.is_first_change_password);
  const isLoadBootstrap = useSelector((state: RootReducerType) => state.bootstrapReducer.isLoad);
  const collapsed = useSelector((state: RootReducerType) => Boolean(state.appSettingReducer.collapse));

  const [isShowHeader, setIsShowHeader] = useState<boolean>(false);

  const onCollapsed = useCallback(() => {
    dispatch(saveSettingAction({ collapse: !collapsed }));
  }, [collapsed, dispatch]);

  useEffect(() => {
    if (!isLoadBootstrap && isLogin) {
      dispatch(getBootstrapAction());
    }
  }, [dispatch, isLoadBootstrap, isLogin]);

  if (isLoadUser && !isLogin) {
    let returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Redirect to={`${UrlConfig.LOGIN}?returnUrl=${returnUrl}`} />;
  }

  if (!isLoadBootstrap) {
    return <SplashScreen />;
  }

  if (isLoadUser && isLogin && isFirstChangePassword && location.pathname !== AccountUrl.UPDATE_PASSWORD){
    showInfo("Bạn cần đổi mật khẩu lần đầu để tiếp tục sử dụng ứng dụng");
    return <Redirect to={AccountUrl.UPDATE_PASSWORD} />;
  }

  return (
    <Layout>
      <Helmet>
        <title>{prefixTitle() + title}</title>
      </Helmet>
      <LoadingScreen />
      <HeaderContainer
        onCollapse={onCollapsed}
        isShowHeader={isShowHeader}
        setIsShowHeader={(value: boolean) => setIsShowHeader(value)}
      />
      <Layout className={isShowHeader ? 'showHeader' : 'hideHeader'}>
        <SidebarContainer collapsed={collapsed} path={location.pathname} />
        <Layout.Content className={classNames("container", collapsed && "collapsed")}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default Container;
