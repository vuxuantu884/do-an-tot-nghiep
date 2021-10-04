import { useAuthorizationProps } from "hook/useAuthorization";
import { RootReducerType } from "model/reducers/RootReducerType";
import { cloneElement, Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";

interface AuthWrapperProps extends useAuthorizationProps {
  children?: any;
  passThrough?: boolean; // send boolean value to children
}

AuthWrapper.defautProps = {
  not: false,
  passThrough: false,
};

function AuthWrapper(props: AuthWrapperProps) {
  const { acceptRoles, not, children, passThrough } = props;
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer?.modules?.permissions
  );

  const [allowed, setAllowed] = useState<boolean>(false);
  useEffect(() => {
    setAllowed(checkUserPermission(acceptRoles, currentRoles));
  }, [acceptRoles, currentRoles]);
  const isPassed = allowed && !not;
  return (
    <Fragment>
      {passThrough ? (
        cloneElement(children, isPassed)
      ) : isPassed ? (
        children
      ) : (
        <Fragment />
      )}
    </Fragment>
  );
}

export default AuthWrapper;
