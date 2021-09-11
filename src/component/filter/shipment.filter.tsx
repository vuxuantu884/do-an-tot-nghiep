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
  Radio
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import { ShipmentSearchQuery } from "model/order/shipment.model";
import moment from "moment";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import DebounceSelect from "./component/debounce-select";
import { searchVariantsApi, getVariantApi } from "service/product/product.service";

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

async function searchVariants(input: any) {
  try {
    const result = await searchVariantsApi({info: input})
    return result.data.items.map(item => {
      return {
        label: item.name,
        value: item.id.toString()
      }
    })
  } catch (error) {
    console.log(error);
  }
}


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

  const controlStatus = useMemo(() => [
    {name: "Chưa đối soát", value: "notControl"},
    {name: "Đang đối soát", value: "controlling"},
    {name: "Đã đối sát", value: "hasControl"},
  ], []);

  const printStatus = useMemo(() => [
    {name: "Chưa in", value: 'false'},
    {name: "Đã in", value: 'true'},
  ], []);
  
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [optionsVariant, setOptionsVariant] = useState<{ label: string, value: string}[]>([]);

  const onChangeOrderOptions = useCallback((e) => {
    onFilter && onFilter({...params, status: e.target.value});
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
      switch(type) {
        case 'packed':
          setPackedClick('')
          setPackedOnMin(dateString[0])
          setPackedOnMax(dateString[1])
          break;
        case 'ship':
          setShipClick('')
          setShipOnMin(dateString[0])
          setShipOnMax(dateString[1])
          break;
        case 'exported':
          setExportedClick('')
          setExportedOnMin(dateString[0])
          setExportedOnMax(dateString[1])
          break;
        case 'cancelled':
          setCancelledClick('')
          setCancelledOnMin(dateString[0])
          setCancelledOnMax(dateString[1])
          break;
        case 'received':
          setReceivedClick('')
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
      switch(tag.key) {
        case 'store':
          onFilter && onFilter({...params, store_ids: []});
          break;
        case 'source':
          onFilter && onFilter({...params, source_ids: []});
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
        case 'reference_status':
          onFilter && onFilter({...params, reference_status: []});
          break;

        case 'delivery_provider_ids':
          onFilter && onFilter({...params, delivery_provider_ids: []});
          break;
        // trạng thái in
        case 'print_status':
          onFilter && onFilter({...params, print_status: []});
          break;
        case 'shipping_address':
          onFilter && onFilter({...params, shipping_address: ""});
          break;
        case 'variant_ids':
          onFilter && onFilter({...params, variant_ids: []});
          break;
        case 'delivery_types':
          onFilter && onFilter({...params, delivery_types: []});
          break;
        case 'account_codes':
          onFilter && onFilter({...params, account_codes: []});
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
  
  const [packedClick, setPackedClick] = useState('');
  const [exportedClick, setExportedClick] = useState('');
  const [shipClick, setShipClick] = useState('');
  const [receivedClick, setReceivedClick] = useState('');
  const [cancelledClick, setCancelledClick] = useState('');

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
    
    switch(type) {
      case 'packed':
        if (packedClick === value ) {
          setPackedClick('')
          setPackedOnMin(null)
          setPackedOnMax(null)
        } else {
          setPackedClick(value)
          setPackedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setPackedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'exported':
        if (exportedClick === value ) {
          setExportedClick('')
          setExportedOnMin(null)
          setExportedOnMax(null)
        } else {
          setExportedClick(value)
          setExportedOnMin(moment(minValue, 'DD-MM-YYYY'))
          setExportedOnMax(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
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
      default:
        break
    }
  }, [cancelledClick, exportedClick, packedClick, receivedClick, shipClick]);

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      status: Array.isArray(params.status) ? params.status : [params.status],
      reference_status: Array.isArray(params.reference_status) ? params.reference_status : [params.reference_status],
      delivery_provider_ids: Array.isArray(params.delivery_provider_ids) ? params.delivery_provider_ids : [params.delivery_provider_ids],
      delivery_types: Array.isArray(params.delivery_types) ? params.delivery_types : [params.delivery_types],
      print_status: Array.isArray(params.print_status) ? params.print_status : [params.print_status],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
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
  
  const [print, setPrint] = useState<any[]>(initialValues.print_status);
  const [control, setControl] = useState<any[]>(initialValues.reference_status);
  const changeStatusPrint = useCallback((status) => {
    let newPrintStatus = [...print]
    console.log('status', status);
    
    switch (status) {
      case 'true':
        const index1 = newPrintStatus.indexOf('true');
        if (index1 > -1) {
          newPrintStatus.splice(index1, 1);
        } else {
          newPrintStatus.push('true')
        }
        break;
      case 'false':
        const index2 = newPrintStatus.indexOf('false');
        if (index2 > -1) {
          newPrintStatus.splice(index2, 1);
        } else {
          newPrintStatus.push('false')
        }
        break;
      
      default: break;  
    }
    console.log('newPrintStatus', newPrintStatus);
    
    setPrint(newPrintStatus)
  }, [print]);

  const changeControl = useCallback((status) => {
    let newControl = [...control]
    switch (status) {
      case 'notControl':
        const index1 = newControl.indexOf('notControl');
        if (index1 > -1) {
          newControl.splice(index1, 1);
        } else {
          newControl.push('notControl')
        }
        break;
      case 'controlling':
        const index2 = newControl.indexOf('controlling');
        if (index2 > -1) {
          newControl.splice(index2, 1);
        }  else {
          newControl.push('controlling')
        }
        break;
      case 'hasControl':
        const index = newControl.indexOf('hasControl');
        if (index > -1) {
          newControl.splice(index, 1);
        } else {
          newControl.push('hasControl')
        }
        break
      default: break;  
    }
    setControl(newControl)
  }, [control]);

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        print_status: print,
        reference_status: control,
        packed_on_min: packedOnMin ? moment(packedOnMin, 'DD-MM-YYYY')?.format('DD-MM-YYYY') : null,
        packed_on_max: packedOnMax ? moment(packedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        exported_on_min: exportedOnMin ? moment(exportedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        exported_on_max: exportedOnMax ? moment(exportedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_min: shipOnMin ? moment(shipOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        ship_on_max: shipOnMax ? moment(shipOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_min: receivedOnMin ? moment(receivedOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        received_on_max: receivedOnMax ? moment(receivedOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_min: cancelledOnMin ? moment(cancelledOnMin, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
        cancelled_on_max: cancelledOnMax ? moment(cancelledOnMax, 'DD-MM-YYYY').format('DD-MM-YYYY') : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [print, control, packedOnMin, packedOnMax, exportedOnMin, exportedOnMax, shipOnMin, shipOnMax, receivedOnMin, receivedOnMax, cancelledOnMin, cancelledOnMax, onFilter]
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
        key: 'received',
        name: 'Ngày nhận hàng',
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
    if (initialValues.reference_status.length) {
      let textStatus = ""
      
      initialValues.reference_status.forEach(i => {
        const findStatus = controlStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'reference_status',
        name: 'Trạng thái đối soát',
        value: textStatus
      })
    }
    if (initialValues.delivery_provider_ids.length) {
      let textService = ""
      initialValues.delivery_provider_ids.forEach(i => {
        const findService = deliveryService?.find(item => item.id === i)
        textService = findService ? textService + findService.name + ";" : textService
      })
      list.push({
        key: 'delivery_provider_ids',
        name: 'Đối tác giao hàng',
        value: textService
      })
    }

    if (initialValues.print_status.length) {
      let textStatus = ""
      initialValues.print_status.forEach(i => {
        const findStatus = printStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + ";" : textStatus
      })
      list.push({
        key: 'print_status',
        name: 'Trạng thái in',
        value: textStatus
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

    if (initialValues.shipping_address) {
      list.push({
        key: 'shipping_address',
        name: 'Địa chỉ',
        value: initialValues.shipping_address
      })
    }

    if (initialValues.variant_ids.length) {
      let textVariant = ""
      
      console.log('optionsVariant', optionsVariant)
      optionsVariant.forEach(i => {
        textVariant = textVariant + i.label + ";"
      })
      list.push({
        key: 'variant_ids',
        name: 'Sản phẩm',
        value: textVariant
      })
    }

    if (initialValues.delivery_types.length) {
      let textType = ""
      initialValues.delivery_types.forEach(i => {
        const findVariant = serviceType?.find(item => item.value === i)
        textType = findVariant ? textType + findVariant.name + ";" : textType
      })
      list.push({
        key: 'delivery_types',
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
  [accounts, deliveryService, initialValues, optionsVariant, listSources, listStore]
  );

  useEffect(() => {
    if (params.variant_ids.length) {
      (async () => {
        let variants: any = [];
        await Promise.all(
          params.variant_ids.map(async (variant_id) => {
            try {
              const result = await getVariantApi(variant_id)

              variants.push({
                label: result.data.name,
                value: result.data.id.toString()
              })
            } catch {}
          })
        );
        console.log('variants', variants);
        setOptionsVariant(variants)
      })()
    }
    setPrint(Array.isArray(params.print_status) ? params.print_status : [params.print_status])
    setControl(Array.isArray(params.reference_status) ? params.reference_status : [params.reference_status])
  }, [params.reference_status, params.print_status, params.variant_ids]);

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <div>
      <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} defaultValue="">
          <Radio.Button value="">Tất cả đơn giao hàng</Radio.Button>
          <Radio.Button value="unshipped">Chờ lấy hàng</Radio.Button>
          <Radio.Button value="picked">Đã lấy hàng</Radio.Button>
          <Radio.Button value="shipping">Đang giao hàng</Radio.Button>
          <Radio.Button value="shipped">Đã giao hàng</Radio.Button>
          <Radio.Button value="returning">Huỷ giao - Chờ nhận</Radio.Button>
          <Radio.Button value="returned">Huỷ giao - Đã nhận</Radio.Button>
        </Radio.Group>
      </div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã đơn giao, mã đơn hàng, tên người nhận, sđt người nhận"
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
                <Collapse defaultActiveKey={initialValues.status.length ? ["1"]: []}>
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
                <Collapse defaultActiveKey={initialValues.packed_on_min && initialValues.packed_on_max ? ["1"]: []}>
                  <Panel header="NGÀY ĐÓNG GÓI" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('packed', 'yesterday')} className={packedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('packed', 'today')} className={packedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('packed', 'thisweek')} className={packedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('packed', 'lastweek')} className={packedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('packed', 'thismonth')} className={packedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('packed', 'lastmonth')} className={packedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
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
                <Collapse defaultActiveKey={initialValues.reference_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI ĐỐI SOÁT" key="1" className="header-filter">
                    <div className="date-option">
                      <Button
                        onClick={() => changeControl('hasControl')}
                        className={control.includes('hasControl') ? 'active' : 'deactive'}
                      >
                        Đã đối soát
                      </Button>
                      <Button
                        onClick={() => changeControl('controlling')}
                        className={control.includes('controlling') ? 'active' : 'deactive'}
                      >
                        Đang đối soát
                      </Button>
                      <Button
                        onClick={() => changeControl('notControl')}
                        className={control.includes('notControl') ? 'active' : 'deactive'}
                      >
                        Chưa đối soát
                      </Button>
                    </div>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.exported_on_min && initialValues.exported_on_max ? ["1"]: []}>
                  <Panel header="NGÀY XUẤT KHO" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('exported', 'yesterday')} className={exportedClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('exported', 'today')} className={exportedClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('exported', 'thisweek')} className={exportedClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('exported', 'lastweek')} className={exportedClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('exported', 'thismonth')} className={exportedClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('exported', 'lastmonth')} className={exportedClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
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
                <Collapse defaultActiveKey={initialValues.received_on_min && initialValues.received_on_max ? ["1"]: []}>
                  <Panel header="NGÀY NHẬN HÀNG" key="1" className="header-filter">
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
                <Collapse defaultActiveKey={initialValues.delivery_provider_ids.length ? ["1"]: []}>
                  <Panel header="ĐỐI TÁC GIAO HÀNG" key="1" className="header-filter">
                    <Item name="delivery_provider_ids">
                    <Select
                      mode="multiple" showSearch placeholder="Chọn đối tác giao hàng"
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
                <Collapse defaultActiveKey={initialValues.print_status.length ? ["1"]: []}>
                  <Panel header="TRẠNG THÁI IN" key="1" className="header-filter">
                    {/* <Item name="print_status"> */}
                      <div className="button-option">
                        <Button
                          onClick={() => changeStatusPrint('true')}
                          className={print.includes('true') ? 'active' : 'deactive'}
                        >
                          Đã in
                        </Button>
                        <Button
                          onClick={() => changeStatusPrint('false')}
                          className={print.includes('false') ? 'active' : 'deactive'}
                        >
                          Chưa in
                        </Button>
                      </div>
                    {/* </Item> */}
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
                        notFoundContent="Không tìm thấy kết quả"
                        optionFilterProp="children" style={{width: '100%'}}
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
                      <DebounceSelect
                        mode="multiple"
                        placeholder="Tìm kiếm sản phẩm"
                        fetchOptions={searchVariants}
                        optionsVariant={optionsVariant}
                        style={{
                          width: '100%',
                        }}
                      />
                    </Item>
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
                        optionFilterProp="children" showSearch notFoundContent="Không tìm thấy kết quả"
                        placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}
                        getPopupContainer={trigger => trigger.parentNode}
                      >
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
                <Collapse defaultActiveKey={initialValues.cancel_reason.length ? ["1"]: []}>
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
