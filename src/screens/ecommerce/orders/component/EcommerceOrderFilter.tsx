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
  AutoComplete,
  Spin,
} from "antd";
import {DownOutlined, FilterOutlined, LoadingOutlined} from "@ant-design/icons";

import BaseFilter from "component/filter/base.filter";
import CustomSelect from "component/custom/select.custom";
import {fullTextSearch} from "utils/StringUtils";

import {AccountResponse} from "model/account/account.model";
import {EcommerceOrderSearchQuery, OrderSearchQuery} from "model/order/order.model";
import {SourceResponse} from "model/response/order/source.response";
import {StoreResponse} from "model/core/store.model";
import {OrderProcessingStatusModel} from "model/response/order-processing-status.response";
import {PaymentMethodResponse} from "model/response/order/paymentmethod.response";
import {getShopEcommerceList} from "domain/actions/ecommerce/ecommerce.actions";

import {StyledOrderFilter} from "screens/ecommerce/orders/orderStyles";

import {ECOMMERCE_LIST, getEcommerceIcon, getEcommerceIdByChannelCode} from "screens/ecommerce/common/commonAction";
import TreeStore from "component/tree-node/tree-store";
import "screens/ecommerce/orders/ecommerce-order.scss"
import CustomSelectTags from "component/custom/custom-select-tag";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import {searchAccountApi} from "service/accounts/account.service";
import {convertItemToArray, handleDelayActionWhenInsertTextInSearchInput} from "utils/AppUtils";
import search from "assets/img/search.svg";
import {PageResponse} from "model/base/base-metadata.response";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import {RefSelectProps} from "antd/lib/select";
import {searchVariantsOrderRequestAction} from "domain/actions/product/products.action";
import {showError} from "utils/ToastUtils";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import {DATE_FORMAT, formatDateFilter} from "utils/DateUtils";
import {formatDateTimeOrderFilter, getTimeFormatOrderFilterTag} from "utils/OrderUtils";
import {POS} from "utils/Constants";

type EcommerceOrderFilterProps = {
  params: EcommerceOrderSearchQuery;
  actions: Array<any>;
  shopeeActions: Array<any>;
  lazadaActions: Array<any>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  deliveryService: Array<any>;
  listPaymentMethod: Array<PaymentMethodResponse>;
  subStatus: Array<OrderProcessingStatusModel>;
  isLoading?: boolean | undefined;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  setEcommerceShopListByAddress: (item: any) => void;

  onClearFilter?: () => void;
};

const { Item } = Form;
const { Option } = Select;

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
  saleable: true,
};

const dateFormat = DATE_FORMAT.DD_MM_YY_HHmm;


