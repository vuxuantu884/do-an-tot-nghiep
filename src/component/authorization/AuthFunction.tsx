import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { checkUserPermission } from "utils/AuthUtil";



function AuthFunction(permission: string) {
  
  const currentRoles: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions
  );

  const [allowed, setAllowed] = useState<boolean>(false);
  useEffect(() => {
    setAllowed(checkUserPermission([permission], currentRoles));
  }, [currentRoles, permission]);

  return allowed
}

export default AuthFunction;