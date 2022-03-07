import React, { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Tag,
  Select,
  Tooltip,
  Dropdown,
  Menu,
  TreeSelect,
} from "antd";
import { SettingOutlined, FilterOutlined, DownOutlined } from "@ant-design/icons";

import BaseFilter from "component/filter/base.filter";
import DebounceSelect from "component/filter/component/debounce-select";
import CustomSelect from "component/custom/select.custom";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import {fullTextSearch} from "utils/StringUtils";

import { AccountResponse } from "model/account/account.model";
import {EcommerceOrderSearchQuery, OrderSearchQuery} from "model/order/order.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";
import { getVariantApi, searchVariantsApi } from "service/product/product.service";

import { StyledOrderFilter } from "screens/ecommerce/orders/orderStyles";
import 'component/filter/order.filter.scss'

import search from "assets/img/search.svg";
import { ECOMMERCE_LIST, getEcommerceIcon } from "screens/ecommerce/common/commonAction";
import TreeStore from "component/tree-node/tree-store";
import "screens/ecommerce/orders/ecommerce-order.scss"

type EcommerceOrderFilterProps = {
  params: EcommerceOrderSearchQuery;
  actions: Array<any>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  listPaymentMethod: Array<PaymentMethodResponse>;
  subStatus: Array<OrderProcessingStatusModel>;
  isLoading?: boolean | undefined;
  onFilter?: (values: OrderSearchQuery| Object) => void;
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


const EcommerceOrderFilter: React.FC<EcommerceOrderFilterProps> = (
  props: EcommerceOrderFilterProps
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
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);

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
  const [optionsVariant, setOptionsVariant] = useState<{ label: string, value: string }[]>([]);

  const dispatch = useDispatch();
  const [ecommerceKeySelected, setEcommerceKeySelected] = useState(null);
  const [isEcommerceSelected, setIsEcommerceSelected] = useState<boolean>(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);


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

  const [issuedClick, setIssuedClick] = useState('');
  const [finalizedClick, setFinalizedClick] = useState('');
  const [completedClick, setCompletedClick] = useState('');
  const [cancelledClick, setCancelledClick] = useState('');
  // const [expectedClick, setExpectedClick] = useState('');

  
  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");  // todo thai need check and update
  }, [listSource]);
  
  const initialValues = useMemo(() => {
    return {
      ...params,
      channel_codes: Array.isArray(params.channel_codes) ? params.channel_codes : [params.channel_codes],
      ecommerce_shop_ids: Array.isArray(params.ecommerce_shop_ids) ? params.ecommerce_shop_ids : [params.ecommerce_shop_ids],
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      order_status: Array.isArray(params.order_status) ? params.order_status : [params.order_status],
      sub_status_code: Array.isArray(params.sub_status_code) ? params.sub_status_code : [params.sub_status_code],
      fulfillment_status: Array.isArray(params.fulfillment_status) ? params.fulfillment_status : [params.fulfillment_status],
      payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      return_status: Array.isArray(params.return_status) ? params.return_status : [params.return_status],
      payment_method_ids: Array.isArray(params.payment_method_ids) ? params.payment_method_ids : [params.payment_method_ids],
      delivery_provider_ids: Array.isArray(params.delivery_provider_ids) ? params.delivery_provider_ids : [params.delivery_provider_ids],
      shipper_ids: Array.isArray(params.shipper_ids) ? params.shipper_ids : [params.shipper_ids],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
      assignee_codes: Array.isArray(params.assignee_codes) ? params.assignee_codes : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
  }}, [params])
  
  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current?.getFieldsError([
        'issued_on_min', 'issued_on_max',
        'finalized_on_min', 'finalized_on_max',
        'completed_on_min', 'completed_on_max',
        'cancelled_on_min', 'cancelled_on_max',
        'expected_receive_on_min', 'expected_receive_on_max',
      ]).forEach(field => {
        if (field.errors.length) {
          error = true
        }
      })

      if (!error) {
        setVisible(false);
        if (values?.price_min > values?.price_max) {
          values = {
            ...values,
            price_min: values?.price_max,
            price_max: values?.price_min,
          }
        }
        onFilter && onFilter(values);
        setRerender(false)
      }
    },
    [formRef, onFilter]
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
    setIssuedClick('')
    setCompletedClick('')
    setCancelledClick('')
    // setExpectedClick('')
    setFinalizedClick('')
  
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
        setOptionsVariant(variants)
      })()
    }
  }, [params.variant_ids]);

  // handle Select Ecommerce
  const updateEcommerceShopList = useCallback((result) => {
    setIsEcommerceSelected(true);
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false,
          ecommerce: item.ecommerce,
        });
      });
    }

    setEcommerceShopList(shopList);
  }, []);

  const getEcommerceShopList = (ecommerceId: any) => {
    setIsEcommerceSelected(false);
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  const handleSelectEcommerce = (key: any) => {
    if (key !== ecommerceKeySelected) {
      formSearchRef?.current?.setFieldsValue({
        ecommerce_shop_ids: []
      });

      const ecommerceSelected = ECOMMERCE_LIST?.find(
        (ecommerce: any) => ecommerce.key.toString() === key.toString()
      );

      setEcommerceKeySelected(key)
      getEcommerceShopList(ecommerceSelected?.ecommerce_id);

      // filter order by channel
      onFilter && onFilter({...params, ecommerce_shop_ids: [], channel_codes: ecommerceSelected?.key});
    }
  };

  const handleRemoveEcommerce = useCallback(() => {
    setEcommerceKeySelected(null);
    setIsEcommerceSelected(false);
    formSearchRef?.current?.setFieldsValue({
      channel_codes: [],
      ecommerce_shop_ids: []
    });
    onFilter && onFilter({...params, ecommerce_shop_ids: [], channel_codes: []});
  }, [formSearchRef, onFilter, params]);
  // end handle Select Ecommerce

  const actionDropdown = () => {
    return (
      <Menu>
        {actions?.map((item: any) => (
          <Menu.Item
            disabled={item.disabled}
            key={item.id}
            onClick={item.onClick}
            icon={item.icon}
          >
            {item.name}
          </Menu.Item>
          ))}
      </Menu>
    )
  }

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];
    if (initialValues.channel_codes.length) {
      let ecommerceFilterText = "";
      initialValues.channel_codes.forEach((ecommerceCode: any) => {
        const ecommerceSelected = ECOMMERCE_LIST?.find(ecommerce => ecommerce.key.toString() === ecommerceCode.toString());
        ecommerceFilterText = ecommerceSelected ? ecommerceFilterText + ecommerceSelected.title + "; " : ecommerceFilterText;
      })
      list.push({
        key: 'channel_codes',
        name: 'Kênh mua hàng',
        value: ecommerceFilterText
      })
    }
    if (initialValues.ecommerce_shop_ids.length) {
      let textShop = "";
      initialValues.ecommerce_shop_ids.forEach((shop_id: any) => {
        const selectedShop = ecommerceShopList?.find(shop => shop.id.toString() === shop_id.toString());
        textShop = selectedShop ? textShop + selectedShop.name + "; " : textShop;
      })
      list.push({
        key: 'ecommerce_shop_ids',
        name: 'Gian hàng',
        value: textShop
      })
    }
    if (initialValues.store_ids.length) {
      let textStores = ""
      initialValues.store_ids.forEach((store_id: any) => {
        const store = listStore?.find(store => store.id.toString() === store_id.toString())
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
      initialValues.source_ids.forEach((source_id: any) => {
        const source = listSources?.find(source => source.id.toString() === source_id.toString());
        textSource = source ? textSource + source.name + "; " : textSource;
      })

      list.push({
        key: 'source',
        name: 'Nguồn',
        value: textSource
      })
    }
    if (initialValues.issued_on_min || initialValues.issued_on_max) {
      let textOrderCreateDate = (initialValues.issued_on_min ? initialValues.issued_on_min : '??')
        + " ~ " + (initialValues.issued_on_max ? initialValues.issued_on_max : '??')
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
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
      })
      list.push({
        key: 'order_status',
        name: 'Trạng thái đơn hàng',
        value: textStatus
      })
    }
    if (initialValues.sub_status_code.length) {
      let textStatus = ""

      initialValues.sub_status_code.forEach((statusCode: any) => {
        const findStatus = subStatus?.find(item => item.code.toString() === statusCode.toString())
        textStatus = findStatus ? textStatus + findStatus.sub_status + "; " : textStatus
      })
      list.push({
        key: 'sub_status_code',
        name: 'Trạng thái xử lý đơn',
        value: textStatus
      })
    }
    if (initialValues.fulfillment_status.length) {
      let textStatus = ""
      initialValues.fulfillment_status.forEach(i => {
        const findStatus = fulfillmentStatus?.find(item => item.value === i)
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
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
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
      })
      list.push({
        key: 'payment_status',
        name: 'Trạng thái thanh toán',
        value: textStatus
      })
    }

    if (initialValues.variant_ids.length) {
      let textVariant = ""
      optionsVariant.forEach(i => {
        textVariant = textVariant + i.label + "; "
      })
      list.push({
        key: 'variant_ids',
        name: 'Sản phẩm',
        value: textVariant
      })
    }

    if (initialValues.assignee_codes.length) {
      let textAccount = ""
      initialValues.assignee_codes.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
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
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
      })
      list.push({
        key: 'account_codes',
        name: 'Nhân viên tạo đơn',
        value: textAccount
      })
    }

    if (initialValues.price_min || initialValues.price_max) {
      let textPrice = (initialValues.price_min ? `${initialValues.price_min} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : " 0 ") + " ~ " + (initialValues.price_max ? `${initialValues.price_max} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : " ?? ")
      list.push({
        key: 'price',
        name: 'Tổng tiền',
        value: textPrice
      })
    }

    if (initialValues.payment_method_ids.length) {
      let textStatus = ""
      initialValues.payment_method_ids.forEach((paymentId: any) => {
        const findStatus = listPaymentMethod?.find(item => item.id.toString() === paymentId.toString())
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus
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
        textType = findType ? textType + findType.name + "; " : textType
      })
      list.push({
        key: 'delivery_types',
        name: 'Hình thức vận chuyển',
        value: textType
      })
    }
    if (initialValues.delivery_provider_ids.length) {
      let textType = ""
      initialValues.delivery_provider_ids.forEach((deliveryId: any) => {
        const findType = deliveryService?.find(item => item.id.toString() === deliveryId.toString())
        textType = findType ? textType + findType.name + "; " : textType
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
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
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
        textStatus = textStatus + i + "; "
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
        name: 'ID đơn hàng sàn',
        value: initialValues.reference_code
      })
    }
    if (initialValues.search_term) {
      list.push({
        key: 'search_term',
        name: 'ID đơn hàng, SĐT KH',
        value: initialValues.search_term
      })
    }
    return list
  }, [
    initialValues.channel_codes,
    initialValues.ecommerce_shop_ids,
    initialValues.store_ids,
    initialValues.source_ids,
    initialValues.issued_on_min,
    initialValues.issued_on_max,
    initialValues.finalized_on_min,
    initialValues.finalized_on_max,
    initialValues.completed_on_min,
    initialValues.completed_on_max,
    initialValues.cancelled_on_min,
    initialValues.cancelled_on_max,
    initialValues.expected_receive_on_min,
    initialValues.expected_receive_on_max,
    initialValues.order_status,
    initialValues.sub_status_code,
    initialValues.fulfillment_status,
    initialValues.payment_status,
    initialValues.variant_ids.length,
    initialValues.assignee_codes,
    initialValues.account_codes,
    initialValues.price_min,
    initialValues.price_max,
    initialValues.payment_method_ids,
    initialValues.delivery_types,
    initialValues.delivery_provider_ids,
    initialValues.shipper_ids,
    initialValues.note,
    initialValues.customer_note,
    initialValues.tags,
    initialValues.reference_code,
    initialValues.search_term,
    ecommerceShopList,
    listStore,
    listSources,
    status,
    subStatus,
    fulfillmentStatus,
    paymentStatus,
    optionsVariant,
    accounts,
    listPaymentMethod,
    serviceType,
    deliveryService
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      switch(tag.key) {
        case 'channel_codes':
          handleRemoveEcommerce();
          break;
        case 'ecommerce_shop_ids':
          formSearchRef?.current?.setFieldsValue({
            ecommerce_shop_ids: []
          });
          onFilter && onFilter({...params, ecommerce_shop_ids: []});
          break;
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
        // case 'expected':
        //   setExpectedClick('')
        //   onFilter && onFilter({...params, expected_receive_on_min: null, expected_receive_on_max: null});
        //   break;
        case 'order_status':
          onFilter && onFilter({...params, order_status: []});
          break;
        case 'sub_status_code':
          onFilter && onFilter({...params, sub_status_code: []});
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
        case 'variant_ids':
          onFilter && onFilter({...params, variant_ids: []});
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
          formSearchRef?.current?.setFieldsValue({
            reference_code: "",
          });
          onFilter && onFilter({...params, reference_code: ""});
          break;
        case 'search_term':
          formSearchRef?.current?.setFieldsValue({
            search_term: "",
          });
          onFilter && onFilter({...params, search_term: ""});
          break;
        default: break
      }
    },
    [formSearchRef, handleRemoveEcommerce, onFilter, params]
  );
  // end handle tag filter


  return (
    <StyledOrderFilter>
      <div className="order-filter">
        <Form
          onFinish={onFinish}
          ref={formSearchRef}
          initialValues={initialValues}
        >
          <Form.Item className="action-dropdown">
            <Dropdown
              overlay={actionDropdown}
              trigger={["click"]}
              disabled={isLoading}
            >
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>
          
          <Item
            className="ecommerce-dropdown"
            name="channel_codes"
          >
            <Select
              disabled={isLoading}
              placeholder="Chọn sàn"
              allowClear
              onSelect={(value) => handleSelectEcommerce(value)}
              onClear={handleRemoveEcommerce}
            >
              {ECOMMERCE_LIST?.map((item: any) => (
                <Option key={item.ecommerce_id} value={item.key}>
                  <div>
                    <img
                      src={item.icon}
                      alt={item.id}
                      style={{ marginRight: "10px" }}
                    />
                    <span>{item.title}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Item>

          <Form.Item
            className="select-store-dropdown"
            name="ecommerce_shop_ids"
          >
            {isEcommerceSelected ?
              <TreeSelect
                placeholder="Chọn gian hàng"
                treeDefaultExpandAll
                className="selector"
                allowClear
                showArrow
                showSearch
                multiple
                treeCheckable
                treeNodeFilterProp="title"
                maxTagCount="responsive"
                filterTreeNode={(textSearch: any, item: any) => {
                  const treeNodeTitle = item?.title?.props?.children[1];
                  return fullTextSearch(textSearch, treeNodeTitle);
                }}
              >
                {ecommerceShopList?.map((shopItem: any) => (
                  <TreeSelect.TreeNode
                    key={shopItem.id}
                    value={shopItem.id}
                    title={
                      <span>
                        {getEcommerceIcon(shopItem.ecommerce) &&
                          <img
                            src={getEcommerceIcon(shopItem.ecommerce)}
                            alt={shopItem.id}
                            style={{ marginRight: "5px", height: "16px" }}
                          />
                        }
                        {shopItem.name}
                      </span>
                    }
                  />
                ))}
              </TreeSelect>
              :
              <Tooltip title="Yêu cầu chọn sàn" color={"gold"}>
                <Select
                  showSearch
                  disabled={true}
                  placeholder="Chọn gian hàng"
                />
              </Tooltip>
            }
          </Form.Item>

          <Item name="reference_code" className="search-id-order-ecommerce">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng (sàn)"
              onBlur={(e) => {
                formSearchRef?.current?.setFieldsValue({
                  reference_code: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formSearchRef?.current?.setFieldsValue({
                  reference_code: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item name="search_term" className="search-term-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng, SĐT KH"
              onBlur={(e) => {
                formSearchRef?.current?.setFieldsValue({
                  search_term: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <div style={{ marginRight: "10px"}}>
            <Button
              type="primary"
              htmlType="submit" 
              disabled={isLoading}
            >
              Lọc
            </Button>
          </div>

          <div style={{ marginRight: "10px"}}>
            <Button
              icon={<FilterOutlined />}
              onClick={openFilter}
              disabled={isLoading}
            >
              Thêm bộ lọc
            </Button>
          </div>

          <Button
            className="setting-button"
            icon={<SettingOutlined />}
            onClick={onShowColumnSetting}
            disabled={isLoading}
          />
        </Form>

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
              <Col span={8} xxl={6}>
                <p>Kho cửa hàng</p>
                <Item name="store_ids">
                  {/* <CustomSelect
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
                    maxTagCount='responsive'
                  >
                    {listStore?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect> */}
                  <TreeStore listStore={listStore} placeholder="Cửa hàng" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}/>
                </Item>
                <p>Trạng thái đơn</p>
                <Item name="order_status">
                  <CustomSelect
                    mode="multiple" allowClear
                    showSearch placeholder="Chọn trạng thái đơn hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children" showArrow
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
                    showArrow allowClear
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
                    mode="multiple" showSearch allowClear
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
                <CustomRangeDatePicker
                  fieldNameFrom="issued_on_min"
                  fieldNameTo="issued_on_max"
                  activeButton={issuedClick}
                  setActiveButton={setIssuedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
            
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày duyệt đơn</p>
                <CustomRangeDatePicker
                  fieldNameFrom="finalized_on_min"
                  fieldNameTo="finalized_on_max"
                  activeButton={finalizedClick}
                  setActiveButton={setFinalizedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày hoàn tất đơn</p>
                <CustomRangeDatePicker
                  fieldNameFrom="completed_on_min"
                  fieldNameTo="completed_on_max"
                  activeButton={completedClick}
                  setActiveButton={setCompletedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
              <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
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
            
              <Col span={8} xxl={6}>
                <p>Trạng thái xử lý đơn</p>
                <Item name="sub_status_code">
                  <CustomSelect
                    mode="multiple"
                    showArrow allowClear
                    showSearch
                    placeholder="Chọn trạng thái xử lý đơn"
                    notFoundContent="Không tìm thấy kết quả"
                    style={{width: '100%'}}
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {subStatus?.map((item: any) => (
                      <CustomSelect.Option key={item.id} value={item.code.toString()}>
                        {item.sub_status}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
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

                {/* <p>Thanh toán</p>
                <Item name="payment_status">
                  <CustomSelect
                    mode="multiple" showArrow allowClear
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
                </Item> */}
              </Col>
              <Col span={8} xxl={6}>
                <p>Trả hàng</p>
                <Item name="return_status">
                  <CustomSelect
                    mode="multiple" showSearch allowClear
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
                    mode="multiple" showSearch allowClear
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
              {/* <Col span={8} xxl={6}>
                <p>Nhân viên tạo đơn</p>
                <Item name="account_codes">
                  <CustomSelect
                    mode="multiple" showSearch allowClear
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
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      placeholder="Từ"
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  
                  <div className="swap-right-icon"><SwapRightOutlined /></div>
                  <Item name="price_max" style={{width: '45%', marginBottom: 0}}>
                    <InputNumber
                      className="site-input-right price_max"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      placeholder="Đến"
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </div>
              </Col> */}
              
              {/* <Col span={8} xxl={6}>
                <p>Phương thức thanh toán</p>
                <Item name="payment_method_ids">
                  <CustomSelect
                    mode="multiple" optionFilterProp="children"
                    showSearch showArrow allowClear
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
                    mode="multiple" showSearch allowClear
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
              </Col> */}

              {/* <Col span={8} xxl={6} style={{ marginBottom: '20px'}}>
                <p>Ngày dự kiến nhận hàng</p>
                
                <CustomRangeDatePicker
                  fieldNameFrom="expected_receive_on_min"
                  fieldNameTo="expected_receive_on_max"
                  activeButton={expectedClick}
                  setActiveButton={setExpectedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col> */}

              <Col span={8} xxl={6}>
                {/* <p>Hình thức vận chuyển</p>
                <Item name="delivery_types">
                  <CustomSelect
                    mode="multiple" allowClear
                    optionFilterProp="children" showSearch
                    showArrow notFoundContent="Không tìm thấy kết quả"
                    placeholder="Chọn hình thức vận chuyển" style={{width: '100%'}}
                    getPopupContainer={trigger => trigger.parentNode}
                    maxTagCount='responsive'
                  >
                    {serviceType?.map((item) => (
                      <CustomSelect.Option key={item.value} value={item.value}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item> */}

                <p>Đơn vị vận chuyển</p>
                <Item name="delivery_provider_ids">
                <CustomSelect
                  mode="multiple" showSearch allowClear
                  showArrow placeholder="Chọn đơn vị vận chuyển"
                  notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                  optionFilterProp="children"
                  getPopupContainer={trigger => trigger.parentNode}
                  maxTagCount='responsive'
                >
                  {deliveryService?.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id.toString()}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
                </Item>
              </Col>

              {/* <Col span={8} xxl={6}>
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
                
              </Col> */}

              {/* <Col span={8} xxl={6}>
                <p>Tags</p>
                <Item name="tags">
                <CustomSelect
                  mode="tags" optionFilterProp="children"
                  showSearch showArrow allowClear
                  placeholder="Chọn 1 hoặc nhiều tag"
                  style={{width: '100%'}}
                >
                  
                </CustomSelect>
                </Item>
                
              </Col> */}
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
            </Row>
          </Form>}
        </BaseFilter>
      </div>

      <div className="order-filter-tags">
        {filters && filters.map((filter: any, index) => {
          return (
            <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </StyledOrderFilter>
  );
};

export default EcommerceOrderFilter;
