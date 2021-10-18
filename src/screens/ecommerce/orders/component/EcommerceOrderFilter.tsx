import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Button,
  Form,
  Input,
  Select,
  Tag,
  InputNumber,
  Checkbox,
  Tooltip,
} from "antd";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import moment from "moment";

import { MenuAction } from "component/table/ActionButton";
import BaseFilter from "component/filter/base.filter";
import CustomFilter from "component/table/custom.filter";

import { AccountResponse } from "model/account/account.model";
import { EcommerceOrderSearchQuery } from "model/order/order.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";

import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";

import search from "assets/img/search.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";

import {
  StyledComponent,
  StyledEcommerceOrderBaseFilter,
} from "screens/ecommerce/orders/orderStyles";

type EcommerceOrderFilterProps = {
  params: EcommerceOrderSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse> | undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  subStatus: Array<OrderProcessingStatusModel>;
  tableLoading: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: EcommerceOrderSearchQuery | Object) => void;
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
    actions,
    listSource,
    listStore,
    accounts,
    deliveryService,
    subStatus,
    tableLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
  } = props;

  const dispatch = useDispatch();
  const [formAdvanceFilter] = Form.useForm();
  const [formBasicFilter] = Form.useForm();

  const [filterType, setFilterType] = useState("");
  const [visible, setVisible] = useState(false);
  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  const [isBasicEcommerceSelected, setIsBasicEcommerceSelected] =
    useState(false);
  const [basicEcommerceShopList, setBasicEcommerceShopList] = useState<
    Array<any>
  >([]);

  const updateEcommerceShopList = useCallback((result) => {
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

  const getShopEcommerce = (ecommerceId: any) => {
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  const clearShopEcommerceSelected = () => {
    let newFormValues = formAdvanceFilter?.getFieldsValue();
    newFormValues.shop_ids = [];
    formAdvanceFilter?.setFieldsValue(newFormValues);
  };

  const selectEcommerce = (ecommerceId: any) => {
    clearShopEcommerceSelected();
    setIsEcommerceSelected(true);
    getShopEcommerce(ecommerceId);
  };

  const removeEcommerce = () => {
    clearShopEcommerceSelected();
    setIsEcommerceSelected(false);
  };

  // handle basic filter

  const updateBasicEcommerceShopList = useCallback((result) => {
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

    setBasicEcommerceShopList(shopList);
  }, []);

  const getBasicShopEcommerce = (ecommerceId: any) => {
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateBasicEcommerceShopList
      )
    );
  };

  const clearBasicShopEcommerceSelected = () => {
    let newFormValues = formBasicFilter?.getFieldsValue();
    newFormValues.shop_ids = [];
    formBasicFilter?.setFieldsValue(newFormValues);
  };

  const selectBasicEcommerce = (ecommerceId: any) => {
    clearBasicShopEcommerceSelected();
    setIsBasicEcommerceSelected(true);
    getBasicShopEcommerce(ecommerceId);
  };

  const removeBasicEcommerce = () => {
    clearBasicShopEcommerceSelected();
    setIsBasicEcommerceSelected(false);
  };

  const onBasicFinish = useCallback(
    (values) => {
      onFilter && onFilter(values);
    },
    [onFilter]
  );

  const onBasicFilter = useCallback(() => {
    setFilterType("basic");
    formBasicFilter?.submit();
  }, [formBasicFilter]);

  // end handle basic filter

  const ECOMMERCE_LIST = useMemo(
    () => [
      {
        title: "Sàn Shopee",
        icon: shopeeIcon,
        id: "shopee",
        ecommerce_id: 1,
      },
      {
        title: "Sàn Tiki",
        icon: tikiIcon,
        id: "tiki",
        ecommerce_id: 2,
      },
      {
        title: "Sàn Lazada",
        icon: lazadaIcon,
        id: "lazada",
        ecommerce_id: 3,
      },
      {
        title: "Sàn Sendo",
        icon: sendoIcon,
        id: "sendo",
        isActive: false,
        ecommerce_id: 4,
      },
    ],
    []
  );

  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return `Đã chọn: ${shopIdSelected.length} gian hàng`;
    } else {
      return "Chọn gian hàng";
    }
  };

  const onSelectShopChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected =
        shopIdSelected &&
        shopIdSelected.filter((item: any) => {
          return item !== shop.id;
        });
      setShopIdSelected(shopSelected);
    }
  };

  const renderShopList = () => {
    return (
      <StyledComponent>
        <div className="render-shop-list">
          {ecommerceShopList.map((item: any) => (
            <div key={item.id} className="shop-name">
              <Checkbox
                onChange={(e) => onSelectShopChange(item, e)}
                checked={item.isSelected}
              >
                <span className="check-box-name">
                  <span>
                    <img
                      src={shopeeIcon}
                      alt={item.id}
                      style={{ marginRight: "5px", height: "16px" }}
                    />
                  </span>
                  <Tooltip title={item.name} color="#1890ff" placement="right">
                    <span className="name">{item.name}</span>
                  </Tooltip>
                </span>
              </Checkbox>
            </div>
          ))}

          {ecommerceShopList.length === 0 && (
            <div style={{ color: "#737373", padding: 10 }}>
              Không có dữ liệu
            </div>
          )}
        </div>
      </StyledComponent>
    );
  };

  const removeSelectedShop = () => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  };

  const status = useMemo(
    () => [
      { name: "Nháp", value: "draft" },
      { name: "Đóng gói", value: "packed" },
      { name: "Xuất kho", value: "shipping" },
      { name: "Đã xác nhận", value: "finalized" },
      { name: "Hoàn thành", value: "completed" },
      { name: "Kết thúc", value: "finished" },
      { name: "Đã huỷ", value: "cancelled" },
      { name: "Đã hết hạn", value: "expired" },
    ],
    []
  );
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
  const paymentType = useMemo(
    () => [
      { name: "Tiền mặt", value: 1 },
      { name: "Chuyển khoản", value: 3 },
      { name: "QR Pay", value: 4 },
      { name: "Tiêu điểm", value: 5 },
      { name: "COD", value: 0 },
    ],
    []
  );

  const serviceType = useMemo(
    () => [
      {
        name: "Tự vận chuyển",
        value: "shipper",
      },
      {
        name: "Nhận tại cửa hàng",
        value: "pick_at_store",
      },
      {
        name: "Hãng vận chuyển",
        value: "external_service",
      },
    ],
    []
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    setFilterType("advance");
    formAdvanceFilter?.submit();
  }, [formAdvanceFilter]);

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

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "issued":
        setIssuedClick("");
        setIssuedOnMin(dateString[0]);
        setIssuedOnMax(dateString[1]);
        break;
      case "finalized":
        setFinalizedClick("");
        setFinalizedOnMin(dateString[0]);
        setFinalizedOnMax(dateString[1]);
        break;
      case "completed":
        setCompletedClick("");
        setCompletedOnMin(dateString[0]);
        setCompletedOnMax(dateString[1]);
        break;
      case "cancelled":
        setCancelledClick("");
        setCancelledOnMin(dateString[0]);
        setCancelledOnMax(dateString[1]);
        break;
      case "expected":
        setExpectedClick("");
        setExpectedReceiveOnMin(dateString[0]);
        setExpectedReceiveOnMax(dateString[1]);
        break;
      default:
        break;
    }
  }, []);

  const onCloseTag = useCallback(
    (e, tag) => {
      if (!tableLoading) {
        e.preventDefault();
        switch (tag.key) {
          case "store":
            onFilter && onFilter({ ...params, store_ids: [] });
            break;
          case "ecommerce_id":
            onFilter &&
              onFilter({ ...params, ecommerce_id: null, shop_ids: [] });
            break;
          case "shop_ids":
            onFilter && onFilter({ ...params, shop_ids: [] });
            break;
          case "source":
            onFilter && onFilter({ ...params, source_ids: [] });
            break;
          case "issued":
            setIssuedClick("");
            setIssuedOnMin(null);
            setIssuedOnMax(null);
            onFilter &&
              onFilter({ ...params, issued_on_min: null, issued_on_max: null });
            break;
          case "finalized":
            setFinalizedClick("");
            setFinalizedOnMin(null);
            setFinalizedOnMax(null);
            onFilter &&
              onFilter({
                ...params,
                finalized_on_min: null,
                finalized_on_max: null,
              });
            break;
          case "completed":
            setCompletedClick("");
            setCompletedOnMin(null);
            setCompletedOnMax(null);
            onFilter &&
              onFilter({
                ...params,
                completed_on_min: null,
                completed_on_max: null,
              });
            break;
          case "cancelled":
            setCancelledClick("");
            setCancelledOnMin(null);
            setCancelledOnMax(null);
            onFilter &&
              onFilter({
                ...params,
                cancelled_on_min: null,
                cancelled_on_max: null,
              });
            break;
          case "expected":
            setExpectedClick("");
            setExpectedReceiveOnMin(null);
            setExpectedReceiveOnMax(null);
            onFilter &&
              onFilter({
                ...params,
                expected_receive_on_min: null,
                expected_receive_on_max: null,
              });
            break;
          case "order_status":
            onFilter && onFilter({ ...params, order_status: [] });
            break;
          case "order_sub_status":
            onFilter && onFilter({ ...params, order_sub_status: [] });
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
          case "price":
            onFilter &&
              onFilter({ ...params, price_min: null, price_max: null });
            break;
          case "payment_method":
            onFilter && onFilter({ ...params, payment_method_ids: [] });
            break;
          case "expected_receive_predefined":
            onFilter &&
              onFilter({ ...params, expected_receive_predefined: "" });
            break;
          case "delivery_types":
            onFilter && onFilter({ ...params, delivery_types: [] });
            break;
          case "delivery_provider_ids":
            onFilter && onFilter({ ...params, delivery_provider_ids: [] });
            break;
          case "shipper_ids":
            onFilter && onFilter({ ...params, shipper_ids: [] });
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
          default:
            break;
        }
      }
    },
    [onFilter, params, tableLoading]
  );

  const [issuedClick, setIssuedClick] = useState("");
  const [finalizedClick, setFinalizedClick] = useState("");
  const [completedClick, setCompletedClick] = useState("");
  const [cancelledClick, setCancelledClick] = useState("");
  const [expectedClick, setExpectedClick] = useState("");

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day").format("DD-MM-YYYY");
          maxValue = moment().endOf("day").format("DD-MM-YYYY");
          break;
        case "yesterday":
          minValue = moment()
            .startOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          break;
        case "thisweek":
          minValue = moment().startOf("week").format("DD-MM-YYYY");
          maxValue = moment().endOf("week").format("DD-MM-YYYY");
          break;
        case "lastweek":
          minValue = moment()
            .startOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          break;
        case "thismonth":
          minValue = moment().startOf("month").format("DD-MM-YYYY");
          maxValue = moment().endOf("month").format("DD-MM-YYYY");
          break;
        case "lastmonth":
          minValue = moment()
            .startOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          break;
        default:
          break;
      }

      switch (type) {
        case "issued":
          if (issuedClick === value) {
            setIssuedClick("");
            setIssuedOnMin(null);
            setIssuedOnMax(null);
          } else {
            setIssuedClick(value);
            setIssuedOnMin(moment(minValue, "DD-MM-YYYY"));
            setIssuedOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "finalized":
          if (finalizedClick === value) {
            setFinalizedClick("");
            setFinalizedOnMin(null);
            setFinalizedOnMax(null);
          } else {
            setFinalizedClick(value);
            setFinalizedOnMin(moment(minValue, "DD-MM-YYYY"));
            setFinalizedOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "completed":
          if (completedClick === value) {
            setCompletedClick("");
            setCompletedOnMin(null);
            setCompletedOnMax(null);
          } else {
            setCompletedClick(value);
            setCompletedOnMin(moment(minValue, "DD-MM-YYYY"));
            setCompletedOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "cancelled":
          if (cancelledClick === value) {
            setCancelledClick("");
            setCancelledOnMin(null);
            setCancelledOnMax(null);
          } else {
            setCancelledClick(value);
            setCancelledOnMin(moment(minValue, "DD-MM-YYYY"));
            setCancelledOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "expected":
          if (expectedClick === value) {
            setExpectedClick("");
            setExpectedReceiveOnMin(null);
            setExpectedReceiveOnMax(null);
          } else {
            setExpectedClick(value);
            setExpectedReceiveOnMin(moment(minValue, "DD-MM-YYYY"));
            setExpectedReceiveOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        default:
          break;
      }
    },
    [cancelledClick, completedClick, expectedClick, issuedClick, finalizedClick]
  );

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids
        : [params.store_ids],
      ecommerce_id: params.ecommerce_id,
      shop_ids: Array.isArray(params.shop_ids)
        ? params.shop_ids
        : [params.shop_ids],
      source_ids: Array.isArray(params.source_ids)
        ? params.source_ids
        : [params.source_ids],
      order_status: Array.isArray(params.order_status)
        ? params.order_status
        : [params.order_status],
      order_sub_status: Array.isArray(params.order_sub_status)
        ? params.order_sub_status
        : [params.order_sub_status],
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
      shipper_ids: Array.isArray(params.shipper_ids)
        ? params.shipper_ids
        : [params.shipper_ids],
      tags: Array.isArray(params.tags) ? params.tags : [params.tags],
      assignee_codes: Array.isArray(params.assignee_codes)
        ? params.assignee_codes
        : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes)
        ? params.account_codes
        : [params.account_codes],
    };
  }, [params]);

  const [issuedOnMin, setIssuedOnMin] = useState(
    initialValues.issued_on_min
      ? moment(initialValues.issued_on_min, "DD-MM-YYYY")
      : null
  );
  const [issuedOnMax, setIssuedOnMax] = useState(
    initialValues.issued_on_max
      ? moment(initialValues.issued_on_max, "DD-MM-YYYY")
      : null
  );
  const [finalizedOnMin, setFinalizedOnMin] = useState(
    initialValues.finalized_on_min
      ? moment(initialValues.finalized_on_min, "DD-MM-YYYY")
      : null
  );
  const [finalizedOnMax, setFinalizedOnMax] = useState(
    initialValues.finalized_on_max
      ? moment(initialValues.finalized_on_max, "DD-MM-YYYY")
      : null
  );
  const [completedOnMin, setCompletedOnMin] = useState(
    initialValues.completed_on_min
      ? moment(initialValues.completed_on_min, "DD-MM-YYYY")
      : null
  );
  const [completedOnMax, setCompletedOnMax] = useState(
    initialValues.completed_on_max
      ? moment(initialValues.completed_on_max, "DD-MM-YYYY")
      : null
  );
  const [cancelledOnMin, setCancelledOnMin] = useState(
    initialValues.cancelled_on_min
      ? moment(initialValues.cancelled_on_min, "DD-MM-YYYY")
      : null
  );
  const [cancelledOnMax, setCancelledOnMax] = useState(
    initialValues.cancelled_on_max
      ? moment(initialValues.cancelled_on_max, "DD-MM-YYYY")
      : null
  );
  const [expectedReceiveOnMin, setExpectedReceiveOnMin] = useState(
    initialValues.expected_receive_on_min
      ? moment(initialValues.expected_receive_on_min, "DD-MM-YYYY")
      : null
  );
  const [expectedReceiveOnMax, setExpectedReceiveOnMax] = useState(
    initialValues.expected_receive_on_max
      ? moment(initialValues.expected_receive_on_max, "DD-MM-YYYY")
      : null
  );

  const onFinish = useCallback(
    (values) => {
      if (values?.price_min > values?.price_max) {
        values = {
          ...values,
          price_min: values?.price_max,
          price_max: values?.price_min,
        };
      }

      const valuesForm = {
        ...values,
        issued_on_min: issuedOnMin
          ? moment(issuedOnMin, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        issued_on_max: issuedOnMax
          ? moment(issuedOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        finalized_on_min: finalizedOnMin
          ? moment(finalizedOnMin, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        finalized_on_max: finalizedOnMax
          ? moment(finalizedOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        completed_on_min: completedOnMin
          ? moment(completedOnMin, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        completed_on_max: completedOnMax
          ? moment(completedOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        cancelled_on_min: cancelledOnMin
          ? moment(cancelledOnMin, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        cancelled_on_max: cancelledOnMax
          ? moment(cancelledOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        expected_receive_on_min: expectedReceiveOnMin
          ? moment(expectedReceiveOnMin, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        expected_receive_on_max: expectedReceiveOnMax
          ? moment(expectedReceiveOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [
      cancelledOnMax,
      cancelledOnMin,
      completedOnMax,
      completedOnMin,
      expectedReceiveOnMax,
      expectedReceiveOnMin,
      issuedOnMax,
      issuedOnMin,
      onFilter,
      finalizedOnMax,
      finalizedOnMin,
    ]
  );

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.store_ids.length) {
      let textStores = "";
      initialValues.store_ids.forEach((store_id) => {
        const store = listStore?.find(
          (store) => store.id.toString() === store_id
        );
        textStores = store ? textStores + store.name + "; " : textStores;
      });
      list.push({
        key: "store",
        name: "Cửa hàng",
        value: textStores,
      });
    }

    if (initialValues.ecommerce_id) {
      const ecommerceSelected = ECOMMERCE_LIST?.find(
        (item) => item.ecommerce_id === initialValues.ecommerce_id
      );
      let textStores = ecommerceSelected?.title;
      list.push({
        key: "ecommerce_id",
        name: "Sàn",
        value: textStores,
      });
    }

    if (initialValues.shop_ids.length) {
      const shopList =
        filterType === "advance" ? ecommerceShopList : basicEcommerceShopList;
      let textShop = "";
      initialValues.shop_ids.forEach((shop_id) => {
        const shop = shopList?.find((shop) => shop.id.toString() === shop_id);
        textShop = shop ? textShop + shop.name + "; " : textShop;
      });
      list.push({
        key: "shop_ids",
        name: "Shop",
        value: textShop,
      });
    }

    if (initialValues.source_ids.length) {
      let textSource = "";
      initialValues.source_ids.forEach((source_id) => {
        const source = listSources?.find(
          (source) => source.id.toString() === source_id
        );
        textSource = source ? textSource + source.name + "; " : textSource;
      });
      list.push({
        key: "source",
        name: "Nguồn",
        value: textSource,
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
        value: textOrderCreateDate,
      });
    }
    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      let textOrderFinalizedDate =
        (initialValues.finalized_on_min
          ? initialValues.finalized_on_min
          : "??") +
        " ~ " +
        (initialValues.finalized_on_max
          ? initialValues.finalized_on_max
          : "??");
      list.push({
        key: "finalized",
        name: "Ngày duyệt đơn",
        value: textOrderFinalizedDate,
      });
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      let textOrderCompleteDate =
        (initialValues.completed_on_min
          ? initialValues.completed_on_min
          : "??") +
        " ~ " +
        (initialValues.completed_on_max
          ? initialValues.completed_on_max
          : "??");
      list.push({
        key: "completed",
        name: "Ngày hoàn tất đơn",
        value: textOrderCompleteDate,
      });
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      let textOrderCancelDate =
        (initialValues.cancelled_on_min
          ? initialValues.cancelled_on_min
          : "??") +
        " ~ " +
        (initialValues.cancelled_on_max
          ? initialValues.cancelled_on_max
          : "??");
      list.push({
        key: "cancelled",
        name: "Ngày huỷ đơn",
        value: textOrderCancelDate,
      });
    }

    if (
      initialValues.expected_receive_on_min ||
      initialValues.expected_receive_on_max
    ) {
      let textExpectReceiveDate =
        (initialValues.expected_receive_on_min
          ? initialValues.expected_receive_on_min
          : "??") +
        " ~ " +
        (initialValues.expected_receive_on_max
          ? initialValues.expected_receive_on_max
          : "??");
      list.push({
        key: "expected",
        name: "Ngày dự kiến nhận hàng",
        value: textExpectReceiveDate,
      });
    }
    if (initialValues.order_status.length) {
      let textStatus = "";
      initialValues.order_status.forEach((i) => {
        const findStatus = status?.find((item) => item.value === i);
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "order_status",
        name: "Trạng thái đơn hàng",
        value: textStatus,
      });
    }
    if (initialValues.order_sub_status.length) {
      let textStatus = "";

      initialValues.order_sub_status.forEach((i: any) => {
        const findStatus = subStatus?.find(
          (item) => item.id.toString() === i.toString()
        );
        textStatus = findStatus
          ? textStatus + findStatus.sub_status + ";"
          : textStatus;
      });
      list.push({
        key: "order_sub_status",
        name: "Trạng thái xử lý đơn",
        value: textStatus,
      });
    }
    if (initialValues.fulfillment_status.length) {
      let textStatus = "";
      initialValues.fulfillment_status.forEach((i) => {
        const findStatus = fulfillmentStatus?.find((item) => item.value === i);
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "fulfillment_status",
        name: "Trạng thái giao hàng",
        value: textStatus,
      });
    }

    if (initialValues.payment_status.length) {
      let textStatus = "";
      initialValues.payment_status.forEach((i) => {
        const findStatus = paymentStatus?.find((item) => item.value === i);
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "payment_status",
        name: "Trạng thái thanh toán",
        value: textStatus,
      });
    }

    if (initialValues.return_status.length) {
      let textStatus = "";
      initialValues.return_status.forEach((i) => {
        const findStatus = paymentStatus?.find((item) => item.value === i);
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "return_status",
        name: "Trạng thái thanh toán",
        value: textStatus,
      });
    }

    if (initialValues.assignee_codes.length) {
      let textAccount = "";
      initialValues.assignee_codes.forEach((i) => {
        const findAccount = accounts?.find((item) => item.code === i);
        textAccount = findAccount
          ? textAccount + findAccount.full_name + " - " + findAccount.code + ";"
          : textAccount;
      });
      list.push({
        key: "assignee_codes",
        name: "Nhân viên bán hàng",
        value: textAccount,
      });
    }

    if (initialValues.account_codes.length) {
      let textAccount = "";
      initialValues.account_codes.forEach((i) => {
        const findAccount = accounts?.find((item) => item.code === i);
        textAccount = findAccount
          ? textAccount + findAccount.full_name + " - " + findAccount.code + ";"
          : textAccount;
      });
      list.push({
        key: "account_codes",
        name: "Nhân viên tạo đơn",
        value: textAccount,
      });
    }

    if (initialValues.price_min || initialValues.price_max) {
      let textPrice =
        (initialValues.price_min ? initialValues.price_min : " ?? ") +
        " ~ " +
        (initialValues.price_max ? initialValues.price_max : " ?? ");
      list.push({
        key: "price",
        name: "Tổng tiền",
        value: textPrice,
      });
    }

    if (initialValues.payment_method_ids.length) {
      let textStatus = "";
      initialValues.payment_method_ids.forEach((i) => {
        const findStatus = paymentType?.find(
          (item) => item.value.toString() === i
        );
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "payment_method",
        name: "Phương thức thanh toán",
        value: textStatus,
      });
    }
    if (initialValues.delivery_types.length) {
      let textType = "";
      initialValues.delivery_types.forEach((i) => {
        const findType = serviceType?.find((item) => item.value === i);
        textType = findType ? textType + findType.name + ";" : textType;
      });
      list.push({
        key: "delivery_types",
        name: "Hình thức vận chuyển",
        value: textType,
      });
    }
    if (initialValues.delivery_provider_ids.length) {
      let textType = "";
      initialValues.delivery_provider_ids.forEach((i: any) => {
        const findType = deliveryService?.find(
          (item) => item.id.toString() === i.toString()
        );
        textType = findType ? textType + findType.name + ";" : textType;
      });
      list.push({
        key: "delivery_provider_ids",
        name: "Đơn vị vận chuyển",
        value: textType,
      });
    }
    if (initialValues.shipper_ids.length) {
      let textAccount = "";
      initialValues.shipper_ids.forEach((i) => {
        const findAccount = accounts
          .filter((item) => item.is_shipper === true)
          ?.find((item) => item.id === i);
        textAccount = findAccount
          ? textAccount + findAccount.full_name + " - " + findAccount.code + ";"
          : textAccount;
      });
      list.push({
        key: "shipper_ids",
        name: "Đối tác giao hàng",
        value: textAccount,
      });
    }
    if (initialValues.expected_receive_predefined) {
      list.push({
        key: "expected_receive_predefined",
        name: "Ngày dự kiến nhận hàng",
        value: initialValues.expected_receive_predefined,
      });
    }
    if (initialValues.note) {
      list.push({
        key: "note",
        name: "Ghi chú nội bộ",
        value: initialValues.note,
      });
    }

    if (initialValues.customer_note) {
      list.push({
        key: "customer_note",
        name: "Ghi chú của khách",
        value: initialValues.customer_note,
      });
    }

    if (initialValues.tags.length) {
      let textStatus = "";
      initialValues.tags.forEach((i) => {
        textStatus = textStatus + i + ";";
      });
      list.push({
        key: "tags",
        name: "Tags",
        value: textStatus,
      });
    }

    if (initialValues.reference_code) {
      list.push({
        key: "reference_code",
        name: "Mã tham chiếu",
        value: initialValues.reference_code,
      });
    }
    return list;
  }, [
    accounts,
    deliveryService,
    serviceType,
    fulfillmentStatus,
    initialValues,
    listSources,
    listStore,
    paymentStatus,
    paymentType,
    status,
    subStatus,
    ECOMMERCE_LIST,
    ecommerceShopList,
    basicEcommerceShopList,
    filterType,
  ]);

  const getEcommerceIcon = (shop: any) => {
    switch (shop) {
      case "shopee":
        return shopeeIcon;
      case "lazada":
        return lazadaIcon;
      case "tiki":
        return tikiIcon;
      case "sendo":
        return sendoIcon;
      default:
        break;
    }
  };

  return (
    <div className="ecommerce-order-filter">
      <div className="order-filter">
        <Form
          form={formBasicFilter}
          onFinish={onBasicFinish}
          initialValues={initialValues}
        >
          <div className="first-line">
            <Item name="ecommerce_id" className="ecommerce-dropdown">
              <Select
                showSearch
                disabled={tableLoading}
                placeholder="Chọn sàn"
                allowClear
                onSelect={(value) => selectBasicEcommerce(value)}
                onClear={removeBasicEcommerce}
              >
                {ECOMMERCE_LIST &&
                  ECOMMERCE_LIST.map((item: any) => (
                    <Option key={item.ecommerce_id} value={item.ecommerce_id}>
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

            {!isBasicEcommerceSelected && (
              <Item name="shop_ids" className="ecommerce-dropdown">
                <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                  <Select
                    showSearch
                    showArrow
                    disabled={true}
                    placeholder="Chọn gian hàng"
                  />
                </Tooltip>
              </Item>
            )}

            {isBasicEcommerceSelected && (
              <Item name="shop_ids" className="ecommerce-dropdown">
                <Select
                  mode="multiple"
                  allowClear
                  showArrow
                  disabled={tableLoading || !isBasicEcommerceSelected}
                  placeholder={getPlaceholderSelectShop()}
                  notFoundContent="Không tìm thấy shop"
                >
                  {basicEcommerceShopList?.map((item) => (
                    <Option key={item.id} value={item.id.toString()}>
                      <img
                        src={getEcommerceIcon(item.ecommerce)}
                        alt={item.id}
                        style={{
                          marginRight: "5px",
                          height: "16px",
                        }}
                      />
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>
            )}

            {/* {isEcommerceSelected && (
              <Item name="shop_ids" className="ecommerce-dropdown">
                <Select
                  showSearch
                  disabled={tableLoading}
                  placeholder={getPlaceholderSelectShop()}
                  allowClear={shopIdSelected && shopIdSelected.length > 0}
                  dropdownRender={() => renderShopList()}
                  onClear={removeSelectedShop}
                />
              </Item>
            )}

            {!isEcommerceSelected && (
              <Item name="shop_ids" className="ecommerce-dropdown">
                <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                  <Select
                    showSearch
                    disabled={true}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList()}
                    onClear={removeSelectedShop}
                  />
                </Tooltip>
              </Item>
            )} */}
          </div>

          <div className="second-line">
            <CustomFilter
              onMenuClick={onActionClick}
              menu={actions}
              actionDisable={tableLoading}
              children={undefined}
            />

            <Item name="id_order_ecommerce" className="id_order_ecommerce">
              <Input
                disabled={tableLoading}
                prefix={<img src={search} alt="" />}
                placeholder="ID đơn hàng (sàn)"
                onBlur={(e) => {
                  formBasicFilter?.setFieldsValue({
                    id_order_ecommerce: e.target.value.trim(),
                  });
                }}
              />
            </Item>

            <Item name="search_term" className="input-search">
              <Input
                disabled={tableLoading}
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo ID đơn hàng, tên, sđt khách hàng"
                onBlur={(e) => {
                  formBasicFilter?.setFieldsValue({
                    search_term: e.target.value.trim(),
                  });
                }}
              />
            </Item>

            <Item>
              <Button
                type="primary"
                onClick={onBasicFilter}
                disabled={tableLoading}
              >
                Lọc
              </Button>
            </Item>

            <Item>
              <Button
                icon={<FilterOutlined />}
                onClick={openFilter}
                disabled={tableLoading}
              >
                Thêm bộ lọc
              </Button>
            </Item>
            <Button
              className="setting-button"
              icon={<SettingOutlined />}
              onClick={onShowColumnSetting}
              disabled={tableLoading}
            />
          </div>
        </Form>

        <BaseFilter
          onClearFilter={() => {
            onClearFilter && onClearFilter();
            setVisible(false);
          }}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
          footerStyle={{
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent: "space-between",
          }}
          confirmButtonTitle="Áp dụng bộ lọc"
          deleteButtonTitle={
            <div>
              <img src={deleteIcon} style={{ marginRight: 10 }} alt="" />
              <span style={{ color: "red" }}>Xóa bộ lọc</span>
            </div>
          }
        >
          <StyledEcommerceOrderBaseFilter>
            {visible && (
              <Form
                form={formAdvanceFilter}
                onFinish={onFinish}
                initialValues={params}
                layout="vertical"
              >
                <Form.Item label={<b>KHO CỬA HÀNG</b>} name="store_ids">
                  <Select
                    mode="multiple"
                    allowClear
                    showArrow
                    placeholder="Chọn cửa hàng"
                    notFoundContent="Không tìm thấy kết quả"
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>CHỌN SÀN</b>} name="ecommerce_id">
                  <Select
                    showSearch
                    placeholder="Chọn sàn"
                    allowClear
                    onSelect={(value) => selectEcommerce(value)}
                    onClear={removeEcommerce}
                  >
                    {ECOMMERCE_LIST &&
                      ECOMMERCE_LIST.map((item: any) => (
                        <Option
                          key={item.ecommerce_id}
                          value={item.ecommerce_id}
                        >
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
                </Form.Item>

                {!isEcommerceSelected && (
                  <Form.Item label={<b>CHỌN GIAN HÀNG</b>} name="shop_ids">
                    <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                      <Select
                        showSearch
                        showArrow
                        disabled={true}
                        placeholder="Chọn gian hàng"
                      />
                    </Tooltip>
                  </Form.Item>
                )}

                {isEcommerceSelected && (
                  <Form.Item label={<b>CHỌN GIAN HÀNG</b>} name="shop_ids">
                    <Select
                      mode="multiple"
                      allowClear
                      showArrow
                      disabled={tableLoading || !isEcommerceSelected}
                      placeholder={getPlaceholderSelectShop()}
                      notFoundContent="Không tìm thấy shop"
                    >
                      {ecommerceShopList?.map((item) => (
                        <Option key={item.id} value={item.id.toString()}>
                          <img
                            src={getEcommerceIcon(item.ecommerce)}
                            alt={item.id}
                            style={{
                              marginRight: "5px",
                              height: "16px",
                            }}
                          />
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <Form.Item label={<b>NGUỒN ĐƠN HÀNG</b>} name="source_ids">
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn nguồn đơn hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {listSources?.map((item, index) => (
                      <Option key={index.toString()} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>NGÀY TẠO ĐƠN</b>}>
                  <SelectDateFilter
                    clickOptionDate={clickOptionDate}
                    onChangeRangeDate={onChangeRangeDate}
                    dateType="issued"
                    dateSelected={issuedClick}
                    startDate={issuedOnMin}
                    endDate={issuedOnMax}
                  />
                </Form.Item>

                <Form.Item label={<b>NGÀY HOÀN TẤT ĐƠN</b>}>
                  <SelectDateFilter
                    clickOptionDate={clickOptionDate}
                    onChangeRangeDate={onChangeRangeDate}
                    dateType="completed"
                    dateSelected={completedClick}
                    startDate={completedOnMin}
                    endDate={completedOnMax}
                  />
                </Form.Item>

                <Form.Item label={<b>NGÀY HUỶ ĐƠN</b>}>
                  <SelectDateFilter
                    clickOptionDate={clickOptionDate}
                    onChangeRangeDate={onChangeRangeDate}
                    dateType="cancelled"
                    dateSelected={cancelledClick}
                    startDate={cancelledOnMin}
                    endDate={cancelledOnMax}
                  />
                </Form.Item>

                <Form.Item
                  label={<b>TRẠNG THÁI ĐƠN HÀNG</b>}
                  name="order_status"
                >
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái đơn hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {status?.map((item, index) => (
                      <Option key={item.value} value={item.value.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<b>TRẠNG THÁI XỬ LÝ ĐƠN</b>}
                  name="order_sub_status"
                >
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái xử lý đơn"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {subStatus?.map((item: any) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.sub_status}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>GIAO HÀNG</b>} name="fulfillment_status">
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái giao hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {fulfillmentStatus.map((item, index) => (
                      <Option
                        key={index.toString()}
                        value={item.value.toString()}
                      >
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>THANH TOÁN</b>} name="payment_status">
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái thanh toán"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {paymentStatus.map((item, index) => (
                      <Option
                        key={index.toString()}
                        value={item.value.toString()}
                      >
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>TRẢ HÀNG</b>} name="return_status">
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái trả hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    <Option value="1">Pending trạng thái trả hàng</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<b>NHÂN VIÊN BÁN HÀNG</b>}
                  name="assignee_codes"
                >
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn nhân viên bán hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {accounts.map((item, index) => (
                      <Option
                        key={index.toString()}
                        value={item.code.toString()}
                      >
                        {`${item.full_name} - ${item.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={<b>TỔNG TIỀN</b>}>
                  <div className="total-price">
                    <Item name="price_min" style={{ width: "30%" }}>
                      <InputNumber
                        className="price_min"
                        placeholder="Từ"
                        min="0"
                        max="100000000"
                        maxLength={9}
                      />
                    </Item>

                    <Input
                      className="site-input-split"
                      placeholder="~"
                      readOnly
                    />
                    <Item name="price_max" style={{ width: "30%" }}>
                      <InputNumber
                        className="price_max"
                        placeholder="Đến"
                        min="0"
                        max="1000000000"
                        maxLength={9}
                      />
                    </Item>
                  </div>
                </Form.Item>

                <Form.Item label={<b>ĐỐI TÁC GIAO HÀNG</b>} name="shipper_ids">
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn đối tác giao hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {accounts
                      .filter((account) => account.is_shipper === true)
                      ?.map((account) => (
                        <Option key={account.id} value={account.id}>
                          {account.full_name} - {account.code}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={<b>GHI CHÚ CỦA KHÁCH</b>}
                  name="customer_note"
                >
                  <Input.TextArea placeholder="Tìm kiếm theo nội dung ghi chú của khách" />
                </Form.Item>
              </Form>
            )}
          </StyledEcommerceOrderBaseFilter>
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag
                key={filter.key}
                className="tag"
                closable
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </div>
  );
};

export default EcommerceOrderFilter;
