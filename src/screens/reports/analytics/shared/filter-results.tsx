import { FilterOutlined } from "@ant-design/icons";
import { Button, FormInstance, Select } from "antd";
import { fieldsTypeNumber } from "config/report";
import _, { isEmpty } from "lodash";
import { AnalyticDataQuery, AnalyticProperties } from "model/report/analytics.model";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { executeAnalyticsQueryService } from "service/report/analytics.service";
import { callApiNative } from "utils/ApiUtils";
import { getTranslatePropertyKey, transformDateRangeToString } from "utils/ReportUtils";
import { searchNumberString } from "utils/StringUtils";
import FilterAdvancedDrawer from "../../../../component/filter/filter-advanced-drawer";
import FilterAdvancedItem from "../../../../component/filter/filter-advanced-item";
import FilterAdvancedList from "../../../../component/filter/filter-advanced-list";
import { FilterResultStyle } from "../index.style";
import { ReportifyFormFields } from "./analytics-form";
import { AnalyticsContext } from "./analytics-provider";

type FilterData = {
  groupName: string;
  groupLabel: Array<{ key: string; label: string }>;
};

type Props = {
  properties: AnalyticProperties;
  form: FormInstance;
};

function FilterResults({ properties, form }: Props) {
  const [visible, setVisible] = useState(false);
  const dispatch = useDispatch();
  const { metadata, activeFilters, setActiveFilters, dataQuery } = useContext(AnalyticsContext);
  const [listFetchOptions, setListFetchOptions] = useState<any[]>([]);
  const [loadingInputs, setLoadingInputs] = useState<number[]>([]);
  const [additionalOptions, setAdditionalOptions] = useState<any>();
  const [finalOptions, setFinalOptions] = useState<any[]>();

  const ALL_OPTION = { label: `Tất cả`, value: "" };

  const shouldAddOption = useCallback((keySearch: string, listOption: any[]) => {
    return listOption.every((item) => item.value !== keySearch);
  }, []);

  const getOptionData = async (index: number, propertyField: string, keySearch?: string) => {
    setAdditionalOptions(null);
    //thêm loading
    setLoadingInputs([...loadingInputs, index]);

    const timeRange = transformDateRangeToString(form.getFieldValue(ReportifyFormFields.timeRange));

    if (metadata && !_.isEmpty(timeRange) && dataQuery?.query.cube) {
      let firstAggregate = Object.keys(metadata.aggregates)[0];

      const query =
        `SHOW ${firstAggregate} BY ${propertyField} FROM ${dataQuery.query.cube} ` +
        (!fieldsTypeNumber.includes(propertyField)
          ? `WHERE ${propertyField} ${keySearch ? " == '~" + keySearch + "'" : " != '' "} `
          : "") +
        `SINCE ${timeRange?.from} UNTIL ${timeRange?.to} ORDER BY ${propertyField} ASC`;
      const response: AnalyticDataQuery = await callApiNative(
        { isShowError: true },
        dispatch,
        executeAnalyticsQueryService,
        { q: query },
      );
      if (response) {
        const data = response?.result.data.map((item: Array<any>) => ({
          label: item[0],
          value: item[0],
        }));
        setListFetchOptions(data);
        setFinalOptions(() => {
          //rất xin lỗi vì code bẩn, hôm nay em mất trí
          const additionalOpt =
            additionalOptions?.value &&
            shouldAddOption(additionalOptions.value, [
              ...data,
              {
                label: additionalOptions.value,
                value: additionalOptions.value,
              },
            ])
              ? additionalOptions
              : null;
          return additionalOpt ? [ALL_OPTION, ...data, additionalOpt] : [ALL_OPTION, ...data];
        });
      } else {
        //reset option list, để phần reset vào trong cho ui mượt, nếu reset trước khi fetch data thì bị giật
        setListFetchOptions([]);
      }

      //dừng loading
      setLoadingInputs((loadingInputs) => loadingInputs.filter((item) => item !== index));
    } else {
      //reset option list, để phần reset vào trong cho ui mượt, nếu reset trước khi fetch data thì bị giật
      setListFetchOptions([]);
    }
  };

  const handleSelectAllOptions = (propertyField: string, values: string) => {
    if (values.includes("")) {
      form.setFieldsValue({
        [ReportifyFormFields.where]: {
          [propertyField]: [""],
        },
      });
    } else if (!isEmpty(additionalOptions) && values.includes(additionalOptions?.value)) {
      setFinalOptions(() => {
        const additionalOpt =
          additionalOptions?.value && shouldAddOption(additionalOptions.value, listFetchOptions)
            ? additionalOptions
            : null;
        return additionalOpt
          ? [
              ALL_OPTION,
              ...listFetchOptions,
              { label: additionalOpt.value, value: additionalOpt.value },
            ]
          : [ALL_OPTION, ...listFetchOptions];
      });
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleActive = () => {
    setVisible(true);
  };

  const handleClearFilter = () => {
    form.setFieldsValue({ [ReportifyFormFields.where]: undefined });
  };

  const addAdditionalOptions = (propertyField: string, keySearch: string) => {
    const isSelected = form
      .getFieldValue([ReportifyFormFields.where, propertyField])
      ?.includes(keySearch);
    if (shouldAddOption(keySearch, listFetchOptions) && !isSelected) {
      const opt = { label: `Thêm '${keySearch}'`, value: keySearch };
      setAdditionalOptions(opt);
      setFinalOptions([ALL_OPTION, ...listFetchOptions, opt]);
    } else {
      setAdditionalOptions(null);
      setFinalOptions([ALL_OPTION, ...listFetchOptions]);
    }
  };

  const handleSubmit = () => {
    const fieldWhereValue = form.getFieldValue(ReportifyFormFields.where);
    if (Object.keys(fieldWhereValue).length) {
      Object.keys(fieldWhereValue).forEach((key: string) => {
        const value = fieldWhereValue[key];
        if (value && Array.isArray(value) && value.length) {
          if (value.length === 1 && value[0] === "") {
            setActiveFilters(
              activeFilters.set(key, {
                value: ["Tất cả"],
                title: metadata ? getTranslatePropertyKey(metadata, key) : key,
              }),
            );
          } else {
            setActiveFilters(
              activeFilters.set(key, {
                value: fieldWhereValue[key],
                title: metadata ? getTranslatePropertyKey(metadata, key) : key,
              }),
            );
          }
        } else {
          activeFilters.delete(key);
          setActiveFilters(activeFilters);
        }
      });
    }
    form.submit();
    handleCancel();
  };
  // danh sách các input filter
  const propertiesFilter = useMemo(() => {
    let listProperties: Array<FilterData> = [];

    properties &&
      Object.keys(properties)?.forEach((key) => {
        const currentProperty = properties[key];
        listProperties = [
          ...listProperties,
          {
            groupLabel: Object.keys(currentProperty).map((key) => {
              return {
                key: key,
                label: currentProperty[key],
              };
            }),
            groupName: key,
          },
        ];
      });
    return listProperties;
  }, [properties]);

  const renderFormItem = (
    item: any, //TODO: type item
    index: number,
  ) => (
    <FilterAdvancedItem
      col={1}
      key={item.key}
      name={[ReportifyFormFields.where, item.key]}
      label={item.label}
    >
      <Select
        className="filter-results__input"
        showSearch
        allowClear
        mode="multiple"
        maxTagCount={"responsive"}
        placeholder={"Tìm " + item.label.toLowerCase()}
        onFocus={(e) => {
          getOptionData(index, item.key);
        }}
        onChange={(value: string) => {
          handleSelectAllOptions(item.key, value);
        }}
        onSearch={(value) => addAdditionalOptions(item.key, value)}
        filterOption={(input, option) => {
          return option?.label && input
            ? searchNumberString(input, option?.label as string)
            : false;
        }}
        options={finalOptions}
        loading={loadingInputs.includes(index)}
      />
    </FilterAdvancedItem>
  );

  return (
    <div>
      <Button icon={<FilterOutlined />} onClick={handleActive} type="primary" ghost>
        Lọc kết quả
      </Button>
      <FilterAdvancedDrawer
        width={"400px"}
        visible={visible}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        onClearFilter={handleClearFilter}
      >
        <FilterResultStyle>
          <div className="ant-form ant-form-vertical">
            {propertiesFilter.map((propertyGroup, index) => (
              <React.Fragment key={index}>
                <div className="divider-filter">
                  <span className="divider-filter__name">{propertyGroup.groupName}</span>
                </div>
                <FilterAdvancedList data={propertyGroup.groupLabel} renderItem={renderFormItem} />
              </React.Fragment>
            ))}
          </div>
        </FilterResultStyle>
      </FilterAdvancedDrawer>
    </div>
  );
}

export default FilterResults;
