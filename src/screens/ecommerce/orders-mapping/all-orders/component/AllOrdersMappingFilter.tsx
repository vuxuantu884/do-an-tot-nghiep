import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Select,
  Tag,
  TreeSelect,
  Tooltip
} from "antd";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";
import moment from "moment";
import {fullTextSearch} from "utils/StringUtils";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";
import {
  AllOrdersMappingFilterStyled,
} from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { StyledEcommerceOrderBaseFilter } from "screens/ecommerce/orders/orderStyles";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import { useDispatch } from "react-redux";
import {
  getShopEcommerceList,
} from "domain/actions/ecommerce/ecommerce.actions";
import {
  ECOMMERCE_LIST,
  getEcommerceIcon,
} from "screens/ecommerce/common/commonAction";
import 'component/filter/order.filter.scss'

type AllOrdersMappingFilterProps = {
  params: GetOrdersMappingQuery;
  selectedRowKeys?: Array<any> | undefined;
  shopList: Array<any>;
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

const ECOMMERCE_ORDER_STATUS = [
  { name: "Chờ xác nhận", value: "UNPAID" },
  { name: "Chờ lấy hàng (chưa xử lý)", value: "READY_TO_SHIP" },
  { name: "Chờ lấy hàng (đã xử lý)", value: "PROCESSED" },
  { name: "Đang giao", value: "SHIPPED" },
  { name: "Đã giao", value: "TO_CONFIRM_RECEIVE" },
  { name: "Đã huỷ", value: "CANCELLED" },
];

const AllOrdersMappingFilter: React.FC<AllOrdersMappingFilterProps> = (
  props: AllOrdersMappingFilterProps
) => {
  const {
    params,
    selectedRowKeys,
    initQuery,
    isLoading,
    onClearFilter,
    onFilter,
    shopList,
    handleDownloadSelectedOrders,
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [ecommerceIdSelected, setEcommerceIdSelected] = useState(null);
  const [isEcommerceSelected, setIsEcommerceSelected] = useState<boolean>(false);

  const dispatch = useDispatch();

  useEffect(() => {
    setEcommerceShopList(shopList || []);
  }, [shopList]);

  let initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_order_statuses: Array.isArray(params.ecommerce_order_statuses)
        ? params.ecommerce_order_statuses
        : [params.ecommerce_order_statuses],
      shop_ids: Array.isArray(params.shop_ids)
        ? params.shop_ids
        : [params.shop_ids],
    };
  }, [params]);

  const isDisableAction = () => {
    return !selectedRowKeys || selectedRowKeys.length === 0;
  };

  const actionList = (
    <Menu>
      <Menu.Item key="1" onClick={() => handleDownloadSelectedOrders(1)} disabled={isDisableAction()}>
        <span>Đồng bộ đơn hàng</span>
      </Menu.Item>
    </Menu>
  );
  // end action menu

  // handle select date
  const [createdDateClick, setCreatedDateClick] = useState("");
  const [createdDateFrom, setCreatedDateFrom] = useState<any>(
    initialValues.created_date_from
  );
  const [createdDateTo, setCreatedDateTo] = useState<any>(
    initialValues.created_date_to
  );

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
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(moment().endOf("week"));
          break;
        case "lastweek":
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").subtract(1, "weeks").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(
            moment().endOf("week").subtract(1, "weeks")
          );
          break;
        case "thismonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(moment().endOf("month"));
          break;
        case "lastmonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").subtract(1, "months").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(
            moment().endOf("month").subtract(1, "months")
          );
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
    [createdDateClick]
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

    if (initialValues.shop_ids.length) {
      let shopNameList = "";
      initialValues.shop_ids.forEach((shopId: any) => {
        const findStatus = ecommerceShopList?.find(
          (item) => item.id === shopId
        );
        shopNameList = findStatus
          ? shopNameList + findStatus.name + "; "
          : shopNameList;
      });
      list.push({
        key: "shop_ids",
        name: "Gian hàng",
        value: shopNameList,
      });
    }

    if (initialValues.connected_status) {
      const connectStatus = CONNECTED_STATUS.find(
        (item) => item.value === initialValues.connected_status
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

    if (initialValues.ecommerce_order_statuses.length) {
      let textStatus = "";
      initialValues.ecommerce_order_statuses.forEach((i) => {
        const findStatus = ECOMMERCE_ORDER_STATUS?.find(
          (item) => item.value === i
        );
        textStatus = findStatus
          ? textStatus + findStatus.name + "; "
          : textStatus;
      });
      list.push({
        key: "ecommerce_order_statuses",
        name: "Trạng thái đơn hàng",
        value: textStatus,
      });
    }

    return list;
  }, [
    initialValues.shop_ids,
    initialValues.connected_status,
    initialValues.created_date_from,
    initialValues.created_date_to,
    initialValues.ecommerce_order_statuses,
    ecommerceShopList,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "shop_ids":
          onFilter && onFilter({ ...params, shop_ids: [] });
          formFilter?.setFieldsValue({ shop_ids: [] });
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
        default:
          break;
      }
    },
    [formFilter, onFilter, params]
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
    [createdDateFrom, createdDateTo, onFilter]
  );

  //handle select ecommerce
  const handleSelectEcommerce = (ecommerceId: any) => {
    if (ecommerceId !== ecommerceIdSelected) {
      formFilter?.setFieldsValue({
        shop_ids: []
      });

      setEcommerceIdSelected(ecommerceId);
      getEcommerceShop(ecommerceId);
    }
  };

  const getEcommerceShop = (ecommerceId: any) => {
    setIsEcommerceSelected(false);
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  // get ecommerce shop list
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

  const removeEcommerce = () => {
    setIsEcommerceSelected(false);
    setEcommerceIdSelected(null);
    formFilter?.setFieldsValue({ shop_ids: [] });
  };


  return (
    <AllOrdersMappingFilterStyled>
      <div className="order-filter">
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="default-filter">
          <Form.Item className="action-dropdown">
            <Dropdown overlay={actionList} trigger={["click"]}>
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>


          <Form.Item
            name="ecommerce_id"
            className="ecommerce-dropdown">
            <Select
              disabled={isLoading}
              placeholder="Chọn sàn"
              allowClear
              onSelect={(value) => handleSelectEcommerce(value)}
              onClear={removeEcommerce}>
              {ECOMMERCE_LIST?.map((item: any) => (
                <Select.Option key={item.ecommerce_id} value={item.ecommerce_id}>
                  <div>
                    <img
                      src={item.icon}
                      alt={item.id}
                      style={{ marginRight: "10px" }}
                    />
                    <span>{item.title}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            className="select-shop-dropdown"
            name="shop_ids"
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
            />
          </Item>

          <Item style={{ marginRight: "15px"}}>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              Lọc
            </Button>
          </Item>

          <Item>
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
              disabled={isLoading}>
            </Button>
          </Item>
        </Form>

        <BaseFilter
          onClearFilter={onClearBaseFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleBaseFilter}
          width={500}>
          <StyledEcommerceOrderBaseFilter>
            <Form
              form={formFilter}
              onFinish={onFinish}
              initialValues={params}
              layout="vertical">
              <Form.Item
                label={<b>Trạng thái liên kết</b>}
                name="connected_status">
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

              <Form.Item
                label={<b>TRẠNG THÁI ĐƠN HÀNG</b>}
                name="ecommerce_order_statuses">
                <Select
                  mode="multiple"
                  showArrow
                  allowClear
                  placeholder="Chọn trạng thái đơn hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  optionFilterProp="children"
                  maxTagCount="responsive"
                  getPopupContainer={(trigger) => trigger.parentNode}>
                  {ECOMMERCE_ORDER_STATUS?.map((item) => (
                    <Option key={item.value} value={item.value.toString()}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
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
              onClose={(e) => onCloseTag(e, filter)}>
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </AllOrdersMappingFilterStyled>
  );
};

export default AllOrdersMappingFilter;
