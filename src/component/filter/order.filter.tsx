import {
  ArrowLeftOutlined,
  FilterOutlined,
  SettingOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, InputNumber, Radio, Row, Tag } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import search from "assets/img/search.svg";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import CustomSelectWithButtonCheckAll from "component/custom/select-with-button-check-all.custom";
import CustomSelect from "component/custom/select.custom";
import { StyledComponent } from "component/filter/order.filter.styles";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import TreeStore from "component/tree-node/tree-store";
import UrlConfig from "config/url.config";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { AccountResponse, DeliverPartnerResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { OrderSearchQuery } from "model/order/order.model";
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
import { searchAccountApi } from "service/accounts/account.service";
import { getSourcesWithParamsService } from "service/order/order.service";
import { getVariantApi, searchVariantsApi } from "service/product/product.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { POS } from "utils/Constants";
import BaseFilter from "./base.filter";
import DebounceSelect from "./component/debounce-select";
import { fullTextSearch } from "utils/StringUtils";

type PropTypes = {
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

async function searchVariants(input: any) {
  try {
    const result = await searchVariantsApi({ info: input });
    return result.data.items.map((item) => {
      return {
        label: item.name,
        value: item.id.toString(),
      };
    });
  } catch (error) {
    console.log(error);
  }
}

function OrdersFilter(props: PropTypes): JSX.Element {
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
    setListSource,
    setListOrderProcessingStatus,
  } = props;
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [rerenderSearchVariant, setRerenderSearchVariant] = useState(false);
  const loadingFilter = useMemo(() => {
    return isLoading ? true : false;
  }, [isLoading]);

  const dateFormat = "DD-MM-YYYY";

  const [selectedOrderSourceId, setSelectedOrderSourceIds] = useState<string[]>([])
  const [selectedSubStatusCodes, setSelectedSubStatusCodes] = useState<string[]>([])
  const [showedStatusCodes, setShowStatusCodes] = useState<string[]>([])

const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);

const status = bootstrapReducer.data?.order_main_status.filter(
  (single) => single.value !== "splitted"
);

  useEffect(() => {
    setSelectedSubStatusCodes(initSubStatus?.map(single => single.code) || []);
  }, [initSubStatus])

  // useEffect(() => {
  //   setShowStatusCodes(status?.map(single => single.value) || []);
  // }, [status])
  
  const fulfillmentStatus = useMemo(
    () => [
      { name: "Chưa giao", value: "unshipped" },
      // {name: "Đã lấy hàng", value: "picked"},
      // {name: "Giao một phần", value: "partial"},
      // {name: "Đã đóng gói", value: "packed"},
      { name: "Đang giao", value: "shipping" },
      { name: "Đã giao", value: "shipped" },
      // {name: "Đã hủy", value: "cancelled"},
      // {name: "Đang trả lại", value: "returning"},
      // {name: "Đã trả lại", value: "returned"}
    ],
    []
  );
  const paymentStatus = useMemo(
    () => [
      { name: "Chưa trả", value: "unpaid" },
      { name: "Đã trả", value: "paid" },
      { name: "Đã trả một phần", value: "partial_paid" },
      { name: "Đang hoàn lại", value: "refunding" },
    ],
    []
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
    []
  );

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

  const dispatch = useDispatch();
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const [optionsVariant, setOptionsVariant] = useState<{ label: string; value: string }[]>([]);

  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>([]);
  const [accountFound, setAccountFound] = useState<Array<AccountResponse>>([]);
  const [marketerFound, setMarketerFound] = useState<Array<AccountResponse>>([]);
  const [coordinatorFound, setCoordinatorFound] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    if (params.assignee_codes && params.assignee_codes?.length > 0) {
      searchAccountApi({
        codes: params.assignee_codes,
      }).then((response) => {
        setAssigneeFound(response.data.items);
      });
    }
    if (params.created_by && params.created_by?.length > 0) {
      searchAccountApi({
        codes: params.created_by,
      }).then((response) => {
        setAccountFound(response.data.items);
      });
    }
    if (params.marketer_codes && params.marketer_codes?.length > 0) {
      searchAccountApi({
        codes: params.marketer_codes,
      }).then((response) => {
        setMarketerFound(response.data.items);
      });
    }
    if (params.coordinator_codes && params.coordinator_codes?.length > 0) {
      searchAccountApi({
        codes: params.coordinator_codes,
      }).then((response) => {
        setCoordinatorFound(response.data.items);
      });
    }
  }, [
    params.assignee_codes,
    params.created_by,
    params.marketer_codes,
    params.coordinator_codes,
  ]);

  const onChangeOrderOptions = useCallback(
    (e) => {
      onFilter && onFilter({ ...params, is_online: e.target.value });
    },
    [onFilter, params]
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
    [onMenuClick]
  );

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
          onFilter && onFilter({ ...params, finalized_on_min: null, finalized_on_max: null });
          break;
        case "completed":
          setCompletedClick("");
          onFilter && onFilter({ ...params, completed_on_min: null, completed_on_max: null });
          break;
        case "cancelled":
          setCancelledClick("");
          onFilter && onFilter({ ...params, cancelled_on_min: null, cancelled_on_max: null });
          break;
        case "expected":
          setExpectedClick("");
          onFilter &&
            onFilter({ ...params, expected_receive_on_min: null, expected_receive_on_max: null });
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
        case "created_by":
          onFilter && onFilter({ ...params, created_by: [] });
          break;
        case "coordinator_codes":
          onFilter && onFilter({ ...params, coordinator_codes: [] });
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
        case "payment_method":
          onFilter && onFilter({ ...params, payment_method_ids: [] });
          break;
        case "expected_receive_predefined":
          onFilter && onFilter({ ...params, expected_receive_predefined: "" });
          break;
        case "delivery_types":
          onFilter && onFilter({ ...params, delivery_types: [] });
          break;
        case "delivery_provider_ids":
          onFilter && onFilter({ ...params, delivery_provider_ids: [] });
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
        default:
          break;
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  const [issuedClick, setIssuedClick] = useState("");
  const [finalizedClick, setFinalizedClick] = useState("");
  const [completedClick, setCompletedClick] = useState("");
  const [cancelledClick, setCancelledClick] = useState("");
  const [expectedClick, setExpectedClick] = useState("");

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.id !== POS.source_id);
  }, [listSource]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
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
      shipper_codes: Array.isArray(params.shipper_codes)
        ? params.shipper_codes
        : [params.shipper_codes],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      variant_ids: Array.isArray(params.variant_ids) ? params.variant_ids : [params.variant_ids],
      assignee_codes: Array.isArray(params.assignee_codes)
        ? params.assignee_codes
        : [params.assignee_codes],
      created_by: Array.isArray(params.created_by)
        ? params.created_by
        : [params.created_by],
      channel_codes: Array.isArray(params.channel_codes)
        ? params.channel_codes
        : [params.channel_codes],
      coordinator_codes: Array.isArray(params.coordinator_codes)
        ? params.coordinator_codes
        : [params.coordinator_codes],
      marketer_codes: Array.isArray(params.marketer_codes)
        ? params.marketer_codes
        : [params.marketer_codes],
      delivery_types: Array.isArray(params.delivery_types)
        ? params.delivery_types
        : [params.delivery_types],
      services: Array.isArray(params.services) ? params.services : [params.services],
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
			created_by: {
        data: initialValues.created_by,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.created_by.length > numberTagShorten,
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
			marketer_codes: {
        data: initialValues.marketer_codes,
        isShorten: isShortenFilterTag,
        isCanShorten: initialValues.marketer_codes.length > numberTagShorten,
      },
    });
  }, [initialValues]);

  const [services, setServices] = useState<any[]>([]);
  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current
        ?.getFieldsError([
          "issued_on_min",
          "issued_on_max",
          "finalized_on_min",
          "finalized_on_max",
          "completed_on_min",
          "completed_on_max",
          "cancelled_on_min",
          "cancelled_on_max",
          "expected_receive_on_min",
          "expected_receive_on_max",
        ])
        .forEach((field) => {
          if (field.errors.length) {
            error = true;
          }
        });
      if (!error) {
        setVisible(false);
        values.services = services;
        if (values.price_min && values.price_max && values?.price_min > values?.price_max) {
          values = {
            ...values,
            price_min: values?.price_max,
            price_max: values?.price_min,
          };
        }
        onFilter && onFilter(values);
        setRerender(false);
      }
    },
    [formRef, onFilter, services]
  );

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
      countHidden: number = 0
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
            }}>
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
              }}>
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
      _isShortenText?: boolean
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
      } else if (type === "created_by") {
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
        filterTagFormatted.store_ids.data?.some(
          (single: string) => single.toString() === store.id.toString()
        )
      );
      let text = getFilterString(
        mappedStores,
        "name",
        UrlConfig.STORE,
        "id",
        "store_ids",
        filterTagFormatted.store_ids.isCanShorten,
        filterTagFormatted.store_ids.isShorten
      );
      list.push({
        key: "store",
        name: "Cửa hàng",
        value: text,
      });
    }
    if (filterTagFormatted?.source_ids?.data && filterTagFormatted.source_ids?.data?.length) {
      let mappedSources = listSources?.filter((source) =>
        filterTagFormatted.source_ids.data?.some(
          (single: string) => single === source.id.toString()
        )
      );
      let text = getFilterString(
        mappedSources,
        "name",
        undefined,
        undefined,
        "source_ids",
        filterTagFormatted.source_ids.isCanShorten,
        filterTagFormatted.source_ids.isShorten
      );
      list.push({
        key: "source",
        name: "Nguồn",
        value: text,
      });
    }

    if (initialValues.issued_on_min || initialValues.issued_on_max) {
      let textOrderCreateDate =
        (initialValues.issued_on_min ? initialValues.issued_on_min : "??") +
        " ~ " +
        (initialValues.issued_on_max ? initialValues.issued_on_max : "??");
      list.push({
        key: "issued",
        name: "Ngày tạo đơn",
        value: <React.Fragment>{textOrderCreateDate}</React.Fragment>,
      });
    }

    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      let textOrderFinalizedDate =
        (initialValues.finalized_on_min ? initialValues.finalized_on_min : "??") +
        " ~ " +
        (initialValues.finalized_on_max ? initialValues.finalized_on_max : "??");
      list.push({
        key: "finalized",
        name: "Ngày duyệt đơn",
        value: <React.Fragment>{textOrderFinalizedDate}</React.Fragment>,
      });
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate =
        (initialValues.completed_on_min ? initialValues.completed_on_min : "??") +
        " ~ " +
        (initialValues.completed_on_max ? initialValues.completed_on_max : "??");
      list.push({
        key: "completed",
        name: "Ngày hoàn tất đơn",
        value: <React.Fragment>{textOrderCompleteDate}</React.Fragment>,
      });
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate =
        (initialValues.cancelled_on_min ? initialValues.cancelled_on_min : "??") +
        " ~ " +
        (initialValues.cancelled_on_max ? initialValues.cancelled_on_max : "??");
      list.push({
        key: "cancelled",
        name: "Ngày huỷ đơn",
        value: <React.Fragment>{textOrderCancelDate}</React.Fragment>,
      });
    }

    if (initialValues.expected_receive_on_min || initialValues.expected_receive_on_max) {
      let textExpectReceiveDate =
        (initialValues.expected_receive_on_min ? initialValues.expected_receive_on_min : "??") +
        " ~ " +
        (initialValues.expected_receive_on_max ? initialValues.expected_receive_on_max : "??");
      list.push({
        key: "expected",
        name: "Ngày dự kiến nhận hàng",
        value: <React.Fragment>{textExpectReceiveDate}</React.Fragment>,
      });
    }
    if (initialValues.order_status.length) {
      let orderStatuses = status?.filter((status) =>
        initialValues.order_status?.some((item) => item === status.value.toString())
      );
			let text = getFilterString(
				orderStatuses,
				"name",
				undefined,
				undefined,
				"order_status",
				filterTagFormatted.order_status.isCanShorten,
				filterTagFormatted.order_status.isShorten
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
        initialValues.return_status?.some((item) => item === status.value.toString())
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
        initialValues.sub_status_code?.some((item) => item === status.code.toString())
      );
			let text = getFilterString(
        mappedSubStatuses,
        "sub_status",
        undefined,
				undefined,
        "sub_status_code",
        filterTagFormatted.sub_status_code.isCanShorten,
        filterTagFormatted.sub_status_code.isShorten
      );
      list.push({
        key: "sub_status_code",
        name: "Trạng thái xử lý đơn",
        value: text,
      });
    }
    if (initialValues.fulfillment_status.length) {
      let mappedFulfillmentStatus = fulfillmentStatus?.filter((status) =>
        initialValues.fulfillment_status?.some((item) => item === status.value.toString())
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
        initialValues.payment_status?.some((item) => item === status.value.toString())
      );
      let text = getFilterString(mappedPaymentStatuses, "name", undefined, undefined);
      list.push({
        key: "payment_status",
        name: "Trạng thái thanh toán",
        value: text,
      });
    }
    if (initialValues.variant_ids.length) {
      let textVariant = "";
      for (let i = 0; i < optionsVariant.length; i++) {
        if (i < optionsVariant.length - 1) {
          textVariant = textVariant + optionsVariant[i].label + splitCharacter;
        } else {
          textVariant = textVariant + optionsVariant[i].label;
        }
      }
      list.push({
        key: "variant_ids",
        name: "Sản phẩm",
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
        filterTagFormatted.assignee_codes.isShorten
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

    if (initialValues.created_by.length) {
      let text = getFilterString(
        accountFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "created_by",
				filterTagFormatted.created_by.isCanShorten,
        filterTagFormatted.created_by.isShorten
      );
      list.push({
        key: "created_by",
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
        filterTagFormatted.coordinator_codes.isShorten
      );
      list.push({
        key: "coordinator_codes",
        name: "Nhân viên điều phối",
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
        filterTagFormatted.marketer_codes.isShorten
      );
      list.push({
        key: "marketer_codes",
        name: "Nhân viên marketing",
        value: text,
      });
    }

    if (initialValues.price_min || initialValues.price_max) {
      let textPrice =
        (initialValues.price_min
          ? `${initialValues.price_min} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : " 0 ") +
        " ~ " +
        (initialValues.price_max
          ? `${initialValues.price_max} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : " ?? ");
      list.push({
        key: "price",
        name: "Tổng tiền",
        value: <React.Fragment>{textPrice}</React.Fragment>,
      });
    }

    if (initialValues.payment_method_ids.length) {
      let mappedPaymentMethods = listPaymentMethod?.filter((paymentMethod) =>
        initialValues.payment_method_ids?.some((item) => item === paymentMethod.id.toString())
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
        initialValues.delivery_types?.some((item) => item === deliverType.value.toString())
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
          (item) => item === deliveryServiceSingle.id.toString()
        )
      );
      let text = getFilterString(mappedDeliverProviderIds, "name", undefined, undefined);
      list.push({
        key: "delivery_provider_ids",
        name: "Đơn vị vận chuyển",
        value: text,
      });
    }
    if (initialValues.shipper_codes.length) {
      let mappedShippers = shippers?.filter((account) =>
        initialValues.shipper_codes?.some((single) => single === account.code.toString())
      );
      let text = getFilterString(mappedShippers, "name", UrlConfig.ACCOUNTS, "code");
      list.push({
        key: "shipper_codes",
        name: "Đối tác giao hàng",
        value: text,
      });
    }

    if (initialValues.channel_codes.length) {
      let mappedChannels = listChannel?.filter((channel) =>
        initialValues.channel_codes?.some((single) => single === channel.code.toString())
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

    if (initialValues.reference_code) {
      list.push({
        key: "reference_code",
        name: "Mã tham chiếu",
        value: <React.Fragment>{initialValues.reference_code}</React.Fragment>,
      });
    }
    return list;
  }, [
    filterTagFormatted,
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
    initialValues.return_status,
    initialValues.sub_status_code,
    initialValues.fulfillment_status,
    initialValues.payment_status,
    initialValues.variant_ids.length,
    initialValues.assignee_codes.length,
    initialValues.services.length,
    initialValues.created_by.length,
    initialValues.coordinator_codes.length,
    initialValues.marketer_codes.length,
    initialValues.price_min,
    initialValues.price_max,
    initialValues.payment_method_ids,
    initialValues.delivery_types,
    initialValues.delivery_provider_ids,
    initialValues.shipper_codes,
    initialValues.channel_codes,
    initialValues.note,
    initialValues.customer_note,
    initialValues.tags,
    initialValues.reference_code,
    assigneeFound,
    listStore,
    listSources,
    status,
    subStatus,
    fulfillmentStatus,
    paymentStatus,
    optionsVariant,
    services,
    serviceListVariables,
    accountFound,
    coordinatorFound,
    marketerFound,
    listPaymentMethod,
    serviceType,
    deliveryService,
    shippers,
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
    [serviceVariables.deliver4h, serviceVariables.deliverStandard, services]
  );

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setIssuedClick("");
    setCompletedClick("");
    setCancelledClick("");
    setExpectedClick("");
    setFinalizedClick("");

    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener("resize", () => setVisible(false));
  }, []);

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      search_term: params.search_term,
      variant_ids: params.variant_ids,
    });
  }, [formSearchRef, params.search_term, params.variant_ids]);

  useEffect(() => {
    if (params.variant_ids && params.variant_ids.length) {
      setRerenderSearchVariant(false);
      let variant_ids = Array.isArray(params.variant_ids)
        ? params.variant_ids
        : [params.variant_ids];
      (async () => {
        let variants: any = [];
        await Promise.all(
          variant_ids.map(async (variant_id) => {
            try {
              const result = await getVariantApi(variant_id);

              variants.push({
                label: result.data.name,
                value: result.data.id.toString(),
              });
            } catch {}
          })
        );
        setOptionsVariant(variants);
        if (variants?.length > 0) {
          setRerenderSearchVariant(true);
        }
      })();
    } else {
      setRerenderSearchVariant(true);
    }
  }, [params.variant_ids]);

  useEffect(() => {
    if (accounts) {
      setAccountData(accounts);
    }
  }, [accounts]);

  useEffect(() => {
    setServices(initialValues.services);
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch, initialValues.services]);

  // useEffect(() => {
  // setFiltersResult(filters);
  // }, [filters])

  const renderFilterTag = (filter: ListFilterTagTypes) => {
    if (filter.isExpand) {
      return;
    }
    return <React.Fragment>{filter.value}</React.Fragment>;
  };

  useEffect(() => {
    if (initialValues.source_ids) {
      const params = {
        ids: initialValues.source_ids,
      };
      getSourcesWithParamsService(params).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setListSource && setListSource([...response.data.items]);
        } else {
          handleFetchApiError(response, "Tìm nguồn đơn hàng", dispatch);
        }
      });
    }
  }, [dispatch, initialValues.source_ids, setListSource]);

  return (
    <StyledComponent>
      {!isHideTab && (
        <div className="order-options">
          <Radio.Group onChange={(e) => onChangeOrderOptions(e)} value={initialValues.is_online}>
            <Radio.Button value={null}>Tất cả đơn hàng</Radio.Button>
            <Radio.Button value="true">Đơn hàng online</Radio.Button>
            <Radio.Button value="false">Đơn hàng offline</Radio.Button>
          </Radio.Group>
        </div>
      )}
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline">
            <div style={{ width: "100%" }}>
              <Row gutter={20}>
                <Col span={12}>
                  <Item name="search_term" className="input-search">
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="Tìm kiếm theo ID đơn hàng, tên, sđt khách hàng"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>
                </Col>
                <Col span={12}>
                  {rerenderSearchVariant && (
                    <Item name="variant_ids">
                      <DebounceSelect
                        mode="multiple"
                        showArrow
                        maxTagCount="responsive"
                        placeholder="Sản phẩm"
                        allowClear
                        fetchOptions={searchVariants}
                        optionsVariant={optionsVariant}
                        style={{
                          width: "100%",
                        }}
                      />
                    </Item>
                  )}
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
              <Button icon={<SettingOutlined />} onClick={onShowColumnSetting}></Button>
            </div>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={widthScreen()}>
          {rerender && (
            <Form onFinish={onFinish} ref={formRef} initialValues={initialValues} layout="vertical">
              <Row gutter={20}>
                <Col span={8} xxl={8}>
                  <Item name="store_ids" label="Kho cửa hàng">
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
                    <TreeStore listStore={listStore} placeholder="Cửa hàng" />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="source_ids" label="Nguồn đơn hàng">
                  <CustomSelectWithButtonCheckAll
                      mode="multiple"
                      style={{ width: "100%" }}
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Nguồn đơn hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      onSearch={(value) => {
                        if (value.length > 1) {
                          const params = {
                            name: value,
                            limit: 200,
                          };
                          getSourcesWithParamsService(params).then((response) => {
                            if (isFetchApiSuccessful(response)) {
                              setListSource && setListSource(response.data.items);
                            } else {
                              handleFetchApiError(response, "Tìm nguồn đơn hàng", dispatch);
                            }
                          });
                        }
                      }}
                      onChangeAllSelect={(e: CheckboxChangeEvent)=>{
                        if(e.target.checked) {
                          formRef.current?.setFieldsValue({
                            source_ids: selectedOrderSourceId.concat(listSources?.map(single => single.id.toString()))
                          })
                        } else {
                          formRef.current?.setFieldsValue({
                            source_ids: undefined
                          })
                        }
                      }}
                      getCurrentValue={() => {
                        return formRef.current?.getFieldValue("source_ids")
                      }}
                      allValues={listSources}
                      onChange = {(value) => {
                        setSelectedOrderSourceIds(value)
                      }}
                    >
                      {listSources.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelectWithButtonCheckAll>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <p>Ngày tạo đơn</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="issued_on_min"
                    fieldNameTo="issued_on_max"
                    activeButton={issuedClick}
                    setActiveButton={setIssuedClick}
                    format={dateFormat}
                    formRef={formRef}
                  />
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="sub_status_code" label="Trạng thái xử lý đơn">
                    <CustomSelectWithButtonCheckAll
                      mode="multiple"
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Chọn trạng thái xử lý đơn"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      onBlur={() =>
                        setListOrderProcessingStatus && setListOrderProcessingStatus(initSubStatus)
                      }
                      onChangeAllSelect={(e: CheckboxChangeEvent)=>{
                        if(e.target.checked) {
                          formRef.current?.setFieldsValue({
                            sub_status_code: selectedSubStatusCodes
                          })
                        } else {
                          formRef.current?.setFieldsValue({
                            sub_status_code: undefined
                          })
                        }
                      }}
                      getCurrentValue={() => {
                        return formRef.current?.getFieldValue("sub_status_code")
                      }}
                      allValues={subStatus}
                      onSearch = {(value) => {
                        const showed = initSubStatus.filter(single => fullTextSearch(value, single.sub_status)).map(gg => gg.code)
                        setSelectedSubStatusCodes(showed)
                      }}
                    >
                      {subStatus?.map((item: any) => (
                        <CustomSelect.Option key={item.id} value={item.code.toString()}>
                          {item.sub_status}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelectWithButtonCheckAll>
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
                      getPopupContainer={(trigger) => trigger.parentNode}>
                      <CustomSelect.Option style={{ width: "100%" }} key="1" value="returned">
                        Có đổi trả hàng
                      </CustomSelect.Option>
                      <CustomSelect.Option style={{ width: "100%" }} key="2" value="unreturned">
                        Không đổi trả hàng
                      </CustomSelect.Option>
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <p>Ngày duyệt đơn</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="finalized_on_min"
                    fieldNameTo="finalized_on_max"
                    activeButton={finalizedClick}
                    setActiveButton={setFinalizedClick}
                    format={dateFormat}
                    formRef={formRef}
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
                      maxTagCount="responsive">
                      {paymentStatus.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="created_by" label="Nhân viên tạo đơn">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <p>Ngày huỷ đơn</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="cancelled_on_min"
                    fieldNameTo="cancelled_on_max"
                    activeButton={cancelledClick}
                    setActiveButton={setCancelledClick}
                    format={dateFormat}
                    formRef={formRef}
                  />
                </Col>
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
                      maxTagCount="responsive">
                      {listPaymentMethod.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
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
                    />
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <p>Ngày hoàn tất đơn</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="completed_on_min"
                    fieldNameTo="completed_on_max"
                    activeButton={completedClick}
                    setActiveButton={setCompletedClick}
                    format={dateFormat}
                    formRef={formRef}
                  />
                </Col>
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
                    />
                  </Item>
                </Col>
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
                    />
                  </Item>
                </Col>

                <Col span={8} xxl={8}>
                  <p>Ngày dự kiến nhận hàng</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="expected_receive_on_min"
                    fieldNameTo="expected_receive_on_max"
                    activeButton={expectedClick}
                    setActiveButton={setExpectedClick}
                    format={dateFormat}
                    formRef={formRef}
                  />
                </Col>
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
                      maxTagCount="responsive">
                      {/* <Option value="">Hình thức vận chuyển</Option> */}
                      {serviceType?.map((item) => (
                        <CustomSelect.Option key={item.value} value={item.value}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
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
                      maxTagCount="responsive">
                      {deliveryService?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item name="tags" label="Tags">
                    <CustomSelect
                      mode="tags"
                      optionFilterProp="children"
                      showSearch
                      showArrow
                      allowClear
                      placeholder="Điền 1 hoặc nhiều tag"
                      style={{ width: "100%" }}></CustomSelect>
                  </Item>
                </Col>
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
                <Col span={8} xxl={8}>
                  <Item name="reference_code" label="Mã tham chiếu">
                    <Input placeholder="Tìm kiếm theo mã tham chiếu" />
                  </Item>
                </Col>
                <Col span={8} xxl={8}></Col>
                <Col span={8} xxl={8}></Col>
                <Col span={8} xxl={8}></Col>
                <Col span={8} xxl={8}>
                  <Item name="order_status" label="Trạng thái tiến trình đơn hàng">
                  <CustomSelectWithButtonCheckAll
                      mode="multiple"
                      allowClear
                      showSearch
                      placeholder="Chọn trạng thái tiến trình đơn hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      onChangeAllSelect={(e: CheckboxChangeEvent)=>{
                        if(e.target.checked && status) {
                          formRef.current?.setFieldsValue({
                            order_status: showedStatusCodes.length > 0 ? showedStatusCodes : status.map(single => single.value)
                          })
                        } else {
                          formRef.current?.setFieldsValue({
                            order_status: undefined
                          })
                        }
                      }}
                      getCurrentValue={() => {
                        return formRef.current?.getFieldValue("order_status")
                      }}
                      allValues={status}
                      onSearch = {(value) => {
                        if(status) {
                          const showed = (status|| []).filter(single => fullTextSearch(value, single.name)).map(gg => gg.value)
                          setShowStatusCodes(showed)
                        }
                      }}
                    >
                      {status?.map((item) => (
                        <CustomSelect.Option key={item.value} value={item.value.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelectWithButtonCheckAll>
                  </Item>
                </Col>
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
                      maxTagCount="responsive">
                      {fulfillmentStatus.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <Item label="Đơn tự giao hàng">
                    <div className="button-option-1">
                      {serviceListVariables.map((single) => (
                        <Button
                          key={single.value}
                          onClick={() => handleSelectServices(single.value)}
                          className={services.includes(single.value) ? "active" : "deactive"}>
                          {single.title}
                        </Button>
                      ))}
                    </div>
                  </Item>
                </Col>
                <Col span={8} xxl={8}>
                  <p>Tổng tiền</p>
                  <div className="date-range" style={{ display: "flex", alignItems: "center" }}>
                    <Item name="price_min" style={{ width: "45%", marginBottom: 0 }}>
                      <InputNumber
                        className="price_min"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        placeholder="Từ"
                        min="0"
                        max="100000000"
                        style={{ width: "100%" }}
                      />
                    </Item>

                    <div className="swap-right-icon" style={{ width: "10%", textAlign: "center" }}>
                      <SwapRightOutlined />
                    </div>
                    <Item name="price_max" style={{ width: "45%", marginBottom: 0 }}>
                      <InputNumber
                        className="site-input-right price_max"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        placeholder="Đến"
                        min="0"
                        max="1000000000"
                        style={{ width: "100%" }}
                      />
                    </Item>
                  </div>
                </Col>
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
                      maxTagCount="responsive">
                      {shippers &&
                        shippers.map((shipper) => (
                          <CustomSelect.Option key={shipper.code} value={shipper.code}>
                            {shipper.code} - {shipper.name}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
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
                      maxTagCount="responsive">
                      {listChannel &&
                        listChannel.map((channel) => (
                          <CustomSelect.Option key={channel.code} value={channel.code}>
                            {channel.code} - {channel.name}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </Form>
          )}
        </BaseFilter>
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
