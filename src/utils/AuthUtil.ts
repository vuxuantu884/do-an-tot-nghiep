import { UserPermissions } from "./Constants";

//returns true : can | false : can not
export const checkUserPermission = (
  acceptPermissions: Array<string> = [],
  currentPermissions: Array<string> = []
): boolean => {

  if (Array.isArray(acceptPermissions) && acceptPermissions?.length === 0) {
    return true;
  }

  if (
    Array.isArray(currentPermissions) &&
    currentPermissions?.includes(UserPermissions.ADMIN_ALL)
  ) {
    return true;
  }

  acceptPermissions.forEach((element) => {
    if (currentPermissions.includes(element)) {
      return true;
    }
  });

  return false;
};
