import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Input, Menu, Select, Tag, Tooltip, TreeSelect } from "antd";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import moment from "moment";
import { fullTextSearch } from "utils/StringUtils";
import { convertItemToArray } from "utils/AppUtils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";
import { AllOrdersMappingFilterStyled } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { StyledEcommerceOrderBaseFilter } from "screens/ecommerce/orders/orderStyles";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import { useDispatch } from "react-redux";
import { getShopEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";
import {
  ECOMMERCE_ID,
  ECOMMERCE_LIST,
  getEcommerceIcon,
  LAZADA_ORDER_STATUS_LIST,
  SHOPEE_ORDER_STATUS_LIST,
  TIKI_ORDER_STATUS_LIST,
  TIKTOK_ORDER_STATUS_LIST,
} from "screens/ecommerce/common/commonAction";
import "component/filter/order.filter.scss";
import { actionFetchListOrderProcessingStatus } from "domain/actions/settings/order-processing-status.action";
import {
  OrderProcessingStatusModel,
  OrderProcessingStatusResponseModel,
} from "model/response/order-processing-status.response";

type AllOrdersMappingFilterProps = {
  params: GetOrdersMappingQuery;
  selectedRowKeys?: Array<any> | undefined;
  // shopList: Array<any>;
  initQuery: GetOrdersMappingQuery;
  isLoading: boolean;
  onClearFilter?: () => void;
  onFilter?: (values: GetOrdersMappingQuery | Object) => void;
  setRowDataFilter: (x: any) => void;
  handleDownloadSelectedOrders: (x: any) => void;
};

const { Item } = Form;
const { Option } = Select;

const CONNECTED_STATUS = [
  {
    title: "Thành công",
    value: "connected",
  },
  {
    title: "Thất bại",
    value: "waiting",
  },
];

const AllOrdersMappingFilter: React.FC<AllOrdersMappingFilterProps> = (
  props: AllOrdersMappingFilterProps,
) => {
  const {
    params,
    selectedRowKeys,
    initQuery,
    isLoading,
    onClearFilter,
    onFilter,
    // shopList,
    handleDownloadSelectedOrders,
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [ecommerceIdSelected, setEcommerceIdSelected] = useState<any>(null);
  const [valueTrackingCode, setValueTrackingCode] = useState<string | null>("");

  const [listOrderProcessingStatus, setListOrderProcessingStatus] = useState<
    OrderProcessingStatusModel[]
  >([]);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   setEcommerceShopList(shopList || []);
  // }, [shopList]);

  let initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_order_statuses: convertItemToArray(params.ecommerce_order_statuses),
      shop_ids: convertItemToArray(params.shop_ids),
      core_sub_status_code: convertItemToArray(params.core_sub_status_code),
    };
  }, [params]);

  let ECOMMERCE_ORDER_STATUS_LIST = useMemo(() => {
    switch (params?.ecommerce_id?.toString()) {
      case ECOMMERCE_ID.SHOPEE.toString():
        return SHOPEE_ORDER_STATUS_LIST;
      case ECOMMERCE_ID.LAZADA.toString():
        return LAZADA_ORDER_STATUS_LIST;
      case ECOMMERCE_ID.TIKI.toString():
        return TIKI_ORDER_STATUS_LIST;
      case ECOMMERCE_ID.TIKTOK.toString():
        return TIKTOK_ORDER_STATUS_LIST;
      default:
        return [];
    }
  }, [params?.ecommerce_id]);

  useEffect(() => {
    const params = {
      sort_type: "asc",
      sort_column: "display_order",
    };
    dispatch(
      actionFetchListOrderProcessingStatus(params, (data: OrderProcessingStatusResponseModel) => {
        setListOrderProcessingStatus(data.items);
      }),
    );
  }, [dispatch]);

  const isDisableAction = () => {
    return !selectedRowKeys || selectedRowKeys.length === 0;
  };

  const actionList = (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => handleDownloadSelectedOrders(1)}
        disabled={isDisableAction()}
      >
        <span>Đồng bộ đơn hàng</span>
      </Menu.Item>
    </Menu>
  );
  // end action menu

  // handle select date
  const [createdDateClick, setCreatedDateClick] = useState("");
  const [createdDateFrom, setCreatedDateFrom] = useState<any>(initialValues.created_date_from);
  const [createdDateTo, setCreatedDateTo] = useState<any>(initialValues.created_date_to);

  const ConvertUtcToDate = (date?: Date | string | number | null, format?: string) => {
    if (date != null) {
      let localDate = moment.utc(date).toDate();
      return moment(localDate).format(format ? format : "DD/MM/YYYY");
    }
    return "";
  };

  const clickOptionDate = useCallback(
    (type, value) => {
      let startDateValue = null;
      let endDateValue = null;

      switch (value) {
        case "today":
          startDateValue = ConvertDateToUtc(moment());
          endDateValue = ConvertDateToUtc(moment());
          break;
        case "yesterday":
          startDateValue = ConvertDateToUtc(moment().subtract(1, "days"));
          endDateValue = ConvertDateToUtc(moment().subtract(1, "days"));
          break;
        case "thisweek":
          startDateValue = ConvertDateToUtc(moment().startOf("week").add(7, "h"));
          endDateValue = ConvertDateToUtc(moment().endOf("week"));
          break;
        case "lastweek":
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").subtract(1, "weeks").add(7, "h"),
          );
          endDateValue = ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks"));
          break;
        case "thismonth":
          startDateValue = ConvertDateToUtc(moment().startOf("month").add(7, "h"));
          endDateValue = ConvertDateToUtc(moment().endOf("month"));
          break;
        case "lastmonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").subtract(1, "months").add(7, "h"),
          );
          endDateValue = ConvertDateToUtc(moment().endOf("month").subtract(1, "months"));
          break;
        default:
          break;
      }

      switch (type) {
        case "created_date":
          if (createdDateClick === value) {
            setCreatedDateClick("");
            setCreatedDateFrom(null);
            setCreatedDateTo(null);
          } else {
            setCreatedDateClick(value);
            setCreatedDateFrom(startDateValue);
            setCreatedDateTo(endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [createdDateClick],
  );

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "created_date":
        setCreatedDateClick("");
        const startDateUtc = dates[0].utc().format();
        const endDateUtc = dates[1].utc().format();
        setCreatedDateFrom(startDateUtc);
        setCreatedDateTo(endDateUtc);
        break;
      default:
        break;
    }
  }, []);
  // end handle select date

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues?.ecommerce_id) {
      let ecommerceFilterText = "";
      const ecommerceSelected = ECOMMERCE_LIST?.find(
        (ecommerce) => ecommerce.ecommerce_id?.toString() === params.ecommerce_id?.toString(),
      );
      ecommerceFilterText = ecommerceSelected
        ? ecommerceFilterText +
          ecommerceSelected.key.slice(0, 1).toUpperCase().concat(ecommerceSelected.key.slice(1)) +
          "; "
        : ecommerceFilterText;
      list.push({
        key: "ecommerce_id",
        name: "Sàn",
        value: ecommerceFilterText,
      });
    }

    if (initialValues.shop_ids?.length) {
      let shopNameList = "";
      initialValues.shop_ids.forEach((shopId: any) => {
        const findStatus = ecommerceShopList?.find(
          (item) => item.id?.toString() === shopId?.toString(),
        );
        shopNameList = findStatus ? shopNameList + findStatus.name + "; " : shopNameList;
      });
      list.push({
        key: "shop_ids",
        name: "Gian hàng",
        value: shopNameList,
      });
    }

    if (initialValues.ecommerce_order_code) {
      list.push({
        key: "ecommerce_order_code",
        name: "ID đơn hàng sàn",
        value: initialValues.ecommerce_order_code,
      });
    }

    if (initialValues.core_order_code) {
      list.push({
        key: "core_order_code",
        name: "ID đơn hàng",
        value: initialValues.core_order_code,
      });
    }

    if (initialValues.core_sub_status_code?.length) {
      let subStatusFilteredList = "";
      initialValues.core_sub_status_code.forEach((subStatus: any) => {
        const subStatusItem = listOrderProcessingStatus?.find(
          (item) => item.code?.toString() === subStatus?.toString(),
        );
        subStatusFilteredList = subStatusItem
          ? subStatusFilteredList + subStatusItem.sub_status + "; "
          : subStatusFilteredList;
      });
      list.push({
        key: "core_sub_status_code",
        name: "TT xử lý đơn",
        value: subStatusFilteredList,
      });
    }

    if (initialValues.connected_status) {
      const connectStatus = CONNECTED_STATUS.find(
        (item) => item.value === initialValues.connected_status,
      );
      list.push({
        key: "connected_status",
        name: "Trạng thái liên kết",
        value: connectStatus?.title,
      });
    }

    if (initialValues.created_date_from || initialValues.created_date_to) {
      let textOrderCreateDate =
        (initialValues.created_date_from
          ? ConvertUtcToLocalDate(initialValues.created_date_from, "DD/MM/YYYY")
          : "??") +
        " ~ " +
        (initialValues.created_date_to
          ? ConvertUtcToLocalDate(initialValues.created_date_to, "DD/MM/YYYY")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo đơn",
        value: textOrderCreateDate,
      });
    }

    if (initialValues.ecommerce_order_statuses?.length) {
      let textStatus = "";
      initialValues.ecommerce_order_statuses.forEach((status) => {
        const findStatus = ECOMMERCE_ORDER_STATUS_LIST?.find((item) => item.value === status);
        textStatus = findStatus ? textStatus + findStatus.name + "; " : textStatus;
      });
      list.push({
        key: "ecommerce_order_statuses",
        name: "Trạng thái đơn hàng sàn",
        value: textStatus,
      });
    }

    if (initialValues.have_tracking_code) {
      let value = null;

      if (initialValues.have_tracking_code === "true") {
        value = "Đã có MVĐ";
      } else if (initialValues.have_tracking_code === "false") {
        value = "Chưa có MVĐ";
      }

      list.push({
        key: "have_tracking_code",
        name: "Mã vận đơn",
        value: value,
      });
    }

    return list;
  }, [
    initialValues,
    params.ecommerce_id,
    ecommerceShopList,
    listOrderProcessingStatus,
    ECOMMERCE_ORDER_STATUS_LIST,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "ecommerce_id":
          onFilter &&
            onFilter({
              ...params,
              ecommerce_id: "",
              shop_ids: [],
              ecommerce_order_statuses: [],
            });
          formFilter?.setFieldsValue({
            ecommerce_id: null,
            shop_ids: [],
            ecommerce_order_statuses: [],
          });
          setEcommerceIdSelected(null);
          break;
        case "shop_ids":
          onFilter && onFilter({ ...params, shop_ids: [] });
          formFilter?.setFieldsValue({ shop_ids: [] });
          break;

        case "ecommerce_order_code":
          onFilter && onFilter({ ...params, ecommerce_order_code: "" });
          formFilter?.setFieldsValue({ ecommerce_order_code: "" });
          break;

        case "core_order_code":
          onFilter && onFilter({ ...params, core_order_code: "" });
          formFilter?.setFieldsValue({ core_order_code: "" });
          break;
        case "connected_status":
          onFilter && onFilter({ ...params, connected_status: null });
          formFilter?.setFieldsValue({ connected_status: null });
          break;
        case "created_date":
          setCreatedDateClick("");
          setCreatedDateFrom(null);
          setCreatedDateTo(null);
          onFilter &&
            onFilter({
              ...params,
              created_date_from: null,
              created_date_to: null,
            });
          break;
        case "ecommerce_order_statuses":
          onFilter && onFilter({ ...params, ecommerce_order_statuses: [] });
          formFilter?.setFieldsValue({ ecommerce_order_statuses: [] });
          break;
        case "core_sub_status_code":
          onFilter && onFilter({ ...params, core_sub_status_code: [] });
          formFilter?.setFieldsValue({ core_sub_status_code: [] });
          break;
        case "have_tracking_code":
          onFilter && onFilter({ ...params, have_tracking_code: null });
          formFilter?.setFieldsValue({ have_tracking_code: null });
          setValueTrackingCode("");
          break;
        default:
          break;
      }
    },
    [formFilter, onFilter, params],
  );
  // end handle tag filter

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
    setCreatedDateClick("");
    setCreatedDateFrom(null);
    setCreatedDateTo(null);
  };

  const onClearBaseFilter = useCallback(() => {
    onClearCreatedDate();

    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
    removeEcommerce();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFilter, initQuery, onClearFilter]);
  // end handle filter action

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        created_date_from: createdDateFrom,
        created_date_to: createdDateTo,
      };

      onFilter && onFilter(formValues);
    },
    [createdDateFrom, createdDateTo, onFilter],
  );

  //handle select ecommerce
  const handleSelectEcommerce = (ecommerceId: any) => {
    if (ecommerceId && ecommerceId !== ecommerceIdSelected) {
      formFilter?.setFieldsValue({
        shop_ids: [],
        ecommerce_order_statuses: [],
      });

      setEcommerceIdSelected(ecommerceId);
      onFilter &&
        onFilter({
          ...params,
          shop_ids: [],
          ecommerce_order_statuses: [],
          ecommerce_id: ecommerceId,
        });
    }
  };

  const getEcommerceShop = (ecommerceId: any) => {
    dispatch(getShopEcommerceList({ ecommerce_id: ecommerceId }, updateEcommerceShopList));
  };

  // get ecommerce shop list
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

  const removeEcommerce = () => {
    setEcommerceIdSelected(null);
    formFilter?.setFieldsValue({
      ecommerce_id: null,
      shop_ids: [],
      ecommerce_order_statuses: [],
    });
    onFilter &&
      onFilter({
        ...params,
        ecommerce_id: "",
        shop_ids: [],
        ecommerce_order_statuses: [],
      });
  };

  const handleOnClearShop = () => {
    onFilter && onFilter({ ...params, shop_ids: [] });
    formFilter?.setFieldsValue({ shop_ids: [] });
  };

  const handleFilterTrackingCode = useCallback(
    (value: string) => {
      let tracking_code = null;
      switch (value) {
        case "has-tracking-code":
          tracking_code = "has-tracking-code";
          formFilter?.setFieldsValue({ have_tracking_code: true });
          break;
        case "no-tracking-code":
          tracking_code = "no-tracking-code";
          formFilter?.setFieldsValue({ have_tracking_code: false });
          break;
        default:
          break;
      }
      if (valueTrackingCode === value) {
        setValueTrackingCode("");
        formFilter?.setFieldsValue({ have_tracking_code: null });
      } else {
        setValueTrackingCode(tracking_code);
      }
    },
    [formFilter, valueTrackingCode],
  );

  //handle query params filter
  const onCheckDateFilterParam = useCallback((date_from: any, date_to: any, setDate: any) => {
    const todayFrom = ConvertUtcToDate(ConvertDateToUtc(moment()));
    const todayTo = ConvertUtcToDate(ConvertDateToUtc(moment()));
    const yesterdayFrom = ConvertUtcToDate(ConvertDateToUtc(moment().subtract(1, "days")));
    const yesterdayTo = ConvertUtcToDate(ConvertDateToUtc(moment().subtract(1, "days")));
    const thisWeekFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("week").add(7, "h")));
    const thisWeekTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("week")));
    const lastWeekFrom = ConvertUtcToDate(
      ConvertDateToUtc(moment().startOf("week").subtract(1, "weeks").add(7, "h")),
    );
    const lastWeekTo = ConvertUtcToDate(
      ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks")),
    );
    const thisMonthFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("month").add(7, "h")));
    const thisMonthTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("month")));
    const lastMonthFrom = ConvertUtcToDate(
      ConvertDateToUtc(moment().startOf("month").subtract(1, "months").add(7, "h")),
    );
    const lastMonthTo = ConvertUtcToDate(
      ConvertDateToUtc(moment().endOf("month").subtract(1, "months")),
    );

    const date_from_convert = ConvertUtcToDate(date_from);
    const date_to_convert = ConvertUtcToDate(date_to);

    if (date_from_convert === todayFrom && date_to_convert === todayTo) {
      setDate("today");
    } else if (date_from_convert === yesterdayFrom && date_to_convert === yesterdayTo) {
      setDate("yesterday");
    } else if (date_from_convert === thisWeekFrom && date_to_convert === thisWeekTo) {
      setDate("thisweek");
    } else if (date_from_convert === lastWeekFrom && date_to_convert === lastWeekTo) {
      setDate("lastweek");
    } else if (date_from_convert === thisMonthFrom && date_to_convert === thisMonthTo) {
      setDate("thismonth");
    } else if (date_from_convert === lastMonthFrom && date_to_convert === lastMonthTo) {
      setDate("lastmonth");
    } else {
      setDate("");
    }
  }, []);

  useEffect(() => {
    formFilter.setFieldsValue({
      ecommerce_order_code: params.ecommerce_order_code,
      core_order_code: params.core_order_code,
      shop_ids: convertItemToArray(params.shop_ids),
      core_sub_status_code: convertItemToArray(params.core_sub_status_code),
      ecommerce_id: params.ecommerce_id,
      connected_status: params.connected_status,
      created_date_from: params.created_date_from,
      created_date_to: params.created_date_to,
      ecommerce_order_statuses: convertItemToArray(params.ecommerce_order_statuses),
      page: params.page,
      have_tracking_code: params.have_tracking_code,
    });

    onCheckDateFilterParam(params.created_date_from, params.created_date_to, setCreatedDateClick);

    if (params.ecommerce_id) {
      getEcommerceShop(params.ecommerce_id);
    }

    if (params.created_date_from === null) {
      setCreatedDateFrom(null);
      setCreatedDateTo(null);
    } else {
      setCreatedDateFrom(params.created_date_from);
      setCreatedDateTo(params.created_date_to);
    }

    const checkActiveTrackingCode = formFilter.getFieldValue("have_tracking_code");

    if (checkActiveTrackingCode === "true") {
      setValueTrackingCode("has-tracking-code");
    } else if (checkActiveTrackingCode === "false") {
      setValueTrackingCode("no-tracking-code");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFilter, params]);

  return (
    <AllOrdersMappingFilterStyled>
      <div className="order-filter">
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="default-filter"
        >
          <Form.Item className="action-dropdown">
            <Dropdown overlay={actionList} trigger={["click"]}>
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>

          <Form.Item name="ecommerce_id" className="ecommerce-dropdown">
            <Select
              disabled={isLoading}
              placeholder="Chọn sàn"
              allowClear
              onSelect={(value) => handleSelectEcommerce(value)}
              onClear={removeEcommerce}
            >
              {ECOMMERCE_LIST?.map((item: any) => (
                <Select.Option key={item.ecommerce_id} value={item.ecommerce_id?.toString()}>
                  <div>
                    <img src={item.icon} alt={item.id} style={{ marginRight: "10px" }} />
                    <span>{item.title}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="select-shop-dropdown" name="shop_ids">
            {params.ecommerce_id ? (
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
                onClear={handleOnClearShop}
                filterTreeNode={(textSearch: any, item: any) => {
                  const treeNodeTitle = item?.title?.props?.children[1];
                  return fullTextSearch(textSearch, treeNodeTitle);
                }}
              >
                {ecommerceShopList?.map((shopItem: any) => (
                  <TreeSelect.TreeNode
                    key={shopItem.id}
                    value={shopItem.id?.toString()}
                    title={
                      <span>
                        {getEcommerceIcon(shopItem.ecommerce) && (
                          <img
                            src={getEcommerceIcon(shopItem.ecommerce)}
                            alt={shopItem.id}
                            style={{ marginRight: "5px", height: "16px" }}
                          />
                        )}
                        {shopItem.name}
                      </span>
                    }
                  />
                ))}
              </TreeSelect>
            ) : (
              <Tooltip title="Yêu cầu chọn sàn" color={"gold"}>
                <Select showSearch disabled={true} placeholder="Chọn gian hàng" />
              </Tooltip>
            )}
          </Form.Item>

          <Item name="ecommerce_order_code" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng (Sàn)"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  ecommerce_order_code: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formFilter.setFieldsValue({
                  ecommerce_order_code: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item name="core_order_code" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  core_order_code: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formFilter?.setFieldsValue({
                  core_order_code: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item name="core_sub_status_code" className="select-core-sub-status">
            <Select
              mode="multiple"
              showSearch
              showArrow
              allowClear
              placeholder="TT xử lý đơn"
              notFoundContent="Không tìm thấy kết quả"
              disabled={isLoading}
              optionFilterProp="children"
              maxTagCount="responsive"
            >
              {listOrderProcessingStatus?.map((item: any) => (
                <Option key={item.id} value={item.code?.toString()}>
                  {item.sub_status}
                </Option>
              ))}
            </Select>
          </Item>

          <Item style={{ marginRight: "15px" }}>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              Lọc
            </Button>
          </Item>

          <Item>
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
              disabled={isLoading}
            ></Button>
          </Item>
        </Form>

        <BaseFilter
          onClearFilter={onClearBaseFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleBaseFilter}
          width={500}
        >
          <StyledEcommerceOrderBaseFilter>
            <Form form={formFilter} onFinish={onFinish} initialValues={params} layout="vertical">
              <Form.Item label={<b>Trạng thái liên kết</b>} name="connected_status">
                <Select placeholder="Chọn trạng thái" allowClear>
                  {CONNECTED_STATUS.map((item: any) => (
                    <Option key={item.value} value={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={<b>NGÀY TẠO ĐƠN</b>}>
                <SelectDateFilter
                  clickOptionDate={clickOptionDate}
                  onChangeRangeDate={onChangeRangeDate}
                  dateType="created_date"
                  dateSelected={createdDateClick}
                  startDate={createdDateFrom}
                  endDate={createdDateTo}
                  isUTC={true}
                />
              </Form.Item>

              <Form.Item name="ecommerce_id" label="Sàn TMĐT" className="ecommerce-dropdown">
                <Select
                  disabled={isLoading}
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}
                >
                  {ECOMMERCE_LIST?.map((item: any) => (
                    <Select.Option key={item.ecommerce_id} value={item.ecommerce_id?.toString()}>
                      <div>
                        <img src={item.icon} alt={item.id} style={{ marginRight: "10px" }} />
                        <span>{item.title}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={<b>TRẠNG THÁI ĐƠN HÀNG SÀN</b>} name="ecommerce_order_statuses">
                {params.ecommerce_id ? (
                  <Select
                    mode="multiple"
                    showArrow
                    allowClear
                    placeholder="Chọn trạng thái đơn hàng sàn"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    maxTagCount="responsive"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {ECOMMERCE_ORDER_STATUS_LIST?.map((item) => (
                      <Option key={item.value} value={item.value.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Tooltip title="Yêu cầu chọn sàn" color={"gold"}>
                    <Select showSearch disabled={true} placeholder="Chọn trạng thái đơn hàng sàn" />
                  </Tooltip>
                )}
              </Form.Item>
              <Form.Item label={<b>Mã vận đơn</b>} name="have_tracking_code">
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                  <Button
                    className={`${valueTrackingCode === "no-tracking-code" ? "active-btn" : ""}`}
                    onClick={() => handleFilterTrackingCode("no-tracking-code")}
                    style={{ width: "47%" }}
                  >
                    Chưa có MVĐ
                  </Button>
                  <Button
                    className={`${valueTrackingCode === "has-tracking-code" ? "active-btn" : ""}`}
                    onClick={() => handleFilterTrackingCode("has-tracking-code")}
                    style={{ width: "47%" }}
                  >
                    Đã có MVĐ
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </StyledEcommerceOrderBaseFilter>
        </BaseFilter>
      </div>

      <div className="filter-tags">
        {filters?.map((filter: any) => {
          return (
            <Tag
              key={filter.key}
              className="tag"
              closable={!isLoading}
              onClose={(e) => onCloseTag(e, filter)}
            >
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </AllOrdersMappingFilterStyled>
  );
};

export default AllOrdersMappingFilter;
