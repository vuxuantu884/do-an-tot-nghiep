import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select, Tag,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect,  useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { StoreQuery, StoreTypeRequest } from "model/core/store.model";
import CustomFilter from "component/table/custom.filter";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { StoreRankResponse } from "model/core/store-rank.model";
import { GroupResponse } from "model/content/group.model";
import NumberInput from "component/custom/number-input.custom";
import "assets/css/custom-filter.scss";
import { DepartmentResponse } from "model/account/department.model";
import ButtonSetting from "component/table/ButtonSetting";
import CustomSelect from "component/custom/select.custom";
import TreeDepartment from "component/tree-node/tree-department";
import CustomFilterDatePicker from "../custom/filter-date-picker.custom";
import { DATE_FORMAT, formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import moment from "moment";
import { CountryResponse } from "../../model/content/country.model";
import { SearchVariantField, SearchVariantMapping } from "../../model/product/product-mapping";

type StoreFilterProps = {
  initValue: StoreQuery;
  params: StoreQuery;
  onFilter?: (values: StoreQuery) => void;
  onClearFilter?: () => void;
  onMenuClick?: (index: number) => void;
  actions: Array<MenuAction>;
  storeStatusList?: Array<BaseBootstrapResponse>;
  storeRanks?: Array<StoreRankResponse>;
  groups?: Array<GroupResponse>;
  type?: Array<StoreTypeRequest>;
  listDepartment?: Array<DepartmentResponse>;
  onClickOpen?: () => void;
};

const SearchStoreFields = {
  rank: 'rank',
  type: 'type',
  hotline: 'hotline',
  square: 'square',
  from_square: 'from_square',
  to_square: 'to_square',
  begin_date: 'begin_date',
  from_begin_date: 'from_begin_date',
  to_begin_date: 'to_begin_date',
};

const SearchStoreMapping = {
  [SearchStoreFields.rank]: 'Phân cấp',
  [SearchStoreFields.type]: 'Phân loại',
  [SearchStoreFields.hotline]: 'Số điện thoại',
  [SearchStoreFields.begin_date]: 'Ngày mở cửa',
  [SearchStoreFields.square]: 'Diện tích',
};

const keysFilter = ['begin_date', 'square'];

const { Item } = Form;
const { Option } = Select;
const StoreFilter: React.FC<StoreFilterProps> = (props: StoreFilterProps) => {
  const {
    onFilter,
    params,
    onMenuClick,
    storeStatusList,
    storeRanks,
    initValue,
    type,
    listDepartment,
    onClickOpen
  } = props;
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  const [formAvd] = Form.useForm();
  const formRef = createRef<FormInstance>();
  let [advanceFilters, setAdvanceFilters] = useState<any>({});

  const onAdvanceFinish = useCallback(
    (values: StoreQuery) => {
      values.from_begin_date = getStartOfDayCommon(values.from_begin_date)?.format();
      values.to_begin_date = getEndOfDayCommon(values.to_begin_date)?.format();
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFinish = useCallback(
    (values: StoreQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const resetField = useCallback(
    (field: string) => {
      formAvd.resetFields([field]);
      formAvd.submit();
    },
    [formAvd]
  );

  const onClearFilterAdvanceClick = useCallback(() => {
    formRef.current?.setFieldsValue(initValue);
    formRef.current?.submit();
    setVisible(false);
  }, [formRef, initValue]);

  useEffect(() => {
    const filter = {
      ...params,
      rank: params.rank ? Number(params.rank) : null,
      [SearchStoreFields.from_begin_date]: formatDateFilter(params.from_begin_date),
      [SearchStoreFields.to_begin_date]: formatDateFilter(params.to_begin_date),
    };

    formAvd.setFieldsValue(filter);
    setAdvanceFilters(filter);
  }, [formAvd, params]);

  return (
    <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick}>
        <Form
          className="form-search"
          onFinish={onFinish}
          initialValues={{
            ...params,
            department_ids: Array.isArray(params.department_ids) ?
              params.department_ids : typeof params.department_ids === 'string'
                ? [params.department_ids] : [],
          }}
          layout="inline"
        >
          <Form.Item name="info" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tên/ Mã cửa hàng/ Số điện thoại/ Hotline"
            />
          </Form.Item>
          <Form.Item name="department_ids" style={{ maxWidth: 310, minWidth:250 }}>
            <TreeDepartment listDepartment={listDepartment} style={{ width: 250}}/>
          </Form.Item>
          <Form.Item name="status">
            <CustomSelect
            allowClear
            showArrow
            style={{ width: 180 }}
            placeholder="Chọn trạng thái">
              {storeStatusList?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Form.Item>
          <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
        </Form>
      </CustomFilter>
      <FilterList
        storeRanks={storeRanks}
        type={type}
        filters={advanceFilters}
        resetField={resetField}
      />
      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={396}
      >
        <Form
          form={formAvd}
          onFinish={onAdvanceFinish}
          ref={formRef}
          layout="vertical"
        >
          <Item name="rank" label="Phân cấp">
            <Select placeholder="Chọn phân cấp">
              <Option value="">Chọn phân cấp</Option>
              {storeRanks?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.code}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="type" label="Phân loại">
            <Select placeholder="Chọn loại cửa hàng">
              <Option value="">Chọn tất cả</Option>
              {type?.map((item, index) => (
                <Option key={index} value={item.value}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Item>
          <Item name="hotline" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Item>
          <Row gutter={24}>
            <Col span={24}>
              <div className="label-date">Ngày mở cửa</div>
              <CustomFilterDatePicker
                fieldNameFrom="from_begin_date"
                fieldNameTo="to_begin_date"
                activeButton={dateClick}
                setActiveButton={setDateClick}
                formRef={formRef}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Item name="from_square" label="Diện tích từ">
                <NumberInput placeholder="Diện tích từ" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name="to_square" label="Đến">
                <NumberInput placeholder="Đến" />
              </Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </div>
  );
};

const FilterList = ({
    filters,
    resetField,
    type,
    storeRanks
  }: any) => {
  const newFilters = {...filters};
  let filtersKeys = Object.keys(newFilters);
  let renderTxt: any = null;
  const newKeys = ConvertDatesLabel(newFilters, keysFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysFilter, i));

  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];
        if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
        if (!SearchStoreMapping[filterKey]) return null;
        switch (filterKey) {
          case SearchStoreFields.begin_date:
            renderTxt = `${SearchStoreMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
            break;
          case SearchStoreFields.square:
            renderTxt = `${SearchStoreMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? filters[`from_${filterKey}`] : '??'} 
            ~ ${filters[`to_${filterKey}`] ? filters[`to_${filterKey}`] : '??'}`
            break;
          case SearchStoreFields.rank:
            if (!value) return null;
            const storeRankFiltered = storeRanks && storeRanks.length > 0
              && storeRanks.filter((i: any) => i.id === Number(value));
            renderTxt = `${SearchStoreMapping[filterKey]} : ${storeRankFiltered.length > 0 && storeRankFiltered[0].code}`;
            break;
          case SearchStoreFields.type:
            if (!value) return null;
            const typeFiltered = type && type.length > 0 && type.filter((i: any) => i.value === value);
            renderTxt = `${SearchStoreMapping[filterKey]} : ${typeFiltered.length > 0 && typeFiltered[0].name}`;
            break;
          case SearchStoreFields.hotline:
            if (!value) return null;
            renderTxt = `${SearchStoreMapping[filterKey]} : ${value}`;
            break;
        }
        return (
          <Tag
            onClose={() => {
              if (filterKey === "begin_date") {
                resetField("from_begin_date");
                resetField("to_begin_date");
                return;
              }
              if (filterKey === "square") {
                resetField("from_square");
                resetField("to_square");
                return;
              }
              resetField(filterKey)
            }}
            key={filterKey}
            className="fade margin-bottom-20"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </div>
  );
};

export default StoreFilter;
