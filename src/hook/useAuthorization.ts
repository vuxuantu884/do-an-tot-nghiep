import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";
export interface useAuthorizationProps {
  acceptRoles?: Array<string>;
  not?: boolean;
}

useAuthorization.defautProps = {
  acceptRoles: [],
  not: false,
};
function useAuthorization(props: useAuthorizationProps) {
  const { acceptRoles, not } = props;
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer?.modules?.permissions
  );

  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(checkUserPermission(acceptRoles, currentRoles));
  }, [acceptRoles, currentRoles]);

  return [allowed && !not];
}

export default useAuthorization;
