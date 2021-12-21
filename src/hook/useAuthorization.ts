import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";
export interface useAuthorizationProps {
  acceptPermissions?: Array<string>;
  not?: boolean;
}

useAuthorization.defautProps = {
  acceptPermissions: [],
  not: false,
};
function useAuthorization(props: useAuthorizationProps) {
  const { acceptPermissions, not } = props;
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer?.permissions
  );
    
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(checkUserPermission(acceptPermissions, currentRoles));
  }, [acceptPermissions, currentRoles]);

  return [allowed && !not];
}

export default useAuthorization
