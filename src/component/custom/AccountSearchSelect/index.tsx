import { Select } from "antd";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { AccountResponse } from "model/account/account.model";
import React, {
	MutableRefObject,
	useCallback, useRef
} from "react";
import { useDispatch } from "react-redux";
import { searchAccountApi } from "service/accounts/account.service";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";

type PropType = {
  placeholder: string;
  initValue?: string;
  dataToSelect: AccountResponse[];
  initDataToSelect: AccountResponse[];
  setDataToSelect: (value: AccountResponse[]) => void;
	[res:string]: any;
};

function AccountSearchSelect(props: PropType) {
  const {
    placeholder,
    initValue,
    dataToSelect,
		initDataToSelect,
    setDataToSelect,
		...rest
  } = props;
  const inputRef: MutableRefObject<any> = useRef();
  const dispatch = useDispatch();

  const onSearch = useCallback(
    (value: string) => {
      const getAccounts = (value: string) => {
        if (value.trim() !== "" && value.length >= 3) {
          searchAccountApi({
            info: value,
            limit: undefined,
          })
            .then((response) => {
              if (response) {
                switch (response.code) {
                  case HttpStatus.SUCCESS:
                    setDataToSelect(response.data.items);
                    break;
                  case HttpStatus.UNAUTHORIZED:
                    dispatch(unauthorizedAction());
                    break;
                  default:
                    response.errors.forEach((e) => showError(e));
                    break;
                }
              }
            })
            .catch((error) => {
              console.log("error", error);
            })
        } else if (value === "") {
          setDataToSelect(initDataToSelect)
        }
      };

      handleDelayActionWhenInsertTextInSearchInput(inputRef, () => getAccounts(value));
    },
    [setDataToSelect, dispatch, initDataToSelect]
  );

	const onClear = useCallback(
		() => {
			setDataToSelect(initDataToSelect)
		},
		[initDataToSelect, setDataToSelect],
	)

  return (
		<Select
			showSearch
			onSearch={onSearch}
			onClear={onClear}
			allowClear
			optionFilterProp="children"
			placeholder={placeholder}
			{...rest}
		>
			{dataToSelect.length > 0 &&
				dataToSelect.map((account) => (
					<Select.Option key={account.id} value={account.code}>
						{`${account.code} - ${account.full_name}`}
					</Select.Option>
				))}
		</Select>
  );
}

export default AccountSearchSelect;
