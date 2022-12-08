import { FilterConfig } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFilterConfigService } from "service/core/config.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useFetchUserConfigs(countForceFetch?: number) {
  const [userConfigs, setUserConfigs] = useState<Array<FilterConfig>>([]);
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  useEffect(() => {
    let account = userReducer.account;
    if (account && account.code) {
      getFilterConfigService(account.code).then((response) => {
        if (isFetchApiSuccessful(response)) {
          if (response && response.data && response.data.length > 0) {
            setUserConfigs(response.data);
          } else {
            setUserConfigs([]);
          }
        } else {
          handleFetchApiError(response, "Lấy dữ liệu cài đặt người dùng", dispatch);
        }
      });
    }
  }, [dispatch, userReducer.account, countForceFetch]);

  return {
    userConfigs,
  };
}

export default useFetchUserConfigs;
