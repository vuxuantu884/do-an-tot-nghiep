import React, { Suspense } from "react";
import { Route } from "react-router";
import NoPermission from "screens/no-permission.screen";
import SplashScreen from "screens/splash.screen";
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
  const { title, path, component: Component, permissions, exact } = props;
  return (
    <Route sensitive  path={path} exact={exact}>
      <Container title={title}>
        <Suspense fallback={<SplashScreen />}>
          <AuthWrapper acceptPermissions={permissions} passThrough>
            {(allowed: boolean, isLoadingUserPermission: boolean ) => isLoadingUserPermission ? <SplashScreen/> : (allowed ? <Component /> : <NoPermission/>)}
          </AuthWrapper>
        </Suspense>
      </Container>
    </Route>
  );
};

export default AuthRoute;
