import { FormInstance } from "antd";
import BaseResponse from "base/base.response";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createFilterConfigService,
  deleteFilterConfigService,
  getFilterConfigService,
  updateFilterConfigService
} from "service/core/config.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";

function useHandleFilterConfigs(
  filterType: string,
  formRef: React.RefObject<FormInstance<any>>,
  filterParams?: {
    [key: string]: any
  },
  setTagActive?: (value: number | null ) => void,
  onSuccessCallback?: (res: BaseResponse<FilterConfig>) => void,
) {
  const [filterConfigs, setFilterConfigs] = useState<Array<FilterConfig>>([]);
  const [configId, setConfigId] = useState<number>();
  const [countForceFetch, setCountForceFetch] = useState<number>(0);
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const handleCreateFilter = useCallback(
    (request: FilterConfigRequest) => {
      createFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Tạo mới bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
          setCountForceFetch(countForceFetch + 1)
        } else {
          handleFetchApiError(response, "Tạo mới bộ lọc", dispatch);
        }
      });
    },
    [countForceFetch, dispatch, onSuccessCallback]
  );

  const handleUpdateFilter = useCallback(
    (request: FilterConfigRequest) => {
      updateFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Lưu bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
          setCountForceFetch(countForceFetch + 1)
        } else {
          handleFetchApiError(response, "Lưu bộ lọc", dispatch);
        }
      });
    },
    [countForceFetch, dispatch, onSuccessCallback]
  );

  const handleDeleteFilter = useCallback(
    (configId: number | undefined) => {
      if(configId) {
        deleteFilterConfigService(configId).then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess(`Xóa bộ lọc thành công`);
            setCountForceFetch(countForceFetch + 1)
          } else {
            handleFetchApiError(response, "Xóa bộ lọc", dispatch);
          }
        });

      }
    },
    [countForceFetch, dispatch]
  );

  const onSaveFilter = useCallback(
    (request: FilterConfigRequest) => {
      if (request) {
        let json_content = JSON.stringify(filterParams, function (k, v) {
          return v === undefined ? null : v;
        }, 1);
        console.log('json_content', json_content)
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
    [filterParams, filterType, filterConfigs, handleUpdateFilter, handleCreateFilter]
  );

  const onSelectFilterConfig = useCallback((id: number)=>{
    setTagActive && setTagActive(id);
    const filterConfig = filterConfigs.find(e=>e.id === id);
    if (filterConfig) {
      let json_content = JSON.parse(filterConfig.json_content);

      Object.keys(json_content).forEach(function(key, index) {
        if (json_content[key] == null) json_content[key] = undefined;
      }, json_content);
      formRef.current?.setFieldsValue(json_content);
      formRef.current?.submit();
    }
  },[filterConfigs, formRef, setTagActive]);

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
  }, [dispatch, filterType, userReducer.account, countForceFetch]);

  return {
    filterConfigs,
    onSaveFilter,
    handleDeleteFilter,
    configId,
    setConfigId,
    countForceFetch,
    setCountForceFetch,
    onSelectFilterConfig,
  };
}

export default useHandleFilterConfigs;
