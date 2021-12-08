import { FormInstance } from "antd";
import { HttpStatus } from "config/http-status.config";
import { unauthorizedAction } from "domain/actions/auth/auth.action";
import { AccountResponse } from "model/account/account.model";
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { searchAccountApi } from "service/accounts/account.service";
import { handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import CustomAutoComplete from "../autocomplete.cusom";
import { StyledComponent } from "./styles";

type PropType = {
  placeholder: string;
  form: FormInstance<any>;
  formFieldName: string;
  defaultValue?: string;
  storeAccountData: AccountResponse[];
  handleSelect?: (value: string) => void;
};

const AutoCompleteForwardRef = React.forwardRef((props:any, ref:React.ForwardedRef<any>) => (
  <div ref={ref}>
    {props.children}
  </div>
));

function AccountAutoComplete(props: PropType) {
  const {placeholder, form, formFieldName, defaultValue, storeAccountData, handleSelect} = props;

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [data, setData] = useState<Array<AccountResponse>>([]);
  const inputRef: MutableRefObject<any> = useRef();
  const autoCompleteRef: MutableRefObject<any> = useRef();
	const dispatch = useDispatch();

  const onSearch = useCallback((value: string) => {
    const getAccounts = (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        setLoadingSearch(true);
        searchAccountApi({
          info: value,
          limit: undefined,
        })
          .then((response) => {
            if (response) {
							switch (response.code) {
								case HttpStatus.SUCCESS:
									setData(response.data.items);
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
          .finally(() => {
            setLoadingSearch(false);
          });
      } else if(value === "") {
				setData(storeAccountData)
			} 
    };
		
		handleDelayActionWhenInsertTextInSearchInput(inputRef, ()=>getAccounts(value));
  }, [dispatch, storeAccountData]);

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: AccountResponse, index: number) => {
      options.push({
        label: (
          <React.Fragment>
            {item.code} - {item.full_name}
          </React.Fragment>
        ),
        value: `${item.code} - ${item.full_name}`,
      });
    });
		console.log('data', data)
    return options;
  }, [data]);

  const onSelect = (value: string) => {
    form.setFieldsValue({
      [formFieldName]: value,
    });
    setLoadingSearch(false);
    handleSelect && handleSelect(value);
  };

	useEffect(() => {
		if(data.length === 0 && storeAccountData.length > 0) {
			setData(storeAccountData);
		}
	}, [data.length, storeAccountData])

  return (
    <StyledComponent>
			<AutoCompleteForwardRef ref={autoCompleteRef}>
				<CustomAutoComplete
					loading={loadingSearch}
					placeholder={placeholder}
					onSearch={onSearch}
					style={{width: "100%"}}
					showAdd={false}
					onSelect={onSelect}
					options={renderResult}
					isFillInputWithTextSelected
					defaultValue={defaultValue}
					defaultActiveFirstOption
				/>

			</AutoCompleteForwardRef>
    </StyledComponent>
  );
}

export default AccountAutoComplete;
