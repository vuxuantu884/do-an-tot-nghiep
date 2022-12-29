import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { TaxConfigResponse } from "model/core/tax.model";
import { getTaxConfigApi } from "service/core/tax.service";
import { callApiNative } from "utils/ApiUtils";

function useFetchTaxConfig() {
  const [taxConfig, setTaxConfig] = useState<TaxConfigResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>();
  const dispatch = useDispatch();

  const getTaxConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApiNative({ isShowError: true }, dispatch, getTaxConfigApi);
      setTaxConfig(response);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    getTaxConfig();
  }, [getTaxConfig]);

  return { taxConfig, isLoading, error, getTaxConfig };
}

export default useFetchTaxConfig;
