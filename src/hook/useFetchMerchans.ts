import { useState } from "react";
import { AccountPublicSearchQuery, AccountResponse } from "../model/account/account.model";
import { callApiNative } from "../utils/ApiUtils";
import { searchAccountPublicApi } from "../service/accounts/account.service";
import { useDispatch } from "react-redux";
import { PageResponse } from "../model/base/base-metadata.response";
import useEffectOnce from "react-use/lib/useEffectOnce";

export const useFetchMerchans = () => {
  const dispatch = useDispatch();
  const [isLoadingMerchans, setIsLoadingMerchans] = useState(false);
  const [errors, setErrors] = useState<any>();

  const [merchans, setMerchans] = useState<PageResponse<AccountResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  useEffectOnce(() => {
    fetchMerchans(merchans.metadata)
  })

  const fetchMerchans = async (query: AccountPublicSearchQuery) => {
    setIsLoadingMerchans(true);
    try {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchAccountPublicApi,
        { ...merchans.metadata, ...query }
      );
      setMerchans(response);
      setIsLoadingMerchans(false);
    } catch (err) {
      console.error(err);
      setErrors(err);
    }
  };

  return { isLoadingMerchans, merchans, setMerchans, fetchMerchans, errors };
};
