import {Layout} from 'antd';
import React, { useEffect } from 'react';
import { Redirect, useHistory } from 'react-router';
import LoadingScreen from 'screens/loading.screen';
import HeaderContainer from './header.container';
import './container.styles.scss';
import SlidebarContainer from './slide-bar.container';
import { useDispatch, useSelector } from 'react-redux';
import { RootReducerType } from 'model/reducers/RootReducerType';
import { getBootstrapAction } from 'domain/actions/content/bootstrap.action';

type ContainerProps = {
  title: string,
  header?: React.ReactNode
  children: React.ReactNode
  type: number,
  object: any 
}

const SplashScreen = React.lazy(() => import ('screens/splash.screen'));

const {Content} = Layout;
const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const {title, children, type, object} = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const { location } = history;
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const {isLogin, isLoad: isLoadUser} = userReducer;
  const {isLoad} = bootstrapReducer;
  useEffect(() => {
    if(!isLoad && isLogin) {
      dispatch(getBootstrapAction());
    }
  }, [dispatch, isLoad, isLogin])
  if(isLoadUser && !isLogin) {
    return <Redirect to={`/login?returnUrl=${location.pathname}`} />
  }
  if(!isLoad) {
    return <SplashScreen />
  }
  return (
    <div>
      <Layout style={{
        backgroundColor: 'white',
        minHeight: '100vh',
      }}>
        <SlidebarContainer path={location.pathname} />
        <Layout style={{
          backgroundColor: '#F4F4F7',
        }}>
          <HeaderContainer type={type} object={object} path={location.pathname} title={title} />
          <Content className="main-content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}

export default Container;