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
import { ShipmentSearchQuery } from "model/order/shipment.model";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";

const { Panel } = Collapse;
type OrderFilterProps = {
  params: ShipmentSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: ShipmentSearchQuery| Object) => void;
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
  
  // const status = useMemo(() => [
  //   {name: "Nháp", value: "draft"},
  //   {name: "Đóng gói", value: "packed"},
  //   {name: "Xuất kho", value: "shipping"},
  //   {name: "Đã xác nhận", value: "finalized"},
  //   {name: "Hoàn thành", value: "completed"},
  //   {name: "Kết thúc", value: "finished"},
  //   {name: "Đã huỷ", value: "cancelled"},
  //   {name: "Đã hết hạn", value: "expired"},
  // ], []);
  
  const formRef = createRef<FormInstance>();

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

  const onChangeRangeDate = useCallback(
    (dates, dateString, type) => {
      console.log(dates, dateString, type)
      switch(type) {
        case 'packed':
          setPackedOnMin(dateString[0])
          setPackedOnMax(dateString[1])
          break;
        case 'ship':
          setShipOnMin(dateString[0])
          setShipOnMax(dateString[1])
          break;
        case 'exported':
          setExportedOnMin(dateString[0])
          setExportedOnMax(dateString[1])
          break;
        case 'cancelled':
          setCancelledOnMin(dateString[0])
          setCancelledOnMax(dateString[1])
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
        case 'source':
          onFilter && onFilter({...params, sources: []});
          break;
        case 'packed':
          setPackedOnMin(null)
          setPackedOnMax(null)
          onFilter && onFilter({...params, packed_on_min: null, packed_on_max: null});
          break;
        case 'ship':
          setShipOnMin(null)
          setShipOnMax(null)
          onFilter && onFilter({...params, ship_on_min: null, ship_on_max: null});
          break;
        case 'exported':
          setExportedOnMin(null)
          setExportedOnMax(null)
          onFilter && onFilter({...params, exported_on_min: null, exported_on_max: null});
          break;
        case 'cancelled':
          setCancelledOnMin(null)
          setCancelledOnMax(null)
          onFilter && onFilter({...params, cancelled_on_min: null, cancelled_on_max: null});
          break;
        case 'received':
          setReceivedOnMin(null)
          setReceivedOnMax(null)
          onFilter && onFilter({...params, received_on_min: null, received_on_max: null});
          break;  
        
        // trạng thái đơn 
        // trạng thái đối soát
        
        case 'delivery_service_provider_ids':
          onFilter && onFilter({...params, delivery_service_provider_ids: []});
          break;
        // trạng thái in
        case 'address':
          onFilter && onFilter({...params, assignee: ""});
          break;
        case 'variant_ids':
          onFilter && onFilter({...params, variant_ids: []});
          break;
        case 'delivery_service_provider_types':
          onFilter && onFilter({...params, delivery_service_provider_types: []});
          break;
        case 'assignees':
          onFilter && onFilter({...params, assignees: []});
          break;
        case 'cancel_reason':
          onFilter && onFilter({...params, cancel_reason: ""});
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
        
        default: break
      }
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
      case 'packed':
        setPackedOnMin(moment(minValue, 'DD-MM-YYYY'))
        setPackedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'exported':
        setExportedOnMin(moment(minValue, 'DD-MM-YYYY'))
        setExportedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'ship':
        setShipOnMin(moment(minValue, 'DD-MM-YYYY'))
        setShipOnMax(moment(maxValue, 'DD-MM-YYYY'))
        break
      case 'received':
        setReceivedOnMin(moment(minValue, 'DD-MM-YYYY'))
        setReceivedOnMax(moment(maxValue, 'DD-MM-YYYY'))
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
      sources: Array.isArray(params.sources) ? params.sources : [params.sources],
      status: Array.isArray(params.status) ? params.status : [params.status],
      reference_status: Array.isArray(params.reference_status) ? params.reference_status : [params.reference_status],
      delivery_service_provider_ids: Array.isArray(params.delivery_service_provider_ids) ? params.delivery_service_provider_ids : [params.delivery_service_provider_ids],
      delivery_service_provider_types: Array.isArray(params.delivery_service_provider_types) ? params.delivery_service_provider_types : [params.delivery_service_provider_types],
      print_status: Array.isArray(params.print_status) ? params.print_status : [params.print_status],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      assignees: Array.isArray(params.assignees) ? params.assignees : [params.assignees],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
  }}, [params])
  const [packedOnMin, setPackedOnMin] = useState(initialValues.packed_on_min? moment(initialValues.packed_on_min, "DD-MM-YYYY") : null);
  const [packedOnMax, setPackedOnMax] = useState(initialValues.packed_on_max? moment(initialValues.packed_on_max, "DD-MM-YYYY") : null);
  const [exportedOnMin, setExportedOnMin] = useState(initialValues.exported_on_min? moment(initialValues.exported_on_min, "DD-MM-YYYY") : null);
  const [exportedOnMax, setExportedOnMax] = useState(initialValues.exported_on_max? moment(initialValues.exported_on_max, "DD-MM-YYYY") : null);
  const [shipOnMin, setShipOnMin] = useState(initialValues.ship_on_min? moment(initialValues.ship_on_min, "DD-MM-YYYY") : null);
  const [shipOnMax, setShipOnMax] = useState(initialValues.ship_on_max? moment(initialValues.ship_on_max, "DD-MM-YYYY") : null);
  const [receivedOnMin, setReceivedOnMin] = useState(initialValues.received_on_min? moment(initialValues.received_on_min, "DD-MM-YYYY") : null);
  const [receivedOnMax, setReceivedOnMax] = useState(initialValues.received_on_max? moment(initialValues.received_on_max, "DD-MM-YYYY") : null);
  const [cancelledOnMin, setCancelledOnMin] = useState(initialValues.cancelled_on_min? moment(initialValues.cancelled_on_min, "DD-MM-YYYY") : null);
  const [cancelledOnMax, setCancelledOnMax] = useState(initialValues.cancelled_on_max? moment(initialValues.cancelled_on_max, "DD-MM-YYYY") : null);
  
  const onFinish = useCallback(
    (values) => {
      console.log('values filter 2', values);
      const valuesForm = {
        ...values,
        packed_on_min: packedOnMin ? moment(packedOnMin, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : null,
        packed_on_max: packedOnMax ? moment(packedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        exported_on_min: exportedOnMin ? moment(exportedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        exported_on_max: exportedOnMax ? moment(exportedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_min: shipOnMin ? moment(shipOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_max: shipOnMax ? moment(shipOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_min: receivedOnMin ? moment(receivedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_max: receivedOnMax ? moment(receivedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        expected_receive_on_min: receivedOnMin ? moment(receivedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        expected_receive_on_max: receivedOnMax ? moment(receivedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [exportedOnMax, exportedOnMin, onFilter, packedOnMax, packedOnMin, receivedOnMax, receivedOnMin, shipOnMax, shipOnMin]
  );
  let filters = useMemo(() => {
    let list = []
    console.log('filters initialValues', initialValues);
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
    if (initialValues.sources.length) {
      let textSource = ""
      initialValues.sources.forEach(source_id => {
        const source = listSources?.find(source => source.id.toString() === source_id)
        textSource = source ? textSource + source.name + ";" : textSource
      })
      list.push({
        key: 'source',
        name: 'Nguồn',
        value: textSource
      })
    }
    if (initialValues.packed_on_min || initialValues.packed_on_max) {
      let textOrderCreateDate = (initialValues.packed_on_min ? initialValues.packed_on_min : '??') + " ~ " + (initialValues.packed_on_max ? initialValues.packed_on_max : '??')
      list.push({
        key: 'packed',
        name: 'Ngày đóng gói',
        value: textOrderCreateDate
      })
    }
    if (initialValues.ship_on_min || initialValues.ship_on_max) {
      let textOrderShipDate = (initialValues.ship_on_min ? initialValues.ship_on_min : '??') + " ~ " + (initialValues.ship_on_max ? initialValues.ship_on_max : '??')
      list.push({
        key: 'ship',
        name: 'Ngày giao hàng',
        value: textOrderShipDate
      })
    }
    if (initialValues.exported_on_min || initialValues.exported_on_max) {
      let textOrderExportedate = (initialValues.exported_on_min ? initialValues.exported_on_min : '??') + " ~ " + (initialValues.exported_on_max ? initialValues.exported_on_max : '??')
      list.push({
        key: 'exported',
        name: 'Ngày xuất kho',
        value: textOrderExportedate
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

    if (initialValues.received_on_min || initialValues.received_on_max) {
      let textExpectReceiveDate = (initialValues.received_on_min ? initialValues.received_on_min : '??') + " ~ " + (initialValues.received_on_max ? initialValues.received_on_max : '??')
      list.push({
        key: 'expected',
        name: 'Ngày giao hàng',
        value: textExpectReceiveDate
      })
    }
    // if (initialValues.status.length) {
    //   let textStatus = ""
    //   initialValues.status.forEach(i => {
    //     const findStatus = status?.find(item => item.value === i)
    //     textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
    //   })
    //   list.push({
    //     key: 'status',
    //     name: 'Trạng thái đơn hàng',
    //     value: textStatus
    //   })
    // }
    // if (initialValues.status.length) {
    //   let textStatus = ""
      
    //   initialValues.status.forEach(i => {
    //     const findStatus = subStatus?.find(item => item.id.toString() === i)
    //     textStatus = findStatus ? textStatus + findStatus.sub_status + ";" : textStatus
    //   })
    //   list.push({
    //     key: 'status',
    //     name: 'Trạng thái đối soát',
    //     value: textStatus
    //   })
    // }
    if (initialValues.delivery_service_provider_ids.length) {
      let textService = ""
      initialValues.delivery_service_provider_ids.forEach(i => {
        const findService = deliveryService?.find(item => item.id === i)
        textService = findService ? textService + findService.name + ";" : textService
      })
      list.push({
        key: 'delivery_service_provider_ids',
        name: 'Đối tác giao hàng',
        value: textService
      })
    }

    // if (initialValues.print_status.length) {
    //   let textStatus = ""
    //   initialValues.print_status.forEach(i => {
    //     const findStatus = paymentStatus?.find(item => item.value === i)
    //     textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
    //   })
    //   list.push({
    //     key: 'print_status',
    //     name: 'Trạng thái in',
    //     value: textStatus
    //   })
    // }
    if (initialValues.assignees.length) {
      let textAccount = ""
      initialValues.assignees.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + ";" : textAccount
      })
      list.push({
        key: 'assignees',
        name: 'Nhân viên tạo đơn',
        value: textAccount
      })
    }

    if (initialValues.shipping_address) {
      list.push({
        key: 'address',
        name: 'Địa chỉ',
        value: initialValues.shipping_address
      })
    }

    if (initialValues.variant_ids.length) {
      let textVariant = ""
      // initialValues.variant_ids.forEach(i => {
      //   const findVariant = Variants?.find(item => item.code === i)
      //   textVariant = findVariant ? textVariant + findVariant.full_name + " - " + findVariant.code + ";" : textVariant
      // })
      list.push({
        key: 'variant',
        name: 'Sản phẩm',
        value: textVariant
      })
    }

    if (initialValues.delivery_service_provider_types.length) {
      let textType = ""
      // initialValues.variant_ids.forEach(i => {
      //   const findVariant = Variants?.find(item => item.code === i)
      //   textVariant = findVariant ? textVariant + findVariant.full_name + " - " + findVariant.code + ";" : textVariant
      // })
      list.push({
        key: 'price',
        name: 'Hình thức vận chuyển',
        value: textType
      })
    }
    if (initialValues.cancel_reason.length) {
      list.push({
        key: 'cancel_reason',
        name: 'Lý do huỷ giao',
        value: initialValues.cancel_reason
      })
    }
    if (initialValues.note) {
      console.log('initialValues.note', initialValues.note);
      
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

    return list
  },
  [deliveryService, initialValues, listSources, listStore]
  );

  

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} defaultValue="true">
          <Radio.Button value="a">Tất cả đơn giao hàng</Radio.Button>
          <Radio.Button value="b">Chờ lấy hàng</Radio.Button>
          <Radio.Button value="c">Đang giao hàng</Radio.Button>
          <Radio.Button value="d">Đã giao hàng</Radio.Button>
          <Radio.Button value="e">Huỷ giao - Chờ nhận</Radio.Button>
          <Radio.Button value="f">Huỷ giao - Đã nhận</Radio.Button>
        </Radio.Group>
      </div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã đơn giao, mã đơn hàng, sđt người nhận"
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
                <Collapse defaultActiveKey={initialValues.status.length ? ["1"]: []}>
                  <Panel header="NGUỒN ĐƠN HÀNG" key="1" className="header-filter">
                    <Item name="sources" style={{ margin: "10px 0px" }}>
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
                <Collapse defaultActiveKey={initialValues.packed_on_min && initialValues.packed_on_max ? ["1"]: []}>
                  <Panel header="NGÀY ĐÓNG GÓI" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('packed', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('packed', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('packed', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('packed', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('packed', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('packed', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[packedOnMin? moment(packedOnMin, "DD-MM-YYYY") : null, packedOnMax? moment(packedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'packed')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={[]}>
                  <Panel header="TRẠNG THÁI ĐỐI SOÁT" key="1" className="header-filter">
                    
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.exported_on_min && initialValues.exported_on_max ? ["1"]: []}>
                  <Panel header="NGÀY XUẤT KHO" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('exported', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('exported', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('exported', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('exported', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('exported', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('exported', 'lastmonth')}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[exportedOnMin? moment(exportedOnMin, "DD-MM-YYYY") : null, exportedOnMax? moment(exportedOnMax, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'exported')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.ship_on_min && initialValues.ship_on_min ? ["1"]: []}>
                  <Panel header="NGÀY GIAO HÀNG" key="1" className="header-filter">
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
                <Collapse defaultActiveKey={initialValues.received_on_min && initialValues.received_on_max ? ["1"]: []}>
                  <Panel header="NGÀY HOÀN TẤT ĐƠN" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('received', 'yesterday')}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('received', 'today')}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('received', 'thisweek')}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('received', 'lastweek')}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('received', 'thismonth')}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('received', 'lastmonth')}>Tháng trước</Button>
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
                <Collapse defaultActiveKey={initialValues.delivery_service_provider_ids.length ? ["1"]: []}>
                  <Panel header="ĐỐI TÁC GIAO HÀNG" key="1" className="header-filter">
                    <Item name="delivery_service_provider_ids">
                    <Select mode="multiple" showSearch placeholder="Chọn đối tác giao hàng" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}>
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
                <Collapse defaultActiveKey={initialValues.print_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI IN" key="1" className="header-filter">
                    <Item name="print_status">
                      <Select mode="multiple" showSearch placeholder="Chọn trạng thái in" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}>
                          
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.status.length ? ["1"]: []}>
                  <Panel header="NHÂN VIÊN TẠO ĐƠN" key="1" className="header-filter">
                    <Item name="assignees">
                      <Select mode="multiple" showSearch placeholder="Chọn nhân viên tạo đơn" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}>
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
                <Collapse defaultActiveKey={initialValues.shipping_address ? ["1"]: []}>
                  <Panel header="ĐỊA CHỈ GIAO HÀNG" key="1" className="header-filter">
                    <Item name="shipping_address">
                      <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm địa chỉ giao hàng" />
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.variant_ids.length ? ["1"]: []}>
                  <Panel header="SẢN PHẦM" key="1" className="header-filter">
                    <Item name="variant_ids">
                    <Select mode="multiple" optionFilterProp="children" showSearch notFoundContent="Không tìm thấy kết quả" placeholder="Chọn sản phẩm" style={{width: '100%'}}>
                      {/* {paymentType.map((item, index) => (
                        <Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value.toString()}
                        >
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
                <Collapse defaultActiveKey={initialValues.status ? ["1"]: []}>
                  <Panel header="HÌNH THỨC VẬN CHUYỂN" key="1" className="header-filter">
                    <Item name="ship_by">
                      <Select optionFilterProp="children" showSearch notFoundContent="Không tìm thấy kết quả" placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}>
                        <Option value="">Hình thức vận chuyển</Option>
                        
                      </Select>
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.cancel_reason ? ["1"]: []}>
                  <Panel header="LÝ DO HUỶ GIAO" key="1" className="header-filter">
                    <Item name="cancel_reason">
                      <Input placeholder="Tìm kiếm theo lý do huỷ"/>
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
