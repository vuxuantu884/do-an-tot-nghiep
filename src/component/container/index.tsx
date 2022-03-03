import {Layout} from "antd";
import React, {useCallback, useEffect} from "react";
import {Redirect, useHistory} from "react-router";
import LoadingScreen from "screens/loading.screen";
import SidebarContainer from "./side-bar.container";
import {useDispatch, useSelector} from "react-redux";
import {RootReducerType} from "model/reducers/RootReducerType";
import {getBootstrapAction} from "domain/actions/content/bootstrap.action";
import classNames from "classnames";
import {saveSettingAction} from "domain/actions/app.action";
import SplashScreen from "screens/splash.screen";
import UrlConfig from "config/url.config";
import HeaderContainer from "./header.container";
import {Helmet} from "react-helmet";

type ContainerProps = {
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const {children, title} = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const {location} = history;

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const collapsed = useSelector(
    (state: RootReducerType) => Boolean(state.appSettingReducer.collapse)
  );
  const {isLogin, isLoad: isLoadUser, account} = userReducer;
  const {isLoad} = bootstrapReducer;
  const onCollapsed = useCallback(() => {
    dispatch(saveSettingAction({collapse: !collapsed}));
  }, [collapsed, dispatch]);
  useEffect(() => {
    if (!isLoad && isLogin) {
      dispatch(getBootstrapAction());
    }
  }, [dispatch, isLoad, isLogin]);
  if (isLoadUser && !isLogin) {
    let returnUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Redirect to={`${UrlConfig.LOGIN}?returnUrl=${returnUrl}`} />;
  }
  if (!isLoad) {
    return <SplashScreen />;
  }
  return (
    <Layout>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <LoadingScreen />
      <HeaderContainer account={account} onCollapse={onCollapsed} />
      <Layout>
        <SidebarContainer collapsed={collapsed} path={location.pathname} />
        <Layout.Content className={classNames("container", collapsed && "collapsed")}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default Container;
