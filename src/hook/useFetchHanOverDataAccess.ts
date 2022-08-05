import { HandoverResponse } from "model/handover/handover.response";
import { HandoverSearchRequest } from "model/handover/handover.search";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { HandoverTransfer } from "screens/order-online/handover/handover.config";
import { searchHandoverService } from "service/handover/handover.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";

const dateFormat = DATE_FORMAT.DD_MM_YYYY;

const fromDate = moment().startOf("day").subtract(3, "days").format(dateFormat);
const toDate = moment().endOf("day").format(dateFormat);

const handOverRequest: HandoverSearchRequest = {
  from_created_date: fromDate,
  to_created_date: toDate,
  types: [HandoverTransfer],
  limit: 1000,
  page: 1,
};

function useFetchHanOverDataAccess() {
  const [listHandOvers, setListHandOvers] = useState<HandoverResponse[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    searchHandoverService(handOverRequest)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          setListHandOvers(response.data.items);
        } else {
          handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch);
        }
      })
      .catch()
      .finally(() => {});
  }, [dispatch]);

  return listHandOvers;
}

export default useFetchHanOverDataAccess;
