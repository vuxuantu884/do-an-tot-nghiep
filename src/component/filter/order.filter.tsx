import {
  ArrowLeftOutlined,
  FilterOutlined,
  SettingOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, InputNumber, Radio, Row, Switch, Tag } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import Select from "antd/lib/select";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import CustomSelectWithButtonCheckAll from "component/custom/select-with-button-check-all.custom";
import CustomSelect from "component/custom/select.custom";
import { StyledComponent } from "component/filter/order.filter.styles";
import FilterConfigModal from "component/modal/FilterConfigModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import SearchProductComponent from "component/search-product";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTreeSelect from "component/CustomTreeSelect";
import UrlConfig from "config/url.config";
import { getListChannelRequest } from "domain/actions/order/order.action";
import useHandleFilterConfigsVersion2 from "hook/useHandleFilterConfigsVersion2";
import { isEqual } from "lodash";
import { AccountResponse, DeliverPartnerResponse } from "model/account/account.model";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { OrderSearchQuery, OrderTypeModel } from "model/order/order.model";
import { FilterConfig } from "model/other";
import { VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import React, {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { formatCurrency, replaceFormat } from "utils/AppUtils";
import { FILTER_CONFIG_TYPE, ORDER_TYPES_ONLINE, POS } from "utils/Constants";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import { ORDER_TYPES } from "utils/Order.constants";
import { formatDateTimeOrderFilter, getTimeFormatOrderFilterTag } from "utils/OrderUtils";
import { fullTextSearch } from "utils/StringUtils";
// import TreeSource from "../treeSource";
import BaseFilter from "./base.filter";
import UserCustomFilterTag from "./UserCustomFilterTag";
import useAuthorization from "hook/useAuthorization";
import { ORDER_PERMISSIONS } from "config/permissions/order.permission";
import { specialOrderTypes } from "component/order/special-order/SideBarOrderSpecial/helper";

type Props = {
  params: OrderSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse> | undefined;
  accounts: Array<AccountResponse>;
  shippers?: Array<DeliverPartnerResponse>;
  deliveryService: Array<any>;
  listPaymentMethod: Array<PaymentMethodResponse>;
  initSubStatus: Array<OrderProcessingStatusModel>;
  subStatus: Array<OrderProcessingStatusModel>;
  isLoading?: boolean;
  isHideTab?: boolean;
  listShippers?: AccountResponse[];
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  setListSource?: (values: SourceResponse[]) => void;
  setListOrderProcessingStatus?: (values: OrderProcessingStatusModel[]) => void;
  orderType: OrderTypeModel;
  initChannelCodes?: string[];
  channels?: ChannelResponse[];
  userConfigs: FilterConfig[];
  handleCountForceFetchUserConfigs: () => void;
};

type ListFilterTagTypes = {
  key: string;
  name: string;
  value: JSX.Element | null;
  isExpand?: boolean;
};

const { Item } = Form;

const isShortenFilterTag = true;
const numberTagShorten = 2;

// const initQueryVariant: VariantSearchQuery = {
//   limit: 10,
//   page: 1,
//   saleable: true,
// };

var initialValueExchange = {};

function OrdersFilter(props: Props): JSX.Element {
  const {
    params,
    actions,
    listSource,
    listStore,
    accounts,
    shippers,
    deliveryService,
    initSubStatus,
    subStatus,
    listPaymentMethod,
    isLoading,
    isHideTab = false,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    orderType,
    initChannelCodes,
    channels,
    userConfigs,
    handleCountForceFetchUserConfigs,
  } = props;

  const [allowOrderB2BRead] = useAuthorization({
    acceptPermissions: [ORDER_PERMISSIONS.ORDERS_B2B_READ],
    not: false,
  });

  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [visibleUTM, setVisibleUTM] = useState<boolean>(false);
  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);

  const dateFormat = DATE_FORMAT.DD_MM_YY_HHmmss;
  const timeFormat = DATE_FORMAT.HH_mm;

  const dispatch = useDispatch();

  const [selectedSubStatusCodes, setSelectedSubStatusCodes] = useState<string[]>([]);

  const [services, setServices] = useState<any[]>([]);
  const [isExpiresPayment, setIsExpiresPayment] = useState<boolean>();
  const [isUniform, setIsUniform] = useState<boolean>();
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);

  const status = bootstrapReducer.data?.order_main_status.filter(
    (single) => single.value !== "splitted",
  );

  const filterConfigType =
    orderType === ORDER_TYPES.offline
      ? FILTER_CONFIG_TYPE.orderOffline
      : FILTER_CONFIG_TYPE.orderOnline;

  const filterConfigs = userConfigs.filter((config) => config.type === filterConfigType);

  useEffect(() => {
    setSelectedSubStatusCodes(initSubStatus?.map((single) => single.code) || []);
  }, [initSubStatus]);

  const [keySearchVariant, setKeySearchVariant] = useState("");

  const fulfillmentStatus = useMemo(
    () => [
      { name: "Chưa giao", value: "unshipped" },
      { name: "Đang giao", value: "shipping" },
      { name: "Đã giao", value: "shipped" },
    ],
    [],
  );
  const paymentStatus = useMemo(
    () => [
      { name: "Chưa trả", value: "unpaid" },
      { name: "Đã trả", value: "paid" },
      { name: "Đã trả một phần", value: "partial_paid" },
      { name: "Đang hoàn lại", value: "refunding" },
    ],
    [],
  );

  const serviceType = useMemo(
    () => [
      {
        name: "Nhận tại cửa hàng",
        value: "pick_at_store",
      },
      {
        name: "Hãng vận chuyển",
        value: "external_service",
      },
      {
        name: "Shopee",
        value: "shopee",
      },
    ],
    [],
  );

  const specialOrderTypesArr = useMemo(() => {
    let types = [];
    for (const property in specialOrderTypes) {
      types.push({
        ...specialOrderTypes[property],
      });
    }
    return types;
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const orderToBeProcessed = [
    {
      value: "packed_late",
      title: "Đóng trễ",
    },
    {
      value: "picked_late",
      title: "Lấy trễ",
    },
    // {
    //   value: "cancelled_after_shipping",
    //   title: "Hủy sau xuất",
    // },
  ];

  const serviceVariables = {
    deliver4h: "4h_delivery",
    deliverStandard: "standard_delivery",
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const serviceListVariables = [
    {
      title: "Đơn giao 4H",
      value: serviceVariables.deliver4h,
    },
    {
      title: "Đơn giao thường",
      value: serviceVariables.deliverStandard,
    },
  ];

  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>([]);
  const [accountFound, setAccountFound] = useState<Array<AccountResponse>>([]);
  const [marketerFound, setMarketerFound] = useState<Array<AccountResponse>>([]);
  const [coordinatorFound, setCoordinatorFound] = useState<Array<AccountResponse>>([]);
  const [orderCarerFound, setOrderCarerFound] = useState<Array<AccountResponse>>([]);

  const [isShowModalSaveFilter, setIsShowModalSaveFilter] = useState(false);

  const onShowSaveFilter = useCallback(() => {
    let values = formRef.current?.getFieldsValue();

    if (values) {
      values.services = services;
      if (values.price_min && values.price_max) {
        values = {
          ...values,
          price_min: values?.price_min,
          price_max: values?.price_max,
        };
      }
    }
    setFormSearchValuesToSave(values);
    setIsShowModalSaveFilter(true);
  }, [formRef, services]);

  const onHandleFilterTagSuccessCallback = (res: BaseResponse<FilterConfig>) => {
    setTagActive(res.data.id);
  };

  const [formSearchValuesToSave, setFormSearchValuesToSave] = useState({});

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const [tagActive, setTagActive] = useState<number | null>();

  const { onSaveFilter, configId, setConfigId, handleDeleteFilter, onSelectFilterConfig } =
    useHandleFilterConfigsVersion2(
      userConfigs,
      filterConfigType,
      formRef,
      handleCountForceFetchUserConfigs,
      {
        ...formSearchValuesToSave,
      },
      setTagActive,
      onHandleFilterTagSuccessCallback,
    );

  const onChangeOrderOptions = useCallback(
    (e) => {
      onFilter && onFilter({ ...params, is_online: e.target.value });
    },
    [onFilter, params],
  );

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
    [onMenuClick],
  );

  useEffect(() => {
    if (
      params.utm_source ||
      params.utm_medium ||
      params.utm_content ||
      params.utm_term ||
      params.utm_id ||
      params.utm_campaign ||
      params.affiliate
    ) {
      setVisibleUTM(true);
    } else {
      setVisibleUTM(false);
    }
  }, [
    params.affiliate,
    params.utm_campaign,
    params.utm_content,
    params.utm_id,
    params.utm_medium,
    params.utm_source,
    params.utm_term,
    visible,
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      switch (tag.key) {
        case "store":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "source":
          onFilter && onFilter({ ...params, source_ids: [] });
          break;
        case "issued":
          setIssuedClick("");
          onFilter && onFilter({ ...params, issued_on_min: null, issued_on_max: null });
          break;
        case "finalized":
          setFinalizedClick("");
          onFilter &&
            onFilter({
              ...params,
              finalized_on_min: null,
              finalized_on_max: null,
            });
          break;
        case "last_coordinator_confirm":
          setFinalizedClick("");
          onFilter &&
            onFilter({
              ...params,
              last_coordinator_confirm_on_min: null,
              last_coordinator_confirm_on_max: null,
            });
          break;
        case "completed":
          setCompletedClick("");
          onFilter &&
            onFilter({
              ...params,
              completed_on_min: null,
              completed_on_max: null,
            });
          break;
        case "cancelled":
          setCancelledClick("");
          onFilter &&
            onFilter({
              ...params,
              cancelled_on_min: null,
              cancelled_on_max: null,
            });
          break;
        case "expected":
          setExpectedClick("");
          onFilter &&
            onFilter({
              ...params,
              expected_receive_on_min: null,
              expected_receive_on_max: null,
            });
          break;
        case "returning":
          setExpectedClick("");
          onFilter &&
            onFilter({
              ...params,
              returning_date_min: null,
              returning_date_max: null,
            });
          break;
        case "returned":
          setExpectedClick("");
          onFilter &&
            onFilter({
              ...params,
              returned_date_min: null,
              returned_date_max: null,
            });
          break;
        case "exported_on":
          setExportedClick("");
          onFilter &&
            onFilter({
              ...params,
              exported_on_min: null,
              exported_on_max: null,
            });
          break;
        case "order_status":
          onFilter && onFilter({ ...params, order_status: [] });
          break;
        case "sub_status_code":
          onFilter && onFilter({ ...params, sub_status_code: [] });
          break;
        case "fulfillment_status":
          onFilter && onFilter({ ...params, fulfillment_status: [] });
          break;
        case "payment_status":
          onFilter && onFilter({ ...params, payment_status: [] });
          break;
        case "assignee_codes":
          onFilter && onFilter({ ...params, assignee_codes: [] });
          break;
        case "account_codes":
          onFilter && onFilter({ ...params, account_codes: [] });
          break;
        case "coordinator_codes":
          onFilter && onFilter({ ...params, coordinator_codes: [] });
          break;
        case "order_carer_codes":
          onFilter && onFilter({ ...params, order_carer_codes: [] });
          break;
        case "marketer_codes":
          onFilter && onFilter({ ...params, marketer_codes: [] });
          break;
        case "price":
          onFilter && onFilter({ ...params, price_min: null, price_max: null });
          break;
        case "variant_ids":
          onFilter && onFilter({ ...params, variant_ids: [] });
          break;
        case "searched_product":
          onFilter && onFilter({ ...params, searched_product: null });
          break;
        case "tracking_codes":
          onFilter && onFilter({ ...params, tracking_codes: null });
          break;
        case "payment_method":
          onFilter && onFilter({ ...params, payment_method_ids: [] });
          break;
        case "delivery_types":
          onFilter && onFilter({ ...params, delivery_types: [] });
          break;
        case "delivery_provider_ids":
          onFilter && onFilter({ ...params, delivery_provider_ids: [] });
          break;
        case "special_types":
          onFilter && onFilter({ ...params, special_types: [] });
          break;
        case "violation_types":
          onFilter && onFilter({ ...params, violation_types: [] });
          break;
        case "shipper_codes":
          onFilter && onFilter({ ...params, shipper_codes: [] });
          break;
        case "note":
          onFilter && onFilter({ ...params, note: "" });
          break;
        case "customer_note":
          onFilter && onFilter({ ...params, customer_note: "" });
          break;
        case "tags":
          onFilter && onFilter({ ...params, tags: [] });
          break;
        case "marketing_campaign":
          onFilter && onFilter({ ...params, marketing_campaign: [] });
          break;
        case "reference_code":
          onFilter && onFilter({ ...params, reference_code: "" });
          break;
        case "services":
          onFilter && onFilter({ ...params, services: "" });
          break;
        case "return_status":
          onFilter && onFilter({ ...params, return_status: "" });
          break;
        case "channel_codes":
          onFilter && onFilter({ ...params, channel_codes: [] });
          break;
        case "discount_codes":
          onFilter && onFilter({ ...params, discount_codes: [] });
          break;
        case "utm_source":
          onFilter && onFilter({ ...params, utm_source: null });
          break;
        case "utm_medium":
          onFilter && onFilter({ ...params, utm_medium: null });
          break;
        case "utm_content":
          onFilter && onFilter({ ...params, utm_content: null });
          break;
        case "utm_term":
          onFilter && onFilter({ ...params, utm_term: null });
          break;
        case "utm_id":
          onFilter && onFilter({ ...params, utm_id: null });
          break;
        case "utm_campaign":
          onFilter && onFilter({ ...params, utm_campaign: null });
          break;
        case "affiliate":
          onFilter && onFilter({ ...params, affiliate: null });
          break;
        case "in_goods_receipt":
          onFilter && onFilter({ ...params, in_goods_receipt: undefined });
          break;
        case "is_expired_payment":
          onFilter && onFilter({ ...params, is_expired_payment: undefined });
          break;
        case "uniform":
          onFilter && onFilter({ ...params, uniform: undefined });
          break;
        case "expired_at":
          onFilter && onFilter({ ...params, expired_at: undefined });
          break;
        case "returned_store":
          onFilter && onFilter({ ...params, returned_store_ids: undefined });
          break;
        case "types":
          onFilter && onFilter({ ...params, types: undefined });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  const [issuedClick, setIssuedClick] = useState("");
  const [finalizedClick, setFinalizedClick] = useState("");
  const [completedClick, setCompletedClick] = useState("");
  const [cancelledClick, setCancelledClick] = useState("");
  const [expectedClick, setExpectedClick] = useState("");
  const [exportedClick, setExportedClick] = useState("");
  const listSources = useMemo(() => {
    return listSource.filter((item) => item.id !== POS.source_id);
  }, [listSource]);

  const initialValues = useMemo(() => {
    let textDiscount = "";
    if (Array.isArray(params.discount_codes)) {
      if (params.discount_codes && params.discount_codes.length > 0) {
        let indexExt = params.discount_codes.length - 1;
        params.discount_codes.forEach((value, index) => {
          if (indexExt === index) textDiscount = textDiscount + value;
          else textDiscount = textDiscount + `${value}, `;
        });
      }
    } else {
      textDiscount = params.discount_codes || "";
    }

    return {
      ...params,
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids.map((i) => Number(i))
        : [Number(params.store_ids)],
      source_ids: Array.isArray(params.source_ids)
        ? params.source_ids.map((i) => Number(i))
        : [Number(params.source_ids)],
      order_status: Array.isArray(params.order_status)
        ? params.order_status
        : [params.order_status],
      sub_status_code: Array.isArray(params.sub_status_code)
        ? params.sub_status_code
        : [params.sub_status_code],
      fulfillment_status: Array.isArray(params.fulfillment_status)
        ? params.fulfillment_status
        : [params.fulfillment_status],
      payment_status: Array.isArray(params.payment_status)
        ? params.payment_status
        : [params.payment_status],
      return_status: Array.isArray(params.return_status)
        ? params.return_status
        : [params.return_status],
      payment_method_ids: Array.isArray(params.payment_method_ids)
        ? params.payment_method_ids
        : [params.payment_method_ids],
      delivery_provider_ids: Array.isArray(params.delivery_provider_ids)
        ? params.delivery_provider_ids
        : [params.delivery_provider_ids],
      special_types: Array.isArray(params.special_types)
        ? params.special_types
        : [params.special_types],
      violation_types: Array.isArray(params.violation_types)
        ? params.violation_types
        : [params.violation_types],
      shipper_codes: Array.isArray(params.shipper_codes)
        ? params.shipper_codes
        : [params.shipper_codes],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      marketing_campaign: Array.isArray(params.marketing_campaign)
        ? params.marketing_campaign
        : [params.marketing_campaign],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
      assignee_codes: Array.isArray(params.assignee_codes)
        ? params.assignee_codes
        : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes)
        ? params.account_codes
        : [params.account_codes],
      channel_codes: Array.isArray(params.channel_codes)
        ? params.channel_codes
        : [params.channel_codes],
      coordinator_codes: Array.isArray(params.coordinator_codes)
        ? params.coordinator_codes
        : [params.coordinator_codes],
      order_carer_codes: Array.isArray(params.order_carer_codes)
        ? params.order_carer_codes
        : [params.order_carer_codes],
      marketer_codes: Array.isArray(params.marketer_codes)
        ? params.marketer_codes
        : [params.marketer_codes],
      delivery_types: Array.isArray(params.delivery_types)
        ? params.delivery_types
        : [params.delivery_types],
      services: Array.isArray(params.services) ? params.services : [params.services],
      returned_store_ids: params.returned_store_ids
        ? Array.isArray(params.returned_store_ids)
          ? params.returned_store_ids.map((p) => Number(p))
          : [Number(params.returned_store_ids)]
        : [],
      types: params.types ? (Array.isArray(params.types) ? params.types : [params.types]) : [],

      is_expired_payment: params.is_expired_payment === "true" ? true : undefined,
      uniform: params.uniform === "true" ? true : undefined,

      issued_on_min: formatDateFilter(params.issued_on_min || undefined),
      issued_on_max: formatDateFilter(params.issued_on_max || undefined),
      finalized_on_min: formatDateFilter(params.finalized_on_min || undefined),
      finalized_on_max: formatDateFilter(params.finalized_on_max || undefined),
      last_coordinator_confirm_on_min: formatDateFilter(
        params.last_coordinator_confirm_on_min || undefined,
      ),
      last_coordinator_confirm_on_max: formatDateFilter(
        params.last_coordinator_confirm_on_max || undefined,
      ),
      cancelled_on_min: formatDateFilter(params.cancelled_on_min || undefined),
      cancelled_on_max: formatDateFilter(params.cancelled_on_max || undefined),
      completed_on_min: formatDateFilter(params.completed_on_min || undefined),
      completed_on_max: formatDateFilter(params.completed_on_max || undefined),
      exported_on_min: formatDateFilter(params.exported_on_min || undefined),
      exported_on_max: formatDateFilter(params.exported_on_max || undefined),
      expected_receive_on_min: formatDateFilter(params.expected_receive_on_min || undefined),
      expected_receive_on_max: formatDateFilter(params.expected_receive_on_max || undefined),
      returning_date_min: formatDateFilter(params.returning_date_min || undefined),
      returning_date_max: formatDateFilter(params.returning_date_max || undefined),
      returned_date_min: formatDateFilter(params.returned_date_min || undefined),
      returned_date_max: formatDateFilter(params.returned_date_max || undefined),
      discount_codes: textDiscount,
      in_goods_receipt: params.in_goods_receipt ? Number(params.in_goods_receipt) : undefined,
    };
  }, [params]);

  const [filterTagFormatted, setFilterTagFormatted] = useState<any>(null);

  useEffect(() => {
    setFilterTagFormatted({
      ...initialValues,
      store_ids: {
        data: initialValues.store_ids,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.store_ids.length > numberTagShorten,
      },
      returned_store_ids: {
        data: initialValues.returned_store_ids,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.returned_store_ids.length > numberTagShorten,
      },
      source_ids: {
        data: initialValues.source_ids,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.source_ids.length > numberTagShorten,
      },
      order_status: {
        data: initialValues.order_status,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.order_status.length > numberTagShorten,
      },
      account_codes: {
        data: initialValues.account_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.account_codes.length > numberTagShorten,
      },
      assignee_codes: {
        data: initialValues.assignee_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.assignee_codes.length > numberTagShorten,
      },
      coordinator_codes: {
        data: initialValues.coordinator_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.coordinator_codes.length > numberTagShorten,
      },

      order_carer_codes: {
        data: initialValues.order_carer_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.order_carer_codes.length > numberTagShorten,
      },
      marketer_codes: {
        data: initialValues.marketer_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.marketer_codes.length > numberTagShorten,
      },
    });
  }, [initialValues]);

  const onFinish = useCallback(() => {
    let error = false;
    formRef?.current
      ?.getFieldsError([
        "issued_on_min",
        "issued_on_max",
        "finalized_on_min",
        "finalized_on_max",
        "last_coordinator_confirm_on_min",
        "last_coordinator_confirm_on_max",
        "completed_on_min",
        "completed_on_max",
        "cancelled_on_min",
        "cancelled_on_max",
        "expected_receive_on_min",
        "expected_receive_on_max",
        "returning_date_min",
        "returning_date_max",
        "returned_date_min",
        "returned_date_max",
        "exported_on_min",
        "exported_on_max",
      ])
      .forEach((field) => {
        if (field.errors.length) {
          error = true;
        }
      });
    if (!error) {
      const baseFilterValue = formRef?.current?.getFieldsValue();
      const filterValue = formSearchRef.current?.getFieldsValue();
      let values: any = undefined;
      if (baseFilterValue) {
        values = { ...baseFilterValue, ...filterValue };
      } else {
        values = { ...initialValues, ...filterValue };
      }
      setVisible(false);
      values.services = services;
      values.searched_product = keySearchVariant; // search sản phẩm, ko để trong form nên phải thêm trong values
      if (values.price_min && values.price_max) {
        values = {
          ...values,
          price_min: values?.price_min,
          price_max: values?.price_max,
        };
      }
      values.issued_on_min = formatDateTimeOrderFilter(values.issued_on_min, dateFormat);
      values.issued_on_max = formatDateTimeOrderFilter(values.issued_on_max, dateFormat);
      values.finalized_on_min = formatDateTimeOrderFilter(values.finalized_on_min, dateFormat);
      values.finalized_on_max = formatDateTimeOrderFilter(values.finalized_on_max, dateFormat);
      values.last_coordinator_confirm_on_min = formatDateTimeOrderFilter(
        values.last_coordinator_confirm_on_min,
        dateFormat,
      );
      values.last_coordinator_confirm_on_max = formatDateTimeOrderFilter(
        values.last_coordinator_confirm_on_max,
        dateFormat,
      );
      values.cancelled_on_min = formatDateTimeOrderFilter(values.cancelled_on_min, dateFormat);
      values.cancelled_on_max = formatDateTimeOrderFilter(values.cancelled_on_max, dateFormat);
      values.completed_on_min = formatDateTimeOrderFilter(values.completed_on_min, dateFormat);
      values.completed_on_max = formatDateTimeOrderFilter(values.completed_on_max, dateFormat);
      values.exported_on_min = formatDateTimeOrderFilter(values.exported_on_min, dateFormat);
      values.exported_on_max = formatDateTimeOrderFilter(values.exported_on_max, dateFormat);
      values.expected_receive_on_min = formatDateTimeOrderFilter(
        values.expected_receive_on_min,
        dateFormat,
      );
      values.expected_receive_on_max = formatDateTimeOrderFilter(
        values.expected_receive_on_max,
        dateFormat,
      );
      values.returning_date_min = formatDateTimeOrderFilter(values.returning_date_min, dateFormat);
      values.returning_date_min = formatDateTimeOrderFilter(values.returning_date_min, dateFormat);
      values.returning_date_max = formatDateTimeOrderFilter(values.returning_date_max, dateFormat);
      values.returned_date_min = formatDateTimeOrderFilter(values.returned_date_min, dateFormat);
      values.returned_date_max = formatDateTimeOrderFilter(values.returned_date_max, dateFormat);
      values.expired_at = values.expired_at === 0 ? undefined : values.expired_at;

      let discount_codes = [];
      if (values.discount_codes) {
        discount_codes = values.discount_codes.split(",").map((p: string) => p?.trim());
      }
      onFilter &&
        onFilter({
          ...values,
          discount_codes: discount_codes,
          is_expired_payment: isExpiresPayment,
          uniform: isUniform,
        });
      setRerender(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateFormat,
    formRef,
    formSearchRef,
    initialValues,
    keySearchVariant,
    onFilter,
    services,
    isExpiresPayment,
    allowOrderB2BRead,
  ]);

  let filters = useMemo(() => {
    const splitCharacter = ", ";

    const renderSplitCharacter = (index: number, mappedArray: any[]) => {
      let result = null;
      if (index !== mappedArray.length - 1) {
        result = <React.Fragment>{splitCharacter}</React.Fragment>;
      }
      return result;
    };

    const renderEndOfFilter = (
      type: string,
      isShortenText: boolean = true,
      isCanShortenText?: boolean,
      countHidden: number = 0,
    ) => {
      if (!isCanShortenText) {
        return;
      }
      if (!isShortenText) {
        return (
          <span
            title="Thu gọn"
            onClick={() => {
              setFilterTagFormatted({
                ...filterTagFormatted,
                [type]: {
                  ...filterTagFormatted[type],
                  isShorten: !filterTagFormatted[type]?.isShorten,
                },
              });
            }}
          >
            <ArrowLeftOutlined />
          </span>
        );
      } else {
        return (
          <React.Fragment>
            <span
              title="Mở rộng đầy đủ"
              className="expandText"
              onClick={() => {
                setFilterTagFormatted({
                  ...filterTagFormatted,
                  [type]: {
                    ...filterTagFormatted[type],
                    isShorten: !filterTagFormatted[type]?.isShorten,
                  },
                });
              }}
            >
              {` (+${countHidden})`}
            </span>
          </React.Fragment>
        );
      }
    };

    const getFilterString = (
      _mappedArray: any[] | undefined,
      keyValue: string,
      endPoint?: string,
      objectLink?: string,
      type?: string,
      isCanShortenText: boolean = false,
      _isShortenText?: boolean,
    ) => {
      let result = null;
      if (!_mappedArray) {
        return null;
      }
      let mappedArrayResult = _mappedArray;
      let countHidden = 0;
      if (_mappedArray && _isShortenText && _mappedArray.length > numberTagShorten) {
        mappedArrayResult = _mappedArray.slice(0, numberTagShorten);
        countHidden = _mappedArray.length - numberTagShorten;
      }
      if (type === "assignee_codes") {
        result = mappedArrayResult.map((single, index) => {
          return (
            <Link to={`${UrlConfig.ACCOUNTS}/${single.code}`} target="_blank" key={single.code}>
              {single.code} - {single.full_name}
              {renderSplitCharacter(index, mappedArrayResult)}
            </Link>
          );
        });
      } else if (type === "account_codes") {
        result = mappedArrayResult.map((single, index) => {
          return (
            <Link to={`${UrlConfig.ACCOUNTS}/${single.code}`} target="_blank" key={single.code}>
              {single.code} - {single.full_name}
              {renderSplitCharacter(index, mappedArrayResult)}
            </Link>
          );
        });
      } else {
        result = mappedArrayResult.map((single, index) => {
          if (objectLink && endPoint && single[objectLink]) {
            return (
              <Link to={`${endPoint}/${single[objectLink]}`} target="_blank" key={single[keyValue]}>
                {single[keyValue]}
                {renderSplitCharacter(index, mappedArrayResult)}
              </Link>
            );
          }
          return (
            <React.Fragment>
              {single[keyValue]}
              {renderSplitCharacter(index, mappedArrayResult)}
            </React.Fragment>
          );
        });
      }
      if (!type) {
        type = "";
      }
      return (
        <React.Fragment>
          {result}
          {renderEndOfFilter(type, _isShortenText, isCanShortenText, countHidden)}
        </React.Fragment>
      );
    };

    let list: ListFilterTagTypes[] = [];
    if (filterTagFormatted?.store_ids?.data && filterTagFormatted.store_ids?.data?.length) {
      let mappedStores = listStore?.filter((store) =>
        filterTagFormatted.store_ids.data?.some((single: number) => single === store.id),
      );
      let text = getFilterString(
        mappedStores,
        "name",
        UrlConfig.STORE,
        "id",
        "store_ids",
        filterTagFormatted.store_ids.isCanShorten,
        filterTagFormatted.store_ids.isShorten,
      );
      list.push({
        key: "store",
        name: "Cửa hàng",
        value: text,
      });
    }
    if (filterTagFormatted?.source_ids?.data && filterTagFormatted.source_ids?.data?.length) {
      let mappedSources = listSources?.filter((source) =>
        filterTagFormatted.source_ids.data?.some((single: number) => single === source.id),
      );
      let text = getFilterString(
        mappedSources,
        "name",
        undefined,
        undefined,
        "source_ids",
        filterTagFormatted.source_ids.isCanShorten,
        filterTagFormatted.source_ids.isShorten,
      );
      list.push({
        key: "source",
        name: "Nguồn",
        value: text,
      });
    }

    if (initialValues.issued_on_min || initialValues.issued_on_max) {
      let textOrderCreateDate =
        (initialValues.issued_on_min
          ? getTimeFormatOrderFilterTag(initialValues.issued_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.issued_on_max
          ? getTimeFormatOrderFilterTag(initialValues.issued_on_max, dateFormat)
          : "??");
      list.push({
        key: "issued",
        name: "Ngày tạo đơn",
        value: <React.Fragment>{textOrderCreateDate}</React.Fragment>,
      });
    }

    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      let textOrderFinalizedDate =
        (initialValues.finalized_on_min
          ? getTimeFormatOrderFilterTag(initialValues.finalized_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.finalized_on_max
          ? getTimeFormatOrderFilterTag(initialValues.finalized_on_max, dateFormat)
          : "??");
      list.push({
        key: "finalized",
        name: "Ngày duyệt đơn",
        value: <React.Fragment>{textOrderFinalizedDate}</React.Fragment>,
      });
    }
    if (
      initialValues.last_coordinator_confirm_on_min ||
      initialValues.last_coordinator_confirm_on_max
    ) {
      let textOrderLastCoordinatorDate =
        (initialValues.last_coordinator_confirm_on_min
          ? getTimeFormatOrderFilterTag(initialValues.last_coordinator_confirm_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.last_coordinator_confirm_on_max
          ? getTimeFormatOrderFilterTag(initialValues.last_coordinator_confirm_on_max, dateFormat)
          : "??");
      list.push({
        key: "last_coordinator_confirm",
        name: "Ngày xác nhận",
        value: <React.Fragment>{textOrderLastCoordinatorDate}</React.Fragment>,
      });
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate =
        (initialValues.completed_on_min
          ? getTimeFormatOrderFilterTag(initialValues.completed_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.completed_on_max
          ? getTimeFormatOrderFilterTag(initialValues.completed_on_max, dateFormat)
          : "??");
      list.push({
        key: "completed",
        name: "Ngày hoàn tất đơn",
        value: <React.Fragment>{textOrderCompleteDate}</React.Fragment>,
      });
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate =
        (initialValues.cancelled_on_min
          ? getTimeFormatOrderFilterTag(initialValues.cancelled_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.cancelled_on_max
          ? getTimeFormatOrderFilterTag(initialValues.cancelled_on_max, dateFormat)
          : "??");
      list.push({
        key: "cancelled",
        name: "Ngày huỷ đơn",
        value: <React.Fragment>{textOrderCancelDate}</React.Fragment>,
      });
    }

    if (initialValues.expected_receive_on_min || initialValues.expected_receive_on_max) {
      let textExpectReceiveDate =
        (initialValues.expected_receive_on_min
          ? getTimeFormatOrderFilterTag(initialValues.expected_receive_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.expected_receive_on_max
          ? getTimeFormatOrderFilterTag(initialValues.expected_receive_on_max, dateFormat)
          : "??");
      list.push({
        key: "expected",
        name: "Ngày dự kiến nhận hàng",
        value: <React.Fragment>{textExpectReceiveDate}</React.Fragment>,
      });
    }

    if (initialValues.returning_date_min || initialValues.returning_date_max) {
      let textExpectReceiveDate =
        (initialValues.returning_date_min
          ? getTimeFormatOrderFilterTag(initialValues.returning_date_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.returning_date_max
          ? getTimeFormatOrderFilterTag(initialValues.returning_date_max, dateFormat)
          : "??");
      list.push({
        key: "returning",
        name: "Ngày đang hoàn ",
        value: <React.Fragment>{textExpectReceiveDate}</React.Fragment>,
      });
    }

    if (initialValues.returned_date_min || initialValues.returned_date_max) {
      let textExpectReceiveDate =
        (initialValues.returned_date_min
          ? getTimeFormatOrderFilterTag(initialValues.returned_date_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.returned_date_max
          ? getTimeFormatOrderFilterTag(initialValues.returned_date_max, dateFormat)
          : "??");
      list.push({
        key: "returned",
        name: "Ngày đã hoàn",
        value: <React.Fragment>{textExpectReceiveDate}</React.Fragment>,
      });
    }
    if (initialValues.exported_on_min || initialValues.exported_on_max) {
      let textExportedOnDate =
        (initialValues.exported_on_min
          ? getTimeFormatOrderFilterTag(initialValues.exported_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.exported_on_max
          ? getTimeFormatOrderFilterTag(initialValues.exported_on_max, dateFormat)
          : "??");
      list.push({
        key: "exported_on",
        name: "Ngày giao hàng cho HVC",
        value: <React.Fragment>{textExportedOnDate}</React.Fragment>,
      });
    }
    if (initialValues.order_status.length) {
      let orderStatuses = status?.filter((status) =>
        initialValues.order_status?.some((item) => item === status.value.toString()),
      );
      let text = getFilterString(
        orderStatuses,
        "name",
        undefined,
        undefined,
        "order_status",
        filterTagFormatted.order_status.isCanShorten,
        filterTagFormatted.order_status.isShorten,
      );
      list.push({
        key: "order_status",
        name: "Trạng thái tiến trình đơn hàng",
        value: text,
      });
    }

    if (initialValues.return_status.length) {
      let option = [
        {
          label: "Có đổi trả hàng",
          value: "returned",
        },
        {
          label: "Không đổi trả hàng",
          value: "unreturned",
        },
      ];
      let mappedReturnStatus = option?.filter((status) =>
        initialValues.return_status?.some((item) => item === status.value.toString()),
      );
      let text = getFilterString(mappedReturnStatus, "label", undefined, undefined);

      list.push({
        key: "return_status",
        name: "Trả hàng",
        value: <React.Fragment>{text}</React.Fragment>,
      });
    }

    if (initialValues.sub_status_code.length) {
      let mappedSubStatuses = subStatus?.filter((status) =>
        initialValues.sub_status_code?.some((item) => item === status.code.toString()),
      );
      let text = getFilterString(
        mappedSubStatuses,
        "sub_status",
        undefined,
        undefined,
        "sub_status_code",
        filterTagFormatted.sub_status_code.isCanShorten,
        filterTagFormatted.sub_status_code.isShorten,
      );
      list.push({
        key: "sub_status_code",
        name: "Trạng thái xử lý đơn",
        value: text,
      });
    }
    if (initialValues.fulfillment_status.length) {
      let mappedFulfillmentStatus = fulfillmentStatus?.filter((status) =>
        initialValues.fulfillment_status?.some((item) => item === status.value.toString()),
      );
      let text = getFilterString(mappedFulfillmentStatus, "name", undefined, undefined);
      list.push({
        key: "fulfillment_status",
        name: "Trạng thái giao hàng",
        value: text,
      });
    }

    if (initialValues.payment_status.length) {
      let mappedPaymentStatuses = paymentStatus?.filter((status) =>
        initialValues.payment_status?.some((item) => item === status.value.toString()),
      );
      let text = getFilterString(mappedPaymentStatuses, "name", undefined, undefined);
      list.push({
        key: "payment_status",
        name: "Trạng thái thanh toán",
        value: text,
      });
    }

    if (initialValues.searched_product) {
      let textVariant = initialValues.searched_product;
      list.push({
        key: "searched_product",
        name: "Mã sản phẩm",
        value: <React.Fragment>{textVariant}</React.Fragment>,
      });
    }

    if (initialValues.assignee_codes.length) {
      let text = getFilterString(
        assigneeFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "assignee_codes",
        filterTagFormatted.assignee_codes.isCanShorten,
        filterTagFormatted.assignee_codes.isShorten,
      );
      list.push({
        key: "assignee_codes",
        name: "Nhân viên bán hàng",
        value: text,
      });
    }

    if (initialValues.services.length > 0) {
      let text = "";
      for (let i = 0; i < services.length; i++) {
        let selected = serviceListVariables.find((single) => single.value === services[i]);
        if (i < services.length - 1) {
          text = text + selected?.title + splitCharacter;
        } else {
          text = text + selected?.title;
        }
      }
      list.push({
        key: "services",
        name: "Đơn tự giao hàng",
        value: <React.Fragment>{text}</React.Fragment>,
      });
    }

    if (initialValues.account_codes.length) {
      let text = getFilterString(
        accountFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "account_codes",
        filterTagFormatted.account_codes.isCanShorten,
        filterTagFormatted.account_codes.isShorten,
      );
      list.push({
        key: "account_codes",
        name: "Nhân viên tạo đơn",
        value: text,
      });
    }

    if (initialValues.coordinator_codes.length) {
      let text = getFilterString(
        coordinatorFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "coordinator_codes",
        filterTagFormatted.coordinator_codes.isCanShorten,
        filterTagFormatted.coordinator_codes.isShorten,
      );
      list.push({
        key: "coordinator_codes",
        name: "Nhân viên điều phối",
        value: text,
      });
    }

    if (initialValues.order_carer_codes.length) {
      let text = getFilterString(
        orderCarerFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "order_carer_codes",
        filterTagFormatted.order_carer_codes.isCanShorten,
        filterTagFormatted.order_carer_codes.isShorten,
      );
      list.push({
        key: "order_carer_codes",
        name: "Nhân viên CSĐH",
        value: text,
      });
    }

    if (initialValues.marketer_codes.length) {
      let text = getFilterString(
        marketerFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "marketer_codes",
        filterTagFormatted.marketer_codes.isCanShorten,
        filterTagFormatted.marketer_codes.isShorten,
      );
      list.push({
        key: "marketer_codes",
        name: "Nhân viên marketing",
        value: text,
      });
    }

    if (initialValues.price_min || initialValues.price_max) {
      let textPrice =
        (initialValues.price_min ? `${formatCurrency(initialValues.price_min)} đ` : " 0 ") +
        " ~ " +
        (initialValues.price_max ? `${formatCurrency(initialValues.price_max)} đ` : " ?? ");
      list.push({
        key: "price",
        name: "Tổng tiền",
        value: <React.Fragment>{textPrice}</React.Fragment>,
      });
    }

    if (initialValues.payment_method_ids.length) {
      let mappedPaymentMethods = listPaymentMethod?.filter((paymentMethod) =>
        initialValues.payment_method_ids?.some((item) => item === paymentMethod.id.toString()),
      );
      let text = getFilterString(mappedPaymentMethods, "name", undefined, undefined);
      list.push({
        key: "payment_method",
        name: "Phương thức thanh toán",
        value: text,
      });
    }
    if (initialValues.delivery_types.length) {
      let mappedDeliverTypes = serviceType?.filter((deliverType) =>
        initialValues.delivery_types?.some((item) => item === deliverType.value.toString()),
      );
      let text = getFilterString(mappedDeliverTypes, "name", undefined, undefined);
      list.push({
        key: "delivery_types",
        name: "Hình thức vận chuyển",
        value: text,
      });
    }
    if (initialValues.delivery_provider_ids.length) {
      let mappedDeliverProviderIds = deliveryService?.filter((deliveryServiceSingle) =>
        initialValues.delivery_provider_ids?.some(
          (item) => item === deliveryServiceSingle.id.toString(),
        ),
      );
      let text = getFilterString(mappedDeliverProviderIds, "name", undefined, undefined);
      list.push({
        key: "delivery_provider_ids",
        name: "Đơn vị vận chuyển",
        value: text,
      });
    }

    if (initialValues.special_types.length) {
      let mappedSpecialTypes = specialOrderTypesArr?.filter((type) =>
        initialValues.special_types?.some((item: any) => item === type.value.toString()),
      );
      let text = getFilterString(mappedSpecialTypes, "title", undefined, undefined);
      list.push({
        key: "special_types",
        name: "Loại đơn hàng",
        value: text,
      });
    }
    if (initialValues.shipper_codes.length) {
      let mappedShippers = shippers?.filter((account) =>
        initialValues.shipper_codes?.some((single) => single === account.code.toString()),
      );
      let text = getFilterString(mappedShippers, "name", UrlConfig.ACCOUNTS, "code");
      list.push({
        key: "shipper_codes",
        name: "Đối tác giao hàng",
        value: text,
      });
    }
    if (initialValues.violation_types.length) {
      let mappedSpecialTypes = orderToBeProcessed?.filter((type) =>
        initialValues.violation_types?.some((item: any) => item === type.value.toString()),
      );
      let text = getFilterString(mappedSpecialTypes, "title", undefined, undefined);
      list.push({
        key: "violation_types",
        name: "Đơn cần xử lý",
        value: text,
      });
    }

    if (
      initialValues.channel_codes.length &&
      !isEqual(initialValues.channel_codes, initChannelCodes || orderType !== ORDER_TYPES.online)
    ) {
      let mappedChannels = listChannel?.filter((channel) =>
        initialValues.channel_codes?.some((single) => single === channel.code.toString()),
      );
      let text = getFilterString(mappedChannels, "name", undefined, undefined);
      list.push({
        key: "channel_codes",
        name: "Kênh bán hàng",
        value: text,
      });
    }

    if (initialValues.note) {
      list.push({
        key: "note",
        name: "Ghi chú nội bộ",
        value: <React.Fragment>{initialValues.note}</React.Fragment>,
      });
    }

    if (initialValues.customer_note) {
      list.push({
        key: "customer_note",
        name: "Ghi chú của khách",
        value: <React.Fragment>{initialValues.customer_note}</React.Fragment>,
      });
    }

    if (initialValues.tags.length) {
      let textStatus = "";
      for (let i = 0; i < initialValues.tags.length; i++) {
        if (i < initialValues.tags.length - 1) {
          textStatus = textStatus + initialValues.tags[i] + splitCharacter;
        } else {
          textStatus = textStatus + initialValues.tags[i];
        }
      }
      list.push({
        key: "tags",
        name: "Tags",
        value: <React.Fragment>{textStatus}</React.Fragment>,
      });
    }
    if (initialValues.marketing_campaign.length) {
      let textStatus = "";
      for (let i = 0; i < initialValues.marketing_campaign.length; i++) {
        if (i < initialValues.marketing_campaign.length - 1) {
          textStatus = textStatus + initialValues.marketing_campaign[i] + splitCharacter;
        } else {
          textStatus = textStatus + initialValues.marketing_campaign[i];
        }
      }
      list.push({
        key: "marketing_campaign",
        name: "Marketing Campaign",
        value: <React.Fragment>{textStatus}</React.Fragment>,
      });
    }

    if (initialValues.reference_code) {
      list.push({
        key: "reference_code",
        name: "Mã tham chiếu",
        value: <React.Fragment>{initialValues.reference_code}</React.Fragment>,
      });
    }

    if (initialValues.discount_codes && initialValues.discount_codes.length > 0) {
      list.push({
        key: "discount_codes",
        name: "Mã giảm giá",
        value: <React.Fragment>{initialValues.discount_codes}</React.Fragment>,
      });
    }

    /**
     * webApp
     */
    if (initialValues.utm_source && initialValues.utm_source.length !== 0) {
      list.push({
        key: "utm_source",
        name: "UTM_Source",
        value: <React.Fragment>{initialValues.utm_source}</React.Fragment>,
      });
    }

    if (initialValues.utm_medium && initialValues.utm_medium.length !== 0) {
      list.push({
        key: "utm_medium",
        name: "UTM_Medium",
        value: <React.Fragment>{initialValues.utm_medium}</React.Fragment>,
      });
    }
    if (initialValues.utm_content && initialValues.utm_content.length !== 0) {
      list.push({
        key: "utm_content",
        name: "UTM_content",
        value: <React.Fragment>{initialValues.utm_content}</React.Fragment>,
      });
    }
    if (initialValues.utm_term && initialValues.utm_term.length !== 0) {
      list.push({
        key: "utm_term",
        name: "UTM_term",
        value: <React.Fragment>{initialValues.utm_term}</React.Fragment>,
      });
    }
    if (initialValues.utm_id && initialValues.utm_id.length !== 0) {
      list.push({
        key: "utm_id",
        name: "UTM_id",
        value: <React.Fragment>{initialValues.utm_id}</React.Fragment>,
      });
    }
    if (initialValues.utm_campaign && initialValues.utm_campaign.length !== 0) {
      list.push({
        key: "utm_campaign",
        name: "UTM_campagin",
        value: <React.Fragment>{initialValues.utm_campaign}</React.Fragment>,
      });
    }
    if (initialValues.affiliate && initialValues.affiliate.length !== 0) {
      list.push({
        key: "affiliate",
        name: "Affiate code",
        value: <React.Fragment>{initialValues.affiliate}</React.Fragment>,
      });
    }

    if (initialValues?.in_goods_receipt === 0 || initialValues?.in_goods_receipt === 1) {
      let textRecord =
        initialValues?.in_goods_receipt === 1
          ? "Đã nằm trong biên bản"
          : initialValues?.in_goods_receipt === 0
          ? "Chưa nằm trong biên bản"
          : "";
      list.push({
        key: "in_goods_receipt",
        name: "Biên bản",
        value: <React.Fragment>{textRecord}</React.Fragment>,
      });
    }

    if (initialValues?.expired_at && Number(initialValues.expired_at) !== 0) {
      list.push({
        key: "expired_at",
        name: "Số phút chưa thanh toán ví điện tử",
        value: <>{initialValues.expired_at} phút</>,
      });
    }

    if (initialValues?.is_expired_payment && initialValues?.is_expired_payment === true) {
      list.push({
        key: "is_expired_payment",
        name: "thanh toán ví điện tử",
        value: <React.Fragment>Hết hạn</React.Fragment>,
      });
    }
    if (initialValues?.uniform && initialValues?.uniform === true) {
      list.push({
        key: "uniform",
        name: "Đơn đồng phục",
        value: <React.Fragment>Có</React.Fragment>,
      });
    }
    if (
      filterTagFormatted?.returned_store_ids?.data &&
      filterTagFormatted.returned_store_ids?.data?.length > 0
    ) {
      let mappedStores = listStore?.filter((store) =>
        filterTagFormatted.returned_store_ids.data?.some((single: number) => single === store.id),
      );
      let text = getFilterString(
        mappedStores,
        "name",
        UrlConfig.STORE,
        "id",
        "returned_store_ids",
        filterTagFormatted.returned_store_ids.isCanShorten,
        filterTagFormatted.returned_store_ids.isShorten,
      );
      list.push({
        key: "returned_store",
        name: "Kho nhận hàng hoàn",
        value: text,
      });
    }

    if (initialValues.types && initialValues.types.length !== 0) {
      const _orderTypes = ORDER_TYPES_ONLINE.filter((p) =>
        initialValues.types.some((p1) => p1 === p.code),
      );

      let textRecord = _orderTypes.map((p) => p.name).join(", ");
      list.push({
        key: "types",
        name: "Loại đơn bán",
        value: <React.Fragment>{textRecord}</React.Fragment>,
      });
    }
    return list;
  }, [
    filterTagFormatted,
    initialValues.issued_on_min,
    initialValues.issued_on_max,
    initialValues.finalized_on_min,
    initialValues.finalized_on_max,
    initialValues.last_coordinator_confirm_on_min,
    initialValues.last_coordinator_confirm_on_max,
    initialValues.completed_on_min,
    initialValues.completed_on_max,
    initialValues.cancelled_on_min,
    initialValues.cancelled_on_max,
    initialValues.expected_receive_on_min,
    initialValues.expected_receive_on_max,
    initialValues.returning_date_min,
    initialValues.returning_date_max,
    initialValues.returned_date_min,
    initialValues.returned_date_max,
    initialValues.exported_on_min,
    initialValues.exported_on_max,
    initialValues.order_status,
    initialValues.return_status,
    initialValues.sub_status_code,
    initialValues.fulfillment_status,
    initialValues.payment_status,
    initialValues.searched_product,
    initialValues.assignee_codes.length,
    initialValues.services.length,
    initialValues.account_codes.length,
    initialValues.coordinator_codes.length,
    initialValues.order_carer_codes.length,
    initialValues.marketer_codes.length,
    initialValues.price_min,
    initialValues.price_max,
    initialValues.payment_method_ids,
    initialValues.delivery_types,
    initialValues.delivery_provider_ids,
    initialValues.special_types,
    initialValues.shipper_codes,
    initialValues.violation_types,
    initialValues.channel_codes,
    initialValues.note,
    initialValues.customer_note,
    initialValues.tags,
    initialValues.marketing_campaign,
    initialValues.reference_code,
    initialValues.discount_codes,
    initialValues.utm_source,
    initialValues.utm_medium,
    initialValues.utm_content,
    initialValues.utm_term,
    initialValues.utm_id,
    initialValues.utm_campaign,
    initialValues.affiliate,
    initialValues?.in_goods_receipt,
    initialValues.expired_at,
    initialValues?.is_expired_payment,
    initialValues?.uniform,
    initialValues.types,
    initChannelCodes,
    orderType,
    listStore,
    listSources,
    dateFormat,
    status,
    subStatus,
    fulfillmentStatus,
    paymentStatus,
    assigneeFound,
    services,
    serviceListVariables,
    accountFound,
    coordinatorFound,
    orderCarerFound,
    marketerFound,
    listPaymentMethod,
    serviceType,
    deliveryService,
    specialOrderTypesArr,
    shippers,
    orderToBeProcessed,
    listChannel,
  ]);

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 1000;
    } else {
      return 800;
    }
  };

  const handleSelectServices = useCallback(
    (service) => {
      let cloneServices = [...services];

      switch (service) {
        case serviceVariables.deliver4h:
          const index1 = cloneServices.indexOf(serviceVariables.deliver4h);
          if (index1 > -1) {
            cloneServices.splice(index1, 1);
          } else {
            cloneServices.push(serviceVariables.deliver4h);
          }
          break;
        case serviceVariables.deliverStandard:
          const index2 = cloneServices.indexOf(serviceVariables.deliverStandard);
          if (index2 > -1) {
            cloneServices.splice(index2, 1);
          } else {
            cloneServices.push(serviceVariables.deliverStandard);
          }
          break;

        default:
          break;
      }
      setServices(cloneServices);
    },
    [serviceVariables.deliver4h, serviceVariables.deliverStandard, services],
  );

  const handleExpiresPayment = useCallback(() => {
    const isExpires = isExpiresPayment === true ? undefined : true;
    setIsExpiresPayment(isExpires);
  }, [isExpiresPayment]);

  const handleUniform = useCallback(() => {
    const isUniformCheck = isUniform === true ? undefined : true;
    console.log("isExpires", isUniformCheck);
    setIsUniform(isUniformCheck);
  }, [isUniform]);

  const handleClearFilterConfig = () => {
    setTagActive(undefined);
    // formRef.current?.resetFields(initialValues)
    let fields = formRef.current?.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formRef.current?.setFieldsValue(fields);
  };

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setIssuedClick("");
    setCompletedClick("");
    setCancelledClick("");
    setExpectedClick("");
    setFinalizedClick("");

    setVisible(false);
    setRerender(false);

    handleClearFilterConfig();
  };

  const renderTabHeader = () => {
    if (orderType === ORDER_TYPES.offline) {
      return null;
    }
    if (!isHideTab) {
      return (
        <div className="order-options">
          <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={initialValues.is_online}>
            <Radio.Button value={null}>Tất cả đơn hàng</Radio.Button>
            <Radio.Button value="true">Đơn hàng online</Radio.Button>
            <Radio.Button value="false">Đơn hàng offline</Radio.Button>
          </Radio.Group>
        </div>
      );
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", () => setVisible(false));
  }, []);

  useEffect(() => {
    if (params.assignee_codes && params.assignee_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.assignee_codes,
      }).then((response) => {
        setAssigneeFound(response.data.items);
      });
    }
    if (params.account_codes && params.account_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.account_codes,
      }).then((response) => {
        setAccountFound(response.data.items);
      });
    }
    if (params.marketer_codes && params.marketer_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.marketer_codes,
      }).then((response) => {
        setMarketerFound(response.data.items);
      });
    }
    if (params.coordinator_codes && params.coordinator_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.coordinator_codes,
      }).then((response) => {
        setCoordinatorFound(response.data.items);
      });
    }
    if (params.order_carer_codes && params.order_carer_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.order_carer_codes,
      }).then((response) => {
        setOrderCarerFound(response.data.items);
      });
    }
  }, [
    params.assignee_codes,
    params.account_codes,
    params.marketer_codes,
    params.coordinator_codes,
    params.order_carer_codes,
  ]);

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      ...initialValues,
      search_term: params.search_term,
      variant_ids: params.variant_ids,
      tracking_codes: params.tracking_codes,
      sub_status_code: params.sub_status_code,
      search_product: params?.searched_product,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.searched_product,
    params.search_term,
    params.sub_status_code,
    params.tracking_codes,
    params.variant_ids,
    initialValues,
  ]);

  useEffect(() => {
    initialValueExchange = { ...params };
    if (params?.searched_product) {
      setKeySearchVariant(params?.searched_product);
    } else {
      setKeySearchVariant("");
    }
  }, [params]);

  useEffect(() => {
    if (accounts) {
      setAccountData(accounts);
    }
  }, [accounts]);

  useEffect(() => {
    setServices(initialValues.services);
    if (!channels || channels?.length === 0) {
      dispatch(getListChannelRequest(setListChannel));
    } else {
      setListChannel(channels);
    }
  }, [channels, dispatch, initialValues.services]);

  useEffect(() => {
    setIsExpiresPayment(initialValues.is_expired_payment);
  }, [initialValues.is_expired_payment]);
  useEffect(() => {
    setIsUniform(initialValues.uniform);
  }, [initialValues.uniform]);

  const renderFilterTag = (filter: ListFilterTagTypes) => {
    if (filter.isExpand) {
      return;
    }
    return <React.Fragment>{filter.value}</React.Fragment>;
  };

  const onMenuDeleteConfigFilter = () => {
    handleDeleteFilter(configId);
    setIsShowConfirmDelete(false);
  };

  const handleSelectProduct = useCallback(
    (v?: VariantResponse) => {
      if (v) {
        onFilter && onFilter({ ...initialValueExchange, searched_product: v.sku });
      }
    },
    [onFilter],
  );

  return (
    <StyledComponent>
      {renderTabHeader()}
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <div style={{ width: "100%" }}>
              <Row gutter={12}>
                <Col span={orderType === ORDER_TYPES.offline ? 12 : 7}>
                  <Item name="search_term" className="input-search">
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="ID đơn hàng, tên, sđt khách hàng"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                      onPressEnter={(e) => {
                        let element: any = document.getElementById("search_term");
                        element?.focus();
                        element?.select();
                      }}
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.offline ? null : (
                  <Col span={6}>
                    <Item name="sub_status_code" style={{ marginRight: 0 }}>
                      <CustomSelectWithButtonCheckAll
                        mode="multiple"
                        showArrow
                        allowClear
                        showSearch
                        placeholder="Trạng thái xử lý đơn"
                        notFoundContent="Không tìm thấy kết quả"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        onChangeAllSelect={(e: CheckboxChangeEvent) => {
                          if (e.target.checked) {
                            formSearchRef.current?.setFieldsValue({
                              sub_status_code: selectedSubStatusCodes,
                            });
                          } else {
                            formSearchRef.current?.setFieldsValue({
                              sub_status_code: undefined,
                            });
                          }
                        }}
                        getCurrentValue={() => {
                          return formSearchRef.current?.getFieldValue("sub_status_code");
                        }}
                        allValues={subStatus}
                        autoClearSearchValue={false}
                      >
                        {subStatus?.map((item: any) => (
                          <CustomSelect.Option key={item.id} value={item.code.toString()}>
                            {item.sub_status}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelectWithButtonCheckAll>
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.offline ? null : (
                  <Col span={5}>
                    <Item name="tracking_codes" className="input-search">
                      <Input
                        prefix={<img src={search} alt="" />}
                        placeholder="Mã vận đơn"
                        onBlur={(e) => {
                          formSearchRef?.current?.setFieldsValue({
                            tracking_codes: e.target.value.trim(),
                          });
                        }}
                        onPressEnter={(e) => {
                          let element: any = document.getElementById("tracking_codes");
                          element?.focus();
                          element?.select();
                        }}
                      />
                    </Item>
                  </Col>
                )}
                <Col span={orderType === ORDER_TYPES.offline ? 12 : 6}>
                  <SearchProductComponent
                    keySearch={keySearchVariant}
                    setKeySearch={setKeySearchVariant}
                    id="search_product"
                    onSelect={handleSelectProduct}
                  />
                </Col>
              </Row>
            </div>
            <div className="buttonGroup">
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
              <Button icon={<SettingOutlined />} onClick={onShowColumnSetting} />
            </div>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          allowSave
          onSaveFilter={onShowSaveFilter}
          width={widthScreen()}
        >
          {rerender && (
            <Form onFinish={onFinish} ref={formRef} initialValues={initialValues} layout="vertical">
              {filterConfigs && filterConfigs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {filterConfigs?.map((e, index) => {
                    return (
                      <UserCustomFilterTag
                        key={index}
                        tagId={e.id}
                        name={e.name}
                        onSelectFilterConfig={(tagId) => {
                          onSelectFilterConfig(tagId);
                        }}
                        setConfigId={setConfigId}
                        setIsShowConfirmDelete={setIsShowConfirmDelete}
                        tagActive={tagActive}
                      />
                    );
                  })}
                </div>
              )}
              <Row gutter={20}>
                <Col span={8} xxl={8}>
                  <Item name="store_ids" label="Kho cửa hàng">
                    <CustomTreeSelect
                      placeholder="Cửa hàng"
                      storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                      style={{ width: "100%" }}
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="source_ids" label="Nguồn đơn hàng">
                    <CustomTreeSelect
                      placeholder="Nguồn đơn hàng"
                      storeByDepartmentList={listSource as unknown as StoreByDepartment[]}
                      style={{ width: "100%" }}
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <div className="ant-form-item-label">
                    <label>Ngày tạo đơn</label>
                  </div>
                  <CustomFilterDatePicker
                    fieldNameFrom="issued_on_min"
                    fieldNameTo="issued_on_max"
                    activeButton={issuedClick}
                    setActiveButton={setIssuedClick}
                    format={dateFormat}
                    formRef={formRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="payment_status" label="Thanh toán">
                    <CustomSelect
                      mode="multiple"
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Chọn trạng thái thanh toán"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
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
                <Col span={8} xxl={8}>
                  <Item name="return_status" label="Trả hàng">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      allowClear
                      showArrow
                      placeholder="Chọn trạng thái trả hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    >
                      <CustomSelect.Option style={{ width: "100%" }} key="1" value="returned">
                        Có đổi trả hàng
                      </CustomSelect.Option>
                      <CustomSelect.Option style={{ width: "100%" }} key="2" value="unreturned">
                        Không đổi trả hàng
                      </CustomSelect.Option>
                    </CustomSelect>
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày duyệt đơn</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="finalized_on_min"
                      fieldNameTo="finalized_on_max"
                      activeButton={finalizedClick}
                      setActiveButton={setFinalizedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày xác nhận</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="last_coordinator_confirm_on_min"
                      fieldNameTo="last_coordinator_confirm_on_max"
                      activeButton={finalizedClick}
                      setActiveButton={setFinalizedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="payment_method_ids" label="Phương thức thanh toán">
                    <CustomSelect
                      mode="multiple"
                      optionFilterProp="children"
                      showSearch
                      showArrow
                      allowClear
                      notFoundContent="Không tìm thấy kết quả"
                      placeholder="Chọn phương thức thanh toán"
                      style={{ width: "100%" }}
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
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
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="account_codes" label="Nhân viên tạo đơn">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày huỷ đơn</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="cancelled_on_min"
                      fieldNameTo="cancelled_on_max"
                      activeButton={cancelledClick}
                      setActiveButton={setCancelledClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="marketer_codes" label="Nhân viên marketing">
                      <AccountCustomSearchSelect
                        placeholder="Tìm theo họ tên hoặc mã nhân viên"
                        dataToSelect={accountData}
                        setDataToSelect={setAccountData}
                        initDataToSelect={accounts}
                        mode="multiple"
                        getPopupContainer={(trigger: any) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                      />
                    </Item>
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="assignee_codes" label="Nhân viên bán hàng">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày thành công</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="completed_on_min"
                      fieldNameTo="completed_on_max"
                      activeButton={completedClick}
                      setActiveButton={setCompletedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="delivery_types" label="Hình thức vận chuyển">
                      <CustomSelect
                        mode="multiple"
                        allowClear
                        optionFilterProp="children"
                        showSearch
                        showArrow
                        notFoundContent="Không tìm thấy kết quả"
                        placeholder="Chọn hình thức vận chuyển"
                        style={{ width: "100%" }}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                      >
                        {serviceType?.map((item) => (
                          <CustomSelect.Option key={item.value} value={item.value}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="coordinator_codes" label="Nhân viên điều phối">
                      <AccountCustomSearchSelect
                        placeholder="Tìm theo họ tên hoặc mã nhân viên"
                        dataToSelect={accountData}
                        setDataToSelect={setAccountData}
                        initDataToSelect={accounts}
                        mode="multiple"
                        getPopupContainer={(trigger: any) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                      />
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày xuất kho</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="exported_on_min"
                      fieldNameTo="exported_on_max"
                      activeButton={exportedClick}
                      setActiveButton={setExportedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="note" label="Ghi chú nội bộ">
                    <Input.TextArea
                      style={{ width: "100%" }}
                      placeholder="Tìm kiếm theo nội dung ghi chú nội bộ"
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="customer_note" label="Ghi chú của khách">
                    <Input.TextArea
                      style={{ width: "100%" }}
                      placeholder="Tìm kiếm theo nội dung ghi chú của khách"
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày dự kiến nhận hàng</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="expected_receive_on_min"
                      fieldNameTo="expected_receive_on_max"
                      activeButton={expectedClick}
                      setActiveButton={setExpectedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày đang hoàn</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="returning_date_min"
                      fieldNameTo="returning_date_max"
                      activeButton={expectedClick}
                      setActiveButton={setExpectedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <div className="ant-form-item-label">
                      <label>Ngày đã hoàn</label>
                    </div>
                    <CustomFilterDatePicker
                      fieldNameFrom="returned_date_min"
                      fieldNameTo="returned_date_max"
                      activeButton={expectedClick}
                      setActiveButton={setExpectedClick}
                      format={dateFormat}
                      formRef={formRef}
                      showTime={{ format: timeFormat }}
                    />
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="fulfillment_status" label="Trạng thái giao hàng">
                      <CustomSelect
                        mode="multiple"
                        showSearch
                        allowClear
                        showArrow
                        placeholder="Chọn trạng thái giao hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
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
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="delivery_provider_ids" label="Đơn vị vận chuyển">
                      <CustomSelect
                        mode="multiple"
                        showSearch
                        allowClear
                        showArrow
                        placeholder="Chọn đơn vị vận chuyển"
                        notFoundContent="Không tìm thấy kết quả"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                      >
                        {deliveryService?.map((item) => (
                          <CustomSelect.Option key={item.id} value={item.id.toString()}>
                            {item.name}
                          </CustomSelect.Option>
                        ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="tags" label="Tags">
                    <CustomSelect
                      mode="tags"
                      optionFilterProp="children"
                      showSearch
                      showArrow
                      allowClear
                      placeholder="Điền 1 hoặc nhiều tag"
                      style={{ width: "100%" }}
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="shipper_codes" label="Đối tác giao hàng">
                      <CustomSelect
                        mode="multiple"
                        showSearch
                        allowClear
                        showArrow
                        placeholder="Chọn đối tác giao hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                      >
                        {shippers &&
                          shippers.map((shipper) => (
                            <CustomSelect.Option key={shipper.code} value={shipper.code}>
                              {shipper.code} - {shipper.name}
                            </CustomSelect.Option>
                          ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="reference_code" label="Mã tham chiếu">
                    <Input placeholder="Tìm kiếm theo mã tham chiếu" />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <div className="ant-form-item-label">
                    <label>Tổng tiền</label>
                  </div>
                  <div className="date-range" style={{ display: "flex", alignItems: "center" }}>
                    <Item name="price_min" style={{ width: "45%", marginBottom: 0 }}>
                      <InputNumber
                        className="price_min"
                        formatter={(value) => {
                          return formatCurrency(value || 0);
                        }}
                        parser={(value: string | undefined) => replaceFormat(value || "")}
                        min={0}
                        max={1000000000}
                        placeholder="Từ"
                        style={{ width: "100%" }}
                      />
                    </Item>

                    <div className="swap-right-icon" style={{ width: "10%", textAlign: "center" }}>
                      <SwapRightOutlined />
                    </div>
                    <Item name="price_max" style={{ width: "45%", marginBottom: 0 }}>
                      <InputNumber
                        className="site-input-right price_max"
                        formatter={(value) => {
                          return formatCurrency(value || 0);
                        }}
                        parser={(value: string | undefined) => replaceFormat(value || "")}
                        placeholder="Đến"
                        min={0}
                        max={1000000000}
                        style={{ width: "100%" }}
                      />
                    </Item>
                  </div>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item label="Đơn tự giao hàng">
                      <div className="button-option-1">
                        {serviceListVariables.map((single) => (
                          <Button
                            key={single.value}
                            onClick={() => handleSelectServices(single.value)}
                            className={services.includes(single.value) ? "active" : "deactive"}
                          >
                            {single.title}
                          </Button>
                        ))}
                      </div>
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="channel_codes" label="Kênh bán hàng">
                      <CustomSelect
                        mode="multiple"
                        showSearch
                        allowClear
                        showArrow
                        placeholder="Chọn kênh bán hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        getPopupContainer={(trigger) => trigger.parentNode}
                        maxTagCount="responsive"
                        autoClearSearchValue={false}
                        filterOption={(input, option) => {
                          return fullTextSearch(input, option?.children.join(""));
                        }}
                      >
                        {listChannel &&
                          listChannel.map((channel) => (
                            <CustomSelect.Option key={channel.code} value={channel.code}>
                              {channel.code} - {channel.name}
                            </CustomSelect.Option>
                          ))}
                      </CustomSelect>
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="marketing_campaign" label="Marketing Campaign">
                      <CustomSelect
                        mode="tags"
                        optionFilterProp="children"
                        showSearch
                        showArrow
                        allowClear
                        placeholder="Điền 1 hoặc nhiều tag"
                        style={{ width: "100%" }}
                      />
                    </Item>
                  </Col>
                )}
                <Col span={8} xxl={8}>
                  <Item name="discount_codes" label="Mã giảm giá">
                    <Input
                      placeholder="Nhập mã giảm giá (VD : YODY20K,YODY30K)"
                      style={{ width: "100%" }}
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="expired_at" label="Số phút chưa thanh toán ví điện tử:">
                    <InputNumber
                      placeholder="Nhập số phút chưa thanh toán"
                      style={{ width: "100%" }}
                      min={0}
                      formatter={(value) => {
                        return Math.round(Number(value || 0)).toLocaleString();
                      }}
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item label="Đơn hàng hết hạn thanh toán ví điện tử:">
                    <div className="button-option-3">
                      <Button
                        onClick={() => handleExpiresPayment()}
                        className={isExpiresPayment === true ? "active" : "deactive"}
                      >
                        Hết hạn thanh toán
                      </Button>
                    </div>
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="in_goods_receipt" label="Biên bản:">
                    <Select
                      placeholder="Tìm kiếm đơn có hoặc chưa trong biên bản"
                      style={{ width: "100%" }}
                      allowClear
                    >
                      <Select.Option key={1} value={1}>
                        Đã nằm trong biên bản
                      </Select.Option>
                      <Select.Option key={0} value={0}>
                        Chưa nằm trong biên bản
                      </Select.Option>
                    </Select>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item label="Đơn đồng phục:">
                    <div className="button-option-3">
                      <Button
                        onClick={() => handleUniform()}
                        className={isUniform === true ? "active" : "deactive"}
                      >
                        Đơn đồng phục
                      </Button>
                    </div>
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="returned_store_ids" label="Kho nhận hàng hoàn:">
                    <CustomTreeSelect
                      placeholder="Kho nhận hàng hoàn"
                      storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                      style={{ width: "100%" }}
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                <Col
                  span={8}
                  xxl={8}
                  hidden={orderType !== ORDER_TYPES.online || !allowOrderB2BRead}
                >
                  <Item name="types" label="Loại đơn bán:">
                    <Select
                      placeholder="Loại đơn bán (Bán buôn/ bán lẻ)"
                      style={{ width: "100%" }}
                      allowClear
                      mode="multiple"
                    >
                      {ORDER_TYPES_ONLINE.map((p, index) => (
                        <Select.Option key={index} value={p.code}>
                          {p.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="special_types" label="Loại đơn hàng">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      allowClear
                      showArrow
                      placeholder="Loại đơn hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    >
                      {specialOrderTypesArr &&
                        specialOrderTypesArr.map((p, index) => (
                          <CustomSelect.Option key={index} value={p.value}>
                            {p.title}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="order_carer_codes" label="Nhân viên CSĐH">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8} hidden={orderType !== ORDER_TYPES.online}>
                  <Item name="violation_types" label="Đơn cần xử lý">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      allowClear
                      showArrow
                      placeholder="Đơn cần xử lý"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      autoClearSearchValue={false}
                    >
                      {orderToBeProcessed.map((p, index) => (
                        <CustomSelect.Option key={index} value={p.value}>
                          {p.title}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
              {orderType === ORDER_TYPES.online && (
                <React.Fragment>
                  <Row
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <Switch
                      size="small"
                      onChange={(value) => {
                        setVisibleUTM(value);
                      }}
                      checked={visibleUTM}
                    />
                    <span style={{ paddingLeft: "10px", fontWeight: 500 }}>Đơn hàng Web/App</span>
                  </Row>
                  {visibleUTM && (
                    <React.Fragment>
                      <Row gutter={20}>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_Source" name="utm_source">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_Medium" name="utm_medium">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_content" name="utm_content">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_term" name="utm_term">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_id" name="utm_id">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="UTM_campagin" name="utm_campaign">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                        <Col span={8} xxl={8}>
                          <Item label="Affiate code" name="affiliate">
                            <Input placeholder="..." style={{ width: "100%" }} />
                          </Item>
                        </Col>
                      </Row>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </Form>
          )}
        </BaseFilter>

        <FilterConfigModal
          setVisible={setIsShowModalSaveFilter}
          visible={isShowModalSaveFilter}
          onOk={(formValues) => {
            setIsShowModalSaveFilter(false);
            onSaveFilter(formValues);
          }}
          filterConfigs={filterConfigs}
        />
        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={onMenuDeleteConfigFilter}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={
            <span>
              Bạn có chắc muốn xóa bộ lọc{" "}
              <strong>
                "{userConfigs.find((single) => single.id === configId)?.name || null}"
              </strong>
            </span>
          }
        />
      </div>
      {filters && filters.length > 0 && (
        <div className="order-filter-tags">
          {filters.map((filter, index) => {
            return (
              <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                <span className="tagLabel 3">{filter.name}:</span>
                {renderFilterTag(filter)}
              </Tag>
            );
          })}
        </div>
      )}
    </StyledComponent>
  );
}

export default OrdersFilter;
