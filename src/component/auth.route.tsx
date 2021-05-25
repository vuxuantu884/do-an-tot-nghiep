import React from 'react';
import { Route } from 'react-router';
import Container from './container';

type AuthRouteProps = {
  path: string;
  component: any;
  exact: boolean;
  title: string;
  type: number;
  object: any;
} 

const AuthRoute: React.FC<AuthRouteProps> = (props: AuthRouteProps) => {
  const {title, path, component: Component, type, object} = props;
  return (
    <Route path={path}>
      <Container type={type} object={object} title={title}>
        <Component />
      </Container>
    </Route>
  );
}

export default AuthRoute;
