import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
  Dropdown,
  Menu,
  Checkbox,
  Tooltip,
} from "antd";
import { FilterOutlined, DownOutlined } from "@ant-design/icons";
import moment from "moment";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";

import BaseFilter from "component/filter/base.filter";
import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";

import search from "assets/img/search.svg";
import {
  StyledEcommerceOrderBaseFilter,
} from "screens/ecommerce/orders/orderStyles";
import { AllOrdersMappingFilterStyled, StyledRenderShopList } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";

import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";


type AllOrdersMappingFilterProps = {
  params: GetOrdersMappingQuery;
  selectedRowKeys?: Array<any> | undefined;
  shopList: Array<any>;
  initQuery: GetOrdersMappingQuery;
  isLoading: boolean;
  onClearFilter?: () => void;
  onFilter?: (values: GetOrdersMappingQuery | Object) => void;
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
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  useEffect(() => {
    setEcommerceShopList(shopList || []);
  }, [shopList]);

  let initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_order_statuses: Array.isArray(params.ecommerce_order_statuses)
        ? params.ecommerce_order_statuses
        : [params.ecommerce_order_statuses],
      shop_id: Array.isArray(params.shop_id)
        ? params.shop_id
        : [params.shop_id],
      
    };
  }, [params]);

  // action menu
  const onMenuClick = useCallback(
    (index: number) => {
      console.log("selectedRowKeys: ", selectedRowKeys);
    },
    [selectedRowKeys]
  );

  const actionList = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={() => onMenuClick(1)}>ACTION 1</span>
      </Menu.Item>
    </Menu>
  );
  // end action menu

  // handle select date
  const [createdDateClick, setCreatedDateClick] = useState("");
  const [createdDateFrom, setCreatedDateFrom] = useState<any>(initialValues.created_date_from);
  const [createdDateTo, setCreatedDateTo] = useState<any>(initialValues.created_date_to);

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
          startDateValue = ConvertDateToUtc(moment().startOf("week").add(7, 'h'));
          endDateValue = ConvertDateToUtc(moment().endOf("week"));
          break;
        case "lastweek":
          startDateValue = ConvertDateToUtc(moment().startOf("week").subtract(1, "weeks").add(7, 'h'));
          endDateValue = ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks"));
          break;
        case "thismonth":
          startDateValue = ConvertDateToUtc(moment().startOf("month").add(7, 'h'));
          endDateValue = ConvertDateToUtc(moment().endOf("month"));
          break;
        case "lastmonth":
          startDateValue = ConvertDateToUtc(moment().startOf("month").subtract(1, "months").add(7, 'h'));
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

  // handle select shop
  const onClearSelectedShop = useCallback(() => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  }, [ecommerceShopList]);

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

  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return `Đã chọn: ${shopIdSelected.length} gian hàng`;
    } else {
      return "Chọn gian hàng";
    }
  };

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

  const renderShopList = () => {
    return (
      <StyledRenderShopList>
        <div className="shop-list">
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
      </StyledRenderShopList>
    );
  };

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.shop_id.length) {
      let shopNameList = "";
      initialValues.shop_id.forEach((shopId) => {
        const findStatus = ecommerceShopList?.find((item) => item.id === shopId);
        shopNameList = findStatus
          ? shopNameList + findStatus.name + "; "
          : shopNameList;
      });
      list.push({
        key: "shop_id",
        name: "Gian hàng",
        value: shopNameList,
      });
    }

    if (initialValues.connected_status) {
      const connectStatus = CONNECTED_STATUS.find((item) => item.value === initialValues.connected_status);
      list.push({
        key: "connected_status",
        name: "Trạng thái liên kết",
        value: connectStatus?.title,
      });
    }

    if (initialValues.created_date_from || initialValues.created_date_to) {
      let textOrderCreateDate =
        (initialValues.created_date_from ? ConvertUtcToLocalDate(initialValues.created_date_from, "DD/MM/YYYY") : "??") +
        " ~ " +
        (initialValues.created_date_to ? ConvertUtcToLocalDate(initialValues.created_date_to, "DD/MM/YYYY") : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo đơn",
        value: textOrderCreateDate,
      });
    }
    
    if (initialValues.ecommerce_order_statuses.length) {
      let textStatus = "";
      initialValues.ecommerce_order_statuses.forEach((i) => {
        const findStatus = ECOMMERCE_ORDER_STATUS?.find((item) => item.value === i);
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
  }, [initialValues.shop_id, initialValues.connected_status, initialValues.created_date_from, initialValues.created_date_to, initialValues.ecommerce_order_statuses, ecommerceShopList]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "shop_id":
          onFilter && onFilter({ ...params, shop_id: [] });
          formFilter?.setFieldsValue({ shop_id: [] });
          onClearSelectedShop();
          break;
        case "connected_status":
          onFilter && onFilter({ ...params, connected_status: null });
          formFilter?.setFieldsValue({ connected_status: null });
          break;
        case "created_date":
          setCreatedDateClick("");
          setCreatedDateFrom(null);
          setCreatedDateTo(null);
          onFilter && onFilter({ ...params, created_date_from: null, created_date_to: null });
          break;
        case "ecommerce_order_statuses":
          onFilter && onFilter({ ...params, ecommerce_order_statuses: [] });
          formFilter?.setFieldsValue({ ecommerce_order_statuses: [] });
          break;
        default:
          break;
      }
    },
    [formFilter, onClearSelectedShop, onFilter, params]
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
    onClearSelectedShop();

    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formFilter, initQuery, onClearFilter, onClearSelectedShop]);
  // end handle filter action

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        shop_id: shopIdSelected,
        created_date_from: createdDateFrom,
        created_date_to: createdDateTo,
      };
      
      onFilter && onFilter(formValues);
    },
    [shopIdSelected, createdDateFrom, createdDateTo, onFilter]
  );


  return (
    <AllOrdersMappingFilterStyled>
      <div className="order-filter">
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="default-filter"
        >
          <Form.Item className="action-dropdown" hidden>
            <Dropdown
              overlay={actionList}
              trigger={["click"]}
              disabled={isLoading || true}
            >
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>

          <Form.Item className="select-shop-dropdown">
            <Select
              disabled={isLoading}
              placeholder={getPlaceholderSelectShop()}
              dropdownRender={() => renderShopList()}
            />
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

          <Item className="filter-item">
            <Button
              type="primary"
              htmlType="submit" 
              disabled={isLoading}
            >
              Lọc
            </Button>
          </Item>

          <Item className="filter-item">
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
              disabled={isLoading}
            >
              Thêm bộ lọc
            </Button>
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
            <Form
              form={formFilter}
              onFinish={onFinish}
              initialValues={params}
              layout="vertical"
            >
              <Form.Item label={<b>Trạng thái liên kết</b>} name="connected_status">
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                >
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
                name="ecommerce_order_statuses"
              >
                <Select
                  mode="multiple"
                  showArrow
                  allowClear
                  placeholder="Chọn trạng thái đơn hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  optionFilterProp="children"
                  maxTagCount='responsive'
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {ECOMMERCE_ORDER_STATUS?.map((item, index) => (
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
        {filters?.map((filter: any, index) => {
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
