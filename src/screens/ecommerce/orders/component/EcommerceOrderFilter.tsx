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
  Dropdown,
} from "antd";
import { SettingOutlined, FilterOutlined, DownOutlined } from "@ant-design/icons";
import moment from "moment";

import BaseFilter from "component/filter/base.filter";

import { AccountResponse } from "model/account/account.model";
import { EcommerceOrderSearchQuery } from "model/order/order.model";
import { StoreResponse } from "model/core/store.model";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";

import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";

import search from "assets/img/search.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";

import {
  StyledEcommerceOrderBaseFilter,
  StyledOrderFilter,
} from "screens/ecommerce/orders/orderStyles";
import CustomSelect from "component/custom/select.custom";

type EcommerceOrderFilterProps = {
  params: EcommerceOrderSearchQuery;
  initQuery: EcommerceOrderSearchQuery;
  actionList: any;
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
    initQuery,
    actionList,
    listStore,
    accounts,
    deliveryService,
    subStatus,
    tableLoading,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
  } = props;

  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);


  let initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids
        : [params.store_ids],
        source_ids: Array.isArray(params.source_ids)
        ? params.source_ids
        : [params.source_ids],
      ecommerce_shop_ids: Array.isArray(params.ecommerce_shop_ids)
        ? params.ecommerce_shop_ids
        : [params.ecommerce_shop_ids],
      order_status: Array.isArray(params.order_status)
        ? params.order_status
        : [params.order_status],
      sub_status_id: Array.isArray(params.sub_status_id) ? params.sub_status_id : [params.sub_status_id],
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

  const getEcommerceId = (sourceId: any) => {
    let ecommerceId = null;
    if (sourceId) {
      ecommerceId = ECOMMERCE_LIST.find(item => item.source_id === sourceId)?.ecommerce_id;
    }
    return ecommerceId;
  }

  // handle Select Ecommerce
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

  const getEcommerceShopList = (ecommerceId: any) => {
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  const handleSelectEcommerce = (sourceId: any) => {
    setIsEcommerceSelected(true);
    setShopIdSelected([]);
    const ecommerceId = getEcommerceId(sourceId);
    getEcommerceShopList(ecommerceId);
    formFilter?.setFieldsValue({ source_ids: [sourceId] });
  };

  const handleRemoveEcommerce = useCallback(() => {
    setIsEcommerceSelected(false);
    setShopIdSelected([]);
    formFilter?.setFieldsValue({ source_ids: [] });
  },[formFilter]);
   // end handle Select Ecommerce

  const ECOMMERCE_LIST = useMemo(
    () => [
      {
        title: "Sàn Shopee",
        icon: shopeeIcon,
        id: "shopee",
        ecommerce_id: 1,
        source_id: 16,
      },
      {
        title: "Sàn Tiki",
        icon: tikiIcon,
        id: "tiki",
        ecommerce_id: 2,
        source_id: 100, //todo thai need update
      },
      {
        title: "Sàn Lazada",
        icon: lazadaIcon,
        id: "lazada",
        ecommerce_id: 3,
        source_id: 19,
      },
      {
        title: "Sàn Sendo",
        icon: sendoIcon,
        id: "sendo",
        isActive: false,
        ecommerce_id: 4,
        source_id: 20,
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

   // handle Select Shop
  const onSelectShopChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected = shopIdSelected?.filter((item: any) => {
        return item !== shop.id;
      });
      setShopIdSelected(shopSelected);
    }
  };

  const renderShopList = () => {
    return (
      <StyledOrderFilter>
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
                      src={getEcommerceIcon(item.ecommerce)}
                      alt={item.id}
                      style={{ marginRight: "5px", height: "16px" }}
                    />
                  </span>

                  {item.name && item.name.length > 31 &&
                    <Tooltip title={item.name} color="#1890ff" placement="right">
                      <span className="name">{item.name}</span>
                    </Tooltip>
                  }

                  {item.name && item.name.length <= 31 &&
                    <span className="name">{item.name}</span>
                  }
                  
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
      </StyledOrderFilter>
    );
  };

  const handleRemoveSelectedShop = useCallback(() => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  }, [ecommerceShopList]);
  // end handle Select Shop

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

  // handle filter action
  const onFilterClick = useCallback(() => {
    setVisibleBaseFilter(false);
    formFilter?.submit();
  }, [formFilter]);

  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  //clear base filter
  const onClearCreatedDate = () => {
    setIssuedClick("");
    setIssuedOnMin(null);
    setIssuedOnMax(null);
  };

  const onClearCompletedDate = () => {
    setCompletedClick("");
    setCompletedOnMin(null);
    setCompletedOnMax(null);
  };
  
  const onClearCancelledDate = () => {
    setCancelledClick("");
    setCancelledOnMin(null);
    setCancelledOnMax(null);
  };

  const onClearBaseFilter = useCallback(() => {
    handleRemoveEcommerce();
    onClearCreatedDate();
    onClearCompletedDate();
    onClearCancelledDate();

    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formFilter, handleRemoveEcommerce, initQuery, onClearFilter]);
  // end handle filter action

  // handle select date
  const [issuedClick, setIssuedClick] = useState("");
  const [finalizedClick, setFinalizedClick] = useState("");
  const [completedClick, setCompletedClick] = useState("");
  const [cancelledClick, setCancelledClick] = useState("");
  const [expectedClick, setExpectedClick] = useState("");

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
  // end handle select date

  const onFinish = useCallback(
    (values) => {
      if (values?.price_min > values?.price_max) {
        values = {
          ...values,
          price_min: values?.price_max,
          price_max: values?.price_min,
        };
      }

      const formValues = {
        ...values,
        ecommerce_shop_ids: shopIdSelected,
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
      
      onFilter && onFilter(formValues);
    },
    [
      shopIdSelected,
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

  // handle tag filter
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

    if (initialValues.source_ids?.length === 1) {
      let textEcommerce = "";
      initialValues.source_ids.forEach((source_id: any) => {
        const ecommerce = ECOMMERCE_LIST?.find((item) => item.source_id === source_id);
        textEcommerce = ecommerce ? textEcommerce + ecommerce.title + "; " : textEcommerce;
      });
      list.push({
        key: "source_ids",
        name: "Sàn",
        value: textEcommerce,
      });
    }

    if (initialValues.ecommerce_shop_ids.length) {
      let textShop = "";
      initialValues.ecommerce_shop_ids.forEach((shop_id: any) => {
        const shop = ecommerceShopList?.find((shop) => shop.id.toString() === shop_id.toString());
        textShop = shop ? textShop + shop.name + "; " : textShop;
      });
      list.push({
        key: "ecommerce_shop_ids",
        name: "Shop",
        value: textShop,
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
    if (initialValues.sub_status_id.length) {
      let textStatus = ""
      
      initialValues.sub_status_id.forEach(i => {
        const findStatus = subStatus?.find(item => item.id.toString() === i)
        textStatus = findStatus ? textStatus + findStatus.sub_status + ";" : textStatus
      })
      list.push({
        key: 'sub_status_id',
        name: 'Trạng thái xử lý đơn',
        value: textStatus
      })
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

    return list;
  }, [
    accounts,
    deliveryService,
    serviceType,
    fulfillmentStatus,
    initialValues,
    listStore,
    paymentStatus,
    paymentType,
    status,
    subStatus,
    ECOMMERCE_LIST,
    ecommerceShopList
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "store":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "source_ids":
          handleRemoveEcommerce();
          onFilter &&
            onFilter({ ...params, source_ids: [], ecommerce_shop_ids: [] });
          break;
        case "ecommerce_shop_ids":
          handleRemoveSelectedShop();
          onFilter && onFilter({ ...params, ecommerce_shop_ids: [] });
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
        case "sub_status_id":
          onFilter && onFilter({ ...params, sub_status_id: [] });
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
        default:
          break;
      }
    },
    [handleRemoveEcommerce, handleRemoveSelectedShop, onFilter, params]
  );
  // end handle tag filter

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
    <StyledOrderFilter>
      <div className="order-filter">
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <Form.Item className="action-dropdown">
            <Dropdown
              overlay={actionList}
              trigger={["click"]}
              disabled={tableLoading}
            >
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>
          
          <Item name="source_ids" className="ecommerce-dropdown">
            <Select
              showSearch
              disabled={tableLoading}
              placeholder="Chọn sàn"
              allowClear
              onSelect={(value) => handleSelectEcommerce(value)}
              onClear={handleRemoveEcommerce}
            >
              {ECOMMERCE_LIST &&
                ECOMMERCE_LIST.map((item: any) => (
                  <Option key={item.source_id} value={item.source_id}>
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

          <Form.Item className="select-store-dropdown">
            {isEcommerceSelected && (
              <Select
                showSearch
                disabled={tableLoading || !isEcommerceSelected}
                placeholder={getPlaceholderSelectShop()}
                allowClear={shopIdSelected && shopIdSelected.length > 0}
                dropdownRender={() => renderShopList()}
                onClear={handleRemoveSelectedShop}
              />
            )}

            {!isEcommerceSelected && (
              <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                <Select
                  showSearch
                  disabled={true}
                  placeholder={getPlaceholderSelectShop()}
                  allowClear={shopIdSelected && shopIdSelected.length > 0}
                  dropdownRender={() => renderShopList()}
                  onClear={handleRemoveSelectedShop}
                />
              </Tooltip>
            )}
          </Form.Item>

          <Item name="reference_code" className="search-id-order-ecommerce">
            <Input
              disabled={tableLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng (sàn)"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  reference_code: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formFilter?.setFieldsValue({
                  reference_code: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item name="search_term" className="search-term-input">
            <Input
              disabled={tableLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng, SĐT KH"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  search_term: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item className="filter-item">
            <Button
              type="primary"
              // onClick={onBasicFilter}
              htmlType="submit" 
              disabled={tableLoading}
            >
              Lọc
            </Button>
          </Item>

          <Item className="filter-item">
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
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
        </Form>

        <BaseFilter
          onClearFilter={onClearBaseFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleBaseFilter}
          width={500}
        >
          <StyledEcommerceOrderBaseFilter>
            <Form
              form={formFilter}
              onFinish={onFinish}
              initialValues={params}
              layout="vertical"
            >
              <Form.Item label={<b>KHO CỬA HÀNG</b>} name="store_ids">
                <CustomSelect
                  mode="multiple"
                  showArrow
                  allowClear
                  showSearch
                  placeholder="Chọn cửa hàng"
                  notFoundContent="Không tìm thấy kết quả"
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
              </Form.Item>

              <Form.Item label={<b>SÀN TMĐT</b>} name="source_ids">
                <Select
                  showSearch
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={handleRemoveEcommerce}
                >
                  {ECOMMERCE_LIST &&
                    ECOMMERCE_LIST.map((item: any) => (
                      <Option
                        key={item.source_id}
                        value={item.source_id}
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

              <Form.Item
                className="select-store-dropdown"
                label={<b>CHỌN GIAN HÀNG</b>}
              >
                {isEcommerceSelected && (
                  <Select
                    showSearch
                    disabled={tableLoading || !isEcommerceSelected}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList()}
                    onClear={handleRemoveSelectedShop}
                  />
                )}

                {!isEcommerceSelected && (
                  <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                    <Select
                      showSearch
                      disabled={true}
                      placeholder={getPlaceholderSelectShop()}
                      allowClear={shopIdSelected && shopIdSelected.length > 0}
                      dropdownRender={() => renderShopList()}
                      onClear={handleRemoveSelectedShop}
                    />
                  </Tooltip>
                )}
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
                name="sub_status_id"
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
                closable={!tableLoading}
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </StyledOrderFilter>
  );
};

export default EcommerceOrderFilter;
