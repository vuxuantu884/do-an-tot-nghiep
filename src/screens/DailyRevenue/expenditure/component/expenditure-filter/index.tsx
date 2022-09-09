import { SettingOutlined } from "@ant-design/icons";
import search from "assets/img/search.svg";
import { Button, DatePicker, Form, Input, Select, Tag } from "antd";
import { FormInstance } from "antd/es/form/Form";
import CustomSelect from "component/custom/select.custom";
import BaseFilter from "component/filter/base.filter";
import CustomFilter from "component/table/custom.filter";
import { StoreResponse } from "model/core/store.model";
import { ExpenditureSearchQuery } from "model/revenue/expenditure.model";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./style";
import FilterArrayToString from "screens/DailyRevenue/components/Filter/filter-array-to-string";
import { Link } from "react-router-dom";
import { FilterModel } from "screens/DailyRevenue/components/Filter/model";
import UrlConfig from "config/url.config";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import moment from "moment";
import { formatDateTimeOrderFilter, getTimeFormatOrderFilterTag } from "utils/OrderUtils";

type Props = {
  stores: StoreResponse[];
  params?: ExpenditureSearchQuery;
  onFilter?: (values: any | Object) => void;
};

type ListFilterTagTypes = {
  key: string;
  name: string;
  value: JSX.Element | null;
  isExpand?: boolean;
};

const dateFormat = DATE_FORMAT.DDMMYYY;

const ExpenditureFilter: React.FC<Props> = (props: Props) => {
  const { params, onFilter, stores } = props;
  const formSearchRef = createRef<FormInstance>();
  const formSearchExtendRef = createRef<FormInstance>();

  const [visible, setVisible] = useState(false);

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params?.store_ids)
        ? params?.store_ids.map((i) => Number(i))
        : [Number(params?.store_ids)],
      create_date: formatDateFilter(params?.create_date || undefined),
    };
  }, [params]);

  const filters: ListFilterTagTypes[] = useMemo(() => {
    let list: ListFilterTagTypes[] = [];
    if (initialValues?.store_ids && initialValues?.store_ids.length) {
      const storesCopy = stores.filter((p) =>
        initialValues?.store_ids?.some((single: number) => Number(single) === p.id),
      );
      const filterModel: FilterModel[] = storesCopy.map((p) => {
        return {
          id: p.id,
          code: p.code,
          value: (
            <>
              <Link to={`${UrlConfig.STORE}/${p.id}`} target="_blank">
                {p.name}
              </Link>
            </>
          ),
          path: undefined,
        };
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: <FilterArrayToString data={filterModel} />,
      });
    }

    if (initialValues.create_date) {
      list.push({
        key: "create_date",
        name: "Ngày tạo",
        value: (
          <React.Fragment>
            {` `}
            {getTimeFormatOrderFilterTag(initialValues.create_date, dateFormat)}
          </React.Fragment>
        ),
      });
    }
    return list;
  }, [initialValues.create_date, initialValues?.store_ids, stores]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "create_date":
          onFilter && onFilter({ ...params, create_date: undefined });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  const menuActionClick = (id: number) => {};

  const onFinish = useCallback(() => {
    const formSearchValue = formSearchRef.current?.getFieldsValue();
    const formSearchExtendValue = formSearchExtendRef.current?.getFieldsValue();

    formSearchValue.create_date = formatDateTimeOrderFilter(
      formSearchValue.create_date,
      dateFormat,
    );
    console.log(formSearchValue);
    console.log(formSearchExtendValue);

    onFilter && onFilter({ ...formSearchValue });
  }, [formSearchExtendRef, formSearchRef, onFilter]);

  const renderFilterTag = (filter: ListFilterTagTypes) => {
    if (filter.isExpand) {
      return;
    }
    return <React.Fragment>{filter.value}</React.Fragment>;
  };

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      ...initialValues,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  console.log(initialValues);
  return (
    <React.Fragment>
      <StyledComponent>
        <CustomFilter menu={[]} onMenuClick={menuActionClick}>
          <Form layout="inline" ref={formSearchRef} initialValues={initialValues}>
            <div className="expenditure-filter">
              <Form.Item name="store_ids" style={{ width: "23%" }}>
                <CustomSelect
                  placeholder="Cửa hàng"
                  allowClear
                  showArrow
                  mode="multiple"
                  maxTagCount="responsive"
                  showSearch
                >
                  {stores.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
              <Form.Item name="create_date" style={{ width: "23%" }}>
                <DatePicker
                  format={dateFormat}
                  placeholder="Ngày tạo đơn"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item style={{ width: "26%" }}>
                <Input placeholder="ID phiếu" prefix={<img src={search} alt="" />} />
              </Form.Item>

              <Button onClick={onFinish} type="primary">
                Lọc
              </Button>
              <Button onClick={() => setVisible(true)}>Thêm bộ lọc</Button>
              {/* <Button icon={<SettingOutlined />} onClick={() => {}} /> */}
            </div>
          </Form>
        </CustomFilter>
        <BaseFilter
          visible={visible}
          onClearFilter={() => {}}
          onFilter={() => {}}
          onCancel={() => setVisible(false)}
          className="expenditure-filter-drawer"
          width={400}
        >
          {/* <Form layout="vertical" ref={formSearchExtendRef}>
            <Form.Item name="store_ids" label="Cửa hàng" style={{ width: "100%" }}>
              <TreeStore
                name="store_ids"
                placeholder="Cửa hàng"
                listStore={stores}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Form> */}
        </BaseFilter>
        {filters && filters.length > 0 && (
          <div className="expenditure-filter-tags">
            {filters.map((filter, index) => {
              return (
                <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                  <span className="tagLabel 3">{filter.name}:</span>
                  {renderFilterTag(filter)}
                </Tag>
              );
            })}
          </div>
        )}
      </StyledComponent>
    </React.Fragment>
  );
};

export default ExpenditureFilter;
