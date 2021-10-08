import {
  Button,
  Collapse,
  Form,
  FormInstance,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { createRef, useCallback, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import {
  ProductWrapperSearchQuery,
  VariantSearchQuery,
} from "model/product/product.model";
import CustomFilter from "component/table/custom.filter";
import BaseFilter from "component/filter/base.filter";
import { StyledComponent } from "./styled";
import ButtonSetting from "component/table/ButtonSetting";
import {
  SearchVariantWrapperField,
  SearchVariantWrapperMapping,
} from "model/product/product-mapping";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import moment from "moment";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import { MaterialResponse } from "model/product/material.model";
import { CategoryView } from "model/product/category.model";
import { StatusFilterResponse } from "model/product/status.model";

type ProductFilterProps = {
  params: ProductWrapperSearchQuery;
  listMerchandisers?: Array<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
  listMaterial?: Array<MaterialResponse>;
  listCategory?: Array<CategoryView>;
  goods?: Array<BaseBootstrapResponse>;
  actions: Array<MenuAction>;
  initValue?: ProductWrapperSearchQuery;
};

const { Item } = Form;
const { Option } = Select;
const listStatus = [
  {
  name: 'Ngừng hoạt động',
  value: 'inactive'
  },
  {
    name: 'Đang hoạt động',
    value: 'active'
  }
];

const ProductWrapperFilter: React.FC<ProductFilterProps> = (
  props: ProductFilterProps
) => {
  const {
    params,
    listMerchandisers,
    actions,
    onMenuClick,
    onFilter,
    onClickOpen,
    listMaterial,
    listCategory,
    goods,
  } = props;
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
  const formRef = createRef<FormInstance>();
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
        values.created_date = undefined;
      }
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
  const onClearFilterClick = useCallback(() => {
    formRef.current?.resetFields();
    formRef.current?.submit();
    setVisible(false);
  }, [formRef]);
  const resetField = useCallback(
    (field: string) => {
      formRef.current?.setFieldsValue({
        ...formRef.current?.getFieldsValue(true),
        [field]: undefined,
      });
      formRef.current?.submit();
    },
    [formRef]
  );

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
              <Button onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
            <Item>
              <ButtonSetting onClick={onClickOpen} />
            </Item>
          </Form>
        </CustomFilter>
        <FilterList
          filters={advanceFilters}
          resetField={resetField}
          listMerchandisers={listMerchandisers}
          listMaterial={listMaterial}
          listCategory={listCategory}
          goods={goods}
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
            ref={formRef}
            initialValues={{}}
            layout="vertical"
          >
            <Space
              className="po-filter"
              direction="vertical"
              style={{ width: "100%" }}
            >
              {Object.keys(SearchVariantWrapperMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantWrapperField.designer_code:
                    component = (
                      <Select optionFilterProp="children" showSearch>
                        <Option value="">Nhà thiết kế</Option>
                        {listMerchandisers?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.code} - {item.full_name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantWrapperField.merchandiser_code:
                    component = (
                      <Select optionFilterProp="children" showSearch>
                        <Option value="">Merchandiser</Option>
                        {listMerchandisers?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.code} - {item.full_name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantWrapperField.status:
                    component = (
                      <Select>
                        <Option value="">TRẠNG THÁI</Option>
                        <Option value="inactive">Ngừng hoạt động</Option>
                        <Option value="active">Đang hoạt động</Option>
                    </Select>
                    );
                    break;
                  case SearchVariantWrapperField.category_id:
                    component = (
                      <Select>
                        <Option value="">DANH MỤC</Option>
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
                      <Select>
                        <Option value="">NGÀNH HÀNG</Option>
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
                        <Select>
                          <Option value="">CHẤT LIỆU</Option>
                          {listMaterial?.map((item) => (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
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
                      header={
                        <span>
                          {SearchVariantWrapperMapping[key].toUpperCase()}
                        </span>
                      }
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
  listMaterial,
  listCategory,
  goods,
  listMerchandisers,
}: any) => {
  let filtersKeys = Object.keys(filters);
  console.log('goods', goods);
  
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!SearchVariantWrapperMapping[filterKey]) return null;
        switch (filterKey) {
          case SearchVariantWrapperField.created_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;
          case SearchVariantWrapperField.category_id:
            let index2 = listCategory.findIndex(
              (item: CategoryView) => item.id === value
            );
            renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listCategory[index2].name}`;
            break;
            case SearchVariantWrapperField.material_id:
              let index3 = listMaterial.findIndex(
                (item: MaterialResponse) => item.id === value
                );
                renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listMaterial[index3].name}`;
              break;
            case SearchVariantWrapperField.goods:
              let index4 = goods.findIndex(
                (item: BaseBootstrapResponse) => item.value === value
                );
                renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${goods[index4].name}`;
              break;
            case SearchVariantWrapperField.status:
              let index6 = listStatus.findIndex(
                (item: StatusFilterResponse) => item.value === value
              );
              renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listStatus[index6].name}`;
            break;
          case SearchVariantWrapperField.merchandiser_code:
          case SearchVariantWrapperField.designer_code:
            let index5 = listMerchandisers.findIndex(
              (item: AccountResponse) => item.code === value
            );
            renderTxt = `${SearchVariantWrapperMapping[filterKey]} : ${listMerchandisers[index5].full_name}`;
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

export default ProductWrapperFilter;
