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
import { StarOutlined, SettingOutlined, FilterOutlined } from "@ant-design/icons";
// import NumberInput from "component/custom/number-input.custom";
// import CustomDatepicker from "component/custom/date-picker.custom";
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
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const OrderFilter: React.FC<OrderFilterProps> = (
  props: OrderFilterProps
) => {
  const {
    params,
    actions,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
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
    <div className="order-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Item name="search" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo ID đơn hàng, tên, sđt khách hàng"
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
            <Button icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
          </Item>
          <Button icon={<SettingOutlined/>} onClick={onShowColumnSetting}></Button>
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
                    // name="area"
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
                    // name="id_store"
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
                    name="source"
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
                    name="order_status"
                  >
                  <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn trạng thái đơn hàng" style={{width: '100%'}}>
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
          {/* <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="TRẠNG THÁI XỬ LÝ ĐƠN" key="1">
                  <Item
                    name="fulfillment_status"
                  >
                  <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn trạng thái xử lý đơn" style={{width: '100%'}}>
                    <Option value="">Chọn trạng thái xử lý đơn</Option>
                  </Select>
                  </Item>
                </Panel>
              </Collapse>
            </Col>
          </Row> */}
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="GIAO HÀNG" key="1">
                  <Item
                    // name="fulfillment_status"
                  >
                  <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn trạng thái giao hàng" style={{width: '100%'}}>
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
                      name="payment_status"
                    >
                    <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn trạng thái giao hàng" style={{width: '100%'}}>
                      <Option value="unpaid">Chưa thanh toán</Option>
                      <Option value="partial_paid">Thanh toán một phần</Option>
                      <Option value="paid">Đã thanh toán</Option>
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
                  có đổi, không đổi
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="NHÂN VIÊN BÁN HÀNG" key="1">
                  <Item
                    name="assignee"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn nhân viên bán hàng" style={{width: '100%'}}>
                    <Option value="">Nhân viên bán hàng</Option>
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
                    name="account"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn nhân viên tạo đơn" style={{width: '100%'}}>
                    <Option value="">Nhân viên tạo đơn</Option>
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
                  <Input style={{ width: 100, textAlign: 'center' }} placeholder="Minimum" />
                  <Input
                    className="site-input-split"
                    style={{
                      width: 30,
                      borderLeft: 0,
                      borderRight: 0,
                      pointerEvents: 'none',
                    }}
                    placeholder="~"
                    disabled
                  />
                  <Input
                    className="site-input-right"
                    style={{
                      width: 100,
                      textAlign: 'center',
                    }}
                    placeholder="Maximum"
                  />
                </Panel>
              </Collapse>
            </Col>
          </Row>
          <Row gutter={12} style={{marginTop: '10px'}}>
            <Col span={24}>
              <Collapse defaultActiveKey={[]}>
                <Panel header="PHƯƠNG THỨC THANH TOÁN" key="1">
                  <Item
                    name="payment_method_ids"
                  >
                  <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn phương thức thanh toán" style={{width: '100%'}}>
                    <Option value="">Tiền mặt</Option>
                    <Option value="">Chuyển khoản</Option>
                    <Option value="">COD</Option>
                    
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
                    // name="from_created_date"
                  >
                    <DatePicker placeholder="Chọn ngày" style={{width: "100%"}}/>
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
                  <Select optionFilterProp="children" showSearch placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}>
                    <Option value="">Hình thức vận chuyển</Option>
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
                    <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
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
                  <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
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
                    // name="tags"
                  >
                  <Select optionFilterProp="children" showSearch placeholder="Chọn 1 hoặc nhiều tag" style={{width: '100%'}}>
                    <Option value="">Tag 1</Option>
                    <Option value="">Tag 2</Option>
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
                    name="reference_code"
                  >
                    <Input placeholder="Tìm kiếm theo mã tham chiếu"/>
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
