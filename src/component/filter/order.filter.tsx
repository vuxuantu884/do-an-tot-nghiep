import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tooltip,
  Collapse
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
import { StarOutlined, SettingOutlined } from "@ant-design/icons";
import NumberInput from "component/custom/number-input.custom";
import CustomDatepicker from "component/custom/date-picker.custom";
import './order.filter.scss'

const { Panel } = Collapse;
type OrderFilterProps = {
  params: VariantSearchQuery;
  listStatus?: Array<BaseBootstrapResponse>;
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

const OrderFilter: React.FC<OrderFilterProps> = (
  props: OrderFilterProps
) => {
  const {
    params,
    listStatus,
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
    <div>
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Item name="info">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tìm kiếm theo ID đơn hàng"
            />
          </Item>
          <Item name="barcode">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: 200 }}
              placeholder="Tìm kiếm theo tên, sđt khách hàng"
            />
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
        width={500}
      >
        <Form
          onFinish={onFinish}
          ref={formRef}
          initialValues={params}
          layout="vertical"
        >
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="KHU VỰC" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="KHO CỬA HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn kho hàng" style={{width: '100%'}}>
                    <Option value="">Chọn kho hàng</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGUỒN ĐƠN HÀNG" key="1">
                  
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn nguồn đơn hàng" style={{width: '100%'}}>
                    <Option value="">Chọn nguồn đơn hàng</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
                
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGÀY TẠO ĐƠN" key="1">
                  <div className="date-option">
                    <Button>Hôm qua</Button>
                    <Button>Hôm nay</Button>
                    <Button>Tuần này</Button>
                  </div>
                  <div className="date-option">
                    <Button>Tuần trước</Button>
                    <Button>Tháng này</Button>
                    <Button>Tháng trước</Button>
                  </div>
                  <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                  <Item
                    name="from_created_date"
                  >
                    <DatePicker.RangePicker
                      defaultValue={[null, null]}
                      style={{width: "100%"}}
                    />
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGÀY DUYỆT ĐƠN" key="1">
                  <div className="date-option">
                    <Button>Hôm qua</Button>
                    <Button>Hôm nay</Button>
                    <Button>Tuần này</Button>
                  </div>
                  <div className="date-option">
                    <Button>Tuần trước</Button>
                    <Button>Tháng này</Button>
                    <Button>Tháng trước</Button>
                  </div>
                  <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                  <Item
                    name="from_created_date"
                  >
                    <DatePicker.RangePicker
                      defaultValue={[null, null]}
                      style={{width: "100%"}}
                    />
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGÀY HOÀN TẤT ĐƠN" key="1">
                  <div className="date-option">
                    <Button>Hôm qua</Button>
                    <Button>Hôm nay</Button>
                    <Button>Tuần này</Button>
                  </div>
                  <div className="date-option">
                    <Button>Tuần trước</Button>
                    <Button>Tháng này</Button>
                    <Button>Tháng trước</Button>
                  </div>
                  <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                  <Item
                    name="from_created_date"
                  >
                    <DatePicker.RangePicker
                      defaultValue={[null, null]}
                      style={{width: "100%"}}
                    />
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGÀY HUỶ ĐƠN" key="1">
                  <div className="date-option">
                    <Button>Hôm qua</Button>
                    <Button>Hôm nay</Button>
                    <Button>Tuần này</Button>
                  </div>
                  <div className="date-option">
                    <Button>Tuần trước</Button>
                    <Button>Tháng này</Button>
                    <Button>Tháng trước</Button>
                  </div>
                  <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                  <Item
                    name="from_created_date"
                  >
                    <DatePicker.RangePicker
                      defaultValue={[null, null]}
                      style={{width: "100%"}}
                    />
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TRẠNG THÁI ĐƠN HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn trạng thái đơn hàng" style={{width: '100%'}}>
                    <Option value="">Chọn trạng thái đơn hàng</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TRẠNG THÁI XỬ LÝ ĐƠN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn trạng thái xử lý đơn" style={{width: '100%'}}>
                    <Option value="">Chọn trạng thái xử lý đơn</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="GIAO HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn trạng thái giao hàng" style={{width: '100%'}}>
                    <Option value="">Chưa giao</Option>
                    <Option value="">Đang giao</Option>
                    <Option value="">Đã giao</Option>
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="THANH TOÁN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn hình thức thanh toán" style={{width: '100%'}}>
                    <Option value="">Thẻ</Option>
                    <Option value="">Tiền mặt</Option>
                    <Option value="">Momo</Option>
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TRẢ HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NHÂN VIÊN BÁN HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NHÂN VIÊN TẠO ĐƠN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TỔNG TIỀN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="PHƯƠNG THỨC THANH TOÁN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NGÀY DỰ KIẾN NHẬN HÀNG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="HÌNH THỨC VẬN CHUYỂN" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="GHI CHÚ NỘI BỘ" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="GHI CHÚ CỦA KHÁCH" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Input style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TAG" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn 1 hoặc nhiều tag" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="MÃ THAM CHIẾU" key="1">
                  <Item
                    name="from_created_date"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Tìm kiếm theo mã tham chiếu" style={{width: '100%'}}>
                    <Option value="">Chọn khu vực</Option>
                    {/* {listCountries?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))} */}
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
    </div>
  );
};

export default OrderFilter;
