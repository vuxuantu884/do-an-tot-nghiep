import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tooltip,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import { SizeResponse } from "model/product/size.model";
import { ColorResponse } from "model/product/color.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CountryResponse } from "model/content/country.model";
import { VariantSearchQuery } from "model/product/product.model";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";
import NumberInput from "component/custom/number-input.custom";
import CustomDatepicker from "component/custom/date-picker.custom";

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
    <Card bordered={false}>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tên/Mã sản phẩm"
            />
          </Item>
          <Item name="barcode">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Barcode"
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
            <Tooltip overlay="Lưu bộ lọc" placement="top">
              <Button icon={<StarOutlined />} />
            </Tooltip>
          </Item>
          <Item>
            <Button onClick={openFilter}>Thêm bộ lọc</Button>
          </Item>
        </Form>
      </CustomFilter>

      <BaseFilter
        onClearFilter={onClearFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
      >
        <Form
          onFinish={onFinish}
          ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Row gutter={12}>
            <Col md={12}>
              <Item
                name="from_inventory"
                label="Tồn kho từ"
              >
                <NumberInput style={{ width: "100%" }} placeholder="Từ" />
              </Item>
            </Col>
            <Col md={12}>
              <Item
                name="to_inventory"
                label="đến"
              >
                <NumberInput style={{ width: "100%" }} placeholder="Đến" />
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Item
                name="made_in"
                label="Xuất sứ"
              >
                <Select optionFilterProp="children" showSearch>
                  <Option value="">Xuất sứ</Option>
                  {listCountries?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Item
                name="merchandiser"
                label="Nhà thiết kế"
              >
                <Select>
                  <Option value="">Nhà thiết kế</Option>
                  {listMerchandisers?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.full_name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Item
                name="from_created_date"
                label="Ngày tạo từ"
              >
                <CustomDatepicker
                  style={{width: '100%'}}
                  placeholder="Ngày tạo từ"
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="to_created_date"
                label="Đến"
              >
                <DatePicker
                  style={{width: '100%'}}
                  placeholder="Ngày tạo đến"
                />
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Item
                name="size"
                label="Size"
              >
                <Select>
                  <Option value="">Size</Option>
                  {listSize?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.code}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
            <Col span={12}>
              <Item
                name="status"
                label="Trạng thái"
              >
                <Select>
                  <Option value="">Trạng thái</Option>
                  {listStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Item
                name="main_color"
                label="Màu chủ đạo"
              >
                <Select>
                  <Option value="">Màu chủ đạo</Option>
                  {listMainColors?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Item
                name="color"
                label="Màu sắc"
              >
                <Select>
                  <Option value="">Màu sắc</Option>
                  {listColors?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Item
                name="supplier"
                label="Nhà cung cấp"
              >
                <Select>
                  <Option value="">Nhà cung cấp</Option>
                  {listSupplier?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default ProductFilter;
