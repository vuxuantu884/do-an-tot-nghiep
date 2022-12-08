import { FormInstance } from "antd";
import BaseResponse from "base/base.response";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  createFilterConfigService,
  deleteFilterConfigService,
  updateFilterConfigService,
} from "service/core/config.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";

/**
 * version 2 update: tách fetch api
 * đối với trường hợp danh sách đơn hàng và danh sách trả hàng
 * có cả setting column và lưu bộ lọc
 * nó đều gọi chung api dẫn đến lặp api
 * handleForceFetchFilterConfigs: load lại api
 */
function useHandleFilterConfigsVersion2(
  filterConfigs: FilterConfig[],
  filterType: string,
  formRef: React.RefObject<FormInstance<any>>,
  handleForceFetchFilterConfigs: () => void,
  filterParams?: {
    [key: string]: any;
  },
  setTagActive?: (value: number | null) => void,
  onSuccessCallback?: (res: BaseResponse<FilterConfig>) => void,
) {
  const [configId, setConfigId] = useState<number>();
  const dispatch = useDispatch();

  const handleCreateFilter = useCallback(
    (request: FilterConfigRequest) => {
      createFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Tạo mới bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
          handleForceFetchFilterConfigs();
        } else {
          handleFetchApiError(response, "Tạo mới bộ lọc", dispatch);
        }
      });
    },
    [dispatch, handleForceFetchFilterConfigs, onSuccessCallback],
  );

  const handleUpdateFilter = useCallback(
    (request: FilterConfigRequest) => {
      updateFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          showSuccess(`Lưu bộ lọc thành công`);
          onSuccessCallback && onSuccessCallback(response);
          handleForceFetchFilterConfigs();
        } else {
          handleFetchApiError(response, "Lưu bộ lọc", dispatch);
        }
      });
    },
    [dispatch, handleForceFetchFilterConfigs, onSuccessCallback],
  );

  const handleDeleteFilter = useCallback(
    (configId: number | undefined) => {
      if (configId) {
        deleteFilterConfigService(configId).then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess(`Xóa bộ lọc thành công`);
            handleForceFetchFilterConfigs();
          } else {
            handleFetchApiError(response, "Xóa bộ lọc", dispatch);
          }
        });
      }
    },
    [dispatch, handleForceFetchFilterConfigs],
  );

  const onSaveFilter = useCallback(
    (request: FilterConfigRequest) => {
      if (request) {
        let json_content = JSON.stringify(
          filterParams,
          function (k, v) {
            return v === undefined ? null : v;
          },
          1,
        );
        console.log("json_content", json_content);
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
    [filterParams, filterType, filterConfigs, handleUpdateFilter, handleCreateFilter],
  );

  const onSelectFilterConfig = useCallback(
    (id: number) => {
      setTagActive && setTagActive(id);
      const filterConfig = filterConfigs.find((e) => e.id === id);
      if (filterConfig) {
        let json_content = JSON.parse(filterConfig.json_content);

        Object.keys(json_content).forEach(function (key, index) {
          if (json_content[key] == null) json_content[key] = undefined;
        }, json_content);
        formRef.current?.setFieldsValue(json_content);
        formRef.current?.submit();
      }
    },
    [filterConfigs, formRef, setTagActive],
  );

  return {
    filterConfigs,
    onSaveFilter,
    handleDeleteFilter,
    configId,
    setConfigId,
    onSelectFilterConfig,
  };
}

export default useHandleFilterConfigsVersion2;
