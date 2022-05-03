import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Select,
  Tag,
} from "antd";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import { WebAppGetOrdersMappingQuery } from "model/query/web-app.query";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SelectDateFilter from "screens/web-app/common/SelectDateFilter";
import {
  AllOrdersMappingFilterStyled,
} from "screens/web-app/orders-sync/all-orders/AllOrdersMappingStyled";
import { StyledEcommerceOrderBaseFilter } from "screens/web-app/orders/orderStyles";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import 'component/filter/order.filter.scss'
import {WEB_APP_LIST} from "screens/web-app/common/commonAction";
import { SourceResponse } from "model/response/order/source.response";
import { useDispatch } from "react-redux";
import { getSourceListAction } from "domain/actions/web-app/web-app.actions";

type AllOrdersMappingFilterProps = {
  params: WebAppGetOrdersMappingQuery;
  selectedRowKeys?: Array<any> | undefined;
  initQuery: WebAppGetOrdersMappingQuery;
  isLoading: boolean;
  onClearFilter?: () => void;
  onFilter?: (values: WebAppGetOrdersMappingQuery | Object) => void;
  handleDownloadSelectedOrders: () => void;
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
    handleDownloadSelectedOrders,
  } = props;
  const dispatch = useDispatch();
  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [webAppIdSelected, setWebAppIdSelected] = useState<any>(null);
  const [sourceList,setSourceList] = useState<Array<SourceResponse>>([]);

  let initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_order_statuses: Array.isArray(params.ecommerce_order_statuses)
        ? params.ecommerce_order_statuses
        : [params.ecommerce_order_statuses],
    };
  }, [params]);

  const isDisableAction = () => {
    return !selectedRowKeys || selectedRowKeys.length === 0;
  };

  //get source list
  useEffect(() => {
    const getSourceList = () => {
      dispatch(getSourceListAction((result: Array<SourceResponse>) => {
        if(result){
          setSourceList(result); 
        }
      }))
    }
    getSourceList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  const actionList = (
    <Menu>
      <Menu.Item key="orrder-sync" onClick={() => handleDownloadSelectedOrders()} disabled={isDisableAction()}>
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

  const ConvertUtcToDate = (
    date?: Date | string | number | null,
    format?: string
  ) => {
    if (date != null) {
      let localDate = moment.utc(date).toDate();
      let dateFormat = moment(localDate).format(
        format ? format : "DD/MM/YYYY"
      );
      return dateFormat;
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
    if (initialValues.ecommerce_id) {
      let filterText = "";
      const webAppSelected = WEB_APP_LIST?.find(item => item.ecommerce_id?.toString() === initialValues.ecommerce_id?.toString());
      filterText = webAppSelected ? filterText + webAppSelected.title + "; " : filterText;
      list.push({
        key: 'ecommerce_id',
        name: 'Nguồn đơn hàng',
        value: filterText,
      })
    }

    if (initialValues.ecommerce_order_code) {
      list.push({
        key: 'ecommerce_order_code',
        name: 'ID đơn hàng Sapo',
        value: initialValues.ecommerce_order_code,
      })
    }

    if (initialValues.core_order_code) {
      list.push({
        key: 'core_order_code',
        name: 'ID đơn hàng',
        value: initialValues.core_order_code,
      })
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
    initialValues.ecommerce_id,
    initialValues.ecommerce_order_code,
    initialValues.core_order_code,
    initialValues.connected_status,
    initialValues.created_date_from,
    initialValues.created_date_to,
    initialValues.ecommerce_order_statuses,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "ecommerce_id":
          onFilter && onFilter({ ...params, ecommerce_id: null });
          formFilter?.setFieldsValue({ ecommerce_id: null });
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
    [createdDateFrom, createdDateTo, onFilter]
  );

  //handle query params filter
  const onCheckDateFilterParam = useCallback((date_from: any, date_to: any, setDate: any) => {
    const todayFrom = ConvertUtcToDate(ConvertDateToUtc(moment()));
    const todayTo = ConvertUtcToDate(ConvertDateToUtc(moment()));
    const yesterdayFrom = ConvertUtcToDate(ConvertDateToUtc(moment().subtract(1, "days")));
    const yesterdayTo = ConvertUtcToDate(ConvertDateToUtc(moment().subtract(1, "days")));
    const thisWeekFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("week").add(7, "h")));
    const thisWeekTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("week")));
    const lastWeekFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("week").subtract(1, "weeks").add(7, "h")));
    const lastWeekTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks")));
    const thisMonthFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("month").add(7, "h")));
    const thisMonthTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("month")));
    const lastMonthFrom = ConvertUtcToDate(ConvertDateToUtc(moment().startOf("month").subtract(1, "months").add(7, "h")));
    const lastMonthTo = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("month").subtract(1, "months")));

    const date_from_convert = ConvertUtcToDate(date_from);
    const date_to_convert = ConvertUtcToDate(date_to)

    if (date_from_convert === todayFrom && date_to_convert === todayTo) {
      setDate("today");
    }else if (date_from_convert === yesterdayFrom && date_to_convert === yesterdayTo) {
      setDate("yesterday");
    }else if (date_from_convert === thisWeekFrom && date_to_convert === thisWeekTo) {
      setDate("thisweek");
    }else if (date_from_convert === lastWeekFrom && date_to_convert === lastWeekTo) {
      setDate("lastweek");
    }else if(date_from_convert === thisMonthFrom && date_to_convert === thisMonthTo) {
      setDate("thismonth");
    }else if (date_from_convert === lastMonthFrom && date_to_convert === lastMonthTo) {
      setDate("lastmonth");
    }else {
      setDate("")
    }
  }, [])

  useEffect(() => {
    formFilter.setFieldsValue({
      ecommerce_id: params.ecommerce_id,
      ecommerce_order_code: params.ecommerce_order_code,
      core_order_code: params.core_order_code,
      connected_status: params.connected_status,
      created_date_from: params.created_date_from,
      created_date_to: params.created_date_to,
      ecommerce_order_statuses: params.ecommerce_order_statuses,
      page: params.page
    })

    onCheckDateFilterParam(params.created_date_from, params.created_date_to, setCreatedDateClick)

    if (params.created_date_from === null) {
      setCreatedDateFrom(null);
      setCreatedDateTo(null);
    }else {
      setCreatedDateFrom(params.created_date_from);
      setCreatedDateTo(params.created_date_to);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formFilter, params]);

  //handle select web/app
  const handleSelectWebApp = (id: any) => {
    if (id !== null && id !== webAppIdSelected) {
      setWebAppIdSelected(id);
      onFilter && onFilter({...params, ecommerce_id: id});
    }
  }

  //handle clear web/app
  const handleClearWebApp = () => {
    setWebAppIdSelected(null);
    onFilter && onFilter({...params, ecommerce_id: null});
  }
  

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
            className="select-web-app">
            <Select
              disabled={isLoading}
              placeholder="Nguồn đơn hàng"
              allowClear
              onSelect={(value) => handleSelectWebApp(value)}
              onClear={handleClearWebApp}
            >
              {sourceList && sourceList.map((item: any) => (
                <Select.Option key={item.id} value={item.id.toString()}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Item name="ecommerce_order_code" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng (Sapo)"
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
              Thêm bộ lọc
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
