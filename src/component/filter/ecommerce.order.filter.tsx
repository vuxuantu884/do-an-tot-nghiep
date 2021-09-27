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
  InputNumber,
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
type OrderFilterProps = {
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

const EcommerceOrderFilter: React.FC<OrderFilterProps> = (
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
  const paymentType = useMemo(() => [
    {name: "Tiền mặt", value: 1},
    {name: "Chuyển khoản", value: 3},
    {name: "QR Pay", value: 4},
    {name: "Tiêu điểm", value: 5},
    {name: "COD", value: 0},
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
  // const onChangeOrderOptions = useCallback((e) => {
  //   console.log('ok lets go', e.target.value);
  //   onFilter && onFilter({...params, is_online: e.target.value});
  // }, [onFilter, params]);

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
          setIssuedClick('')
          setIssuedOnMin(dateString[0])
          setIssuedOnMax(dateString[1])
          break;
        case 'finalized':
          setFinalizedClick('')
          setFinalizedOnMin(dateString[0])
          setFinalizedOnMax(dateString[1])
          break;
        case 'completed':
          setCompletedClick('')
          setCompletedOnMin(dateString[0])
          setCompletedOnMax(dateString[1])
          break;
        case 'cancelled':
          setCancelledClick('')
          setCancelledOnMin(dateString[0])
          setCancelledOnMax(dateString[1])
          break;
        case 'expected':
          setExpectedClick('')
          setExpectedReceiveOnMin(dateString[0])
          setExpectedReceiveOnMax(dateString[1])
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
          setIssuedClick('')
          setIssuedOnMin(null)
          setIssuedOnMax(null)
          onFilter && onFilter({...params, issued_on_min: null, issued_on_max: null});
          break;
        case 'finalized':
          setFinalizedClick('')
          setFinalizedOnMin(null)
          setFinalizedOnMax(null)
          onFilter && onFilter({...params, finalized_on_min: null, finalized_on_max: null});
          break;
        case 'completed':
          setCompletedClick('')
          setCompletedOnMin(null)
          setCompletedOnMax(null)
          onFilter && onFilter({...params, completed_on_min: null, completed_on_max: null});
          break;
        case 'cancelled':
          setCancelledClick('')
          setCancelledOnMin(null)
          setCancelledOnMax(null)
          onFilter && onFilter({...params, cancelled_on_min: null, cancelled_on_max: null});
          break;
        case 'expected':
          setExpectedClick('')
          setExpectedReceiveOnMin(null)
          setExpectedReceiveOnMax(null)
          onFilter && onFilter({...params, expected_receive_on_min: null, expected_receive_on_max: null});
          break;  
        case 'order_status':
          onFilter && onFilter({...params, order_status: []});
          break;
        case 'order_sub_status':
          onFilter && onFilter({...params, order_sub_status: []});
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
          setIssuedOnMin(null)
          setIssuedOnMax(null)
        } else {
          setIssuedClick(value)
          setIssuedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setIssuedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'finalized':
        
        if (finalizedClick === value ) {
          setFinalizedClick('')
          setFinalizedOnMin(null)
          setFinalizedOnMax(null)
        } else {
          setFinalizedClick(value)
          setFinalizedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setFinalizedOnMax(moment(maxValue, 'DD-MM-YYYY'))
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
      case 'cancelled':
        
        if (cancelledClick === value ) {
          setCancelledClick('')
          setCancelledOnMin(null)
          setCancelledOnMax(null)
        } else {
          setCancelledClick(value)
          setCancelledOnMin(moment(minValue, 'DD-MM-YYYY'))
          setCancelledOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'expected':
        
        if (expectedClick === value ) {
          setExpectedClick('')
          setExpectedReceiveOnMin(null)
          setExpectedReceiveOnMax(null)
        } else {
          setExpectedClick(value)
          setExpectedReceiveOnMin(moment(minValue, 'DD-MM-YYYY'))
          setExpectedReceiveOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break  
      default:
        break
    }
  }, [cancelledClick, completedClick, expectedClick, issuedClick, finalizedClick]);

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  
  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      order_sub_status: Array.isArray(params.order_sub_status) ? params.order_sub_status : [params.order_sub_status],
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
  const [issuedOnMin, setIssuedOnMin] = useState(initialValues.issued_on_min? moment(initialValues.issued_on_min, "DD-MM-YYYY") : null);
  const [issuedOnMax, setIssuedOnMax] = useState(initialValues.issued_on_max? moment(initialValues.issued_on_max, "DD-MM-YYYY") : null);
  const [finalizedOnMin, setFinalizedOnMin] = useState(initialValues.finalized_on_min? moment(initialValues.finalized_on_min, "DD-MM-YYYY") : null);
  const [finalizedOnMax, setFinalizedOnMax] = useState(initialValues.finalized_on_max? moment(initialValues.finalized_on_max, "DD-MM-YYYY") : null);
  const [completedOnMin, setCompletedOnMin] = useState(initialValues.completed_on_min? moment(initialValues.completed_on_min, "DD-MM-YYYY") : null);
  const [completedOnMax, setCompletedOnMax] = useState(initialValues.completed_on_max? moment(initialValues.completed_on_max, "DD-MM-YYYY") : null);
  const [cancelledOnMin, setCancelledOnMin] = useState(initialValues.cancelled_on_min? moment(initialValues.cancelled_on_min, "DD-MM-YYYY") : null);
  const [cancelledOnMax, setCancelledOnMax] = useState(initialValues.cancelled_on_max? moment(initialValues.cancelled_on_max, "DD-MM-YYYY") : null);
  const [expectedReceiveOnMin, setExpectedReceiveOnMin] = useState(initialValues.expected_receive_on_min? moment(initialValues.expected_receive_on_min, "DD-MM-YYYY") : null);
  const [expectedReceiveOnMax, setExpectedReceiveOnMax] = useState(initialValues.expected_receive_on_max? moment(initialValues.expected_receive_on_max, "DD-MM-YYYY") : null);
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
        issued_on_min: issuedOnMin ? moment(issuedOnMin, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : null,
        issued_on_max: issuedOnMax ? moment(issuedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        finalized_on_min: finalizedOnMin ? moment(finalizedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        finalized_on_max: finalizedOnMax ? moment(finalizedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_min: completedOnMin ? moment(completedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        completed_on_max: completedOnMax ? moment(completedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_min: cancelledOnMin ? moment(cancelledOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_max: cancelledOnMax ? moment(cancelledOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        expected_receive_on_min: expectedReceiveOnMin ? moment(expectedReceiveOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        expected_receive_on_max: expectedReceiveOnMax ? moment(expectedReceiveOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [cancelledOnMax, cancelledOnMin, completedOnMax, completedOnMin, expectedReceiveOnMax, expectedReceiveOnMin, issuedOnMax, issuedOnMin, onFilter, finalizedOnMax, finalizedOnMin]
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
    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      let textOrderFinalizedDate = (initialValues.finalized_on_min ? initialValues.finalized_on_min : '??') + " ~ " + (initialValues.finalized_on_max ? initialValues.finalized_on_max : '??')
      list.push({
        key: 'finalized',
        name: 'Ngày duyệt đơn',
        value: textOrderFinalizedDate
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

    if (initialValues.expected_receive_on_min || initialValues.expected_receive_on_max) {
      let textExpectReceiveDate = (initialValues.expected_receive_on_min ? initialValues.expected_receive_on_min : '??') + " ~ " + (initialValues.expected_receive_on_max ? initialValues.expected_receive_on_max : '??')
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
    if (initialValues.order_sub_status.length) {
      let textStatus = ""
      
      initialValues.order_sub_status.forEach(i => {
        const findStatus = subStatus?.find(item => item.id.toString() === i)
        textStatus = findStatus ? textStatus + findStatus.sub_status + ";" : textStatus
      })
      list.push({
        key: 'order_sub_status',
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
        const findStatus = paymentType?.find(item => item.value.toString() === i)
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
  }, [accounts, deliveryService, serviceType, fulfillmentStatus, initialValues, listSources, listStore, paymentStatus, paymentType, status, subStatus]);

  

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
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
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
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
                      <Button onClick={() => clickOptionDate('issued', 'yesterday')} className={issuedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('issued', 'today')} className={issuedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('issued', 'thisweek')} className={issuedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('issued', 'lastweek')} className={issuedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('issued', 'thismonth')} className={issuedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('issued', 'lastmonth')} className={issuedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
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
                <Collapse defaultActiveKey={initialValues.finalized_on_min && initialValues.finalized_on_max ? ["1"]: []}>
                  <Panel header="NGÀY DUYỆT ĐƠN" key="1" className="header-filter">
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
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[finalizedOnMin? moment(finalizedOnMin, "DD-MM-YYYY") : null, finalizedOnMax? moment(finalizedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'finalized')}
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
                <Collapse defaultActiveKey={initialValues.cancelled_on_min && initialValues.cancelled_on_max ? ["1"]: []}>
                  <Panel header="NGÀY HUỶ ĐƠN" key="1" className="header-filter">
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
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.fulfillment_status.length ? ["1"]: []}>
                  <Panel header="GIAO HÀNG" key="1" className="header-filter">
                    <Item name="fulfillment_status">
                      <Select
                        mode="multiple" showSearch placeholder="Chọn trạng thái giao hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
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
                      <Select mode="multiple"
                        showSearch placeholder="Chọn trạng thái thanh toán"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
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
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.store_ids.length ? ["1"]: []}>
                  <Panel header="TRẢ HÀNG" key="1" className="header-filter">
                    <Item name="payment_status">
                      <Select
                        mode="multiple" showSearch placeholder="Chọn trạng thái trả hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <Option
                          style={{ width: "100%" }}
                          key="1"
                          value="1"
                        >
                          Pending trạng thái trả hàng
                        </Option>
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.assignee_codes.length ? ["1"]: []}>
                  <Panel header="NHÂN VIÊN BÁN HÀNG" key="1" className="header-filter">
                    <Item name="assignee_codes">
                      <Select
                        mode="multiple" showSearch placeholder="Chọn nhân viên bán hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
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
                <Collapse defaultActiveKey={initialValues.account_codes.length ? ["1"]: []}>
                  <Panel header="NHÂN VIÊN TẠO ĐƠN" key="1" className="header-filter">
                    <Item name="account_codes">
                      <Select
                        mode="multiple" showSearch placeholder="Chọn nhân viên tạo đơn"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
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
                        <InputNumber
                          className="price_min"
                          placeholder="Từ"
                          min="0"
                          max="100000000"
                        />
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
                          placeholder="Đến"
                          min="0"
                          max="1000000000"
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
                    <Select
                      mode="multiple" optionFilterProp="children" showSearch
                      notFoundContent="Không tìm thấy kết quả"
                      placeholder="Chọn phương thức thanh toán" style={{width: '100%'}}
                      getPopupContainer={trigger => trigger.parentNode}
                    >
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
                <Collapse defaultActiveKey={initialValues.expected_receive_on_min && initialValues.expected_receive_on_max ? ["1"]: []}>
                  <Panel header="NGÀY DỰ KIẾN NHÂN HÀNG" key="1" className="header-filter">
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
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[expectedReceiveOnMin? moment(expectedReceiveOnMin, "DD-MM-YYYY") : null, expectedReceiveOnMax? moment(expectedReceiveOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'expected')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.delivery_types.length ? ["1"]: []}>
                  <Panel header="HÌNH THỨC VẬN CHUYỂN" key="1" className="header-filter">
                    <Item name="delivery_types">
                      <Select
                        mode="multiple"
                        optionFilterProp="children" showSearch
                        notFoundContent="Không tìm thấy kết quả"
                        placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {/* <Option value="">Hình thức vận chuyển</Option> */}
                        {serviceType?.map((item) => (
                          <Option key={item.value} value={item.value}>
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
                <Collapse defaultActiveKey={initialValues.delivery_provider_ids.length ? ["1"]: []}>
                  <Panel header="ĐƠN VỊ VẬN CHUYỂN" key="1" className="header-filter">
                    <Item name="delivery_provider_ids">
                    <Select
                      mode="multiple" showSearch placeholder="Chọn đơn vị vận chuyển"
                      notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                      optionFilterProp="children"
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      {deliveryService?.map((item) => (
                        <Option key={item.id} value={item.id}>
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
                <Collapse defaultActiveKey={initialValues.shipper_ids.length ? ["1"]: []}>
                  <Panel header="ĐỐI TÁC GIAO HÀNG" key="1" className="header-filter">
                    <Item name="shipper_ids">
                    <Select
                      mode="multiple" showSearch placeholder="Chọn đối tác giao hàng"
                      notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                      optionFilterProp="children"
                      getPopupContainer={trigger => trigger.parentNode}
                    >
                      {accounts.filter(account => account.is_shipper === true)?.map((account) => (
                        <Option key={account.id} value={account.id}>
                          {account.full_name} - {account.code}
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
            <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </div>
  );
};

export default EcommerceOrderFilter;
