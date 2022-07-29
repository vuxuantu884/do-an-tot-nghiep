import useAuthorization, { UseAuthorizationProps } from "hook/useAuthorization";
import { Fragment, ReactNode } from "react";

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

  const [isPassed, isLoadingUserPermission] = useAuthorization({
    acceptPermissions,
    acceptStoreIds,
    not,
  });

  if (passThrough && typeof children === "function") {
    /**@description : chuyển giá trị vào children function (kể cả có quyền hay không)
     *
     * @param isPassed: boolean : true nếu có quyền truy cập
     * @param isLoadingUserPermission: boolean : true nếu đang tải quyền truy cập
     * @returns function
     */
    return children(isPassed, isLoadingUserPermission);
  } else if (isPassed) {
    /**
     * @description : return component con khi có quyền truy cập
     */
    return children;
  } else {
    /**
     * @description : return component trống khi không có quyền truy cập
     */
    return <Fragment />;
  }
}

export default AuthWrapper;
