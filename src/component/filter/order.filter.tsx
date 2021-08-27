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
  Collapse,
  Tag
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined, SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import { useDispatch } from "react-redux";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";
import CustomSelect from "component/custom/select.custom";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { OrderSearchQuery } from "model/order/order.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import { remove } from "lodash";
import moment from "moment";

const { Panel } = Collapse;
type OrderFilterProps = {
  params: OrderSearchQuery;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery) => void;
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
  const dispatch = useDispatch();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const status = [
    {name: "DRAFT", value: "draft"},
    {name: "FINALIZED", value: "finalized"},
    {name: "COMPLETED", value: "completed"},
    {name: "FINISHED", value: "finished"},
    {name: "Đã huỷ", value: "cancelled"},
    {name: "Đã hết hạn", value: "expired"},
    
  ]
  const fulfillmentStatus = [
    {name: "Chưa giao", value: "unshipped"},
    {name: "Đã lấy hàng", value: "picked"},
    {name: "Giao một phần", value: "partial"},
    {name: "Đã đóng gói", value: "packed"},
    {name: "Đang giao", value: "shipping"},
    {name: "Đã giao", value: "shipped"},
    {name: "Đã hủy", value: "cancelled"},
    {name: "Đang trả lại", value: "returning"},
    {name: "Đã trả lại", value: "returned"}
  ];
  const paymentStatus = [
    {name: "Chưa trả", value: "unpaid"},
    {name: "Đã trả", value: "paid"},
    {name: "Đã trả một phần", value: "partial_paid"},
    {name: "Đang hoàn lại", value: "refunding"}
  ];
  const paymentType = [
    {name: "Tiền mặt", value: 1},
    {name: "Chuyển khoản", value: 3},
    {name: "QR Pay", value: 4},
    {name: "Tiêu điểm", value: 5},
    {name: "COD", value: 0},
  ]
  const formRef = createRef<FormInstance>();
  const onFinish = useCallback(
    (values) => {
      console.log('values', values);
      
      values = {
        ...values,
        // mapping and format date 
        expected_receive_predefined: values.expected_receive_predefined? values.expected_receive_predefined.format('DD-MM-YYYY') : null,
        issued_on_min: values.issued && values.issued[0] ? values.issued[0].format('DD-MM-YYYY') : null,
        issued_on_max: values.issued && values.issued[1] ? values.issued[1].format('DD-MM-YYYY') : null,
        issued_on_predefined: values.issued_on_predefined? values.issued_on_predefined.format('DD-MM-YYYY') : null,
        ship_on_min: values.ship && values.ship[0] ? values.ship[0].format('DD-MM-YYYY') : null,
        ship_on_max: values.ship && values.ship[1] ? values.ship[1].format('DD-MM-YYYY') : null,
        ship_on_predefined: values.ship_on_predefined? values.ship_on_predefined.format('DD-MM-YYYY') : null,
        completed_on_min: values.completed && values.completed[0] ? values.completed[0].format('DD-MM-YYYY') : null,
        completed_on_max: values.completed && values.completed[1] ? values.completed[1].format('DD-MM-YYYY') : null,
        completed_on_predefined: values.completed_on_predefined? values.completed_on_predefined.format('DD-MM-YYYY') : null,
        cancelled_on_min: values.cancelled && values.cancelled[0] ? values.cancelled[0].format('DD-MM-YYYY') : null,
        cancelled_on_max: values.cancelled && values.cancelled[1] ? values.cancelled[1].format('DD-MM-YYYY') : null,
        cancelled_on_predefined: values.cancelled_on_predefined? values.cancelled_on_predefined.format('DD-MM-YYYY') : null,
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
  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  const initialValues = useMemo(() => {
    console.log('initialValues', params);
    
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      fulfillment_status: Array.isArray(params.fulfillment_status) ? params.fulfillment_status : [params.fulfillment_status],
      payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      return_status: Array.isArray(params.return_status) ? params.return_status : [params.return_status],
      payment_method_ids: Array.isArray(params.payment_method_ids) ? params.payment_method_ids : [params.payment_method_ids],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      issued: params.issued_on_min && params.issued_on_max ? [moment(params.issued_on_min, 'DD/MM/YYYY'), moment(params.issued_on_max, 'DD/MM/YYYY')] : null,
      ship: params.ship_on_min && params.ship_on_max ? [moment(params.ship_on_min, 'DD/MM/YYYY'), moment(params.ship_on_max, 'DD/MM/YYYY')] : null,
      completed: params.completed_on_min && params.completed_on_max ? [moment(params.completed_on_min, 'DD/MM/YYYY'), moment(params.completed_on_max, 'DD/MM/YYYY')] : null,
      cancelled: params.cancelled_on_min && params.cancelled_on_max ? [moment(params.cancelled_on_min, 'DD/MM/YYYY'), moment(params.cancelled_on_max, 'DD/MM/YYYY')] : null,
    }
  }, [params]);

  const filters = useMemo(() => {
    let list: any = []
    if (initialValues.store_ids.length) {
      let textStores = ""
      initialValues.store_ids.forEach(store_id => {
        const store = listStore?.find(store => store.id === store_id)
        textStores = store ? textStores + store.name + ";" : textStores
      })
      list.push({
        name: 'Cửa hàng',
        value: textStores
      })
    }
    if (initialValues.source_ids.length) {
      let textSource = ""
      initialValues.source_ids.forEach(source_id => {
        const source = listSources?.find(source => source.id === source_id)
        textSource = source ? textSource + source.name + ";" : textSource
      })
      list.push({
        name: 'Nguồn',
        value: textSource
      })
    }
    if (initialValues.issued_on_min || initialValues.issued_on_max) {
      let textOrderCreateDate = (initialValues.issued_on_min ? initialValues.issued_on_min : '??') + " ~ " + (initialValues.issued_on_max ? initialValues.issued_on_max : '??')
      list.push({
        name: 'Ngày tạo đơn',
        value: textOrderCreateDate
      })
    }
    if (initialValues.ship_on_min || initialValues.ship_on_max) {
      let textOrderShipDate = (initialValues.ship_on_min ? initialValues.ship_on_min : '??') + " ~ " + (initialValues.ship_on_max ? initialValues.ship_on_max : '??')
      list.push({
        name: 'Ngày duyệt đơn',
        value: textOrderShipDate
      })
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate = (initialValues.completed_on_min ? initialValues.completed_on_min : '??') + " ~ " + (initialValues.completed_on_max ? initialValues.completed_on_max : '??')
      list.push({
        name: 'Ngày hoàn tất đơn',
        value: textOrderCompleteDate
      })
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate = (initialValues.cancelled_on_min ? initialValues.cancelled_on_min : '??') + " ~ " + (initialValues.cancelled_on_max ? initialValues.cancelled_on_max : '??')
      list.push({
        name: 'Ngày huỷ đơn',
        value: textOrderCancelDate
      })
    }
    return list
  }, [initialValues]);

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setStore));
  }, [dispatch, setDataAccounts, props]);

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
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
            {/* <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="KHU VỰC" key="1" className="header-filter">
                    <Item name="area">
                    <Select optionFilterProp="children" showSearch placeholder="Chọn khu vực" style={{width: '100%'}}>
                      <Option value="">Chọn khu vực</Option>
                      
                    </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row> */}
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="KHO CỬA HÀNG" key="1" className="header-filter">
                    <Item name="store_ids">
                      <CustomSelect
                        mode="multiple"
                        showArrow
                        showSearch
                        placeholder="Cửa hàng"
                        style={{
                          width: '100%'
                        }}
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                      >
                        {listStore?.map((item) => (
                          <CustomSelect.Option key={item.id} value={item.id.toString()}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="NGUỒN ĐƠN HÀNG" key="1" className="header-filter">
                    <Item name="source_ids" style={{ margin: "10px 0px" }}>
                      <CustomSelect
                        mode="multiple"
                        style={{ width: '100%'}}
                        showArrow
                        showSearch
                        placeholder="Nguồn đơn hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                      >
                        {listSources.map((item, index) => (
                          <CustomSelect.Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.id.toString()}
                          >
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Panel>
                  
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="NGÀY TẠO ĐƠN" key="1" className="header-filter">
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
                    <Item name="issued">
                      <DatePicker.RangePicker
                        format="DD-MM-YYYY"
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
                  <Panel header="NGÀY DUYỆT ĐƠN" key="1" className="header-filter">
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
                    <Item name="ship">
                      <DatePicker.RangePicker
                        format="DD-MM-YYYY"
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
                  <Panel header="NGÀY HOÀN TẤT ĐƠN" key="1" className="header-filter">
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
                    <Item name="completed">
                      <DatePicker.RangePicker
                        format="DD-MM-YYYY"
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
                  <Panel header="NGÀY HUỶ ĐƠN" key="1" className="header-filter">
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
                    <Item name="cancelled">
                      <DatePicker.RangePicker
                        format="DD-MM-YYYY"
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
                  <Panel header="TRẠNG THÁI ĐƠN HÀNG" key="1" className="header-filter">
                    <Item name="order_status">
                    <Select mode="multiple" showSearch placeholder="Chọn trạng thái đơn hàng" style={{width: '100%'}}>
                      {status?.map((item) => (
                        <Option key={item.value} value={item.value.toString()}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="GIAO HÀNG" key="1" className="header-filter">
                    <Item name="fulfillment_status">
                      <Select mode="multiple" showSearch placeholder="Chọn trạng thái giao hàng" style={{width: '100%'}}>
                          {fulfillmentStatus.map((item, index) => (
                            <Option
                              style={{ width: "100%" }}
                              key={index.toString()}
                              value={item.value.toString()}
                            >
                              {item.name}
                            </Option>
                          ))}
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="THANH TOÁN" key="1" className="header-filter">
                    <Item name="payment_status">
                      <Select mode="multiple" showSearch placeholder="Chọn trạng thái thanh toán" style={{width: '100%'}}>
                        {paymentStatus.map((item, index) => (
                          <Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.value.toString()}
                          >
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            {/* <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="TRẢ HÀNG" key="1" className="header-filter">
                    <Item name="payment_status">
                      <Select mode="multiple" showSearch placeholder="Chọn trạng thái thanh toán" style={{width: '100%'}}>
                        {paymentStatus.map((item, index) => (
                          <Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.value.toString()}
                          >
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row> */}
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="NHÂN VIÊN BÁN HÀNG" key="1" className="header-filter">
                    <Item name="assignee">
                      <Select mode="multiple" showSearch placeholder="Chọn nhân viên bán hàng" style={{width: '100%'}}>
                          {accounts.map((item, index) => (
                            <Option
                              style={{ width: "100%" }}
                              key={index.toString()}
                              value={item.code.toString()}
                            >
                              {`${item.full_name} - ${item.code}`}
                            </Option>
                          ))}
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="NHÂN VIÊN TẠO ĐƠN" key="1" className="header-filter">
                    <Item name="account">
                      <Select mode="multiple" showSearch placeholder="Chọn nhân viên tạo đơn" style={{width: '100%'}}>
                        {accounts.map((item, index) => (
                          <Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.code.toString()}
                          >
                            {`${item.full_name} - ${item.code}`}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}} className="price">
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="TỔNG TIỀN" key="1" className="header-filter">
                    <Input.Group compact>
                      <Item name="price_min" style={{ width: '45%', textAlign: 'center' }}>
                        <Input className="price_min"  placeholder="Minimum" />
                      </Item>
                      
                      <Input
                        className="site-input-split"
                        style={{
                          width: '10%',
                          borderLeft: 0,
                          borderRight: 0,
                          pointerEvents: 'none',
                        }}
                        placeholder="~"
                        readOnly
                      />
                      <Item name="price_max" style={{width: '45%',textAlign: 'center'}}>
                        <Input
                          className="site-input-right price_max"
                          placeholder="Maximum"
                        />
                      </Item>
                    </Input.Group>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="PHƯƠNG THỨC THANH TOÁN" key="1" className="header-filter">
                    <Item name="payment_method_ids">
                    <Select mode="multiple" optionFilterProp="children" showSearch placeholder="Chọn phương thức thanh toán" style={{width: '100%'}}>
                      {paymentType.map((item, index) => (
                        <Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value.toString()}
                        >
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="NGÀY DỰ KIẾN NHẬN HÀNG" key="1" className="header-filter">
                    <Item name="expected_receive_predefined">
                      <DatePicker placeholder="Chọn ngày" style={{width: "100%"}}/>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="HÌNH THỨC VẬN CHUYỂN" key="1" className="header-filter">
                    <Item name="ship_by">
                      <Select optionFilterProp="children" showSearch placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}>
                        <Option value="">Hình thức vận chuyển</Option>
                        {/* {listCountries?.map((item) => (
                          <Option key={item.id} value={item.id.toString()}>
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
                  <Panel header="GHI CHÚ NỘI BỘ" key="1" className="header-filter">
                    <Item name="note">
                      <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="GHI CHÚ CỦA KHÁCH" key="1" className="header-filter">
                    <Item name="customer_note">
                    <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="TAG" key="1" className="header-filter">
                    <Item name="tags">
                    <Select mode="tags" optionFilterProp="children" showSearch placeholder="Chọn 1 hoặc nhiều tag" style={{width: '100%'}}>
                      
                    </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="MÃ THAM CHIẾU" key="1" className="header-filter">
                    <Item name="reference_code">
                      <Input placeholder="Tìm kiếm theo mã tham chiếu"/>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          </Form>
        </BaseFilter>
      </div>
      {/* <div>
        {filters.map((filter: any) => {
          return (
            <Tag>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div> */}
    </div>
  );
};

export default OrderFilter;
