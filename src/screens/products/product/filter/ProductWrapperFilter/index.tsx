import { FilterOutlined } from "@ant-design/icons";
import { Button, Collapse, Form, Input, Select, Space, Tag } from "antd";
import search from "assets/img/search.svg";
import SelectPaging from "component/custom/SelectPaging";
import BaseFilter from "component/filter/base.filter";
import CustomRangePicker from "component/filter/component/range-picker.custom";
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
  SearchVariantWrapperField,
  SearchVariantWrapperMapping
} from "model/product/product-mapping";
import { ProductWrapperSearchQuery, VariantSearchQuery } from "model/product/product.model";
import { StatusFilterResponse } from "model/product/status.model";
import moment from "moment";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styled"; 

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
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const [form] = Form.useForm();
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
  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );
  const onFinishAvd = useCallback(
    (values: any) => {
      setAdvanceFilters(values);
      if (values.created_date) {
        const [from_create_date, to_create_date] = values.created_date;
        values.from_create_date = from_create_date;
        values.to_create_date = to_create_date;
      } else {
        values.from_create_date = null;
        values.to_create_date = null;
      }
      console.log("form filter", values);

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
                placeholder="Tìm kiếm theo mã vạch, Mã sản phẩm, Tên sản phẩm"
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
          width={500}
        >
          <Form onFinish={onFinishAvd} form={form} initialValues={{}} layout="vertical">
            <Space className="po-filter" direction="vertical" style={{ width: "100%" }}>
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
                  case SearchVariantWrapperField.created_date:
                    component = <CustomRangePicker />;
                    break;
                }
                return (
                  <Collapse key={key}>
                    <Collapse.Panel
                      key="1"
                      header={<span>{SearchVariantWrapperMapping[key].toUpperCase()}</span>}
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
  materials,
  listCategory,
  designers,
  goods,
  wins,
  form,
}: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt = "";

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
      <Space wrap={true} style={{ marginBottom: 20 }}>
        {filtersKeys.map((filterKey) => {
          let value = filters[filterKey];
          if (!value) return null;
          if (!SearchVariantWrapperMapping[filterKey]) return null;
          switch (filterKey) {
            case SearchVariantWrapperField.created_date:
              let [from, to] = value;
              let formatedFrom = moment(from).utc().format(DATE_FORMAT.DDMMYYY),
                formatedTo = moment(to).utc().format(DATE_FORMAT.DDMMYYY);
              let fixedDate = checkFixedDate(from, to);
              if (fixedDate) renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${fixedDate}`;
              else
                renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${formatedFrom} - ${formatedTo}`;
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
                if (filterKey === "created_date") {
                  resetField("from_create_date");
                  resetField("to_create_date");
                  resetField(filterKey);
                } else {
                  resetField(filterKey);
                }
              }}
              key={filterKey}
              className="fade"
              closable
            >{`${renderTxt}`}</Tag>
          );
        })}
      </Space>
    );
  }
};

export default ProductWrapperFilter;
