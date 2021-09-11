import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Collapse,
  Tag,
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useLayoutEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";

const { Panel } = Collapse;
type ReturnFilterProps = {
  params: OrderSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  subStatus: Array<OrderProcessingStatusModel>
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const ReturnFilter: React.FC<ReturnFilterProps> = (
  props: ReturnFilterProps
) => {
  const {
    params,
    actions,
    listStore,
    subStatus,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  const [visible, setVisible] = useState(false);
  
  const status = useMemo(() => [
    {name: "Nháp", value: "draft"},
    {name: "Đóng gói", value: "packed"},
    {name: "Xuất kho", value: "shipping"},
    {name: "Đã xác nhận", value: "finalized"},
    {name: "Hoàn thành", value: "completed"},
    {name: "Kết thúc", value: "finished"},
    {name: "Đã huỷ", value: "cancelled"},
    {name: "Đã hết hạn", value: "expired"},
  ], []);
  
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  

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
        
        case 'ship':
          setShipOnMin(dateString[0])
          setShipOnMax(dateString[1])
          break;
        case 'completed':
          setCompletedOnMin(dateString[0])
          setCompletedOnMax(dateString[1])
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
        
        
        case 'order_status':
          onFilter && onFilter({...params, order_status: []});
          break;
        
        case 'price':
          onFilter && onFilter({...params, price_min: null, price_max: null});
          break;
        case 'payment_method':
          onFilter && onFilter({...params, payment_method_ids: []});
          break;
         
        default: break
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  const [shipClick, setShipClick] = useState('');
  const [completedClick, setCompletedClick] = useState('');

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
      
      case 'ship':
        
        if (shipClick === value ) {
          setShipClick('')
          setShipOnMin(null)
          setShipOnMax(null)
        } else {
          setShipClick(value)
          setShipOnMin(moment(minValue, 'DD-MM-YYYY'))
          setShipOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'completed':
        
        if (completedClick === value ) {
          setCompletedClick('')
          setCompletedOnMin(null)
          setCompletedOnMax(null)
        } else {
          setCompletedClick(value)
          setCompletedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setCompletedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
       
      default:
        break
    }
  }, [completedClick, shipClick]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      return_status: Array.isArray(params.return_status) ? params.return_status : [params.return_status],
  }}, [params])
  const [shipOnMin, setShipOnMin] = useState(initialValues.ship_on_min? moment(initialValues.ship_on_min, "DD-MM-YYYY") : null);
  const [shipOnMax, setShipOnMax] = useState(initialValues.ship_on_max? moment(initialValues.ship_on_max, "DD-MM-YYYY") : null);
  const [completedOnMin, setCompletedOnMin] = useState(initialValues.completed_on_min? moment(initialValues.completed_on_min, "DD-MM-YYYY") : null);
  const [completedOnMax, setCompletedOnMax] = useState(initialValues.completed_on_max? moment(initialValues.completed_on_max, "DD-MM-YYYY") : null);
  const onFinish = useCallback(
    (values) => {
      if (values?.price_min > values?.price_max) {
        values = {
          ...values,
          price_min: values?.price_max,
          price_max: values?.price_min,
        }
      }
      console.log('values filter 2', values);
      const valuesForm = {
        ...values,
        ship_on_min: shipOnMin ? moment(shipOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_max: shipOnMax ? moment(shipOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_min: completedOnMin ? moment(completedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_max: completedOnMax ? moment(completedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [completedOnMax, completedOnMin, onFilter, shipOnMax, shipOnMin]
  );
  let filters = useMemo(() => {
    let list = []
    // console.log('filters initialValues', initialValues);
    
    
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
    
    // console.log('filters list', list);
    return list
  }, [initialValues]);

  

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      {/* <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} defaultValue="">
          <Radio.Button value="">Tất cả đơn hàng</Radio.Button>
          <Radio.Button value="true">Đơn hàng online</Radio.Button>
          <Radio.Button value="false">Đơn hàng offline</Radio.Button>
        </Radio.Group>
      </div> */}
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo ID đơn hàng, tên, sđt khách hàng"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    search_term: e.target.value.trim()
                  })
                }}
              />
            </Item>
            
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            {/* <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item> */}
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
          className="order-filter-drawer"
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
                        notFoundContent="Không tìm thấy kết quả"
                        style={{
                          width: '100%'
                        }}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
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
                <Collapse defaultActiveKey={initialValues.ship_on_min && initialValues.ship_on_max ? ["1"]: []}>
                  <Panel header="NGÀY DUYỆT ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('ship', 'yesterday')} className={shipClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('ship', 'today')} className={shipClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('ship', 'thisweek')} className={shipClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('ship', 'lastweek')} className={shipClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('ship', 'thismonth')} className={shipClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('ship', 'lastmonth')} className={shipClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
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
                      <Button onClick={() => clickOptionDate('completed', 'yesterday')} className={completedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('completed', 'today')} className={completedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('completed', 'thisweek')} className={completedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('completed', 'lastweek')} className={completedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('completed', 'thismonth')} className={completedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('completed', 'lastmonth')} className={completedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
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
                <Collapse defaultActiveKey={initialValues.order_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI ĐƠN HÀNG" key="1" className="header-filter">
                    <Item name="order_status">
                    <Select
                      mode="multiple"
                      showSearch placeholder="Chọn trạng thái đơn hàng"
                      notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                      optionFilterProp="children"
                      getPopupContainer={trigger => trigger.parentNode}
                    >
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
                <Collapse defaultActiveKey={initialValues.order_sub_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI XỬ LÝ ĐƠN" key="1" className="header-filter">
                    <Item name="order_sub_status">
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Chọn trạng thái xử lý đơn"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{width: '100%'}}
                      optionFilterProp="children"
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      {subStatus?.map((item: any) => (
                        <Option key={item.id} value={item.id}>
                          {item.sub_status}
                        </Option>
                      ))}
                    </Select>
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

export default ReturnFilter;
