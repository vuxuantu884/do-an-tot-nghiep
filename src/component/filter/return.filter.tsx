import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Collapse,
  Tag,
  Select,
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import { ReturnSearchQuery } from "model/order/return.model";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";

const { Panel } = Collapse;
type ReturnFilterProps = {
  params: ReturnSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  reasons: Array<{id: number; name: string}>;
  isLoading: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: ReturnSearchQuery| Object) => void;
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
    reasons,
    isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  const [visible, setVisible] = useState(false);
  
  const loadingFilter = useMemo(() => {
    return isLoading ? true : false
  }, [isLoading])

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
        
        case 'created':
          setCreatedOnMin(dateString[0])
          setCreatedOnMax(dateString[1])
          break;
        case 'received':
          setReceivedOnMin(dateString[0])
          setReceivedOnMax(dateString[1])
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
        
        case 'created':
          setCreatedOnMin(null)
          setCreatedOnMax(null)
          onFilter && onFilter({...params, created_on_min: null, created_on_max: null});
          break;
        case 'received':
          setReceivedOnMin(null)
          setReceivedOnMax(null)
          onFilter && onFilter({...params, received_on_min: null, received_on_max: null});
          break;
        case 'reason_ids':
          onFilter && onFilter({...params, reason_ids: []});
          break;
        
        case 'is_received':
          onFilter && onFilter({...params, is_received: []});
          break;
        case 'payment_status':
          onFilter && onFilter({...params, payment_status: []});
          break;
         
        default: break
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  const [createdClick, setCreatedClick] = useState('');
  const [receivedClick, setReceivedClick] = useState('');

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
      
      case 'created':
        
        if (createdClick === value ) {
          setCreatedClick('')
          setCreatedOnMin(null)
          setCreatedOnMax(null)
        } else {
          setCreatedClick(value)
          setCreatedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setCreatedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'received':
      
        if (receivedClick === value ) {
          setReceivedClick('')
          setReceivedOnMin(null)
          setReceivedOnMax(null)
        } else {
          setReceivedClick(value)
          setReceivedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setReceivedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      default:
        break
    }
  }, [receivedClick, createdClick]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      is_received: Array.isArray(params.is_received) ? params.is_received : [params.is_received],
      payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      reason_ids: Array.isArray(params.reason_ids) ? params.reason_ids : [params.reason_ids],
  }}, [params])
  const [createdOnMin, setCreatedOnMin] = useState(initialValues.created_on_min? moment(initialValues.created_on_min, "DD-MM-YYYY") : null);
  const [createdOnMax, setCreatedOnMax] = useState(initialValues.created_on_max? moment(initialValues.created_on_max, "DD-MM-YYYY") : null);
  const [receivedOnMin, setReceivedOnMin] = useState(initialValues.received_on_min? moment(initialValues.received_on_min, "DD-MM-YYYY") : null);
  const [receivedOnMax, setReceivedOnMax] = useState(initialValues.received_on_max? moment(initialValues.received_on_max, "DD-MM-YYYY") : null);
  
  const [isReceived, setIsReceived] = useState<any[]>(initialValues.is_received);
  const [paymentStatus, setPaymentStatus] = useState<any[]>(initialValues.payment_status);

  const changeIsReceived = useCallback((status) => {
    let newIsReceived = [...isReceived]
    switch (status) {
      case 'true':
        const index1 = newIsReceived.indexOf('true');
        if (index1 > -1) {
          newIsReceived.splice(index1, 1);
        } else {
          newIsReceived.push('true')
        }
        break;
      case 'false':
        const index2 = newIsReceived.indexOf('false');
        if (index2 > -1) {
          newIsReceived.splice(index2, 1);
        }  else {
          newIsReceived.push('false')
        }
        break;
      
      default: break;  
    }
    console.log();
    
    setIsReceived(newIsReceived)
  }, [isReceived]);

  const changePaymentStatus = useCallback((status) => {
    let newPaymentStatus = [...paymentStatus]
    
    switch (status) {
      case 'unpaid':
        const index1 = newPaymentStatus.indexOf('unpaid');
        if (index1 > -1) {
          newPaymentStatus.splice(index1, 1);
        } else {
          newPaymentStatus.push('unpaid')
        }
        break;
      case 'partial_paid':
        const index2 = newPaymentStatus.indexOf('partial_paid');
        if (index2 > -1) {
          newPaymentStatus.splice(index2, 1);
        }  else {
          newPaymentStatus.push('partial_paid')
        }
        break;
      case 'paid':
        const index = newPaymentStatus.indexOf('paid');
        if (index > -1) {
          newPaymentStatus.splice(index, 1);
        } else {
          newPaymentStatus.push('paid')
        }
        break
      default: break;  
    }
    setPaymentStatus(newPaymentStatus)

  }, [paymentStatus]);
  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        is_received: isReceived,
        payment_status: paymentStatus,
        created_on_min: createdOnMin ? moment(createdOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        created_on_max: createdOnMax ? moment(createdOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_min: receivedOnMin ? moment(receivedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_max: receivedOnMax ? moment(receivedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [isReceived, paymentStatus, createdOnMin, createdOnMax, receivedOnMin, receivedOnMax, onFilter]
  );
  let filters = useMemo(() => {
    let list = []
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
    if (initialValues.reason_ids.length) {
      let textReason = ""
      initialValues.reason_ids.forEach(reason_id => {
        const reason = reasons?.find(reason => reason.id.toString() === reason_id)
        textReason = reason ? textReason + reason.name + ";" : textReason
      })
      list.push({
        key: 'reason_ids',
        name: 'Lý do trả hàng',
        value: textReason
      })
    }
    if (initialValues.is_received.length) {
      let textReceived = ""
      initialValues.is_received.forEach(received => {
        
        textReceived = received ? textReceived + "Đã nhận hàng;": textReceived + "Chưa nhận hàng;"
      })
      list.push({
        key: 'is_received',
        name: 'Trạng thái nhận hàng',
        value: textReceived
      })
    }
    if (initialValues.payment_status.length) {
      let paymentStt = ""
      const payments = [
        {name: "Chưa hoàn tiền", value: 'unpaid'},
        {name: "Hoàn tiền một phần", value: 'partial_paid'},
        {name: "Đã hoàn tiền", value: 'paid'},
      ]
      initialValues.payment_status.forEach(status => {
        const findStatus = payments.find(item => item.value === status)
        paymentStt = findStatus ? paymentStt + findStatus.name + ";" : paymentStt
      })
      list.push({
        key: 'payment_status',
        name: 'Trạng thái hoàn tiền',
        value: paymentStt
      })
    }
    if (initialValues.created_on_min || initialValues.created_on_max) {
      let textOrderCreatedDate = (initialValues.created_on_min ? initialValues.created_on_min : '??') + " ~ " + (initialValues.created_on_max ? initialValues.created_on_max : '??')
      list.push({
        key: 'created',
        name: 'Ngày tạo đơn',
        value: textOrderCreatedDate
      })
    }

    if (initialValues.received_on_min || initialValues.received_on_max) {
      let textOrderReceivedDate = (initialValues.received_on_min ? initialValues.received_on_min : '??') + " ~ " + (initialValues.received_on_max ? initialValues.received_on_max : '??')
      list.push({
        key: 'received',
        name: 'Ngày trả hàng',
        value: textOrderReceivedDate
      })
    }
    
    return list
  }, [initialValues.created_on_max, initialValues.created_on_min, initialValues.is_received, initialValues.payment_status, initialValues.reason_ids, initialValues.received_on_max, initialValues.received_on_min, initialValues.store_ids, listStore, reasons]);

  useEffect(() => {
    setIsReceived(Array.isArray(params.is_received) ? params.is_received : [params.is_received])
    setPaymentStatus(Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status])
  }, [params.is_received, params.payment_status]);

  return (
    <div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã đơn trả hàng, tên, sđt khách hàng"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    search_term: e.target.value.trim()
                  })
                }}
              />
            </Item>
            
            <Item>
              <Button type="primary" loading={loadingFilter} htmlType="submit">
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
          {visible && <Form
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
                        allowClear
                        showArrow
                        placeholder="Cửa hàng"
                        optionFilterProp="children"
                        style={{
                          width: '100%'
                        }}
                        notFoundContent="Không tìm thấy kết quả"
                        maxTagCount="responsive"
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
                <Collapse defaultActiveKey={initialValues.is_received.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI NHẬN HÀNG" key="1" className="header-filter">
                    <div className="button-option">
                      <Button
                        onClick={() => changeIsReceived('true')}
                        className={isReceived.includes('true') ? 'active' : 'deactive'}
                      >
                        Đã nhận hàng
                      </Button>
                      
                      <Button
                        onClick={() => changeIsReceived('false')}
                        className={isReceived.includes('false') ? 'active' : 'deactive'}
                      >
                        Chưa nhận hàng
                      </Button>
                    </div>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.payment_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI HOÀN TIỀN" key="1" className="header-filter">
                    <div className="button-option">
                      <Button
                        onClick={() => changePaymentStatus('unpaid')}
                        className={paymentStatus.includes('unpaid') ? 'active' : 'deactive'}
                      >
                        Chưa hoàn tiền
                      </Button>
                      <Button
                        onClick={() => changePaymentStatus('partial_paid')}
                        className={paymentStatus.includes('partial_paid') ? 'active' : 'deactive'}
                      >
                        Hoàn tiền một phần
                      </Button>
                    </div>
                    <div className="button-option">
                      <Button
                        onClick={() => changePaymentStatus('paid')}
                        className={paymentStatus.includes('paid') ? 'active' : 'deactive'}
                      >
                        Hoàn tiền toàn bộ
                      </Button>
                    </div>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.created_on_min && initialValues.created_on_max ? ["1"]: []}>
                  <Panel header="NGÀY TẠO ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('created', 'yesterday')} className={createdClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('created', 'today')} className={createdClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('created', 'thisweek')} className={createdClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('created', 'lastweek')} className={createdClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('created', 'thismonth')} className={createdClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('created', 'lastmonth')} className={createdClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[createdOnMin? moment(createdOnMin, "DD-MM-YYYY") : null, createdOnMax? moment(createdOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'created')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>

            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.received_on_min && initialValues.received_on_max ? ["1"]: []}>
                  <Panel header="NGÀY TRẢ HÀNG" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('received', 'yesterday')} className={receivedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('received', 'today')} className={receivedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('received', 'thisweek')} className={receivedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('received', 'lastweek')} className={receivedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('received', 'thismonth')} className={receivedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('received', 'lastmonth')} className={receivedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[receivedOnMin? moment(receivedOnMin, "DD-MM-YYYY") : null, receivedOnMax? moment(receivedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'received')}
                    /> 
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.reason_ids.length ? ["1"]: []}>
                  <Panel header="LÝ DO TRẢ HÀNG" key="1" className="header-filter">
                    <Item name="reason_ids">
                      <Select
                        mode="multiple" showSearch placeholder="Chọn lý do trả hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {reasons.map((reason) => (
                          <Option key={reason.id.toString()} value={reason.id.toString()}>
                            {reason.name}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                    
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            
          </Form>}
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
