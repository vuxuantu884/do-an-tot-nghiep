import BaseResponse from "base/base.response";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";
import {
  createFilterConfigService,
  getFilterConfigService,
  updateFilterConfigService,
} from "service/core/config.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useHandleFilterColumns(
  columnType: string,
  onSuccessCallback?: (res: BaseResponse<FilterConfig>) => void
) {
  const [tableColumnConfigs, setTableColumnConfigs] = useState<Array<FilterConfig>>([]);
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
    [dispatch, onSuccessCallback]
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
    [dispatch, onSuccessCallback]
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
    ]
  );

  useEffect(() => {
    let account = userReducer.account;
    if (account && account.code) {
      getFilterConfigService(account.code).then((response) => {
        if (isFetchApiSuccessful(response)) {
          if (response && response.data && response.data.length > 0) {
            const configFilters = response.data.filter((e) => e.type === columnType);
            setTableColumnConfigs(configFilters);
          } else {
            setTableColumnConfigs([]);
          }
        } else {
          handleFetchApiError(response, "Lấy dữ liệu cột", dispatch);
        }
      });
    }
  }, [dispatch, columnType, userReducer.account]);

  return {
    tableColumnConfigs,
    onSaveConfigTableColumn,
  };
}

export default useHandleFilterColumns;