const EcommerceOrderFilter: React.FC<EcommerceOrderFilterProps> = (
  props: EcommerceOrderFilterProps
) => {
  const {
    params,
    actions,
    shopeeActions,
    lazadaActions,
    listSource,
    listStore,
    accounts,
    deliveryService,
    subStatus,
    listPaymentMethod,
    isLoading,
    onClearFilter,
    onFilter,
    setEcommerceShopListByAddress

  } = props;

  const [actionList, setActionList] = useState<Array<any>>(actions);
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

  const dispatch = useDispatch();
  const [ecommerceKeySelected, setEcommerceKeySelected] = useState<string>("");
  const [isEcommerceSelected, setIsEcommerceSelected] = useState<boolean>(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);

  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    if (accounts) {
      setAccountData(accounts);
    }
  }, [accounts]);

  useEffect(() => {
    if (params.assignee_codes && params.assignee_codes?.length > 0) {
      searchAccountApi({
        codes: params.assignee_codes,
      }).then((response) => {
        setAssigneeFound(response.data.items);
      });
    }
  }, [params.assignee_codes]);

  // handle search product
  const [keySearchVariant, setKeySearchVariant] = useState("");
  const [resultSearchVariant, setResultSearchVariant] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const autoCompleteRef = createRef<RefSelectProps>();

  const handleSearchProduct = useCallback((value: string) => {
    if (value.trim()) {
      (async () => {
        try {
          await dispatch(
            searchVariantsOrderRequestAction(initQueryVariant, (data) => {
              setResultSearchVariant(data);
              setIsSearchingProducts(false);
              if (data.items.length === 0) {
                showError("Không tìm thấy sản phẩm!")
              }
            }, () => {
              setIsSearchingProducts(false);
            })
          );
        } catch {
          setIsSearchingProducts(false);
        }
      })();
    } else {
      setIsSearchingProducts(false);
    }
  }, [dispatch]);

  const onChangeProductSearch = useCallback(
    async (value: string) => {
      initQueryVariant.info = value;
      if (value.length >= 3) {
        setIsSearchingProducts(true);
        setResultSearchVariant({
          ...resultSearchVariant,
          items: []
        })
        handleSearchProduct(value);
      } else {
        setIsSearchingProducts(false);
      }
    },
    [handleSearchProduct, resultSearchVariant]
  );

  const handleOnSearchProduct = useCallback((value: string) => {
    setKeySearchVariant(value);
    handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () =>
      onChangeProductSearch(value)
    );
  }, [autoCompleteRef, onChangeProductSearch]);

  const renderVariantOption = (item: VariantResponse) => {
    return (
      <div style={{ padding: "5px 10px" }}>
        <div style={{ whiteSpace: "normal", lineHeight: "18px"}}>{item.name}</div>
        <div style={{ color: '#95a1ac' }}>{item.sku}</div>
      </div>
    );
  };
  
  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach((item: VariantResponse) => {
      options.push({
        label: renderVariantOption(item),
        value: item.name ? item.name.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  const onSearchVariantSelect = useCallback(
    (v, variant) => {
      setKeySearchVariant(variant.value);
      autoCompleteRef.current?.blur();
    },
    [autoCompleteRef]
  );
  // end handle search product

  //handle tag filter
	const [tags, setTags] = useState<Array<any>>([]);

  const onChangeTag = useCallback(
		(value: any) => {
      setTags(value)
		},
		[]
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

  const [issuedClick, setIssuedClick] = useState('');
  const [finalizedClick, setFinalizedClick] = useState('');
  const [completedClick, setCompletedClick] = useState('');
  const [cancelledClick, setCancelledClick] = useState('');
  // const [expectedClick, setExpectedClick] = useState('');

  
  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code?.toUpperCase() !== POS.source_code);
  }, [listSource]);

  const initialValues = useMemo(() => {
    let channelCodes = convertItemToArray(params.channel_codes);
    if (channelCodes.length !== 1) {
      channelCodes = [];
    }
    return {
      ...params,
      channel_codes: channelCodes,
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
      assignee_codes: Array.isArray(params.assignee_codes) ? params.assignee_codes : [params.assignee_codes],
      account_codes: Array.isArray(params.account_codes) ? params.account_codes : [params.account_codes],
      issued_on_min: formatDateFilter(params.issued_on_min || undefined),
      issued_on_max: formatDateFilter(params.issued_on_max || undefined),
      finalized_on_min: formatDateFilter(params.finalized_on_min || undefined),
      finalized_on_max: formatDateFilter(params.finalized_on_max || undefined),
      cancelled_on_min: formatDateFilter(params.cancelled_on_min || undefined),
      cancelled_on_max: formatDateFilter(params.cancelled_on_max || undefined),
      completed_on_min: formatDateFilter(params.completed_on_min || undefined),
      completed_on_max: formatDateFilter(params.completed_on_max || undefined),
    };
  }, [params])

  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current?.getFieldsError([
        'issued_on_min', 'issued_on_max',
        'finalized_on_min', 'finalized_on_max',
        'completed_on_min', 'completed_on_max',
        'cancelled_on_min', 'cancelled_on_max',
      ]).forEach(field => {
        if (field.errors.length) {
          error = true
        }
      })

      if (error) {
        showError("Dữ liệu bộ lọc chưa đúng. Vui lòng kiểm tra lại.")
      } else {
        setVisible(false);
        values.searched_product = keySearchVariant;
        if (values?.price_min > values?.price_max) {
          values = {
            ...values,
            price_min: values?.price_max,
            price_max: values?.price_min,
          }
        }
        values.issued_on_min = formatDateTimeOrderFilter(values.issued_on_min || initialValues.issued_on_min, dateFormat);
        values.issued_on_max = formatDateTimeOrderFilter(values.issued_on_max || initialValues.issued_on_max, dateFormat);
        values.finalized_on_min = formatDateTimeOrderFilter(values.finalized_on_min || initialValues.finalized_on_min, dateFormat);
        values.finalized_on_max = formatDateTimeOrderFilter(values.finalized_on_max || initialValues.finalized_on_max, dateFormat);
        values.cancelled_on_min = formatDateTimeOrderFilter(values.cancelled_on_min || initialValues.cancelled_on_min, dateFormat);
        values.cancelled_on_max = formatDateTimeOrderFilter(values.cancelled_on_max || initialValues.cancelled_on_max, dateFormat);
        values.completed_on_min = formatDateTimeOrderFilter(values.completed_on_min || initialValues.completed_on_min, dateFormat);
        values.completed_on_max = formatDateTimeOrderFilter(values.completed_on_max || initialValues.completed_on_max, dateFormat);

        onFilter && onFilter({...values, tags: [...tags]});
        setRerender(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setIssuedClick('');
    setCompletedClick('');
    setCancelledClick('');
    setFinalizedClick('');
    setKeySearchVariant('');

    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener('resize', () => setVisible(false))
  }, []);

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
    setEcommerceShopListByAddress(shopList)
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      form?.setFieldsValue({
        ecommerce_shop_ids: []
      });

      const ecommerceSelected = ECOMMERCE_LIST?.find(
        (ecommerce: any) => ecommerce.key.toString() === key.toString()
      );

      setEcommerceKeySelected(key)
      // getEcommerceShopList(ecommerceSelected?.ecommerce_id);

      // filter order by channel
      onFilter && onFilter({...params, ecommerce_shop_ids: [], channel_codes: ecommerceSelected?.key});
    }
  };

  const handleRemoveEcommerce = useCallback(() => {
    setEcommerceKeySelected("");
    setIsEcommerceSelected(false);
    form?.setFieldsValue({
      channel_codes: [],
      ecommerce_shop_ids: []
    });
    onFilter && onFilter({...params, ecommerce_shop_ids: [], channel_codes: []});
  }, [form, onFilter, params]);
  // end handle Select Ecommerce

  // handle action dropdown
  useEffect(() => {
    // update action list
    switch (ecommerceKeySelected.toString()) {
      case "shopee":
        const newShopeeActionList = [...actions].concat(shopeeActions);
        setActionList(newShopeeActionList);
        break;
      case "lazada":
        const newLazadaActionList = [...actions].concat(lazadaActions);
        setActionList(newLazadaActionList);
        break;
      case "sendo":
        const newSendoActionList = [...actions];
        setActionList(newSendoActionList);
        break;
      case "tiki":
        const newTikiActionList = [...actions];
        setActionList(newTikiActionList);
        break;
      default:
        setActionList([...actions]);
        break;
    }
  }, [actions, ecommerceKeySelected, lazadaActions, shopeeActions]);

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
    let list = [];
    if (initialValues?.channel_codes?.length === 1) {
      let ecommerceFilterText = "";
      initialValues.channel_codes.forEach((ecommerceCode: any) => {
        const ecommerceSelected = ECOMMERCE_LIST?.find(ecommerce => ecommerce.key?.toString() === ecommerceCode?.toString());
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
      const textOrderCreateDate =
        (initialValues.issued_on_min ? getTimeFormatOrderFilterTag(initialValues.issued_on_min, dateFormat) : "??") +
        " ~ " +
        (initialValues.issued_on_max ? getTimeFormatOrderFilterTag(initialValues.issued_on_max, dateFormat) : "??");
      list.push({
        key: 'issued',
        name: 'Ngày tạo đơn',
        value: textOrderCreateDate
      })
    }
    if (initialValues.finalized_on_min || initialValues.finalized_on_max) {
      const textOrderFinalizedDate =
        (initialValues.finalized_on_min ? getTimeFormatOrderFilterTag(initialValues.finalized_on_min, dateFormat) : "??") +
        " ~ " +
        (initialValues.finalized_on_max ? getTimeFormatOrderFilterTag(initialValues.finalized_on_max, dateFormat) : "??");
      list.push({
        key: 'finalized',
        name: 'Ngày xác nhận',
        value: textOrderFinalizedDate
      })
    }
    if (initialValues.completed_on_min || initialValues.completed_on_max) {
      const textOrderCompleteDate =
        (initialValues.completed_on_min ? getTimeFormatOrderFilterTag(initialValues.completed_on_min, dateFormat) : "??") +
        " ~ " +
        (initialValues.completed_on_max ? getTimeFormatOrderFilterTag(initialValues.completed_on_max, dateFormat) : "??");
      list.push({
        key: 'completed',
        name: 'Ngày thành công',
        value: textOrderCompleteDate
      })
    }
    if (initialValues.cancelled_on_min || initialValues.cancelled_on_max) {
      const textOrderCancelDate =
        (initialValues.cancelled_on_min ? getTimeFormatOrderFilterTag(initialValues.cancelled_on_min, dateFormat) : "??") +
        " ~ " +
        (initialValues.cancelled_on_max ? getTimeFormatOrderFilterTag(initialValues.cancelled_on_max, dateFormat) : "??");
      list.push({
        key: 'cancelled',
        name: 'Ngày huỷ đơn',
        value: textOrderCancelDate
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

    if (initialValues.searched_product) {
      list.push({
        key: "searched_product",
        name: "Sản phẩm",
        value: initialValues.searched_product,
      });
    }

    if (initialValues.assignee_codes.length) {
      let textAccount = ""
      initialValues.assignee_codes.forEach(i => {
        const findAccount = assigneeFound?.find(item => item.code === i)
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
    if (initialValues.tracking_codes) {
      list.push({
        key: 'tracking_codes',
        name: 'Mã vận đơn',
        value: initialValues.tracking_codes
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
    initialValues.order_status,
    initialValues.sub_status_code,
    initialValues.fulfillment_status,
    initialValues.payment_status,
    initialValues.searched_product,
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
    initialValues.tracking_codes,
    ecommerceShopList,
    listStore,
    listSources,
    status,
    subStatus,
    fulfillmentStatus,
    paymentStatus,
    accounts,
    assigneeFound,
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
          form?.setFieldsValue({
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
        case "searched_product":
          onFilter && onFilter({ ...params, searched_product: null });
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
        case 'tracking_codes':
          form?.setFieldsValue({
            tracking_codes: "",
          });
          onFilter && onFilter({...params, tracking_codes: ""});
          break;
        default: break
      }
    },
    [form, handleRemoveEcommerce, onFilter, params]
  );
  // end handle tag filter

  useEffect(() => {
    form.setFieldsValue({
      ...initialValues
    });

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

    let channelCodes = convertItemToArray(params.channel_codes);
    if (channelCodes.length !== 1) {
      channelCodes = [];
    }

    if (channelCodes.length === 1) {
      getEcommerceShopList(getEcommerceIdByChannelCode(channelCodes[0]));
    } else {
      setIsEcommerceSelected(false);
    }

    const checkChannelCode = params.channel_codes as any
    if (checkChannelCode === "shopee") {
     setEcommerceKeySelected("shopee")   
    }

    handleOnSearchProduct(params.searched_product || "");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, params, initialValues]);


  return (
    <StyledOrderFilter>
      <div className="order-filter">
        <Form
          onFinish={onFinish}
          form={form}
          initialValues={initialValues}
        >
          <div className="order-filter-container">
            <div className="first-line">
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
                      <img
                        src={item.icon}
                        alt={item.id}
                        style={{ marginRight: "5px", width: "20px" }}
                      />
                      <span>{item.title}</span>
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
                  // prefix={<img src={search} alt="" />}
                  placeholder="ID đơn hàng (sàn)"
                  allowClear
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
                  // prefix={<img src={search} alt="" />}
                  placeholder="ID đơn hàng, SĐT KH"
                  allowClear
                  onBlur={(e) => {
                    form?.setFieldsValue({
                      search_term: e.target.value.trim(),
                    });
                  }}
                />
              </Item>

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
                />
              </div>
            </div>

            <div>
              <Item
                name="tracking_codes"
                className="input-search-tracking_codes"
                label={"Mã vận đơn: "}
              >
                <Input
                  // prefix={<img src={search} alt="" />}
                  placeholder="Nhập mã vận đơn"
                  allowClear
                  onBlur={(e) => {
                    form?.setFieldsValue({
                      tracking_codes: e.target.value.trim(),
                    });
                  }}
                />
              </Item>
            </div>
          </div>
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
            form={form}
            layout="vertical"
          >
            
            <Row gutter={20}>
              <Col span={8} xxl={8}>
                <Item name="store_ids" label="Kho cửa hàng">
                  <TreeStore listStore={listStore} placeholder="Cửa hàng" notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}/>
                </Item>
              </Col>

              <Col span={8} xxl={8}>
                <Item name="source_ids" label="Nguồn đơn hàng">
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
              </Col>

              <Col span={8} xxl={8}>
                <div className="ant-form-item-label"><label>Ngày tạo đơn</label></div>
                <CustomFilterDatePicker
                  fieldNameFrom="issued_on_min"
                  fieldNameTo="issued_on_max"
                  activeButton={issuedClick}
                  setActiveButton={setIssuedClick}
                  format={dateFormat}
                  formRef={formRef}
                  showTime
                />
              </Col>

              <Col span={8}  xxl={8}>
                <Item name="order_status" label="Trạng thái đơn">
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

              <Col span={8}  xxl={8}>
                <Item name="fulfillment_status" label="Giao hàng">
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
            
              <Col span={8} xxl={8}>
                <div className="ant-form-item-label"><label>Ngày xác nhận</label></div>
                <CustomFilterDatePicker
                  fieldNameFrom="finalized_on_min"
                  fieldNameTo="finalized_on_max"
                  activeButton={finalizedClick}
                  setActiveButton={setFinalizedClick}
                  format={dateFormat}
                  formRef={formRef}
                  showTime
                />
              </Col>

              <Col span={8} xxl={8}>
                <Item name="return_status" label="Trả hàng">
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
              </Col>

              <Col span={8} xxl={8}>
                <Item label="Sản phẩm">
                  <AutoComplete
                    notFoundContent={isSearchingProducts ? <Spin size="small"/> : "Không tìm thấy sản phẩm"}
                    id="search_product"
                    ref={autoCompleteRef}
                    value={keySearchVariant}
                    onSelect={onSearchVariantSelect}
                    dropdownClassName="search-layout dropdown-search-header"
                    dropdownMatchSelectWidth={360}
                    style={{ width: "100%" }}
                    onSearch={handleOnSearchProduct}
                    options={convertResultSearchVariant}
                    maxLength={255}
                  >
                    <Input
                      size="middle"
                      className="yody-search"
                      placeholder="Tìm sản phẩm"
                      allowClear
                      prefix={
                        isSearchingProducts ? (
                          <LoadingOutlined style={{ color: "#2a2a86" }} />
                        ) : (
                          <img alt="" src={search} />
                        )
                      }
                    />
                  </AutoComplete>
                </Item>
              </Col>

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
                  showTime
                />
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
                <Item name="delivery_provider_ids" label="Đơn vị vận chuyển">
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
                  showTime
                />
              </Col>

              <Col span={8} xxl={8}>
                <Item name="tags" label="Tags">
                  <CustomSelectTags onChangeTag={onChangeTag} tags={tags} />
                </Item>
              </Col>

              <Col span={8} xxl={8}>
                <Item name="note" label="Ghi chú nội bộ">
                  <Input.TextArea style={{ width: "100%" }} placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                </Item>
              </Col>

              <Col span={8} xxl={8}>
                <Item name="customer_note" label="Ghi chú của khách">
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
