import { FormInstance } from "antd";
import BaseResponse from "base/base.response";
import { StoreResponse } from "model/core/store.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createFilterConfigService,
  getFilterConfigService,
  updateFilterConfigService,
} from "service/core/config.service";
import { getStorePublicService } from "service/core/store.service";
import { handleFetchApiError, haveAccess, isFetchApiSuccessful } from "utils/AppUtils";
import { FILTER_CONFIG_TYPE } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";

function useHandleFilterConfigs(
  filterType: string,
  formAdvanceFilter: FormInstance<any>,
  onSuccessCallback: (res: BaseResponse<FilterConfig>) => void
) {
  const [filterConfigs, setFilterConfigs] = useState<Array<FilterConfig>>([]);
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const handleCreateFilter = useCallback(
    (request: FilterConfigRequest) => {
      createFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Tạo mới bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
        } else {
          handleFetchApiError(response, "Tạo mới bộ lọc", dispatch);
        }
      });
    },
    [dispatch, onSuccessCallback]
  );

  const handleUpdateFilter = useCallback(
    (request: FilterConfigRequest) => {
      updateFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Lưu bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
        } else {
          handleFetchApiError(response, "Lưu bộ lọc", dispatch);
        }
      });
    },
    [dispatch, onSuccessCallback]
  );

  const onSaveFilter = useCallback(
    (request: FilterConfigRequest) => {
      if (request) {
        let json_content = JSON.stringify(formAdvanceFilter.getFieldsValue(), function (k, v) {
          return v === undefined ? null : v;
        });
        request.type = filterType;
        request.json_content = json_content;

        if (request.id && request.id !== null) {
          const config = filterConfigs.find((e) => e.id.toString() === request.id.toString());
          if (filterConfigs && config) {
            request.name = config.name;
          }
          handleUpdateFilter(request);
        } else {
          handleCreateFilter(request);
        }
      }
    },
    [formAdvanceFilter, filterType, filterConfigs, handleUpdateFilter, handleCreateFilter]
  );

  useEffect(() => {
    let account = userReducer.account;
    if (account && account.code) {
      getFilterConfigService(account.code).then((response) => {
        if (isFetchApiSuccessful(response)) {
          if (response && response.data && response.data.length > 0) {
            const configFilters = response.data.filter((e) => e.type === filterType);
            setFilterConfigs(configFilters);
          } else {
            setFilterConfigs([]);
          }
        } else {
          handleFetchApiError(response, "Lấy dữ liệu bộ lọc", dispatch);
        }
      });
    }
  }, [dispatch, filterType, userReducer.account]);

  return {
    filterConfigs,
    onSaveFilter,
  };
}

export default useHandleFilterConfigs;
