import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { getMaterialAction } from "domain/actions/product/material.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { CategoryView } from "model/product/category.model";
import { MaterialResponse } from "model/product/material.model";
import {
  keysDateWrapperFilter,
  SearchVariantWrapperField,
  SearchVariantWrapperMapping,
} from "model/product/product-mapping";
import { ProductWrapperSearchQuery, VariantSearchQuery } from "model/product/product.model";
import { StatusFilterResponse } from "model/product/status.model";
import moment from "moment";
import React, { createRef, Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT, formatDateFilter, getStartOfDayCommon } from "utils/DateUtils";
import { StyledComponent } from "./styled";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";

var isWin = false;
var isDesigner = false;

type ProductFilterProps = {
  params: ProductWrapperSearchQuery;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
  listCategory?: Array<CategoryView>;
  goods?: Array<BaseBootstrapResponse>;
  actions: Array<MenuAction>;
  initValue?: ProductWrapperSearchQuery;
};

const { Item } = Form;
const { Option } = Select;
const listStatus = [
  {
    name: "Ngừng hoạt động",
    value: "inactive",
  },
  {
    name: "Đang hoạt động",
    value: "active",
  },
];

const ProductWrapperFilter: React.FC<ProductFilterProps> = (props: ProductFilterProps) => {
  const dispatch = useDispatch();
  const {
    params,
    actions,
    onMenuClick,
    onFilter,
    onClickOpen,
    listCategory,
    goods,
  } = props;
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [form] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const [materials, setMaterials] = useState<PageResponse<MaterialResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );
  const [wins, setWins] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [designers, setDeisgners] = useState<PageResponse<AccountResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  useEffect(() => {
    setAdvanceFilters({
      ...params,
      [SearchVariantWrapperField.from_create_date]: formatDateFilter(params.from_create_date),
      [SearchVariantWrapperField.to_create_date]: formatDateFilter(params.to_create_date),
    });
  }, [params]);

  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFinishAvd = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      values.from_create_date = getStartOfDayCommon(values.from_create_date)?.format();
      values.to_create_date = getStartOfDayCommon(values.to_create_date)?.format();

      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    form.submit();
  }, [form]);
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
  const onClearFilterClick = useCallback(() => {
    form.resetFields();
    form.submit();
    setVisible(false);
  }, [form]);
  const resetField = useCallback(
    (field: string) => {
      form.setFieldsValue({
        [field]: null,
      });
      form.submit();
    },
    [form]
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse>) => {
      if (!data) {
        return false;
      }
      if (isWin) {
        setWins(data);
      }
      if (isDesigner) {
        setDeisgners(data);
      }
    },
    []
  );

  const getAccounts = useCallback((code: string, page: number, designer: boolean, win: boolean) => {
    isDesigner = designer;
    isWin = win;
    dispatch(
      searchAccountPublicAction(
        { condition: code, page: page, department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        setDataAccounts
      )
    );
  }, [dispatch, setDataAccounts]);

  const getMaterials = useCallback((code: string, page: number) => {
    dispatch(
      getMaterialAction(
        { info: code, page: page},
        (res)=>{
          if (res) { setMaterials(res);}
        }
      )
    );
  }, [dispatch]);


  useEffect(()=>{
    getAccounts("",1,true,true);
    getMaterials("",1);
  },[getAccounts, getMaterials]);

  return (
    <StyledComponent>
      <div className="product-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={params} layout="inline">
            <Item name="info" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo Tên/Mã sản phẩm"
              />
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button onClick={openFilter}  icon={<FilterOutlined />}>Thêm bộ lọc</Button>
            </Item>
            <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
          </Form>
        </CustomFilter>
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          wins={wins}
          materials={materials}
          designers={designers}
          listCategory={listCategory}
          goods={goods}
          form={form}
        />
        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={700}
        >
          <Form ref={formRef} onFinish={onFinishAvd} form={form} initialValues={{}} layout="vertical">
            <Row gutter={20}>
              {Object.keys(SearchVariantWrapperMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantWrapperField.designer_code:
                    component = (
                      <SelectPaging
                        metadata={designers.metadata}
                        showSearch={false}
                        showArrow
                        allowClear
                        searchPlaceholder="Tìm kiếm nhân viên"
                        placeholder="Chọn thiết kế"
                        onPageChange={(key, page) => getAccounts(key, page, true, false)}
                        onSearch={(key) => getAccounts(key, 1, true, false)}
                      >

                        {designers.items.map((item) => (
                          <SelectPaging.Option key={item.code} value={item.code}>
                            {`${item.code} - ${item.full_name}`}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantWrapperField.merchandiser_code:
                    component = (
                      <SelectPaging
                        metadata={wins.metadata}
                        placeholder="Chọn merchandiser"
                        showSearch={false}
                        showArrow
                        allowClear
                        searchPlaceholder="Tìm kiếm nhân viên"
                        onPageChange={(key, page) => getAccounts(key, page, false, true)}
                        onSearch={(key) => getAccounts(key, 1, false, true)}
                      >
                        {wins.items.map((item) => (
                          <SelectPaging.Option key={item.code} value={item.code}>
                            {`${item.code} - ${item.full_name}`}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantWrapperField.status:
                    component = (
                      <Select placeholder="Chọn trạng thái" allowClear>
                        <Option value="inactive">Ngừng hoạt động</Option>
                        <Option value="active">Đang hoạt động</Option>
                      </Select>
                    );
                    break;
                  case SearchVariantWrapperField.category_id:
                    component = (
                      <Select showSearch optionFilterProp="children" placeholder="Chọn danh mục" allowClear>
                        {listCategory?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {`${item.name}`}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantWrapperField.goods:
                    component = (
                      <Select placeholder="Chọn ngành hàng" allowClear>
                        {goods?.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantWrapperField.material_id:
                    component = (
                      <SelectPaging
                        metadata={materials.metadata}
                        placeholder="Chọn chất liệu"
                        showSearch={false}
                        showArrow
                        allowClear
                        searchPlaceholder="Tìm kiếm chất liệu"
                        onPageChange={(key, page) => getMaterials(key, page)}
                        onSearch={(key) => getMaterials(key, 1)}
                      >
                      {materials.items.map((item) => (
                        <SelectPaging.Option key={item.id} value={item.id}>
                          {`${item.name}`}
                        </SelectPaging.Option>
                      ))}
                    </SelectPaging>
                    );
                    break;
                  case SearchVariantWrapperField.create_date:
                    component = <CustomFilterDatePicker
                      fieldNameFrom="from_create_date"
                      fieldNameTo="to_create_date"
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                    />;
                    break;
                }
                return (
                  <Col span={12} key={key}>
                    <div className="font-weight-500">{SearchVariantWrapperMapping[key]}</div>
                    <Item name={key}>{component}</Item>
                  </Col>
                );
              })}
            </Row>
          </Form>
        </BaseFilter>
      </div>
    </StyledComponent>
  );
};

const FilterList = ({
  filters,
  resetField,
  materials,
  listCategory,
  designers,
  goods,
  wins,
  form,
}: any) => {
  let renderTxt = "";
  const newFilters = {...filters};
  let filtersKeys = Object.keys(newFilters);
  const newKeys = ConvertDatesLabel(newFilters, keysDateWrapperFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateWrapperFilter, i));

  const formValue = form.getFieldsValue(true);
  let hasFilter = false;
  Object.keys(formValue).forEach((item) => {
    if (formValue[item]) {
      hasFilter = true;
    }
  });

  if (!hasFilter) {
    return <Fragment />;
  } else {
    return (
      <div>
        {[...newKeys, ...filtersKeys].map((filterKey) => {
          let value = filters[filterKey];
          if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
          if (!SearchVariantWrapperMapping[filterKey]) return null;
          switch (filterKey) {
            case SearchVariantWrapperField.create_date:
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
              break;
            case SearchVariantWrapperField.category_id:
              let index2 = listCategory.findIndex((item: CategoryView) => item.id === value);
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listCategory[index2].name}`;
              break;
            case SearchVariantWrapperField.material_id:
              const material = materials.items.find((e: MaterialResponse)=>e.id === value);
              if (!material) return null;
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${material.name}`;
              break;
            case SearchVariantWrapperField.goods:
              let index4 = goods.findIndex((item: BaseBootstrapResponse) => item.value === value);
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${goods[index4].name}`;
              break;
            case SearchVariantWrapperField.status:
              let index6 = listStatus.findIndex(
                (item: StatusFilterResponse) => item.value === value
              );
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listStatus[index6].name}`;
              break;
            case SearchVariantWrapperField.merchandiser_code:
              const win = wins.items.find((e: AccountResponse)=>e.code === value);
              if (!win) return null;
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${win.full_name}`;
              break;
            case SearchVariantWrapperField.designer_code:
              const designer = designers.items.find((e: AccountResponse)=>e.code === value);
              if (!designer) return null;
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${designer.full_name}`;
              break;
          }
          return (
            <Tag
              onClose={() => {
                if (filterKey === "create_date") {
                  resetField("from_create_date");
                  resetField("to_create_date");
                  return;
                } else {
                  resetField(filterKey);
                }
              }}
              key={filterKey}
              className="fade margin-bottom-20"
              closable
            >{`${renderTxt}`}</Tag>
          );
        })}
      </div>
    );
  }
};

export default ProductWrapperFilter;
