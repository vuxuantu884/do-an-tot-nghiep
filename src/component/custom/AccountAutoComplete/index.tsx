import {FormInstance, Select} from "antd";
import {HttpStatus} from "config/http-status.config";
import {unauthorizedAction} from "domain/actions/auth/auth.action";
import {AccountResponse} from "model/account/account.model";
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {useDispatch} from "react-redux";
import {searchAccountApi} from "service/accounts/account.service";
import {handleDelayActionWhenInsertTextInSearchInput} from "utils/AppUtils";
import {showError} from "utils/ToastUtils";
import CustomAutoComplete from "../autocomplete.cusom";
import {StyledComponent} from "./styles";

type PropType = {
  placeholder: string;
  form: FormInstance<any>;
  formFieldName: string;
  defaultValue?: string;
  storeAccountData: AccountResponse[];
  handleSelect?: (value: string) => void;
};

const AutoCompleteForwardRef = React.forwardRef(
  (props: any, ref: React.ForwardedRef<any>) => <div ref={ref}>{props.children}</div>
);

function AccountAutoComplete(props: PropType) {
  const {placeholder, form, formFieldName, defaultValue, storeAccountData, handleSelect} =
    props;
console.log('form', form)
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [data, setData] = useState<Array<AccountResponse>>([]);
  const inputRef: MutableRefObject<any> = useRef();
  const autoCompleteRef: MutableRefObject<any> = useRef();
  const dispatch = useDispatch();

  const onSearch = useCallback(
    (value: string) => {
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
        } else if (value === "") {
          setData(storeAccountData);
        }
      };

      handleDelayActionWhenInsertTextInSearchInput(inputRef, () => getAccounts(value));
    },
    [dispatch, storeAccountData]
  );

  // useEffect(() => {
  //   if (defaultValue) {
  //     searchAccountApi({
  //       info: defaultValue,
  //     })
  //       .then((response) => {
	// 				console.log('response', response)
	// 				console.log('defaultValue', defaultValue)
  //         if (response) {
  //           switch (response.code) {
  //             case HttpStatus.SUCCESS:
  //               if (data.length === 0 && storeAccountData.length > 0) {
	// 								storeAccountData.push(response.data.items[0]);
  //               }

  //               break;
  //             case HttpStatus.UNAUTHORIZED:
  //               dispatch(unauthorizedAction());
  //               break;
  //             default:
  //               response.errors.forEach((e) => showError(e));
  //               break;
  //           }
	// 					setData(storeAccountData);
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("error", error);
  //       })
  //   } 
  // }, [data.length, defaultValue, dispatch, form, formFieldName, storeAccountData]);

	// useEffect(() => {
	// 	let abc = () => {
	// 		console.log('data', data)
	// 		console.log('defaultValue', defaultValue)
	// 		 setData((data)=>storeAccountData);
	// 		setTimeout(() => {
	// 			 form.setFieldsValue({
	// 				reference_code: "YD9776",
	// 				marketer_code: "YD9776",
	// 			});
				
	// 		}, 2000);
	// 		setTimeout(() => {
	// 			console.log('form', form.getFieldValue("marketer_code"))
			 
	// 	 }, 2000);
	// 	};

	// 	abc()
	// }, [form, data, defaultValue, storeAccountData])


  return (
    <StyledComponent>
      <Select
        showSearch
        placeholder={placeholder}
        allowClear
        optionFilterProp="children"
        // onSearch={(value) => onSearch(value)}
				// key={Math.random()}
      >
        {storeAccountData.length > 0 &&
          storeAccountData.map((c) => (
            <Select.Option key={c.id} value={c.code}>
              {`${c.code} - ${c.full_name}`}
            </Select.Option>
          ))}
      </Select>
    </StyledComponent>
  );
}

export default AccountAutoComplete;
