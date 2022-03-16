import { useState } from "react";
import {
  AccountPublicSearchQuery,
  MerchandiserSelectResponse,
} from "../model/account/account.model";
import { callApiNative } from "../utils/ApiUtils";
import { searchAccountPublicApi } from "../service/accounts/account.service";
import { useDispatch } from "react-redux";
import useEffectOnce from "react-use/lib/useEffectOnce";

const PAGE = 1;
const PAGE_LIMIT = 30;
export const useFetchMerchans = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>();

  const [merchans, setMerchans] = useState<MerchandiserSelectResponse>({
    metadata: {
      limit: PAGE_LIMIT,
      page: PAGE,
      total: 0,
    },
    items: [],
  });

  useEffectOnce(() => {
    fetchMerchans(merchans.metadata);
  });

  const fetchMerchans = async (query: AccountPublicSearchQuery) => {
    setIsLoading(true);
    try {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        searchAccountPublicApi,
        { ...merchans.metadata, ...query }
      );
      setMerchans(response);
    } catch (err) {
      console.error(err);
      setErrors(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoadingMerchans: isLoading, merchans, setMerchans, fetchMerchans, errors };
};
