import {Layout} from 'antd';
import React, {useCallback, useEffect} from 'react';
import {Redirect, useHistory} from 'react-router';
import LoadingScreen from 'screens/loading.screen';
import SlidebarContainer from './slide-bar.container';
import {useDispatch, useSelector} from 'react-redux';
import {RootReducerType} from 'model/reducers/RootReducerType';
import {getBootstrapAction} from 'domain/actions/content/bootstrap.action';
import classNames from 'classnames';
import {saveSettingAction} from 'domain/actions/app.action';
import {useMemo} from 'react';
import SplashScreen from 'screens/splash.screen';
import UrlConfig from 'config/UrlConfig';
import HeaderContainer from './header.container';

type ContainerProps = {
  title: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  type: number;
  object: any;
};

const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const {children} = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const {location} = history;
  
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const collapsed = useMemo(() => (collapse ? collapse : false), [collapse]);
  const {isLogin, isLoad: isLoadUser, account} = userReducer;
  const {isLoad} = bootstrapReducer;
  const onCollapsed = useCallback(
    () => {
      dispatch(saveSettingAction({collapse: !collapsed}));
    },
    [collapsed, dispatch]
  );
  useEffect(() => {
    if (!isLoad && isLogin) {
      dispatch(getBootstrapAction());
    }
  }, [dispatch, isLoad, isLogin]);
  if (isLoadUser && !isLogin) {
    return (
      <Redirect to={`${UrlConfig.LOGIN}?returnUrl=${location.pathname}`} />
    );
  }
  if (!isLoad) {
    return <SplashScreen />;
  }
  return (
    <Layout>
      <LoadingScreen />
      <HeaderContainer account={account} onCollapse={onCollapsed} />
      <Layout>
        <SlidebarContainer
          collapsed={collapsed}
          path={location.pathname}
        />
        <Layout.Content className={classNames('container', collapsed && 'collapsed')}>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default Container;
