import { Select, Spin } from "antd";
import { AccountResponse } from "model/account/account.model";
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { searchAccountPublicApi } from "service/accounts/account.service";
import {
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
	removeMultiWhitespaceAndTrimText,
} from "utils/AppUtils";
import CustomSelect from "../select.custom";

type PropType = {
  placeholder: string;
  initValue?: string;
  dataToSelect: AccountResponse[];
  initDataToSelect: AccountResponse[];
  setDataToSelect: (value: AccountResponse[]) => void;
  [res: string]: any;
};

function AccountCustomSearchSelect(props: PropType) {
  const {
    placeholder,
    initValue,
    dataToSelect,
    initDataToSelect,
    setDataToSelect,
    ...rest
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const inputRef: MutableRefObject<any> = useRef();
  const dispatch = useDispatch();

  const onSearch = useCallback(
    (value: string) => {
      const getAccounts = (value: string) => {
        value = removeMultiWhitespaceAndTrimText(value);
        if (value.trim() !== "" && value.length >= 3) {
          setIsLoading(true);
          searchAccountPublicApi({
            condition: value,
            limit: undefined,
          })
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                setDataToSelect(response.data.items);
              } else {
                handleFetchApiError(response, "Danh sách tài khoản", dispatch);
              }
            })
            .catch((error) => {
              console.log("error", error);
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else if (value === "") {
          setDataToSelect(initDataToSelect);
        }
      };

      handleDelayActionWhenInsertTextInSearchInput(inputRef, () =>
        getAccounts(value),
      );
    },
    [setDataToSelect, dispatch, initDataToSelect],
  );

  const onClear = useCallback(() => {
    setDataToSelect(initDataToSelect);
  }, [initDataToSelect, setDataToSelect]);

  useEffect(() => {
    setDataToSelect(initDataToSelect);
  }, [initDataToSelect, setDataToSelect]);

  return (
    <CustomSelect
      loading={isLoading}
      showSearch
      showArrow
      onSearch={onSearch}
      onClear={onClear}
      allowClear
      optionFilterProp="children"
      placeholder={placeholder}
      notFoundContent={
        isLoading ? <Spin size="small" /> : "Không tìm thấy kết quả"
      }
      {...rest}
    >
      {dataToSelect.length > 0 &&
        dataToSelect.map((account) => (
          <Select.Option key={account.id} value={account.code}>
            {`${account.code} - ${account.full_name}`}
          </Select.Option>
        ))}
    </CustomSelect>
  );
}

export default AccountCustomSearchSelect;
