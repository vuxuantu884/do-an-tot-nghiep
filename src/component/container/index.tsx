import {Layout} from 'antd';
import React from 'react';
import { useHistory } from 'react-router';
import LoadingScreen from 'screens/loading.screen';
import HeaderContainer from './header.container';
import './container.styles.scss';
import SlidebarContainer from './slide-bar.container';

type ContainerProps = {
  title: string,
  header?: React.ReactNode
  children: React.ReactNode
}

const SplashScreen = React.lazy(() => import ('screens/splash.screen'));

const {Content} = Layout;
const Container: React.FC<ContainerProps> = (props: ContainerProps) => {
  const {title, header, children} = props;
  const history = useHistory();
  const { location } = history;
  return (
    <div>
      <LoadingScreen />
      <Layout style={{
        backgroundColor: 'white',
        minHeight: '100vh',
      }}>
        <SlidebarContainer path={location.pathname} />
        <Layout style={{
          backgroundColor: '#F4F4F7',
        }}>
          <HeaderContainer path={location.pathname} title={title} />
          <Content style={{
            paddingLeft: 30,
            paddingRight: 30,
            paddingTop: 5,
            paddingBottom: 5
          }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </div>
  )
}

export default Container;