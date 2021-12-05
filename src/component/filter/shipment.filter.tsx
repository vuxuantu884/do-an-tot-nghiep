import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
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
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import { ShipmentSearchQuery } from "model/order/shipment.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import DebounceSelect from "./component/debounce-select";
import { searchVariantsApi, getVariantApi } from "service/product/product.service";

type OrderFilterProps = {
  params: ShipmentSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  reasons: Array<{id: number; name: string}>;
  isLoading?: boolean;
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
    reasons,
    isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);

  const loadingFilter = useMemo(() => {
    return isLoading ? true : false
  }, [isLoading]);

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
  const pushingStatus = useMemo(() => [
    {name: "Thành công", value: 'completed'},
    {name: "Không thành công", value: 'failed'},
  ], []);
  
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [optionsVariant, setOptionsVariant] = useState<{ label: string, value: string}[]>([]);

  const onChangeOrderOptions = useCallback((e) => {
    onFilter && onFilter({...params, status: e.target.value});
  }, [onFilter, params]);

  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
    setRerender(true);
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
      setRerender(false)
      switch(tag.key) {
        case 'store':
          onFilter && onFilter({...params, store_ids: []});
          break;
        case 'source':
          onFilter && onFilter({...params, source_ids: []});
          break;
        case 'packed':
          setPackedClick('')
          onFilter && onFilter({...params, packed_on_min: null, packed_on_max: null});
          break;
        case 'ship':
          setShipClick('')
          onFilter && onFilter({...params, ship_on_min: null, ship_on_max: null});
          break;
        case 'exported':
          setExportedClick('')
          onFilter && onFilter({...params, exported_on_min: null, exported_on_max: null});
          break;
        case 'cancelled':
          setCancelledClick('')
          onFilter && onFilter({...params, cancelled_on_min: null, cancelled_on_max: null});
          break;
        case 'received':
          setReceivedClick('')
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
        case 'shipper_ids':
          onFilter && onFilter({...params, shipper_ids: []});
          break;  
        // trạng thái in
        case 'print_status':
          onFilter && onFilter({...params, print_status: []});
          break;
        case 'pushing_status':
          onFilter && onFilter({...params, pushing_status: []});
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
          onFilter && onFilter({...params, cancel_reason: []});
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

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);
  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      reference_status: Array.isArray(params.reference_status) ? params.reference_status : [params.reference_status],
      shipper_ids: Array.isArray(params.shipper_ids) ? params.shipper_ids : [params.shipper_ids],
      delivery_provider_ids: Array.isArray(params.delivery_provider_ids) ? params.delivery_provider_ids : [params.delivery_provider_ids],
      delivery_types: Array.isArray(params.delivery_types) ? params.delivery_types : [params.delivery_types],
      print_status: Array.isArray(params.print_status) ? params.print_status : [params.print_status],
      pushing_status: Array.isArray(params.pushing_status) ? params.pushing_status : [params.pushing_status],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
      cancel_reason: Array.isArray(params.cancel_reason) ? params.cancel_reason : [params.cancel_reason],
  }}, [params])
  
  const [print, setPrint] = useState<any[]>(initialValues.print_status);
  const [pushing, setPushing] = useState<any[]>(initialValues.pushing_status);
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

  const changeStatusPushing = useCallback((status) => {
    let newPushingStatus = [...pushing]
    console.log('status', status);
    
    switch (status) {
      case 'completed':
        const index1 = newPushingStatus.indexOf('completed');
        if (index1 > -1) {
          newPushingStatus.splice(index1, 1);
        } else {
          newPushingStatus.push('completed')
        }
        break;
      case 'failed':
        const index2 = newPushingStatus.indexOf('failed');
        if (index2 > -1) {
          newPushingStatus.splice(index2, 1);
        } else {
          newPushingStatus.push('failed')
        }
        break;
      
      default: break;  
    }
    console.log('newPushingStatus', newPushingStatus);
    
    setPushing(newPushingStatus)
  }, [pushing]);

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
      let error = false;
      formRef?.current?.getFieldsError([
        'packed_on_min', 'packed_on_max',
        'ship_on_min', 'ship_on_max',
        'exported_on_min', 'exported_on_max',
        'cancelled_on_min', 'cancelled_on_max',
        'received_on_min', 'received_on_max'
      ]).forEach(field => {
        if (field.errors.length) {
          error = true
        }
      })
      if (!error) {
        setVisible(false);
        const valuesForm = {
          ...values,
          print_status: print,
          pushing_status: pushing,
          reference_status: control
        }
        onFilter && onFilter(valuesForm);
        setRerender(false)
      }
    },
    [formRef, print, pushing, control, onFilter]
  );
  let filters = useMemo(() => {
    let list = []
    if (initialValues.store_ids.length) {
      let textStores = ""
      initialValues.store_ids.forEach(store_id => {
        const store = listStore?.find(store => store.id.toString() === store_id)
        textStores = store ? textStores + store.name + "; " : textStores
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
        textSource = source ? textSource + source.name + "; " : textSource
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
        name: 'Ngày hoàn tất đơn',
        value: textExpectReceiveDate
      })
    }

    if (initialValues.reference_status.length) {
      let textStatus = ""
      
      initialValues.reference_status.forEach(i => {
        const findStatus = controlStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
      })
      list.push({
        key: 'reference_status',
        name: 'Trạng thái đối soát',
        value: textStatus
      })
    }
    if (initialValues.shipper_ids.length) {
      let textAccount = ""
      initialValues.shipper_ids.forEach(i => {
        const findAccount = accounts.filter(item => item.is_shipper === true)?.find(item => item.id.toString() === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
      })
      list.push({
        key: 'shipper_ids',
        name: 'Đối tác giao hàng',
        value: textAccount
      })
    }
    if (initialValues.delivery_provider_ids.length) {
      let textService = ""
      initialValues.delivery_provider_ids.forEach((i: any) => {
        const findService = deliveryService?.find(item => item.id.toString() === i.toString())
        textService = findService ? textService + findService.name + "; " : textService
      })
      list.push({
        key: 'delivery_provider_ids',
        name: 'Đơn vị vận chuyển',
        value: textService
      })
    }

    if (initialValues.print_status.length) {
      let textStatus = ""
      initialValues.print_status.forEach(i => {
        const findStatus = printStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
      })
      list.push({
        key: 'print_status',
        name: 'Trạng thái in',
        value: textStatus
      })
    }
    if (initialValues.pushing_status.length) {
      let textStatus = ""
      initialValues.pushing_status.forEach(i => {
        const findStatus = pushingStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
      })
      list.push({
        key: 'pushing_status',
        name: 'Trạng thái đẩy đơn',
        value: textStatus
      })
    }
    if (initialValues.account_codes.length) {
      let textAccount = ""
      initialValues.account_codes.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
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
        textVariant = textVariant + i.label + "; "
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
        textType = findVariant ? textType + findVariant.name + "; " : textType
      })
      list.push({
        key: 'delivery_types',
        name: 'Hình thức vận chuyển',
        value: textType
      })
    }
    if (initialValues.cancel_reason.length) {
      let textReason = ""
      initialValues.cancel_reason.forEach(cancel_id => {
        const reason = reasons?.find(reason => reason.id.toString() === cancel_id)
        textReason = reason ? textReason + reason.name + "; " : textReason
      })
      
      list.push({
        key: 'cancel_reason',
        name: 'Lý do huỷ giao',
        value: textReason
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
        textStatus = textStatus + i + "; "
      })
      list.push({
        key: 'tags',
        name: 'Tags',
        value: textStatus
      })
    }

    return list
  },
  [initialValues.store_ids, initialValues.source_ids, initialValues.packed_on_min, initialValues.packed_on_max, initialValues.ship_on_min, initialValues.ship_on_max, initialValues.exported_on_min, initialValues.exported_on_max, initialValues.cancelled_on_min, initialValues.cancelled_on_max, initialValues.received_on_min, initialValues.received_on_max, initialValues.reference_status, initialValues.shipper_ids, initialValues.delivery_provider_ids, initialValues.print_status, initialValues.pushing_status, initialValues.account_codes, initialValues.shipping_address, initialValues.variant_ids.length, initialValues.delivery_types, initialValues.cancel_reason, initialValues.note, initialValues.customer_note, initialValues.tags, listStore, listSources, controlStatus, accounts, deliveryService, printStatus, pushingStatus, optionsVariant, serviceType, reasons]
  );
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
    setPackedClick('')
    setExportedClick('')
    setShipClick('')
    setReceivedClick('')
    setCancelledClick('')
  
    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener('resize', () => setVisible(false))
  }, []);

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
    setPushing(Array.isArray(params.pushing_status) ? params.pushing_status : [params.pushing_status])
    setControl(Array.isArray(params.reference_status) ? params.reference_status : [params.reference_status])
  }, [params.reference_status, params.print_status, params.variant_ids, params.pushing_status]);

  return (
    <div>
      <div className="order-options">
        <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={initialValues.status}>
          <Radio.Button value={null}>Tất cả đơn giao hàng</Radio.Button>
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
          {rerender && <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={20}>
              <Col span={12} xxl={8}>
                <p>Kho cửa hàng</p>
                <Item name="store_ids">
                  <CustomSelect
                    mode="multiple"
                    showArrow allowClear
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
                <p>Trạng thái đối soát</p>
                <div className="button-option-2">
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
              </Col>
              <Col span={12} xxl={8}>
                <p>Nguồn đơn hàng</p>
                <Item name="source_ids">
                  <CustomSelect
                    mode="multiple"
                    style={{ width: '100%'}}
                    showArrow maxTagCount='responsive'
                    showSearch allowClear
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
                {/* <Item name="print_status"> */}
                <p>Trạng thái in</p>
                <div className="button-option-1">
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
              </Col>
              <Col span={12} xxl={8} style={{ marginBottom: '20px'}}>
                <p>Ngày đóng gói</p>
                <CustomRangeDatePicker
                  fieldNameFrom="packed_on_min"
                  fieldNameTo="packed_on_max"
                  activeButton={packedClick}
                  setActiveButton={setPackedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={12} xxl={8} style={{ marginBottom: '20px'}}>
                <p>Ngày xuất kho</p>
                <CustomRangeDatePicker
                  fieldNameFrom="exported_on_min"
                  fieldNameTo="exported_on_max"
                  activeButton={exportedClick}
                  setActiveButton={setExportedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={12} xxl={8} style={{ marginBottom: '20px'}}>
                <p>Ngày giao hàng</p>
                <CustomRangeDatePicker
                  fieldNameFrom="ship_on_min"
                  fieldNameTo="ship_on_max"
                  activeButton={shipClick}
                  setActiveButton={setShipClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={12} xxl={8} style={{ marginBottom: '20px'}}>
                <p>Ngày hoàn tất đơn</p>
                <CustomRangeDatePicker
                  fieldNameFrom="received_on_min"
                  fieldNameTo="received_on_max"
                  activeButton={receivedClick}
                  setActiveButton={setReceivedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={12} xxl={8} style={{ marginBottom: '20px'}}>
                <p>Ngày huỷ đơn</p>
                <CustomRangeDatePicker
                  fieldNameFrom="cancelled_on_min"
                  fieldNameTo="cancelled_on_max"
                  activeButton={cancelledClick}
                  setActiveButton={setCancelledClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={12} xxl={8}>
                <p>Đối tác giao hàng</p>
                <Item name="shipper_ids">
                <Select
                  mode="multiple" showSearch placeholder="Chọn đối tác giao hàng"
                  notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                  optionFilterProp="children" showArrow maxTagCount='responsive'
                  getPopupContainer={trigger => trigger.parentNode} allowClear
                >
                  {accounts.filter(account => account.is_shipper === true)?.map((account) => (
                    <Option key={account.id} value={account.id.toString()}>
                      {account.full_name} - {account.code}
                    </Option>
                  ))}
                </Select>
                </Item>
                <p>Nhân viên tạo đơn</p>
                <Item name="account_codes">
                  <Select
                    mode="multiple" showSearch placeholder="Chọn nhân viên tạo đơn"
                    notFoundContent="Không tìm thấy kết quả" showArrow maxTagCount='responsive'
                    optionFilterProp="children" style={{width: '100%'}}
                    getPopupContainer={trigger => trigger.parentNode} allowClear
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
              </Col>
              <Col span={12} xxl={8}>
                <p>Địa chỉ giao hàng</p>
                <Item name="shipping_address">
                  <Input style={{ width: "100%", height: '40px' }} placeholder="Tìm kiếm địa chỉ giao hàng" />
                </Item>
                <p>Sản phẩm</p>
                <Item name="variant_ids">
                  <DebounceSelect
                    mode="multiple" showArrow maxTagCount='responsive'
                    placeholder="Tìm kiếm sản phẩm" allowClear
                    fetchOptions={searchVariants}
                    optionsVariant={optionsVariant}
                    style={{
                      width: '100%',
                    }}
                  />
                </Item>
              </Col>
              <Col  span={12} xxl={8}>
                <p>Hình thức vận chuyển</p>
                <Item name="delivery_types">
                  <Select
                    mode="multiple" showArrow maxTagCount='responsive'
                    optionFilterProp="children" showSearch notFoundContent="Không tìm thấy kết quả"
                    placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}
                    getPopupContainer={trigger => trigger.parentNode} allowClear
                  >
                    {serviceType?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
                <p>Đơn vị vận chuyển</p>
                <Item name="delivery_provider_ids">
                <Select
                  mode="multiple" showSearch placeholder="Chọn đơn vị vận chuyển"
                  notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                  optionFilterProp="children" showArrow maxTagCount='responsive'
                  getPopupContainer={trigger => trigger.parentNode} allowClear
                >
                  {deliveryService?.map((item) => (
                    <Option key={item.id} value={item.id.toString()}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
                </Item>
              </Col>
              <Col  span={12} xxl={8}>
                <p>Lý do huỷ giao</p>
                <Item name="cancel_reason">
                  <Select
                    mode="multiple" showSearch placeholder="Chọn lý do huỷ giao"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children" showArrow maxTagCount='responsive'
                    getPopupContainer={trigger => trigger.parentNode} allowClear
                  >
                    {reasons.map((reason) => (
                      <Option key={reason.id.toString()} value={reason.id.toString()}>
                        {reason.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
                <p>Ghi chú của khách</p>
                <Item name="customer_note">
                <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                </Item>
              </Col>
              <Col span={12} xxl={8}>
                <p>Tags</p>
                <Item name="tags">
                  <Select
                    mode="tags"showArrow maxTagCount='responsive'
                    optionFilterProp="children" showSearch
                    placeholder="Chọn 1 hoặc nhiều tag"
                    style={{width: '100%'}} allowClear
                  >
                </Select>
                </Item>
                <p>Ghi chú nội bộ</p>
                <Item name="note">
                  <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                </Item>
              </Col>
              <Col span={12} xxl={8}>
                <p>Trạng thái đẩy đơn</p>
                <div className="button-option-1">
                  <Button
                    onClick={() => changeStatusPushing('completed')}
                    className={pushing.includes('completed') ? 'active' : 'deactive'}
                  >
                    Thành công
                  </Button>
                  <Button
                    onClick={() => changeStatusPushing('failed')}
                    className={pushing.includes('failed') ? 'active' : 'deactive'}
                  >
                    Không thành công
                  </Button>
                </div>
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