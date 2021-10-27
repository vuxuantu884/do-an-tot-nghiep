import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
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
import { SettingOutlined, FilterOutlined, SwapRightOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import CustomDatepicker from "component/custom/new-date-picker.custom";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";

type OrderFilterProps = {
  params: OrderSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  listPaymentMethod: Array<PaymentMethodResponse>;
  subStatus: Array<OrderProcessingStatusModel>;
  isLoading?: Boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;

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
    subStatus,
    listPaymentMethod,
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
  const fulfillmentStatus = useMemo(() => [
    {name: "Chưa giao", value: "unshipped"},
    // {name: "Đã lấy hàng", value: "picked"},
    // {name: "Giao một phần", value: "partial"},
    // {name: "Đã đóng gói", value: "packed"},
    {name: "Đang giao", value: "shipping"},
    {name: "Đã giao", value: "shipped"},
    // {name: "Đã hủy", value: "cancelled"},
    // {name: "Đang trả lại", value: "returning"},
    // {name: "Đã trả lại", value: "returned"}
  ], []);
  const paymentStatus =  useMemo(() => [
    {name: "Chưa trả", value: "unpaid"},
    {name: "Đã trả", value: "paid"},
    {name: "Đã trả một phần", value: "partial_paid"},
    {name: "Đang hoàn lại", value: "refunding"}
  ], []);

  const serviceType = useMemo(() => [
    {
      name: 'Tự vận chuyển',
      value: 'shipper',
    },
    {
      name: 'Nhận tại cửa hàng',
      value: 'pick_at_store',
    },
    {
      name: 'Hãng vận chuyển',
      value: 'external_service',
    },
  ], []);
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const onChangeOrderOptions = useCallback((e) => {
    console.log('ok lets go', e.target.value);
    onFilter && onFilter({...params, is_online: e.target.value});
  }, [onFilter, params]);

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
          setIssuedClick('')
          onFilter && onFilter({...params, issued_on_min: null, issued_on_max: null});
          break;
        case 'finalized':
          setFinalizedClick('')
          onFilter && onFilter({...params, finalized_on_min: null, finalized_on_max: null});
          break;
        case 'completed':
          setCompletedClick('')
          onFilter && onFilter({...params, completed_on_min: null, completed_on_max: null});
          break;
        case 'cancelled':
          setCancelledClick('')
          onFilter && onFilter({...params, cancelled_on_min: null, cancelled_on_max: null});
          break;
        case 'expected':
          setExpectedClick('')
          onFilter && onFilter({...params, expected_receive_on_min: null, expected_receive_on_max: null});
          break;  
        case 'order_status':
          onFilter && onFilter({...params, order_status: []});
          break;
        case 'sub_status_id':
          onFilter && onFilter({...params, sub_status_id: []});
          break;
        case 'fulfillment_status':
          onFilter && onFilter({...params, fulfillment_status: []});
          break;
        case 'payment_status':
          onFilter && onFilter({...params, payment_status: []});
          break;
        case 'assignee_codes':
          onFilter && onFilter({...params, assignee_codes: []});
          break;
        case 'account_codes':
          onFilter && onFilter({...params, account_codes: []});
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
        case 'delivery_types':
          onFilter && onFilter({...params, delivery_types: []});
          break;  
        case 'delivery_provider_ids':
          onFilter && onFilter({...params, delivery_provider_ids: []});
          break;
        case 'shipper_ids':
          onFilter && onFilter({...params, shipper_ids: []});
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
  const [issuedClick, setIssuedClick] = useState('');
  const [finalizedClick, setFinalizedClick] = useState('');
  const [completedClick, setCompletedClick] = useState('');
  const [cancelledClick, setCancelledClick] = useState('');
  const [expectedClick, setExpectedClick] = useState('');

  

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  
  const initialValues = useMemo(() => {
    console.log('params', params);
    
    return {
      ...params,
      issued_on_min: params.issued_on_min? moment(params.issued_on_min, "DD-MM-YYYY") : undefined,
      issued_on_max: params.issued_on_max? moment(params.issued_on_max, "DD-MM-YYYY") : undefined,
      finalized_on_min: params.finalized_on_min? moment(params.finalized_on_min, "DD-MM-YYYY") : null,
      finalized_on_max: params.finalized_on_max? moment(params.finalized_on_max, "DD-MM-YYYY") : null,
      completed_on_min: params.completed_on_min? moment(params.completed_on_min, "DD-MM-YYYY") : null,
      completed_on_max: params.completed_on_max? moment(params.completed_on_max, "DD-MM-YYYY") : null,
      cancelled_on_min: params.cancelled_on_min? moment(params.cancelled_on_min, "DD-MM-YYYY") : null,
      cancelled_on_max: params.cancelled_on_max? moment(params.cancelled_on_max, "DD-MM-YYYY") : null,
      expected_receive_on_min: params.expected_receive_on_min? moment(params.expected_receive_on_min, "DD-MM-YYYY") : null,
      expected_receive_on_max: params.expected_receive_on_max? moment(params.expected_receive_on_max, "DD-MM-YYYY") : null,

      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      sub_status_id: Array.isArray(params.sub_status_id) ? params.sub_status_id : [params.sub_status_id],
      fulfillment_status: Array.isArray(params.fulfillment_status) ? params.fulfillment_status : [params.fulfillment_status],
      payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      return_status: Array.isArray(params.return_status) ? params.return_status : [params.return_status],
      payment_method_ids: Array.isArray(params.payment_method_ids) ? params.payment_method_ids : [params.payment_method_ids],
      delivery_provider_ids: Array.isArray(params.delivery_provider_ids) ? params.delivery_provider_ids : [params.delivery_provider_ids],
      shipper_ids: Array.isArray(params.shipper_ids) ? params.shipper_ids : [params.shipper_ids],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      assignee_codes: Array.isArray(params.assignee_codes) ? params.assignee_codes : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
  }}, [params])
  
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
        
        if (issuedClick === value ) {
          setIssuedClick('')
          formRef?.current?.setFieldsValue({
            issued_on_min: undefined,
            issued_on_max: undefined
          })
        } else {
          setIssuedClick(value)
          formRef?.current?.setFieldsValue({
            issued_on_min: moment(minValue, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            issued_on_max: moment(maxValue, 'DD-MM-YYYY').format('DD-MM-YYYY')
          })
        }
        break
      case 'finalized':
        
        if (finalizedClick === value ) {
          setFinalizedClick('')
          formRef?.current?.setFieldsValue({
            finalized_on_min: undefined,
            finalized_on_max: undefined
          })
        } else {
          setFinalizedClick(value)
          formRef?.current?.setFieldsValue({
            finalized_on_min: moment(minValue, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            finalized_on_max: moment(maxValue, 'DD-MM-YYYY').format('DD-MM-YYYY')
          })
        }
        break
      case 'completed':
        
        if (completedClick === value ) {
          setCompletedClick('')
          formRef?.current?.setFieldsValue({
            completed_on_min: undefined,
            completed_on_max: undefined
          })
        } else {
          setCompletedClick(value)
          formRef?.current?.setFieldsValue({
            completed_on_min: moment(minValue, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            completed_on_max: moment(maxValue, 'DD-MM-YYYY').format('DD-MM-YYYY')
          })
        }
        break
      case 'cancelled':
        
        if (cancelledClick === value ) {
          setCancelledClick('')
          formRef?.current?.setFieldsValue({
            cancelled_on_min: undefined,
            cancelled_on_max: undefined
          })
        } else {
          setCancelledClick(value)
          formRef?.current?.setFieldsValue({
            cancelled_on_min: moment(minValue, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            cancelled_on_max: moment(maxValue, 'DD-MM-YYYY').format('DD-MM-YYYY')
          })
        }
        break
      case 'expected':
        
        if (expectedClick === value ) {
          setExpectedClick('')
          formRef?.current?.setFieldsValue({
            expected_receive_on_min: undefined,
            expected_receive_on_max: undefined
          })
        } else {
          setExpectedClick(value)
          formRef?.current?.setFieldsValue({
            expected_receive_on_min: moment(minValue, 'DD-MM-YYYY').format('DD-MM-YYYY'),
            expected_receive_on_max: moment(maxValue, 'DD-MM-YYYY').format('DD-MM-YYYY')
          })
        }
        break  
      default:
        break
    }
  }, [cancelledClick, completedClick, expectedClick, finalizedClick, formRef, issuedClick]);

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
      
      onFilter && onFilter(values);
    },
    [onFilter]
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
      let textOrderCreateDate = (initialValues.issued_on_min ? moment(initialValues.issued_on_min, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.issued_on_max ? moment(initialValues.issued_on_max, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??')
      list.push({
        key: 'issued',
        name: 'Ngày tạo đơn',
        value: textOrderCreateDate
      })
    }
    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      let textOrderFinalizedDate = (initialValues.finalized_on_min ? moment(initialValues.finalized_on_min, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.finalized_on_max ? moment(initialValues.finalized_on_max, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??')
      list.push({
        key: 'finalized',
        name: 'Ngày duyệt đơn',
        value: textOrderFinalizedDate
      })
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate = (initialValues.completed_on_min ? moment(initialValues.completed_on_min, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.completed_on_max ? moment(initialValues.completed_on_max, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??')
      list.push({
        key: 'completed',
        name: 'Ngày hoàn tất đơn',
        value: textOrderCompleteDate
      })
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate = (initialValues.cancelled_on_min ? moment(initialValues.cancelled_on_min, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.cancelled_on_max ? moment(initialValues.cancelled_on_max, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??')
      list.push({
        key: 'cancelled',
        name: 'Ngày huỷ đơn',
        value: textOrderCancelDate
      })
    }

    if (initialValues.expected_receive_on_min || initialValues.expected_receive_on_max) {
      let textExpectReceiveDate = (initialValues.expected_receive_on_min ? moment(initialValues.expected_receive_on_min, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.expected_receive_on_max ? moment(initialValues.expected_receive_on_max, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : '??')
      list.push({
        key: 'expected',
        name: 'Ngày dự kiến nhận hàng',
        value: textExpectReceiveDate
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
    if (initialValues.sub_status_id.length) {
      let textStatus = ""
      
      initialValues.sub_status_id.forEach((i: any) => {
        const findStatus = subStatus?.find(item => item.id.toString() === i.toString())
        textStatus = findStatus ? textStatus + findStatus.sub_status + ";" : textStatus
      })
      list.push({
        key: 'sub_status_id',
        name: 'Trạng thái xử lý đơn',
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

    // if (initialValues.return_status.length) {
    //   let textStatus = ""
    //   initialValues.return_status.forEach(i => {
    //     const findStatus = paymentStatus?.find(item => item.value === i)
    //     textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
    //   })
    //   list.push({
    //     key: 'return_status',
    //     name: 'Trạng thái thanh toán',
    //     value: textStatus
    //   })
    // }

    if (initialValues.assignee_codes.length) {
      let textAccount = ""
      initialValues.assignee_codes.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'assignee_codes',
        name: 'Nhân viên bán hàng',
        value: textAccount
      })
    }

    if (initialValues.account_codes.length) {
      let textAccount = ""
      initialValues.account_codes.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'account_codes',
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
        const findStatus = listPaymentMethod?.find(item => item.id.toString() === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'payment_method',
        name: 'Phương thức thanh toán',
        value: textStatus
      })
    }
    if (initialValues.delivery_types.length) {
      let textType = ""
      initialValues.delivery_types.forEach(i => {
        const findType = serviceType?.find(item => item.value === i)
        textType = findType ? textType + findType.name + ";" : textType
      })
      list.push({
        key: 'delivery_types',
        name: 'Hình thức vận chuyển',
        value: textType
      })
    }
    if (initialValues.delivery_provider_ids.length) {
      let textType = ""
      initialValues.delivery_provider_ids.forEach((i: any) => {
        const findType = deliveryService?.find(item => item.id.toString() === i.toString())
        textType = findType ? textType + findType.name + ";" : textType
      })
      list.push({
        key: 'delivery_provider_ids',
        name: 'Đơn vị vận chuyển',
        value: textType
      })
    }
    if (initialValues.shipper_ids.length) {
      let textAccount = ""
      initialValues.shipper_ids.forEach(i => {
        const findAccount = accounts.filter(item => item.is_shipper === true)?.find(item => item.id === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'shipper_ids',
        name: 'Đối tác giao hàng',
        value: textAccount
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
  }, [accounts, deliveryService, serviceType, fulfillmentStatus, initialValues, listSources, listStore, paymentStatus, listPaymentMethod, status, subStatus]);

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400
    } else if (window.innerWidth < 1600 && window.innerWidth >=1200){
      return 1000
    } else {
      return 800
    }
  }
  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setIssuedClick('')
    setCompletedClick('')
    setCancelledClick('')
    setExpectedClick('')
    setFinalizedClick('')
  
    setVisible(false);
  }
  useLayoutEffect(() => {
    window.addEventListener('resize', () => setVisible(false))
  }, [])

  return (
    <div>
      <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={initialValues.is_online}>
          <Radio.Button value={null}>Tất cả đơn hàng</Radio.Button>
          <Radio.Button value="true">Đơn hàng online</Radio.Button>
          <Radio.Button value="false">Đơn hàng offline</Radio.Button>
        </Radio.Group>
      </div>
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
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={widthScreen()}
        >
          {visible && <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            
            <Row gutter={20}>
              <Col span={8} xxl={6}>
                <p>Kho cửa hàng</p>
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
                    maxTagCount='responsive'
                  >
                    {listStore?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
                <p>Trạng thái đơn</p>
                <Item name="order_status">
                  <CustomSelect
                    mode="multiple"
                    showSearch placeholder="Chọn trạng thái đơn hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {status?.map((item) => (
                      <CustomSelect.Option key={item.value} value={item.value.toString()}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Nguồn đơn hàng</p>
                <Item name="source_ids">
                  <CustomSelect
                    mode="multiple"
                    style={{ width: '100%'}}
                    showArrow
                    showSearch
                    placeholder="Nguồn đơn hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
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
                <p>Giao hàng</p>
                <Item name="fulfillment_status">
                  <CustomSelect
                    mode="multiple" showSearch 
                    showArrow placeholder="Chọn trạng thái giao hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                      {fulfillmentStatus.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value.toString()}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={8}  xxl={6}>
                <p>Ngày tạo đơn</p>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('issued', 'yesterday')} className={issuedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                  <Button onClick={() => clickOptionDate('issued', 'today')} className={issuedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                  <Button onClick={() => clickOptionDate('issued', 'thisweek')} className={issuedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                </div>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('issued', 'lastweek')} className={issuedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                  <Button onClick={() => clickOptionDate('issued', 'thismonth')} className={issuedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                  <Button onClick={() => clickOptionDate('issued', 'lastmonth')} className={issuedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                </div>
                <div className="date-range">
                  <Item name="issued_on_min" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Từ ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="issued_on_max" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Đến ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                </div>
              </Col>
            
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày duyệt đơn</p>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('finalized', 'yesterday')} className={finalizedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                  <Button onClick={() => clickOptionDate('finalized', 'today')} className={finalizedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                  <Button onClick={() => clickOptionDate('finalized', 'thisweek')} className={finalizedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                </div>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('finalized', 'lastweek')} className={finalizedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                  <Button onClick={() => clickOptionDate('finalized', 'thismonth')} className={finalizedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                  <Button onClick={() => clickOptionDate('finalized', 'lastmonth')} className={finalizedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                </div>
                <div className="date-range">
                  <Item name="finalized_on_min" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Từ ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="finalized_on_max" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Đến ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                </div>
              </Col>
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày hoàn tất đơn</p>
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
                <div className="date-range">
                  <Item name="completed_on_min" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Từ ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="completed_on_max" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Đến ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                </div>
              </Col>
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày huỷ đơn</p>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('cancelled', 'yesterday')} className={cancelledClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                  <Button onClick={() => clickOptionDate('cancelled', 'today')} className={cancelledClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                  <Button onClick={() => clickOptionDate('cancelled', 'thisweek')} className={cancelledClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                </div>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('cancelled', 'lastweek')} className={cancelledClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                  <Button onClick={() => clickOptionDate('cancelled', 'thismonth')} className={cancelledClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                  <Button onClick={() => clickOptionDate('cancelled', 'lastmonth')} className={cancelledClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                </div>
                <div className="date-range">
                  <Item name="cancelled_on_min" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Từ ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="cancelled_on_max" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Đến ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                </div>
              </Col>
            
              <Col span={8} xxl={6}>
                <p>Trạng thái xử lý đơn</p>
                <Item name="sub_status_id">
                  <CustomSelect
                    mode="multiple"
                    showArrow
                    showSearch
                    placeholder="Chọn trạng thái xử lý đơn"
                    notFoundContent="Không tìm thấy kết quả"
                    style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {subStatus?.map((item: any) => (
                      <CustomSelect.Option key={item.id} value={item.id.toString()}>
                        {item.sub_status}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
                <p>Thanh toán</p>
                <Item name="payment_status">
                  <CustomSelect
                    mode="multiple" showArrow
                    showSearch placeholder="Chọn trạng thái thanh toán"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {paymentStatus.map((item, index) => (
                      <CustomSelect.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.value.toString()}
                      >
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Trả hàng</p>
                <Item name="return_status">
                  <CustomSelect
                    mode="multiple" showSearch
                    showArrow placeholder="Chọn trạng thái trả hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                  >
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key="1"
                      value="1"
                    >
                      Pending trạng thái trả hàng
                    </CustomSelect.Option>
                  </CustomSelect>
                </Item>
                <p>Nhân viên bán hàng</p>
                <Item name="assignee_codes">
                  <CustomSelect
                    mode="multiple" showSearch
                    showArrow placeholder="Chọn nhân viên bán hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                      {accounts.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.code.toString()}
                        >
                          {`${item.full_name} - ${item.code}`}
                        </CustomSelect.Option>
                      ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Nhân viên tạo đơn</p>
                <Item name="account_codes">
                  <CustomSelect
                    mode="multiple" showSearch
                    showArrow placeholder="Chọn nhân viên tạo đơn"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {accounts.map((item, index) => (
                      <CustomSelect.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.code.toString()}
                      >
                        {`${item.full_name} - ${item.code}`}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
                <p>Tổng tiền</p>
                <div className="date-range">
                  <Item name="price_min" style={{ width: '45%', marginBottom: 0 }}>
                    <InputNumber
                      className="price_min"
                      placeholder="Từ"
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="price_max" style={{width: '45%', marginBottom: 0}}>
                    <InputNumber
                      className="site-input-right price_max"
                      placeholder="Đến"
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </div>
              </Col>
              <Col span={8} xxl={6}>
                <p>Phương thức thanh toán</p>
                <Item name="payment_method_ids">
                  <CustomSelect
                    mode="multiple" optionFilterProp="children"
                    showSearch showArrow
                    notFoundContent="Không tìm thấy kết quả"
                    placeholder="Chọn phương thức thanh toán" style={{width: '100%'}}
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {listPaymentMethod.map((item, index) => (
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
                <p>Đối tác giao hàng</p>
                <Item name="shipper_ids">
                  <CustomSelect
                    mode="multiple" showSearch
                    showArrow placeholder="Chọn đối tác giao hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {accounts.filter(account => account.is_shipper === true)?.map((account) => (
                      <CustomSelect.Option key={account.id} value={account.id}>
                        {account.full_name} - {account.code}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày dự kiến nhận hàng</p>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('expected', 'yesterday')} className={expectedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                  <Button onClick={() => clickOptionDate('expected', 'today')} className={expectedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                  <Button onClick={() => clickOptionDate('expected', 'thisweek')} className={expectedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                </div>
                <div className="date-option">
                  <Button onClick={() => clickOptionDate('expected', 'lastweek')} className={expectedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                  <Button onClick={() => clickOptionDate('expected', 'thismonth')} className={expectedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                  <Button onClick={() => clickOptionDate('expected', 'lastmonth')} className={expectedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                </div>
                <div className="date-range">
                  <Item name="expected_receive_on_min" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Từ ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="expected_receive_on_max" style={{width: "45%", marginBottom: 0}}>
                    <CustomDatepicker
                      format="DD-MM-YYYY"
                      placeholder="Đến ngày"
                      style={{width: "100%"}}
                    />
                  </Item>
                </div>
              </Col>
              <Col span={8} xxl={6}>
                <p>Hình thức vận chuyển</p>
                <Item name="delivery_types">
                  <CustomSelect
                    mode="multiple"
                    optionFilterProp="children" showSearch
                    showArrow notFoundContent="Không tìm thấy kết quả"
                    placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {/* <Option value="">Hình thức vận chuyển</Option> */}
                    {serviceType?.map((item) => (
                      <CustomSelect.Option key={item.value} value={item.value}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
                <p>Đơn vị vận chuyển</p>
                <Item name="delivery_provider_ids">
                <CustomSelect
                  mode="multiple" showSearch
                  showArrow placeholder="Chọn đơn vị vận chuyển"
                  notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                  optionFilterProp="children"
                  getPopupContainer={trigger => trigger.parentNode}
                  maxTagCount='responsive'
                >
                  {deliveryService?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Tags</p>
                <Item name="tags">
                <CustomSelect mode="tags" optionFilterProp="children" showSearch showArrow placeholder="Chọn 1 hoặc nhiều tag" style={{width: '100%'}}>
                  
                </CustomSelect>
                </Item>
                
              </Col>
              <Col span={8} xxl={6}>
                <p>Ghi chú nội bộ</p>
                <Item name="note">
                  <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Ghi chú của khách</p>
                <Item name="customer_note">
                <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                </Item>
              </Col>
              <Col span={8} xxl={6}>
                <p>Mã tham chiếu</p>
                <Item name="reference_code">
                  <Input placeholder="Tìm kiếm theo mã tham chiếu"/>
                </Item>
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

export default OrderFilter;
