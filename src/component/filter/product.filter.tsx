import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/response/bootstrap/BaseBootstrapResponse";
import { createRef, useCallback, useLayoutEffect, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { VariantSearchQuery } from "./../../model/query/Variant.search.query";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import { SizeResponse } from "model/response/products/size.response";
import { ColorResponse } from "model/response/products/color.response";
import { SupplierResposne } from "model/response/supplier/supplier.response";
import { CountryResponse } from "model/response/content/country.response";

type ProductFilterProps = {
  params: VariantSearchQuery;
  listStatus?: Array<BaseBootstrapResponse>;
  listBrands?: Array<BaseBootstrapResponse>;
  listMerchandisers?: Array<AccountDetailResponse>;
  listSize?: Array<SizeResponse>;
  listCountries?: Array<CountryResponse>;
  listMainColors?: Array<ColorResponse>;
  listColors?: Array<ColorResponse>;
  listSupplier?: Array<SupplierResposne>;
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
    <Card className="view-control" bordered={false}>
      <Form
        className="form-search"
        onFinish={onFinish}
        initialValues={params}
        layout="inline"
      >
        <ActionButton onMenuClick={onActionClick} menu={actions} />
        <div className="right-form">
          <Form.Item className="form-group form-group-with-search" name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 250 }}
              placeholder="Tên/Mã sản phẩm"
            />
          </Form.Item>
          <Form.Item
            className="form-group form-group-with-search"
            name="barcode"
          >
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 250 }}
              placeholder="Barcode"
            />
          </Form.Item>
          <Form.Item className="form-group form-group-with-search" name="brand">
            <Select
              className="select-with-search"
              style={{
                width: 250,
              }}
            >
              <Select.Option value="">Thương hiệu</Select.Option>
              {listBrands?.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="yody-search-button"
            >
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openFilter} className="yody-filter-button">
              Thêm bộ lọc
            </Button>
          </Form.Item>
        </div>
      </Form>
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
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                className="form-group form-group-with-search"
                name="from_inventory"
                label="Tồn kho từ"
              >
                <InputNumber style={{ width: "100%" }} placeholder="Từ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                className="form-group form-group-with-search"
                name="to_inventory"
                label="đến"
              >
                <InputNumber style={{ width: "100%" }} placeholder="Đến" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="made_in"
                className="form-group form-group-with-search"
                label="Xuất sứ"
              >
                <Select className="selector">
                  <Option value="">Xuất sứ</Option>
                  {listCountries?.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="merchandiser"
                className="form-group form-group-with-search"
                label="Nhà thiết kế"
              >
                <Select className="selector">
                  <Option value="">Nhà thiết kế</Option>
                  {listMerchandisers?.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.full_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="from_create_date"
                className="form-group form-group-with-search"
                label="Thời gian tạo từ"
              >
                <DatePicker />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="to_create_date"
                className="form-group form-group-with-search"
                label="đến"
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>
          <Item className="form-group form-group-with-search" label="Địa chỉ">
            <Input className="r-5 ip-search" placeholder="Địa chỉ" />
          </Item>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="from_created_date"
                className="form-group form-group-with-search"
                label="Ngày tạo từ"
              >
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="Ngày tạo từ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="to_created_date"
                className="form-group form-group-with-search"
                label="Đến"
              >
                <DatePicker
                  className="r-5 w-100 ip-search"
                  placeholder="Ngày tạo đến"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="size"
                className="form-group form-group-with-search"
                label="Size"
              >
                <Select className="selector">
                  <Option value="">Size</Option>
                  {listSize?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                className="form-group form-group-with-search"
                label="Trạng thái"
              >
                <Select className="selector">
                  <Option value="">Trạng thái</Option>
                  {listStatus?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="main_color"
                className="form-group form-group-with-search"
                label="Màu chủ đạo"
              >
                <Select className="selector">
                  <Option value="">Size</Option>
                  {listMainColors?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="color"
                className="form-group form-group-with-search"
                label="Màu sắc"
              >
                <Select className="selector">
                  <Option value="">Màu sắc</Option>
                  {listColors?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="supplier"
                className="form-group form-group-with-search"
                label="Nhà cung cấp"
              >
                <Select className="selector">
                  <Option value="">Nhà cung cấp</Option>
                  {listSupplier?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </Card>
  );
};

export default ProductFilter;
