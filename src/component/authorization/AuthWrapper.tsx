import { UseAuthorizationProps } from "hook/useAuthorization";
import { RootReducerType } from "model/reducers/RootReducerType";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";

interface AuthWrapperProps extends UseAuthorizationProps {
  children: ReactNode;
  passThrough?: boolean; // send boolean value to children
}

AuthWrapper.defautProps = {
  not: false,
  passThrough: false,
};

function AuthWrapper(props: AuthWrapperProps) {
  const { acceptPermissions, not, children, passThrough, acceptStoreIds } = props;

  const [allowed, setAllowed] = useState<boolean>(false);
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions
  );

  const currentStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores
  );

  useEffect(() => {
    setAllowed(checkUserPermission(acceptPermissions, currentPermissions, acceptStoreIds, currentStores));
  }, [acceptPermissions, currentPermissions, acceptStoreIds, currentStores]);

  const isPassed = allowed && !not;
  const elements = typeof children === "function" ? children(isPassed) : children;
  return <Fragment>{passThrough ? elements : isPassed ? children : <Fragment />}</Fragment>;
}

export default AuthWrapper;
