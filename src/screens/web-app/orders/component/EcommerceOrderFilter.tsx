import React, { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Tag,
  Select,
  Dropdown,
  Menu, InputNumber,
} from "antd";
import {SettingOutlined, FilterOutlined, DownOutlined, SwapRightOutlined} from "@ant-design/icons";

import BaseFilter from "component/filter/base.filter";
import CustomSelect from "component/custom/select.custom";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";

import { AccountResponse } from "model/account/account.model";
import {EcommerceOrderSearchQuery, OrderSearchQuery} from "model/order/order.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { getVariantApi } from "service/product/product.service";

import { StyledOrderFilter } from "screens/web-app/orders/orderStyles";
import 'component/filter/order.filter.scss'

import search from "assets/img/search.svg";
import TreeStore from "component/tree-node/tree-store";
import "screens/web-app/orders/ecommerce-order.scss"
import moment from "moment";
import {WEB_APP_LIST} from "screens/web-app/common/commonAction";
import UrlConfig from "../../../../config/url.config";
import {searchAccountApi} from "../../../../service/accounts/account.service";
import {Link} from "react-router-dom";

type EcommerceOrderFilterProps = {
  params: EcommerceOrderSearchQuery;
  actionList: Array<any>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  shippers: Array<any>;
  listPaymentMethod: Array<PaymentMethodResponse>;
  subStatus: Array<OrderProcessingStatusModel>;
  isLoading?: boolean | undefined;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;


const EcommerceOrderFilter: React.FC<EcommerceOrderFilterProps> = (
  props: EcommerceOrderFilterProps
) => {
  const {
    params,
    actionList,
    listSource,
    listStore,
    accounts,
    deliveryService,
    shippers,
    subStatus,
    listPaymentMethod,
    isLoading,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
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
  const [form] = Form.useForm()
  const [optionsVariant, setOptionsVariant] = useState<{ label: string, value: string }[]>([]);

  const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>(
    []
  );

  useEffect(() => {
    if (params.assignee_codes && params.assignee_codes?.length > 0) {
      searchAccountApi({
        codes: params.assignee_codes
      }).then((response) => {
        setAssigneeFound(response.data.items)
      })
    }
  }, [params.assignee_codes])

  //handle tag filter
  const [tags, setTags] = useState<Array<any>>([]);

  const onFilterClick = useCallback(() => {
    form.submit();
    formRef.current?.submit();
  }, [form, formRef]);

  const openFilter = useCallback(() => {
    setVisible(true);
    setRerender(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const [issuedClick, setIssuedClick] = useState('');
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
      shipper_codes: Array.isArray(params.shipper_codes) ? params.shipper_codes : [params.shipper_codes],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
      assignee_codes: Array.isArray(params.assignee_codes) ? params.assignee_codes : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
      coordinator_codes: Array.isArray(params.coordinator_codes) ? params.coordinator_codes : [params.coordinator_codes],
      marketer_codes: Array.isArray(params.marketer_codes) ? params.marketer_codes : [params.marketer_codes],
      delivery_types: Array.isArray(params.delivery_types) ? params.delivery_types : [params.delivery_types],
      services: Array.isArray(params.services) ? params.services : [params.services],
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
        onFilter && onFilter({...values, tags: [...tags]});
        setRerender(false)
      }
    },
    [formRef, onFilter, tags]
  );

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setIssuedClick('');
    setCompletedClick('');
    setCancelledClick('');

    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener('resize', () => setVisible(false))
  }, []);

  useEffect(() => {
    if (params.variant_ids.length) {
      let variant_ids = Array.isArray(params.variant_ids)
        ? params.variant_ids
        : [params.variant_ids];

      (async () => {
        let variants: any = [];
        await Promise.all(
          variant_ids.map(async (variant_id) => {
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

  const handleRemoveEcommerce = useCallback(() => {
    form?.setFieldsValue({ channel_codes: [] });
    onFilter && onFilter({...params, channel_codes: []});
  }, [form, onFilter, params]);
  // end handle Select Ecommerce

  const actionDropdown = () => {
    return (
      <Menu>
        {actionList?.map((item: any) => (
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

    const splitCharacter = ", ";

    const renderSplitCharacter = (index: number, mappedArray: any[]) => {
      let result = null;
      if (index !== mappedArray.length - 1) {
        result = (
          <React.Fragment>
            {splitCharacter}
          </React.Fragment>
        )
      }
      return result;
    };

    const getFilterString = (mappedArray: any[] | undefined, keyValue: string, endPoint?: string, objectLink?: string, type?: string) => {
      let result = null;
      if (!mappedArray) {
        return null;
      }
      if (type === "assignee_codes") {
        if (assigneeFound.length > 0) {
          result = assigneeFound.map((single, index) => {
            return (
              <Link to={`${UrlConfig.ACCOUNTS}/${single.code}`} target="_blank" key={single.code}>
                {single.code} - {single.full_name}
                {renderSplitCharacter(index, mappedArray)}
              </Link>
            )
          })
        }
      } else if(type === "account_codes") {
        result = mappedArray.map((single, index) => {
          return (
            <Link to={`${UrlConfig.ACCOUNTS}/${single.code}`} target="_blank" key={single.code}>
              {single.code} - {single.full_name}
              {renderSplitCharacter(index, mappedArray)}
            </Link>
          )
        })
      } else {
        result = mappedArray.map((single, index) => {
          if (objectLink && endPoint && single[objectLink]) {
            return (
              <Link to={`${endPoint}/${single[objectLink]}`} target="_blank" key={single[keyValue]}>
                {single[keyValue]}
                {renderSplitCharacter(index, mappedArray)}
              </Link>
            )
          }
          return (
            <React.Fragment>
              {single[keyValue]}
              {renderSplitCharacter(index, mappedArray)}
            </React.Fragment>
          )
        })

      }
      return <React.Fragment>{result}</React.Fragment>;
    };

    let list = [];
    if (initialValues?.channel_codes?.length) {
      let ecommerceFilterText = "";
      initialValues.channel_codes.forEach((ecommerceCode: any) => {
        const ecommerceSelected = WEB_APP_LIST?.find(ecommerce => ecommerce.key?.toString() === ecommerceCode?.toString());
        ecommerceFilterText = ecommerceSelected ? ecommerceFilterText + ecommerceSelected.title + "; " : ecommerceFilterText;
      })
      list.push({
        key: 'channel_codes',
        name: 'Kênh mua hàng',
        value: ecommerceFilterText
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
    if (initialValues.source_ids?.length) {
      let textSource = ""
      initialValues.source_ids.forEach((source_id: any) => {
        const source = listSources?.find(source => source.id.toString() === source_id.toString());
        textSource = source ? textSource + source.name + "; " : textSource;
      })

      list.push({
        key: 'source_ids',
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

    if (initialValues.return_status.length) {
      let option = [
        {
          label: "Có đổi trả hàng",
          value: "returned"
        },
        {
          label: "Không đổi trả hàng",
          value: "unreturned"
        }
      ]
      let mappedReturnStatus = option?.filter((status) => initialValues.return_status?.some((item) => item === status.value.toString()))
      let text = getFilterString(mappedReturnStatus, "label", undefined, undefined);

      list.push({
        key: 'return_status',
        name: 'Trả hàng',
        value: <React.Fragment>{text}</React.Fragment>
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

    if (initialValues.shipper_codes?.length) {
      let mappedShippers = shippers?.filter((account) => initialValues.shipper_codes?.some((single) => single === account.code.toString()))
      let text = getFilterString(mappedShippers, "name", UrlConfig.ACCOUNTS, "code");
      list.push({
        key: 'shipper_codes',
        name: 'Đối tác giao hàng',
        value: text,
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
    if (initialValues.delivery_provider_ids?.length) {
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
        name: 'ID đơn hàng Sapo',
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
    initialValues.shipper_codes,
    initialValues.return_status,
    initialValues.note,
    initialValues.customer_note,
    initialValues.tags,
    initialValues.reference_code,
    initialValues.search_term,
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
    deliveryService,
    shippers,
    assigneeFound,
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      switch(tag.key) {
        case 'return_status':
          onFilter && onFilter({ ...params, return_status: "" });
          break;
        case 'channel_codes':
          handleRemoveEcommerce();
          break;
        case 'ecommerce_shop_ids':
          form?.setFieldsValue({
            ecommerce_shop_ids: []
          });
          onFilter && onFilter({...params, ecommerce_shop_ids: []});
          break;
        case 'store':
          onFilter && onFilter({...params, store_ids: []});
          break;
        case 'source_ids':
          onFilter && onFilter({...params, source_ids: []});
          break;
        case 'issued':
          setIssuedClick('')
          onFilter && onFilter({...params, issued_on_min: null, issued_on_max: null});
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
        case 'shipper_codes':
          onFilter && onFilter({...params, shipper_codes: []});
          break;
        case 'note':
          onFilter && onFilter({...params, note: ""});
          break;
        case 'customer_note':
          onFilter && onFilter({...params, customer_note: ""});
          break;
        case 'tags':
          onFilter && onFilter({...params, tags: []});
          setTags([]);
          break;
        case 'reference_code':
          form?.setFieldsValue({
            reference_code: "",
          });
          onFilter && onFilter({...params, reference_code: ""});
          break;
        case 'search_term':
          form?.setFieldsValue({
            search_term: "",
          });
          onFilter && onFilter({...params, search_term: ""});
          break;
        default: break
      }
    },
    [form, handleRemoveEcommerce, onFilter, params]
  );
  // end handle tag filter

  //handle query params filter
  const onCheckDateFilterParam = (date_from: any, date_to: any, setDate: any) => {
    const todayFrom = moment().startOf('day').format('DD-MM-YYYY')
    const todayTo = moment().endOf('day').format('DD-MM-YYYY')

    const yesterdayFrom = moment().startOf('day').subtract(1, 'days').format('DD-MM-YYYY')
    const yesterdayTo = moment().endOf('day').subtract(1, 'days').format('DD-MM-YYYY')

    const thisWeekFrom = moment().startOf('week').format('DD-MM-YYYY')
    const thisWeekTo = moment().endOf('week').format('DD-MM-YYYY')

    const lastWeekFrom = moment().startOf('week').subtract(1, 'weeks').format('DD-MM-YYYY')
    const lastWeekTo = moment().endOf('week').subtract(1, 'weeks').format('DD-MM-YYYY')

    const thisMonthFrom = moment().startOf('month').format('DD-MM-YYYY')
    const thisMonthTo = moment().endOf('month').format('DD-MM-YYYY')

    const lastMonthFrom = moment().startOf('month').subtract(1, 'months').format('DD-MM-YYYY')
    const lastMonthTo = moment().endOf('month').subtract(1, 'months').format('DD-MM-YYYY')


    if (date_from === todayFrom && date_to === todayTo) {
      setDate("today");
    }else if (date_from === yesterdayFrom && date_to === yesterdayTo) {
      setDate("yesterday");
    }else if (date_from === thisWeekFrom && date_to === thisWeekTo) {
      setDate("thisweek");
    }else if (date_from === lastWeekFrom && date_to === lastWeekTo) {
      setDate("lastweek");
    }else if(date_from === thisMonthFrom && date_to === thisMonthTo) {
      setDate("thismonth");
    }else if (date_from === lastMonthFrom && date_to === lastMonthTo) {
      setDate("lastmonth");
    }else {
      setDate("")
    }
  }

  useEffect(() => {
    let checkEcommerceShop = Array.isArray(params.ecommerce_shop_ids)
      ? params.ecommerce_shop_ids
      : [params.ecommerce_shop_ids];

    form.setFieldsValue({
      source_ids: params.source_ids,
      ecommerce_shop_ids: checkEcommerceShop.map(item => +item),
      search_term: params.search_term,
      reference_code: params.reference_code,
      sub_status_code: params.sub_status_code
    });

    formRef?.current?.setFieldsValue({
      store_ids: params.store_ids,
      channel_codes: params.channel_codes,
      variant_ids: params.variant_ids,
      issued_on_min: params.issued_on_min,
      issued_on_max: params.issued_on_max,
      finalized_on_min: params.finalized_on_min,
      finalized_on_max: params.finalized_on_max,
      completed_on_min: params.completed_on_min,
      completed_on_max: params.completed_on_max,
      cancelled_on_min: params.cancelled_on_min,
      cancelled_on_max: params.cancelled_on_max,
      order_status: params.order_status,
      fulfillment_status: params.fulfillment_status,
      return_status: params.return_status,
      assignee_codes: params.assignee_codes,
      delivery_provider_ids: params.delivery_provider_ids,
      shipper_codes: params.shipper_codes,
      note: params.note,
      customer_note: params.customer_note,
      tags: params.tags,
    })

    onCheckDateFilterParam(params.issued_on_min, params.issued_on_max, setIssuedClick)
    onCheckDateFilterParam(params.completed_on_min, params.completed_on_max, setCompletedClick)
    onCheckDateFilterParam(params.cancelled_on_min, params.cancelled_on_max, setCancelledClick)

    if(!params.tags.length) {
      setTags([]);
    }else {
      let tagsArr : any[] = []
      const tagsFilter = Array.isArray(params.tags)
        ? params.tags
        : [params.tags];
      tagsFilter.length > 0 && tagsFilter.map(item => tagsArr.push(item))
      setTags(tagsArr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, params]);


  return (
    <StyledOrderFilter>
      <div className="order-filter">
        <Form
          onFinish={onFinish}
          form={form}
          initialValues={initialValues}
        >
          <Form.Item className="action-dropdown">
            <Dropdown
              overlay={actionDropdown}
              trigger={["click"]}
              disabled={isLoading}
            >
              <Button className="action-button">
                <div style={{ marginRight: 5 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>

          <Item
            className="source-dropdown-filter"
            name="source_ids">
            <Select
              mode="multiple"
              showArrow
              allowClear
              showSearch
              placeholder="Nguồn đơn hàng"
              notFoundContent="Không tìm thấy kết quả"
              optionFilterProp="children"
              maxTagCount='responsive'
              disabled={isLoading}
            >
              {listSources.map((item, index) => (
                <Select.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.id.toString()}
                >
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Item>

          <Item name="reference_code" className="search-id-order-ecommerce">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng (Sapo)"
              onBlur={(e) => {
                form?.setFieldsValue({
                  reference_code: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                form?.setFieldsValue({
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
                form?.setFieldsValue({
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
          width={1000}
        >
          {rerender && <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={20}>
              <Col span={24}>
                <Row gutter={24}>
                  <Col span={8}>
                    <Item name="campaign_id" label="Campaign ID">
                      <Input style={{ width: "100%" }} placeholder="Nhập Campaign ID" />
                    </Item>
                  </Col>

                  <Col span={8}>
                    <Item name="UTM_term" label="UTM Term">
                      <Input style={{ width: "100%" }} placeholder="Nhập UTM Term" />
                    </Item>
                  </Col>

                  <Col span={8}>
                    <Item name="UTM_campaign" label="UTM Campaign">
                      <Input style={{ width: "100%" }} placeholder="Nhập UTM Campaign" />
                    </Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={8}>
                    <Item name="UTM_source" label="UTM Source">
                      <Input style={{ width: "100%" }} placeholder="Nhập UTM Source" />
                    </Item>
                  </Col>

                  <Col span={8}>
                    <Item name="UTM_content" label="UTM Content">
                      <Input style={{ width: "100%" }} placeholder="Nhập UTM Content" />
                    </Item>
                  </Col>

                  <Col span={8}>
                    <Item name="UTM_medium" label="UTM Medium">
                      <Input style={{ width: "100%" }} placeholder="Nhập UTM Medium" />
                    </Item>
                  </Col>
                </Row>


                <Row gutter={24}>
                  <Col span={8}>
                    <Item name="Affiliate_code" label="Affiliate Code">
                      <Input style={{ width: "100%" }} placeholder="Nhập Affiliate Code" />
                    </Item>
                  </Col>

                  <Col span={8}>
                    <p>Kho cửa hàng</p>
                    <Item name="store_ids">
                      <TreeStore listStore={listStore} placeholder="Cửa hàng" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}/>
                    </Item>
                  </Col>

                  <Col span={8}>
                    <p>Kênh bán hàng</p>
                    <Item name="channel_codes">
                      <CustomSelect
                        mode="multiple"
                        style={{ width: '100%'}}
                        showArrow
                        allowClear
                        showSearch
                        placeholder="Chọn kênh bán hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                        maxTagCount='responsive'
                      >
                        {WEB_APP_LIST.map((item, index) => (
                          <CustomSelect.Option
                            style={{ width: "100%" }}
                            key={index.toString()}
                            value={item.key.toString()}
                          >
                            {item.title}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={8}>
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

                  <Col span={8} style={{ marginBottom: '20px'}}>
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

                  <Col span={8} style={{ marginBottom: '20px'}}>
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
                </Row>

                <Row gutter={24}>
                  <Col span={8}>
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

                  <Col span={8}>
                    <p>Trạng thái xử lý đơn hàng</p>
                    <Item
                      className="select-sub-status"
                      name="sub_status_code"
                    >
                      <Select
                        mode="multiple"
                        showSearch
                        showArrow
                        allowClear
                        placeholder="TT xử lý đơn"
                        notFoundContent="Không tìm thấy kết quả"
                        disabled={isLoading}
                        optionFilterProp="children"
                        maxTagCount='responsive'
                      >
                        {subStatus?.map((item: any) => (
                          <Option key={item.id} value={item.code?.toString()}>
                            {item.sub_status}
                          </Option>
                        ))}
                      </Select>
                    </Item>
                  </Col>

                  <Col span={8}>
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
                </Row>

                <Row gutter={24}>
                  <Col span={8}>
                    <p>Thanh toán</p>
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
                    </Item>
                  </Col>

                  <Col span={8}>
                    <p>Trả hàng</p>
                    <Item name="return_status">
                      <CustomSelect
                        mode="multiple" showSearch allowClear
                        showArrow placeholder="Chọn trạng thái trả hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{ width: '100%' }}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key="1"
                          value="returned"
                        >
                          Có đổi trả hàng
                        </CustomSelect.Option>
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key="2"
                          value="unreturned"
                        >
                          Không đổi trả hàng
                        </CustomSelect.Option>
                      </CustomSelect>
                    </Item>
                  </Col>

                    <Col span={8}>
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
                </Row>

                <Row gutter={24}>
                  <Col span={8}>
                    <Item name="shipper_codes" label="Đối tác giao hàng">
                      <CustomSelect
                        mode="multiple" showSearch allowClear
                        showArrow placeholder="Chọn đối tác giao hàng"
                        notFoundContent="Không tìm thấy kết quả" style={{ width: '100%' }}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                        maxTagCount='responsive'
                      >
                        {shippers && shippers.map((shipper) => (
                          <CustomSelect.Option key={shipper.code} value={shipper.code}>
                            {shipper.code} - {shipper.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>

                  <Col span={8}>
                    <p>Tổng tiền</p>
                    <div className="date-range" style={{display: "flex", alignItems: "center"}}>
                      <Item name="price_min" style={{ width: '45%', marginBottom: 0 }}>
                        <InputNumber
                          className="price_min"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          placeholder="Từ"
                          min="0"
                          max="100000000"
                          style={{width: "100%"}}
                        />
                      </Item>

                      <div className="swap-right-icon" style={{width: "10%", textAlign: "center"}}><SwapRightOutlined /></div>
                      <Item name="price_max" style={{ width: '45%', marginBottom: 0 }}>
                        <InputNumber
                          className="site-input-right price_max"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          placeholder="Đến"
                          min="0"
                          max="1000000000"
                          style={{width: "100%"}}
                        />
                      </Item>
                    </div>
                  </Col>

                  <Col span={8}>
                    <Item name="customer_note" label="Ghi chú của khách">
                      <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                    </Item>
                  </Col>
                </Row>
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
