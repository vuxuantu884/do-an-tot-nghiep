import { hideLoading, showLoading } from "domain/actions/loading.action";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getWarrantyCountService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";

function useGetWarrantyCount(params: string[]) {
  const [warrantyCount, setWarrantyCount] = useState<Array<number>>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(showLoading());
    getWarrantyCountService(params)
      .then((response) => {
        console.log("response", response);
        if (isFetchApiSuccessful(response)) {
          setWarrantyCount(response.data);
        } else {
          handleFetchApiError(response, "Danh sách lịch sử bảo hành", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }, [dispatch, params]);

  return warrantyCount
}

export default useGetWarrantyCount;
