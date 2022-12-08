import BaseResponse from "base/base.response";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";
import { createFilterConfigService, updateFilterConfigService } from "service/core/config.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";

/**
 * version 2 update: tách fetch api
 * đối với trường hợp danh sách đơn hàng và danh sách trả hàng
 * có cả setting column và lưu bộ lọc
 * nó đều gọi chung api dẫn đến lặp api
 */
function useHandleTableColumnsVersion2(
  tableColumnConfigs: FilterConfig[],
  columnType: COLUMN_CONFIG_TYPE,
  onSuccessCallback?: (res: BaseResponse<FilterConfig>) => void,
) {
  const dispatch = useDispatch();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const handleCreateColumn = useCallback(
    (request: FilterConfigRequest) => {
      createFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          onSuccessCallback && onSuccessCallback(response);
        } else {
          handleFetchApiError(response, "Tạo mới cài đặt cột", dispatch);
        }
      });
    },
    [dispatch, onSuccessCallback],
  );

  const handleUpdateColumn = useCallback(
    (request: FilterConfigRequest) => {
      updateFilterConfigService(request).then((response) => {
        if (isFetchApiSuccessful(response)) {
          onSuccessCallback && onSuccessCallback(response);
        } else {
          handleFetchApiError(response, "Lưu cài đặt cột", dispatch);
        }
      });
    },
    [dispatch, onSuccessCallback],
  );

  const onSaveConfigTableColumn = useCallback(
    (data: Array<ICustomTableColumType<any>>) => {
      let config = tableColumnConfigs.find((e) => e.type === columnType) as FilterConfigRequest;
      if (!config) config = {} as FilterConfigRequest;
      const newData = data.map((single) => {
        const { render, title, ...rest } = single;
        return {
          ...rest,
        };
      });
      const json_content = JSON.stringify(newData);
      config.type = columnType;
      config.json_content = json_content;
      config.name = `${userReducer.account?.code}_config_${columnType}`;
      if (config && config.id && config.id !== null) {
        handleCreateColumn(config);
      } else {
        handleUpdateColumn(config);
      }
    },
    [
      tableColumnConfigs,
      userReducer.account?.code,
      columnType,
      handleCreateColumn,
      handleUpdateColumn,
    ],
  );

  return {
    tableColumnConfigs,
    onSaveConfigTableColumn,
  };
}

export default useHandleTableColumnsVersion2;
