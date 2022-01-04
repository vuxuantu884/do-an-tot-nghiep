import {FilterOutlined} from "@ant-design/icons";
import {Button, Collapse, Form, Input, Select, Space, Tag} from "antd";
import search from "assets/img/search.svg";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import CustomSelectOne from "component/filter/component/select-one.custom";
import {MenuAction} from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { AppConfig } from "config/app.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { SupplierSearchAction } from "domain/actions/core/supplier.action";
import { getColorAction} from "domain/actions/product/color.action";
import {AccountResponse} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import {BaseBootstrapResponse} from "model/content/bootstrap.model";
import {CountryResponse} from "model/content/country.model";
import {SupplierResponse} from "model/core/supplier.model";
import {ColorResponse} from "model/product/color.model";
import {SearchVariantField, SearchVariantMapping} from "model/product/product-mapping";
import {VariantSearchQuery} from "model/product/product.model";
import {SizeResponse} from "model/product/size.model";
import moment from "moment";
import {useCallback, useEffect, useState} from "react";
import { useDispatch } from "react-redux";
import {checkFixedDate, DATE_FORMAT} from "utils/DateUtils";
import {StyledComponent} from "./style";

var isWin = false;
var isDesigner = false;
var isColors = false;
var isMainColors = false;

type ProductFilterProps = {
  params: VariantSearchQuery;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>; 
  listSize?: Array<SizeResponse>;
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
  const {
    params,
    listStatus,
    listBrands,
    listSize, 
    listCountries,
    onFilter,
    onClickOpen,
    actions,
    onMenuClick,
  } = props;
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
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

  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFinishAvd = useCallback(
    (values: any) => {
      console.log("onFinishAvd: ", values);
      setAdvanceFilters(values);
      if (values.created_date) {
        const [from_created_date, to_created_date] = values.created_date;
        values.from_created_date = values.created_date ? from_created_date : undefined;
        values.to_created_date = values.created_date ? to_created_date : undefined;
      }
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
      console.log(field);
      formAvd.setFieldsValue({
        ...formAvd.getFieldsValue(true),
        [field]: undefined,
      });
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
    (data: PageResponse<ColorResponse>) => {
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
    isColors = isColor;
    isMainColors = isMainColor;
    dispatch(
      getColorAction(
        { info: code, page: page, is_main_color: isMainColors ? 1: 0 },
        setDataColors
      )
    );
  }, [dispatch, setDataColors]);

  const getSuppliers = useCallback((key: string, page: number) => {
    dispatch(SupplierSearchAction({ condition: key, page: page }, (data: PageResponse<SupplierResponse>) => {
      setSupplier(data);
    }));
  }, [dispatch]);

  useEffect(()=>{
    getAccounts("",1,true,true);
    getColors('', 1,true,true);
    getSuppliers('', 1);
  },[getAccounts, getColors, getSuppliers]);

  return (
    <StyledComponent>
      <div className="product-filter">
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Item name="info" className="search">
              <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã sản phẩm" />
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
          mainColors={mainColors}
          colors={colors}
          suppliers={suppliers}
          listSize={listSize}
          listCountries={listCountries}
          listStatus={listStatus}
          resetField={resetField}
          designers={designers}
          wins={wins}
          listBrands={listBrands}
        />
        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <Form
            onFinish={onFinishAvd}
            form={formAvd}
            initialValues={{}}
            layout="vertical"
          >
            <Space className="po-filter" direction="vertical" style={{width: "100%"}}>
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
                  case SearchVariantField.merchandiser:
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
                  case SearchVariantField.created_date:
                    component = <CustomRangePicker />;
                    break;
                  case SearchVariantField.size:
                    component = (
                      <Select showSearch optionFilterProp="children" allowClear placeholder="Chọn kích thước">
                        {listSize?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.code}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.color:
                    component = (
                      <SelectPaging
                        metadata={colors.metadata}
                        notFoundContent={"Không có dữ liệu"}
                        showSearch={false}
                        searchPlaceholder="Tìm kiếm màu sắc"
                        maxTagCount="responsive"
                        showArrow
                        allowClear
                        onSearch={(key) => getColors(key, 1,true,false)}
                        onPageChange={(key, page) => getColors(key, page,true,false)}
                        placeholder="Chọn màu sắc"
                      >
                        {colors.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={item.id}>
                            {`${item.code} - ${item.name}`}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
                    );
                    break;
                  case SearchVariantField.main_color:
                    component = (
                      <SelectPaging
                        metadata={mainColors.metadata}
                        notFoundContent={"Không có dữ liệu"}
                        showSearch={false}
                        searchPlaceholder="Tìm kiếm màu sắc chủ đạo"
                        maxTagCount="responsive"
                        showArrow
                        allowClear
                        onSearch={(key) => getColors(key, 1,false,true)}
                        onPageChange={(key, page) => getColors(key, page,false,true)}
                        placeholder="Chọn màu sắc chủ đạo"
                      >
                        {mainColors.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={item.id}>
                            {`${item.code} - ${item.name}`}
                          </SelectPaging.Option>
                        ))}
                      </SelectPaging>
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
                      >
                        {suppliers.items.map((item) => (
                          <SelectPaging.Option key={item.id} value={item.id}>
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
                  <Collapse key={key}>
                    <Collapse.Panel
                      key="1"
                      header={<span>{SearchVariantMapping[key].toUpperCase()}</span>}
                    >
                      <Item name={key}>{component}</Item>
                    </Collapse.Panel>
                  </Collapse>
                );
              })}
            </Space>
          </Form>
        </BaseFilter>
      </div>
    </StyledComponent>
  );
};

const FilterList = ({
  filters,
  resetField,
  colors,
  mainColors,
  suppliers,
  listCountries,
  listSize,
  designers,
  wins,
  listBrands,
}: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{marginBottom: 20}}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!SearchVariantMapping[filterKey]) return null;
        switch (filterKey) {
          case SearchVariantField.created_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${SearchVariantMapping[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${SearchVariantMapping[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;
          case SearchVariantField.color:
            const color = colors.items.find((e: ColorResponse)=>e.id === value);
            if (!color) return null;
            renderTxt = `${SearchVariantMapping[filterKey]} : ${color.name}`;
            break;
          case SearchVariantField.main_color: 
            const mainColor = mainColors.items.find((e: ColorResponse)=>e.id === value);
            if (!mainColor) return null; 
            renderTxt = `${SearchVariantMapping[filterKey]} : ${mainColor.name}`;
            break;
          case SearchVariantField.supplier:
            const supplier = suppliers.items.find((e: ColorResponse)=>e.id === value);
            if (!supplier) return null;  
            renderTxt = `${SearchVariantMapping[filterKey]} : ${supplier.name}`;
            break;
          case SearchVariantField.size:
            let index3 = listSize.findIndex(
              (item: SupplierResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listSize[index3].code}`;
            break;
          case SearchVariantField.made_in:
            let index4 = listCountries.findIndex(
              (item: CountryResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listCountries[index4].name}`;
            break;
          case SearchVariantField.saleable:
            renderTxt = `${SearchVariantMapping[filterKey]} : ${
              value === "true" ? "Cho phép bán" : "Ngừng bán"
            }`;
            break;
          case SearchVariantField.merchandiser:
            const win = wins.items.find((e: AccountResponse)=>e.code === value);
            if (!win) return null;
            renderTxt = `${SearchVariantMapping[filterKey]} : ${win.full_name}`;
            break;
          case SearchVariantField.designer:
            const designer = designers.items.find((e: AccountResponse)=>e.code === value);
            if (!designer) return null;
            renderTxt = `${SearchVariantMapping[filterKey]} : ${designer.full_name}`;
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
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};

export default ProductFilter;
