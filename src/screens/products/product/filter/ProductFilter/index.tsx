import {
  Button,
  Collapse,
  Form,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import {useCallback, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import { SizeResponse } from "model/product/size.model";
import { ColorResponse } from "model/product/color.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CountryResponse } from "model/content/country.model";
import { VariantSearchQuery } from "model/product/product.model";
import CustomFilter from "component/table/custom.filter";
import BaseFilter from "component/filter/base.filter";
import { StyledComponent } from "./style";
import ButtonSetting from "component/table/ButtonSetting";
import {
  SearchVariantField,
  SearchVariantMapping,
} from "model/product/product-mapping";
import NumberInputRange from "component/filter/component/number-input-range";
import CustomRangePicker from "component/filter/component/range-picker.custom";
import moment from "moment";
import { checkFixedDate, DATE_FORMAT } from "utils/DateUtils";
import CustomSelectOne from "component/filter/component/select-one.custom";

type ProductFilterProps = {
  params: VariantSearchQuery;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>;
  listMerchandisers?: Array<AccountResponse>;
  listSize?: Array<SizeResponse>;
  listCountries?: Array<CountryResponse>;
  listMainColors?: Array<ColorResponse>;
  listColors?: Array<ColorResponse>;
  listSupplier?: Array<SupplierResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: VariantSearchQuery) => void;
  onClickOpen?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const ProductFilter: React.FC<ProductFilterProps> = (
  props: ProductFilterProps
) => {
  const[formAvd] = Form.useForm();
  const {
    params,
    listStatus,
    listBrands,
    listMerchandisers,
    listSize,
    listMainColors,
    listColors,
    listSupplier,
    actions,
    listCountries,
    onMenuClick,
    onFilter,
    onClickOpen,
  } = props;
  const [visible, setVisible] = useState(false);
  let [advanceFilters, setAdvanceFilters] = useState<any>({});
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
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );
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
  return (
    <StyledComponent>
      <div className="product-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={params} layout="inline">
            <Item name="info" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tên/Mã sản phẩm"
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
          listColors={listColors}
          listMainColors={listMainColors}
          listSupplier={listSupplier}
          listSize={listSize}
          listCountries={listCountries}
          listStatus={listStatus}
          resetField={resetField}
          listMerchandisers={listMerchandisers}
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
            <Space
              className="po-filter"
              direction="vertical"
              style={{ width: "100%" }}
            >
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.inventory:
                    component = <NumberInputRange />;
                    break;
                  case SearchVariantField.made_in:
                    component = (
                      <Select optionFilterProp="children" showSearch>
                        <Option value="">Xuất xứ</Option>
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
                  case SearchVariantField.merchandiser:
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
                  case SearchVariantField.created_date:
                    component = <CustomRangePicker />;
                    break;
                  case SearchVariantField.size:
                    component = (
                      <Select>
                        <Option value="">Size</Option>
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
                      <Select>
                        <Option value="">Màu sắc</Option>
                        {listColors?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.main_color:
                    component = (
                      <Select>
                        <Option value="">Màu chủ đạo</Option>
                        {listMainColors?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.code}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.supplier:
                    component = (
                      <Select>
                        <Option value="">Nhà cung cấp</Option>
                        {listSupplier?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.code}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.saleable:
                    component = (
                      <CustomSelectOne
                        span={12}
                        data={{ true: "Cho phép bán", false: "Ngừng bán" }}
                      />
                    );
                    break;
                  case SearchVariantField.brand:
                    component = (
                      <Select>
                        <Select.Option value="">Thương hiệu</Select.Option>
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
                      header={
                        <span>{SearchVariantMapping[key].toUpperCase()}</span>
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
  listColors,
  listMainColors,
  listSupplier,
  listCountries,
  listSize,
  listMerchandisers,
}: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt: any = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
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
            let index = listColors.findIndex(
              (item: ColorResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listColors[index].name}`;
            break;
          case SearchVariantField.main_color:
            let index1 = listMainColors.findIndex(
              (item: ColorResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listMainColors[index1].name}`;
            break;
          case SearchVariantField.supplier:
            let index2 = listSupplier.findIndex(
              (item: SupplierResponse) => item.id === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listSupplier[index2].name}`;
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
          case SearchVariantField.designer:
            let index5 = listMerchandisers.findIndex(
              (item: AccountResponse) => item.code === value
            );
            renderTxt = `${SearchVariantMapping[filterKey]} : ${listMerchandisers[index5].full_name}`;
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
