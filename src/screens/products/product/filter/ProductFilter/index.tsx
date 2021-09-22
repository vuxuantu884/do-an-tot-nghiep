import {
  Button,
  Collapse,
  Form,
  FormInstance,
  Input,
  Select,
  Space,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
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
  onClearFilter?: () => void;
  onClickOpen?: () => void
};

const { Item } = Form;
const { Option } = Select;

const ProductFilter: React.FC<ProductFilterProps> = (
  props: ProductFilterProps
) => {
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
    onClearFilter,
    onFilter,
    onClickOpen
  } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values: VariantSearchQuery) => {
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
  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

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
            <Item name="brand">
              <Select
                style={{
                  width: 200,
                }}
              >
                <Select.Option value="">Thương hiệu</Select.Option>
                {listBrands?.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
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

        <BaseFilter
          onClearFilter={onClearFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Space
              className="po-filter"
              direction="vertical"
              style={{ width: "100%" }}
            >
              {SearchVariantMapping.map((item) => {
                let component: any = null;
                switch (item.field) {
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
                            {item.code}
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
                    case SearchVariantField.status:
                      component = (
                        <Select>
                          <Option value="">Trạng thái</Option>
                          {listStatus?.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.name}
                            </Option>
                          ))}
                        </Select>
                      );
                      break;
                }
                return (
                  <Collapse key={item.field}>
                    <Collapse.Panel
                      key="1"
                      // className={params[item.field] ? "active" : ""}
                      header={<span>{item.displayField.toUpperCase()}</span>}
                    >
                      <Item name={item.field}>{component}</Item>
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

export default ProductFilter;
