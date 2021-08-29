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
  Tag,
  InputNumber,
  Radio
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useLayoutEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined, SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";

const { Panel } = Collapse;
type OrderFilterProps = {
  params: OrderSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
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
    listSource,
    listStore,
    accounts,
    deliveryService,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  const [visible, setVisible] = useState(false);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const status = [
    {name: "Nháp", value: "draft"},
    {name: "Đóng gói", value: "packed"},
    {name: "Xuất kho", value: "shipping"},
    {name: "Đã xác nhận", value: "finalized"},
    {name: "Hoàn thành", value: "completed"},
    {name: "Kết thúc", value: "finished"},
    {name: "Đã huỷ", value: "cancelled"},
    {name: "Đã hết hạn", value: "expired"},
  ]
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const paymentStatus = [
    {name: "Chưa trả", value: "unpaid"},
    {name: "Đã trả", value: "paid"},
    {name: "Đã trả một phần", value: "partial_paid"},
    {name: "Đang hoàn lại", value: "refunding"}
  ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const paymentType = [
    {name: "Tiền mặt", value: 1},
    {name: "Chuyển khoản", value: 3},
    {name: "QR Pay", value: 4},
    {name: "Tiêu điểm", value: 5},
    {name: "COD", value: 0},
  ]
  const formRef = createRef<FormInstance>();

  const onChangeOrderOptions = useCallback((e) => {
    console.log('ok lets go', e.target.value);
    
  }, []);

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

  const onChangeRangeDate = useCallback(
    (dates, dateString, type) => {
      console.log(dates, dateString, type)
      switch(type) {
        case 'issued':
          setIssuedOnMin(dateString[0])
          setIssuedOnMax(dateString[1])
          break;
        case 'ship':
          setShipOnMin(dateString[0])
          setShipOnMax(dateString[1])
          break;
        case 'completed':
          setCompletedOnMin(dateString[0])
          setCompletedOnMax(dateString[1])
          break;
        case 'cancelled':
          setCancelledOnMin(dateString[0])
          setCancelledOnMax(dateString[1])
          break;  
        default: break
      }
    },
    []
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      console.log('key', tag.key)
      console.log('params', params);
      switch(tag.key) {
        case 'store':
          onFilter && onFilter({...params, store_ids: []});
          break;
        case 'source':
          onFilter && onFilter({...params, source_ids: []});
          break;
        case 'issued':
          setIssuedOnMin(null)
          setIssuedOnMax(null)
          onFilter && onFilter({...params, issued_on_min: null, issued_on_max: null});
          break;
        case 'ship':
          setShipOnMin(null)
          setShipOnMax(null)
          onFilter && onFilter({...params, ship_on_min: null, ship_on_max: null});
          break;
        case 'completed':
          setCompletedOnMin(null)
          setCompletedOnMax(null)
          onFilter && onFilter({...params, completed_on_min: null, completed_on_max: null});
          break;
        case 'cancelled':
          setCancelledOnMin(null)
          setCancelledOnMax(null)
          onFilter && onFilter({...params, cancelled_on_min: null, cancelled_on_max: null});
          break;
        case 'order_status':
          onFilter && onFilter({...params, order_status: []});
          break;
        case 'fulfillment_status':
          onFilter && onFilter({...params, fulfillment_status: []});
          break;
        case 'payment_status':
          onFilter && onFilter({...params, payment_status: []});
          break;
        case 'assignee':
          onFilter && onFilter({...params, assignee: []});
          break;
        case 'account':
          onFilter && onFilter({...params, account: []});
          break;
        case 'price':
          onFilter && onFilter({...params, price_min: null, price_max: null});
          break;
        case 'payment_method':
          onFilter && onFilter({...params, payment_method_ids: []});
          break;
        case 'expected_receive_predefined':
          onFilter && onFilter({...params, expected_receive_predefined: ""});
          break;
        case 'ship_by':
          onFilter && onFilter({...params, ship_by: ""});
          break;
        case 'note':
          onFilter && onFilter({...params, note: ""});
          break;
        case 'customer_note':
          onFilter && onFilter({...params, customer_note: ""});
          break;
        case 'tags':
          onFilter && onFilter({...params, tags: []});
          break;
        case 'reference_code':
          onFilter && onFilter({...params, reference_code: ""});
          break;  
        default: break
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  

  const clickOptionDate = useCallback(
    (type, value) => {
    let minValue = null;
    let maxValue = null;

    console.log('value', value);
    
    switch(value) {
      case 'today':
        minValue = moment().startOf('day').format('DD-MM-YYYY')
        maxValue = moment().endOf('day').format('DD-MM-YYYY')
        break
      case 'yesterday':
        minValue = moment().startOf('day').subtract(1, 'days').format('DD-MM-YYYY')
        maxValue = moment().endOf('day').subtract(1, 'days').format('DD-MM-YYYY')
        break
      case 'thisweek':
        minValue = moment().startOf('week').format('DD-MM-YYYY')
        maxValue = moment().endOf('week').format('DD-MM-YYYY')
        break
      case 'lastweek':
        minValue = moment().startOf('week').subtract(1, 'weeks').format('DD-MM-YYYY')
        maxValue = moment().endOf('week').subtract(1, 'weeks').format('DD-MM-YYYY')
        break
      case 'thismonth':
        minValue = moment().startOf('month').format('DD-MM-YYYY')
        maxValue = moment().endOf('month').format('DD-MM-YYYY')
        break
      case 'lastmonth':
        minValue = moment().startOf('month').subtract(1, 'months').format('DD-MM-YYYY')
        maxValue = moment().endOf('month').subtract(1, 'months').format('DD-MM-YYYY')
        break  
      default:
        break
    }
    console.log('minValue', minValue);
    console.log('maxValue', maxValue);
    
    switch(type) {
      case 'issued':
        setIssuedOnMin(moment(minValue, 'DD-MM-YYYY'))
        setIssuedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'ship':
        setShipOnMin(moment(minValue, 'DD-MM-YYYY'))
        setShipOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'completed':
        setCompletedOnMin(moment(minValue, 'DD-MM-YYYY'))
        setCompletedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'cancelled':
        setCancelledOnMin(moment(minValue, 'DD-MM-YYYY'))
        setCancelledOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      default:
        break
    }
  }, []);

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  const initialValues = useMemo(() => {
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
      assignee: Array.isArray(params.assignee) ? params.assignee : [params.assignee],
      account: Array.isArray(params.account) ? params.account : [params.account],
  }}, [params])
  const [issuedOnMin, setIssuedOnMin] = useState(initialValues.issued_on_min? moment(initialValues.issued_on_min, "DD-MM-YYYY") : null);
  const [issuedOnMax, setIssuedOnMax] = useState(initialValues.issued_on_max? moment(initialValues.issued_on_max, "DD-MM-YYYY") : null);
  const [shipOnMin, setShipOnMin] = useState(initialValues.ship_on_min? moment(initialValues.ship_on_min, "DD-MM-YYYY") : null);
  const [shipOnMax, setShipOnMax] = useState(initialValues.ship_on_max? moment(initialValues.ship_on_max, "DD-MM-YYYY") : null);
  const [completedOnMin, setCompletedOnMin] = useState(initialValues.completed_on_min? moment(initialValues.completed_on_min, "DD-MM-YYYY") : null);
  const [completedOnMax, setCompletedOnMax] = useState(initialValues.completed_on_min? moment(initialValues.completed_on_min, "DD-MM-YYYY") : null);
  const [cancelledOnMin, setCancelledOnMin] = useState(initialValues.cancelled_on_min? moment(initialValues.cancelled_on_min, "DD-MM-YYYY") : null);
  const [cancelledOnMax, setCancelledOnMax] = useState(initialValues.cancelled_on_min? moment(initialValues.cancelled_on_min, "DD-MM-YYYY") : null);
  const onFinish = useCallback(
    (values) => {
      console.log('values filter 2', values);
      console.log('issuedOnMin', issuedOnMin);
      const valuesForm = {
        ...values,
        issued_on_min: issuedOnMin ? moment(issuedOnMin, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : null,
        issued_on_max: issuedOnMax ? moment(issuedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_min: shipOnMin ? moment(shipOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_max: shipOnMax ? moment(shipOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_min: completedOnMin ? moment(completedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_max: completedOnMax ? moment(completedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_min: cancelledOnMin ? moment(cancelledOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_max: cancelledOnMax ? moment(cancelledOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [cancelledOnMax, cancelledOnMin, completedOnMax, completedOnMin, issuedOnMax, issuedOnMin, onFilter, shipOnMax, shipOnMin]
  );
  let filters = useMemo(() => {
    let list = []
    // console.log('filters initialValues', initialValues);
    if (initialValues.store_ids.length) {
      let textStores = ""
      initialValues.store_ids.forEach(store_id => {
        const store = listStore?.find(store => store.id.toString() === store_id)
        textStores = store ? textStores + store.name + ";" : textStores
      })
      list.push({
        key: 'store',
        name: 'Cửa hàng',
        value: textStores
      })
    }
    if (initialValues.source_ids.length) {
      let textSource = ""
      initialValues.source_ids.forEach(source_id => {
        const source = listSources?.find(source => source.id.toString() === source_id)
        textSource = source ? textSource + source.name + ";" : textSource
      })
      list.push({
        key: 'source',
        name: 'Nguồn',
        value: textSource
      })
    }
    if (initialValues.issued_on_min || initialValues.issued_on_max) {
      let textOrderCreateDate = (initialValues.issued_on_min ? initialValues.issued_on_min : '??') + " ~ " + (initialValues.issued_on_max ? initialValues.issued_on_max : '??')
      list.push({
        key: 'issued',
        name: 'Ngày tạo đơn',
        value: textOrderCreateDate
      })
    }
    if (initialValues.ship_on_min || initialValues.ship_on_max) {
      let textOrderShipDate = (initialValues.ship_on_min ? initialValues.ship_on_min : '??') + " ~ " + (initialValues.ship_on_max ? initialValues.ship_on_max : '??')
      list.push({
        key: 'ship',
        name: 'Ngày duyệt đơn',
        value: textOrderShipDate
      })
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate = (initialValues.completed_on_min ? initialValues.completed_on_min : '??') + " ~ " + (initialValues.completed_on_max ? initialValues.completed_on_max : '??')
      list.push({
        key: 'completed',
        name: 'Ngày hoàn tất đơn',
        value: textOrderCompleteDate
      })
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate = (initialValues.cancelled_on_min ? initialValues.cancelled_on_min : '??') + " ~ " + (initialValues.cancelled_on_max ? initialValues.cancelled_on_max : '??')
      list.push({
        key: 'cancelled',
        name: 'Ngày huỷ đơn',
        value: textOrderCancelDate
      })
    }
    if (initialValues.order_status.length) {
      let textStatus = ""
      initialValues.order_status.forEach(i => {
        const findStatus = status?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'order_status',
        name: 'Trạng thái đơn hàng',
        value: textStatus
      })
    }
    if (initialValues.fulfillment_status.length) {
      let textStatus = ""
      initialValues.fulfillment_status.forEach(i => {
        const findStatus = fulfillmentStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'fulfillment_status',
        name: 'Trạng thái giao hàng',
        value: textStatus
      })
    }

    if (initialValues.payment_status.length) {
      let textStatus = ""
      initialValues.payment_status.forEach(i => {
        const findStatus = paymentStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'payment_status',
        name: 'Trạng thái thanh toán',
        value: textStatus
      })
    }

    if (initialValues.assignee.length) {
      let textAccount = ""
      initialValues.assignee.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'assignee',
        name: 'Nhân viên bán hàng',
        value: textAccount
      })
    }

    if (initialValues.account.length) {
      let textAccount = ""
      initialValues.account.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'account',
        name: 'Nhân viên tạo đơn',
        value: textAccount
      })
    }

    if (initialValues.price_min || initialValues.price_max) {
      let textPrice = (initialValues.price_min ? initialValues.price_min : " ?? ") + " ~ " + (initialValues.price_max ? initialValues.price_max : " ?? ")
      list.push({
        key: 'price',
        name: 'Tổng tiền',
        value: textPrice
      })
    }

    if (initialValues.payment_method_ids.length) {
      let textStatus = ""
      initialValues.payment_method_ids.forEach(i => {
        const findStatus = paymentType?.find(item => item.value.toString() === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'payment_method',
        name: 'Phương thức thanh toán',
        value: textStatus
      })
    }
    if (initialValues.ship_by) {
      const findSerivice = deliveryService.find(item => item.id.toString() === initialValues.ship_by)
      list.push({
        key: 'ship_by',
        name: 'Hình thức vận chuyển',
        value: findSerivice.name
      })
    }
    if (initialValues.expected_receive_predefined) {
      list.push({
        key: 'expected_receive_predefined',
        name: 'Ngày dự kiến nhận hàng',
        value: initialValues.expected_receive_predefined
      })
    }
    if (initialValues.note) {
      list.push({
        key: 'note',
        name: 'Ghi chú nội bộ',
        value: initialValues.note
      })
    }

    if (initialValues.customer_note) {
      list.push({
        key: 'customer_note',
        name: 'Ghi chú của khách',
        value: initialValues.customer_note
      })
    }

    if (initialValues.tags.length) {
      let textStatus = ""
      initialValues.tags.forEach(i => {
        textStatus = textStatus + i + ";"
      })
      list.push({
        key: 'tags',
        name: 'Tags',
        value: textStatus
      })
    }

    if (initialValues.reference_code) {
      list.push({
        key: 'reference_code',
        name: 'Mã tham chiếu',
        value: initialValues.reference_code
      })
    }
    // console.log('filters list', list);
    return list
  }, [accounts, deliveryService, fulfillmentStatus, initialValues, listSources, listStore, paymentStatus, paymentType, status]);

  

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} defaultValue="a">
          <Radio.Button value="a">Tất cả đơn hàng</Radio.Button>
          <Radio.Button value="b">Đơn hàng online</Radio.Button>
          <Radio.Button value="c">Đơn hàng offline</Radio.Button>
        </Radio.Group>
      </div>
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
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.store_ids.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.source_ids.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.issued_on_min && initialValues.issued_on_max ? ["1"]: []}>
                  <Panel header="NGÀY TẠO ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('issued', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('issued', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('issued', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('issued', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('issued', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('issued', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[issuedOnMin? moment(issuedOnMin, "DD-MM-YYYY") : null, issuedOnMax? moment(issuedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'issued')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.ship_on_min && initialValues.ship_on_max ? ["1"]: []}>
                  <Panel header="NGÀY DUYỆT ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('ship', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('ship', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('ship', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('ship', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('ship', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('ship', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[shipOnMin? moment(shipOnMin, "DD-MM-YYYY") : null, shipOnMax? moment(shipOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'ship')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.completed_on_min && initialValues.completed_on_max ? ["1"]: []}>
                  <Panel header="NGÀY HOÀN TẤT ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('completed', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('completed', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('completed', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('completed', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('completed', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('completed', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[completedOnMin? moment(completedOnMin, "DD-MM-YYYY") : null, completedOnMax? moment(completedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'completed')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.cancelled_on_min && initialValues.cancelled_on_max ? ["1"]: []}>
                  <Panel header="NGÀY HUỶ ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('cancelled', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('cancelled', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('cancelled', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('cancelled', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('cancelled', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('cancelled', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[cancelledOnMin? moment(cancelledOnMin, "DD-MM-YYYY") : null, cancelledOnMax? moment(cancelledOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'cancelled')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.order_status.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.fulfillment_status.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.payment_status.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.store_ids.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.assignee.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.account.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.price_min || initialValues.price_max ? ["1"]: []}>
                  <Panel header="TỔNG TIỀN" key="1" className="header-filter">
                    <Input.Group compact>
                      <Item name="price_min" style={{ width: '45%', textAlign: 'center' }}>
                        <InputNumber className="price_min"  placeholder="Minimum" />
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
                        <InputNumber
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
                <Collapse defaultActiveKey={initialValues.payment_method_ids.length ? ["1"]: []}>
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
            {/* <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.store_ids.length ? ["1"]: []}>
                  <Panel header="NGÀY DỰ KIẾN NHẬN HÀNG" key="1" className="header-filter">
                    <Item name="expected_receive_predefined">
                      <DatePicker
                        placeholder="Chọn ngày"
                        format="DD-MM-YYYY"
                        style={{width: "100%"}}
                      />
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row> */}
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.ship_by ? ["1"]: []}>
                  <Panel header="HÌNH THỨC VẬN CHUYỂN" key="1" className="header-filter">
                    <Item name="ship_by">
                      <Select optionFilterProp="children" showSearch placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}>
                        {/* <Option value="">Hình thức vận chuyển</Option> */}
                        {deliveryService?.map((item) => (
                          <Option key={item.id} value={item.id.toString()}>
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
                <Collapse defaultActiveKey={initialValues.note ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.customer_note ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.tags.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.reference_code ? ["1"]: []}>
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
      <div className="order-filter-tags">
        {filters && filters.map((filter: any, index) => {
          return (
            <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </div>
  );
};

export default OrderFilter;
