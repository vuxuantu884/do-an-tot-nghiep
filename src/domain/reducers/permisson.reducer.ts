import { YodyAction } from "base/base.action";
import { PermissionType } from "domain/types/auth.type";

const intitalState = {
  permissions: null,
  user_id: null,
};

const permissionReducer = (state = intitalState, action: YodyAction) => {
  const { type, payload } = action;
  switch (type) {
    case PermissionType.GET_PROFILE_PERMISSION_SUCCESS:
      return payload;
    default:
      return state;
  }
};

export default permissionReducer;
