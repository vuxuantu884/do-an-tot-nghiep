import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  GetWarrantiesParamModelExtra,
  WarrantyItemModel,
  WarrantyItemStatus,
  WarrantyReturnStatusModel,
} from "model/warranty/warranty.model";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { TAB_STATUS_KEY } from "screens/warranty/history-list/WarrantyList";
import { getWarrantiesService } from "service/warranty/warranty.service";
import { generateQuery, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showError } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";

function useFetchWarranties(
  initQuery: GetWarrantiesParamModelExtra,
  location: any,
  countForceFetchData: number,
  setQuery: (data: GetWarrantiesParamModelExtra) => void,
  checkIfInvalidFilter: (values: any) => boolean,
) {
  const [warranties, setWarranties] = useState<Array<WarrantyItemModel>>([]);
  const [metadata, setMetaData] = useState({
    limit: 0,
    page: 0,
    total: 0,
  });
  const dispatch = useDispatch();
  const history = useHistory();
  const queryParamsParsed: any = queryString.parse(location.search);

  const getFullQuery = useCallback(() => {
    let result = {};
    if (!queryParamsParsed?.tab) {
      queryParamsParsed.tab = TAB_STATUS_KEY.new;
    }
    switch (queryParamsParsed?.tab) {
      case TAB_STATUS_KEY.new:
        return {
          ...queryParamsParsed,
          warranty_status: undefined,
          return_status: WarrantyReturnStatusModel.UNRETURNED,
          status: WarrantyItemStatus.RECEIVED,
        };
      case TAB_STATUS_KEY.finalized:
        return {
          ...queryParamsParsed,
          warranty_status: undefined,
          return_status: WarrantyReturnStatusModel.UNRETURNED,
          status: `${WarrantyItemStatus.FIXING},${WarrantyItemStatus.FIXED},${WarrantyItemStatus.NOT_FIXED}`,
        };
      case TAB_STATUS_KEY.finished:
        return {
          ...queryParamsParsed,
          warranty_status: undefined,
          return_status: WarrantyReturnStatusModel.RETURNED,
        };
      case TAB_STATUS_KEY.today:
        return {
          ...queryParamsParsed,
          from_appointment_date: moment().format(DATE_FORMAT.DD_MM_YYYY),
          to_appointment_date: moment().format(DATE_FORMAT.DD_MM_YYYY),
          warranty_status: undefined,
        };
      case TAB_STATUS_KEY.expired:
        return {
          ...queryParamsParsed,
          from_appointment_date: undefined,
          to_appointment_date: moment().subtract(1, "days").format(DATE_FORMAT.DD_MM_YYYY),
          warranty_status: undefined,
          return_status: WarrantyReturnStatusModel.UNRETURNED,
        };
      case TAB_STATUS_KEY.all:
        return {
          tab: undefined,
          warranty_status: undefined,
          from_appointment_date: undefined,
          to_appointment_date: undefined,
          return_status: undefined,
        };
      default:
        break;
    }

    return result;
  }, [queryParamsParsed]);

  const findId = useCallback(() => {
    if (queryParamsParsed?.query) {
      return {
        ...queryParamsParsed,
        warranty_status: undefined,
        from_appointment_date: undefined,
        to_appointment_date: undefined,
        return_status: undefined,
        status: undefined,
      };
    }
  }, [queryParamsParsed]);

  const findTab = (item: WarrantyItemModel) => {
    if (
      item.return_status === WarrantyReturnStatusModel.UNRETURNED &&
      item.status === WarrantyItemStatus.RECEIVED
    ) {
      return TAB_STATUS_KEY.new;
    } else if (
      item.return_status === WarrantyReturnStatusModel.UNRETURNED &&
      item.status === WarrantyItemStatus.FIXING
    ) {
      return TAB_STATUS_KEY.finalized;
    } else {
      return TAB_STATUS_KEY.finished;
    }
  };

  const fetchData = useCallback(() => {
    const fullQuery = getFullQuery();
    let isError = checkIfInvalidFilter(fullQuery);
    if (isError) {
      return;
    }
    let dataQuery = {
      ...initQuery,
      ...fullQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      ...findId(),
    };

    console.log("initQuery", initQuery);
    let result = {
      ...dataQuery,
      created_date: undefined,
      appointment_date: undefined,
      tab: undefined,
    };
    setQuery(dataQuery);
    dispatch(showLoading());
    getWarrantiesService(result)
      .then((response) => {
        console.log("response", response);
        if (isFetchApiSuccessful(response)) {
          setWarranties(response.data.items);
          setMetaData(response.data.metadata);
          if (queryParamsParsed?.query) {
            let newPrams = {
              ...queryParamsParsed,
              tab: findTab(response.data.items[0]),
              warranty_status: undefined,
              from_appointment_date: undefined,
              to_appointment_date: undefined,
            };
            let queryParam = generateQuery(newPrams);
            history.push(`${location.pathname}?${queryParam}`);
          } else {
          }
        } else {
          handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch);
        }
      })
      .catch((error) => {
        console.log("error.response", error.response);
        if (error?.response?.data?.message) {
          showError(error?.response?.data?.message);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }, [
    checkIfInvalidFilter,
    dispatch,
    findId,
    getFullQuery,
    history,
    initQuery,
    location.pathname,
    queryParamsParsed,
    setQuery,
  ]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setQuery, location.search, countForceFetchData]);

  return {
    warranties,
    metadata,
  };
}

export default useFetchWarranties;
