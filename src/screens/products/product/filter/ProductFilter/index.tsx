import { FilterOutlined } from "@ant-design/icons";
import { Button, FormInstance, Col, Form, Input, Row, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import ColorSearchSelect from "component/custom/select-search/color-select";
import SizeSearchSelect from "component/custom/select-search/size-search";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import CustomSelectOne from "component/filter/component/select-one.custom";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { getColorAction } from "domain/actions/product/color.action";
import { sizeSearchAction } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ColorResponse } from "model/product/color.model";
import {
  keysDateFilter,
  SearchVariantField,
  SearchVariantMapping,
} from "model/product/product-mapping";
import { VariantSearchQuery } from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT, formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { StyledComponent } from "./style";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";

let isWin = false;
let isDesigner = false;

type ProductFilterProps = {
  params: VariantSearchQuery;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>;
  listCountries?: Array<CountryResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
};

const {Item} = Form;
const {Option} = Select;

const ProductFilter: React.FC<ProductFilterProps> = (props: ProductFilterProps) => {
  const dispatch = useDispatch();
  const [formAvd] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const {
    params,
    listStatus,
    listBrands,
    listCountries,
    onFilter,
    onClickOpen,
    actions,
    onMenuClick,
  } = props;
  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');
  let [advanceFilters, setAdvanceFilters] = useState<any>({});

  const [lstSize, setLstSize] = useState<PageResponse<SizeResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [colors, setColors] = useState<PageResponse<ColorResponse>>(
    {
      items: [],
      metadata: { limit: 20, page: 1, total: 0 }
    }
  );

  const [mainColors, setMainColors] = useState<PageResponse<ColorResponse>>(
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

  const [suppliers, setSupplier] = useState<PageResponse<SupplierResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 }
  });

  useEffect(() => {
    const { made_in, size, color, main_color, supplier, brand, merchandiser, designer } = params;

    const filter = {
      ...params,
      [SearchVariantField.from_created_date]: formatDateFilter(params.from_created_date),
      [SearchVariantField.to_created_date]: formatDateFilter(params.to_created_date),
      [SearchVariantField.made_in]: made_in ? Number(made_in) : null,
      [SearchVariantField.size]: Array.isArray(size) ?
        size.join() : size !== '' ? size : null,
      [SearchVariantField.color]: Array.isArray(color) ?
        color.join() : color !== '' ? color : null,
      [SearchVariantField.main_color]: Array.isArray(main_color) ?
        main_color.join() : main_color !== '' ? main_color : null,
      [SearchVariantField.supplier]: Array.isArray(supplier) ?
        supplier.join() : supplier !== '' ? supplier : null,
      [SearchVariantField.merchandiser]: Array.isArray(merchandiser) ?
        merchandiser.join() : merchandiser !== '' ? merchandiser : null,
      [SearchVariantField.designer]: Array.isArray(designer) ?
        designer.join() : designer !== '' ? designer : null,
      [SearchVariantField.brand]: brand ? brand : null
    };

    if (supplier && supplier !== '') setTimeout(() => {
      getSuppliers(JSON.parse(supplier).code, 1)
    }, 0);

    formAvd.setFieldsValue(filter);
    setAdvanceFilters(filter);
  }, [formAvd, params]);

  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFinishAvd = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      values.from_created_date = getStartOfDayCommon(values.from_created_date)?.format();
      values.to_created_date = getEndOfDayCommon(values.to_created_date)?.format();

      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAvd.submit();
  }, [formAvd]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onClearFilterClick = useCallback(() => {
    formAvd.resetFields();
    formAvd.submit();
    setVisible(false);
  }, [formAvd]);

  const resetField = useCallback(
    (field: string) => {
      formAvd.resetFields([field]);
      formAvd.submit();
    },
    [formAvd]
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
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

  const setDataColors = useCallback(
    (data: PageResponse<ColorResponse>, isColors: boolean, isMainColors: boolean) => {
      if (!data) {
        return false;
      }
      if (isColors) {
        setColors(data);
      }
      if (isMainColors) {
        setMainColors(data);
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

  const getColors = useCallback((code: string, page: number, isColor: boolean, isMainColor: boolean) => {
    dispatch(
      getColorAction(
        { info: code, page: page, is_main_color: isMainColor ? 1: 0 },
        (res)=>{
          setDataColors(res, isColor, isMainColor);
        }
      )
    );
  }, [dispatch, setDataColors]);

  const setDataSizes = useCallback((res: PageResponse<SizeResponse>) => {
    if (res) {
     setLstSize(res);
    }
   },[]);

  const getSizes = useCallback((code: string, page: number)=>{
    dispatch(
      sizeSearchAction(
        { code: code, page: page },
        setDataSizes
      )
    );
  },[dispatch, setDataSizes]);

  const getSuppliers = useCallback((key: string, page: number) => {
    dispatch(SupplierSearchAction({ condition: key, page: page }, (data: PageResponse<SupplierResponse>) => {
      setSupplier({
        ...suppliers,
        items: [
          ...suppliers.items,
          ...data.items
        ]
      });
    }));
  }, [dispatch]);

  useEffect(()=> {
    getAccounts("",1,true,true);
    getColors('', 1,false,true);
    getColors('', 1,true,false);
    getSuppliers('', 1);
    getSizes("",1);
  },[getAccounts, getColors, getSizes, getSuppliers]);

  return (
    <StyledComponent>
      <div className="product-filter">
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Item name="info" className="search">
              <Input prefix={<img src={search} alt="" />} placeholder="Tìm kiếm theo Tên/Mã/Barcode sản phẩm" />
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button onClick={openFilter} icon={<FilterOutlined />}>
                Thêm bộ lọc
              </Button>
            </Item>
            <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
          </CustomFilter>
        </Form>
        <FilterList
          filters={advanceFilters}
          listCountries={listCountries}
          listStatus={listStatus}
          resetField={resetField}
          listBrands={listBrands}
        />
        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={700}
        >
          <Form
            onFinish={onFinishAvd}
            form={formAvd}
            ref={formRef}
            layout="vertical"
          >
            <Row gutter={20}>
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.made_in:
                    component = (
                      <Select optionFilterProp="children" showSearch allowClear placeholder="Chọn xuất sứ">
                        {listCountries?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.designer:
                    component = (
                      <AccountSearchPaging isFilter placeholder="Chọn thiết kế" fixedQuery={{ department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" }}/>
                    );
                    break;
                  case SearchVariantField.merchandiser:
                    component = (
                      <AccountSearchPaging isFilter placeholder="Chọn merchandiser" fixedQuery={{ department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" }}/>
                    );
                    break;
                  case SearchVariantField.created_date:
                    component = <CustomFilterDatePicker
                      fieldNameFrom="from_created_date"
                      fieldNameTo="to_created_date"
                      activeButton={dateClick}
                      setActiveButton={setDateClick}
                      formRef={formRef}
                    />;
                    break;
                  case SearchVariantField.size:
                    component = (
                      <SizeSearchSelect isFilter key="code" onSelect={(key, option) => getSizes(option?.key || key, 1)}/> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.color:
                    component = (
                      <ColorSearchSelect isFilter fixedQuery={{is_main_color:0}} onSelect={(key, option) =>{getColors(option?.key || key, 1,true,false)}}/> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.main_color:
                    component = (
                      <ColorSearchSelect isFilter fixedQuery={{is_main_color:1}}  placeholder="Chọn màu sắc chủ đạo" onSelect={(key, option) =>{getColors(option?.key || key, 1,false, true)}}/> // để tạm onslect để lấy key hiển thị ra filter list
                    );
                    break;
                  case SearchVariantField.supplier:
                    component = (
                      <SelectPaging
                        searchPlaceholder="Tìm kiếm nhà cung cấp"
                        metadata={suppliers.metadata}
                        showSearch={false}
                        allowClear
                        placeholder="Chọn nhà cung cấp"
                        onSearch={(key) => getSuppliers(key, 1)}
                        onPageChange={(key, page) => getSuppliers(key, page)}
                        onSelect={()=>{}} // to disable onSearch when select item
                      >
                        {suppliers.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={JSON.stringify({
                            code: item.id,
                            name: item.name
                          })}>
                            {item.name}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantField.saleable:
                    component = (
                      <CustomSelectOne
                        span={12}
                        data={{true: "Cho phép bán", false: "Ngừng bán"}}
                      />
                    );
                    break;
                  case SearchVariantField.brand:
                    component = (
                      <Select showSearch optionFilterProp="children" allowClear placeholder="Chọn thương hiệu">
                        {listBrands?.map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    );
                }
                return (
                  <Col span={12} key={key}>
                    <div className="font-weight-500">{SearchVariantMapping[key]}</div>
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
  listCountries,
  listBrands,
}: any) => {
  const newFilters = {...filters};
  let filtersKeys = Object.keys(newFilters);
  let renderTxt: any = null;
  const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
  filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));

  return (
    <div>
      {[...newKeys, ...filtersKeys].map((filterKey) => {
        let value = filters[filterKey];
        if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
        if (!SearchVariantMapping[filterKey]) return null;
        switch (filterKey) {
          case SearchVariantField.created_date:
            renderTxt = `${SearchVariantMapping[filterKey]} 
            : ${filters[`from_${filterKey}`] ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'} 
            ~ ${filters[`to_${filterKey}`] ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY) : '??'}`
            break;
          case SearchVariantField.color:
          case SearchVariantField.main_color:
          case SearchVariantField.supplier:
          case SearchVariantField.size:
          case SearchVariantField.merchandiser:
          case SearchVariantField.designer:
            if (!value) return null;
            renderTxt = `${SearchVariantMapping[filterKey]} : ${JSON.parse(value).name}`;
            break;
          case SearchVariantField.made_in:
            if (!listCountries) return null;
            let index4 = listCountries && listCountries.findIndex(
              (item: CountryResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listCountries && listCountries[index4] && listCountries[index4].name}`;
            break;
          case SearchVariantField.saleable:
            renderTxt = `${SearchVariantMapping[filterKey]} : ${
              value === "true" ? "Cho phép bán" : "Ngừng bán"
            }`;
            break;
          case SearchVariantField.brand:
            let index6 = listBrands.findIndex(
              (item: BaseBootstrapResponse) => item.value === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listBrands[index6].name}`;
            break;
        }
        return (
          <Tag
            onClose={() => {
              if (filterKey === "created_date") {
                resetField("from_created_date");
                resetField("to_created_date");
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

export default ProductFilter;
