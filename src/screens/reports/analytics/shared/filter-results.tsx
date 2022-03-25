import { FilterOutlined } from "@ant-design/icons";
import { Button, FormInstance, Select } from "antd";
import _ from "lodash";
import { AnalyticDataQuery, AnalyticProperties } from "model/report/analytics.model";
import React, { useContext, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { executeAnalyticsQueryService } from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import { transformDateRangeToString } from "utils/ReportUtils";
import { fullTextSearch } from "utils/StringUtils";
import FilterAdvancedDrawer from "../../../../component/filter/filter-advanced-drawer";
import FilterAdvancedItem from "../../../../component/filter/filter-advanced-item";
import FilterAdvancedList from "../../../../component/filter/filter-advanced-list";
import { FilterResultStyle } from "../index.style";
import { ReportifyFormFields } from "./analytics-form";
import { AnalyticsContext } from "./analytics-provider";

type FilterData = {
  groupName: string
  groupLabel: Array<{ key: string, label: string }>
}

type Props = {
  properties: AnalyticProperties;
  form: FormInstance
};

function FilterResults({ properties, form }: Props) {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { cubeRef, metadata } = useContext(AnalyticsContext)
  const [optionList, setOptionList] = useState<any[]>([]);
  const [loadingInputs, setLoadingInputs] = useState<number[]>([]);

  const getOptionData = async (index: number, propertyField: string, keySearch?: string) => {
    //thêm loading
    setLoadingInputs([...loadingInputs, index]);
    //reset option list
    setOptionList([]);

    const timeRange = transformDateRangeToString(form.getFieldValue(ReportifyFormFields.timeRange))

    if (metadata && !_.isEmpty(timeRange) && cubeRef.current) {
      let firstAggregate = Object.keys(metadata.aggregates)[0]

      const query = `SHOW ${firstAggregate} BY ${propertyField} FROM ${cubeRef.current} 
      WHERE ${propertyField} ${keySearch ? " == '~" + keySearch + "'" : " != '' "} 
      SINCE ${timeRange?.from} UNTIL ${timeRange?.to} ORDER BY ${propertyField} ASC`;
      const response: AnalyticDataQuery = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q: query });
      if (response) {
        const data = response?.result.data.map((item: Array<any>) => ({ label: item[0], value: item[0] }))
        setOptionList(data)
      }

      //dừng loading
      setLoadingInputs((loadingInputs) => loadingInputs.filter((item) => item !== index));
    }

  }

  const handleSelectAllOptions = (propertyField: string, values: string) => {
    if (values.includes("")) {
      form.setFieldsValue({
        [ReportifyFormFields.where]: {
          [propertyField]: [""]
        }
      })
    }
  }

  const handleCancel = () => {
    setVisible(false);
  };

  const handleActive = () => {
    setVisible(true);
  };

  const handleClearFilter = () => {
    form.setFieldsValue({ [ReportifyFormFields.where]: {} });
  };

  const handleSubmit=()=>{
    form.submit();
    handleCancel();
  }
  // danh sách các input filter
  const propertiesFilter = useMemo(() => {
    let listProperties: Array<FilterData> = [];

    properties && Object.keys(properties)?.forEach((key) => {
      const currentProperty = properties[key];
      listProperties = [
        ...listProperties,
        {
          groupLabel: Object.keys(currentProperty).map((key) => {
            return {
              key: key,
              label: currentProperty[key]
            };
          }),
          groupName: key
        }
      ];

    });
    return listProperties;
  }, [properties])


  const renderFormItem = (
    item: any, //TODO: type item
    index: number,
  ) => (
    <FilterAdvancedItem col={1} key={item.key} name={[ReportifyFormFields.where, item.key]} label={item.label}>
      <Select
        className="filter-results__input"
        showSearch
        allowClear
        mode="multiple"
        maxTagCount={"responsive"}
        placeholder={"Tìm " + item.label.toLowerCase()}
        onFocus={(e) => {
          getOptionData(index, item.key)
        }
        }
        onChange={(value: string) => {
          handleSelectAllOptions(item.key, value)
        }}
        // onSearch={_.debounce((keySearch) => getOptionData(index, item.key, keySearch), AppConfig.TYPING_TIME_REQUEST)} 
        filterOption={(input, option) => fullTextSearch(input, option?.value)
        }
        options={[{ label: "Tất cả", value: "" }, ...optionList]}
        loading={loadingInputs.includes(index)}
      />
    </FilterAdvancedItem>
  );

  return (
    <div>
      <Button icon={<FilterOutlined />} onClick={handleActive}>
        Lọc kết quả
      </Button>
      <FilterAdvancedDrawer width={"400px"} visible={visible} onClose={handleCancel} onSubmit={handleSubmit} onClearFilter={handleClearFilter}>
        <FilterResultStyle>
        <div className="ant-form ant-form-vertical">
          {propertiesFilter.map((propertyGroup) =>
            <>
              <div className="divider-filter">
                <span className="divider-filter__name">
                  {propertyGroup.groupName}
                </span>
              </div>
              <FilterAdvancedList data={propertyGroup.groupLabel} renderItem={renderFormItem} />
            </>

          )}
        </div>
        </FilterResultStyle>
      </FilterAdvancedDrawer>
    </div>
  );
}

export default FilterResults;
