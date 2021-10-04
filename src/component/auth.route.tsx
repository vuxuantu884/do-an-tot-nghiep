import React from "react";
import { Route } from "react-router";
import AuthWrapper from "./authorization/AuthWrapper";
import Container from "./container";

type AuthRouteProps = {
  path: string;
  component: any;
  exact: boolean;
  title: string;
  permissions?: string[];
};

const AuthRoute: React.FC<AuthRouteProps> = (props: AuthRouteProps) => {
  const { title, path, component: Component, permissions } = props;
  return (
    <Route path={path}>
      <Container title={title}>
        <AuthWrapper acceptPermissions={permissions}>
          <Component />
        </AuthWrapper>
      </Container>
    </Route>
  );
};

export default AuthRoute;
