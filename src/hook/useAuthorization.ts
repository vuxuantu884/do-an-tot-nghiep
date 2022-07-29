import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";
export interface UseAuthorizationProps {
  acceptPermissions?: Array<string>;
  not?: boolean;
  acceptStoreIds?: Array<number>;
}

useAuthorization.defautProps = {
  acceptPermissions: [],
  not: false,
};
function useAuthorization(props: UseAuthorizationProps) {
  const { acceptPermissions, not, acceptStoreIds } = props;

  const [allowed, setAllowed] = useState<boolean>(false);
  const [isLoadingUserPermission, setIsLoadingUserPermission] = useState<boolean>(false);
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const currentStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  useEffect(() => {
    if (!currentPermissions) {
      setIsLoadingUserPermission(true);
      setAllowed(false);
    } else {
      setAllowed(
        checkUserPermission(acceptPermissions, currentPermissions, acceptStoreIds, currentStores),
      );
      setIsLoadingUserPermission(false);
    }
  }, [acceptPermissions, currentPermissions, acceptStoreIds, currentStores]);

  return [allowed && !not, isLoadingUserPermission];
}

export default useAuthorization;
