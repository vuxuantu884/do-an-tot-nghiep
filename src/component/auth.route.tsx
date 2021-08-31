import React from 'react';
import { Route } from 'react-router';
import Container from './container';

type AuthRouteProps = {
  path: string;
  component: any;
  exact: boolean;
  title: string;
} 

const AuthRoute: React.FC<AuthRouteProps> = (props: AuthRouteProps) => {
  const {title, path, component: Component} = props;
  return (
    <Route path={path}>
      <Container title={title}>
        <Component />
      </Container>
    </Route>
  );
}

export default AuthRoute;
