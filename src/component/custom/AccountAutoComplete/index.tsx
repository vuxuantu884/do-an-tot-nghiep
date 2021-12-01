import { FormInstance } from "antd";
import { AccountResponse } from "model/account/account.model";
import React, { useCallback, useMemo, useState } from "react";
import { searchAccountApi } from "service/accounts/account.service";
import CustomAutoComplete from "../autocomplete.cusom";
import { StyledComponent } from "./styles";

type PropType = {
  placeholder: string;
	form: FormInstance<any>
  formFieldName: string;
  defaultValue?: string;
  handleSelect?: () => void;
};
function AccountAutoComplete(props: PropType) {
  const {
    placeholder,
		form,
		formFieldName,
		defaultValue,
		handleSelect
  } = props;

	const [loadingSearch, setLoadingSearch] = useState(false);
	const [data, setData] = useState<Array<AccountResponse>>([]);

  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        setLoadingSearch(true);
				searchAccountApi(
					{
						info: value,
						limit: undefined,
					}
				).then ((response) => {
					console.log('response', response)
					if(response) {
						setData(response.data.items);
					}
				})
      } else {
        setData([]);
      }
    },
    []
  );

	const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: AccountResponse, index: number) => {
      options.push({
        label: <React.Fragment>{item.code} - {item.full_name}</React.Fragment>,
        value: `${item.code} - ${item.full_name}`,
      });
    });
    return options;
  }, [data]);

	const onSelect = (value: string) => {
		console.log('value', value);
		form.setFieldsValue({
			[formFieldName]: value,
		});
		console.log('form.getFieldValue(formFieldName)', form.getFieldValue(formFieldName));
		setLoadingSearch(false);
		handleSelect && handleSelect();
	};

  return (
    <StyledComponent>
      <CustomAutoComplete
				loading={loadingSearch}
				dropdownClassName="product"
				placeholder={placeholder}
				onSearch={onSearch}
				style={{ width: "100%" }}
				showAdd={false}
				onSelect={onSelect}
				options={renderResult}
				isFillInputWithTextSelected
				defaultValue = {defaultValue}
			/>
    </StyledComponent>
  );
}

export default AccountAutoComplete;
