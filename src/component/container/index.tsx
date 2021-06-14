import { Layout } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router";
import LoadingScreen from "screens/loading.screen";
import HeaderContainer from "./header.container";

// import './container.styles.scss';
import SlidebarContainer from "./slide-bar.container";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getBootstrapAction } from "domain/actions/content/bootstrap.action";
import classNames from "classnames";
import { saveSettingAction } from "domain/actions/app.action";
import { useMemo } from "react";

type ContainerProps = {
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  type: number;
  object: any;
};

const SplashScreen = React.lazy(() => import("screens/splash.screen"));

const { Content } = Layout;
const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const { title, children, type, object } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const collapsed = useMemo(() => collapse ? collapse : false, [collapse])
  const { isLogin, isLoad: isLoadUser } = userReducer;
  const { isLoad } = bootstrapReducer;
  const onCollapsed = useCallback((b: boolean) => {
    dispatch(saveSettingAction({collapse: b}))
  }, [dispatch]);
  useEffect(() => {
    if (!isLoad && isLogin) {
      dispatch(getBootstrapAction());
    }
  }, [dispatch, isLoad, isLogin]);
  if (isLoadUser && !isLogin) {
    return <Redirect to={`/login?returnUrl=${location.pathname}`} />;
  }
  if (!isLoad) {
    return <SplashScreen />;
  }
  return (
    <Layout>
      <LoadingScreen />
      <SlidebarContainer
        collapsed={collapsed}
        setCollapsed={onCollapsed}
        path={location.pathname}
      />
      <Layout className={classNames("container", collapsed && "collapsed")}>
        <Content>
          <HeaderContainer
            type={type}
            object={object}
            path={location.pathname}
            title={title}
          />
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Container;
