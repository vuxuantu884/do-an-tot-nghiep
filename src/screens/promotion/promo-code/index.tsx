import { FilterOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Select, Tag } from "antd";
import search from "assets/img/search.svg";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PromotionReleasePermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading } from "domain/actions/loading.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { PriceRule } from "model/promotion/price-rules.model";
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { DISCOUNT_STATUS, PROMOTION_RELEASE_ACTIONS, STATE_LIST } from "screens/promotion/constants";
import DatePromotionColumn from "../shared/date-column";
import actionColumn from "./actions/action.column";
import { convertItemToArray, generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import "./promo-code.scss";
import {
  deactivatePromotionReleaseAction,
  activatePromotionReleaseAction,
  getPromotionReleaseListAction,
} from "domain/actions/promotion/promo-code/promo-code.action";

const PromotionCode = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const initQuery: any = useMemo(
    () => ({
      page: 1,
      limit: 30,
      type: "",
      query: "",
      coupon: "",
      states: [],
    }),
    [],
  );

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<PageResponse<PriceRule> | null>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [form] = Form.useForm();
  const history = useHistory();

  const [params, setParams] = useState<any>(initQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  /** phân quyền */
  const [allowCreatePromotionRelease] = useAuthorization({
    acceptPermissions: [PromotionReleasePermission.CREATE],
  });
  const [allowActivePromotionRelease] = useAuthorization({
    acceptPermissions: [PromotionReleasePermission.ACTIVE],
  });
  /** */

  // handle get coupon release
  const fetchData = useCallback(
    (data: PageResponse<PriceRule> | null) => {
      dispatch(hideLoading());
      if (data) {
        setDataSource(data);
      }
      setTableLoading(false);
    },
    [dispatch],
  );

  const getCouponReleaseList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setTableLoading(true);
      dispatch(getPromotionReleaseListAction(params, fetchData));
    },
    [dispatch, fetchData],
  );

  const handleSetFormFieldsValue = useCallback(
    (fieldsValue) => {
      form.setFieldsValue({
        ...fieldsValue,
      });
    },
    [form],
  );

  useEffect(() => {
    const dataQuery: any = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setParams(dataQuery);
    getCouponReleaseList(dataQuery);
    handleSetFormFieldsValue(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);
  // end handle get coupon release

  /** handle form value */
  const initialValues = useMemo(() => {
    return {
      ...params,
      states: convertItemToArray(params.states),
    };
  }, [params]);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      const queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params],
  );

  const onFilter = useCallback(
    (values) => {
      const newParams = { ...params, ...values, page: 1, query: values.query?.trim(), };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);
      if (currentParam === queryParam) {
        getCouponReleaseList(newParams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
    },
    [getCouponReleaseList, history, location.pathname, params],
  );

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "12%",
      render: (value: any, item: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
        >
          {value.code}
        </Link>
      ),
    },
    {
      title: "Tên đợt phát hành",
      visible: true,
      fixed: "left",
      dataIndex: "title",
      width: "20%",
    },
    {
      title: "SL mã",
      visible: true,
      fixed: "left",
      align: "center",
      dataIndex: "number_of_discount_codes",
      width: "10%",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      align: "center",
      dataIndex: "total_usage_count",
      width: "10%",
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: "center",
      width: "20%",
      render: (value: any, item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      fixed: "left",
      align: "center",
      width: "10%",
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: "state",
      align: "center",
      width: "15%",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e) => e.code === state)?.Component ?? (
          <Fragment />
        );
        return StatusTag;
      },
    },
    actionColumn(),
  ];

  /** handle promotion release actions */
  const promotionReleaseAction: Array<MenuAction> = useMemo(() => {
    if (selectedRowKey.length < 1) {
      return PROMOTION_RELEASE_ACTIONS.map((action) => {
        action.disabled = true;
        return action;
      });
    } else if (selectedRowKey.length > 0) {
      return PROMOTION_RELEASE_ACTIONS.map((action) => {
        action.disabled = false;
        return action;
      });
    }
    return PROMOTION_RELEASE_ACTIONS;
  }, [selectedRowKey]);

  const handleCallback = useCallback(
    (response: any, type: string) => {
      if (response) {
        setTimeout(() => {
          setTableLoading(false);
          showSuccess(`Đã ${type} thành công ${response.count}/${selectedRowKey.length} đợt phát hành`);
          dispatch(getPromotionReleaseListAction(params, fetchData));
        }, 1500);
      } else {
        setTableLoading(false);
      }
    },
    [selectedRowKey.length, dispatch, params, fetchData],
  );

  const onMenuClick = useCallback(
    async (index: number) => {
      const body = { ids: selectedRowKey };
      switch (index) {
        case 1:
          setTableLoading(true);
          dispatch(activatePromotionReleaseAction(body,
            (response) => handleCallback(response, "kích hoạt")));
          break;
        case 2:
          setTableLoading(true);
          dispatch(deactivatePromotionReleaseAction(body,
            (response) => handleCallback(response, "tạm ngừng")));
          break;
      }
    },
    [dispatch, handleCallback, selectedRowKey],
  );
  /** end handle promotion release actions */

  const { Item } = Form;
  const { Option } = Select;

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, []);

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];
    if (initialValues.query) {
      list.push({
        key: "query",
        name: "Mã, tên đợt phát hành",
        value: initialValues.query,
      });
    }

    if (initialValues.states?.length) {
      let statesFiltered = "";
      initialValues.states.forEach((stateValue: string) => {
        const state = STATE_LIST.find(
          (item: any) => item.value === stateValue?.toUpperCase()
        );
        statesFiltered = state
          ? statesFiltered + state.name + "; "
          : statesFiltered + stateValue + "; ";
      });
      list.push({
        key: "states",
        name: "Trạng thái",
        value: statesFiltered,
      });
    }

    if (initialValues.coupon) {
      list.push({
        key: "coupon",
        name: "Mã giảm giá",
        value: initialValues.coupon,
      });
    }
    return list;
  }, [initialValues.coupon, initialValues.query, initialValues.states]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          onFilter && onFilter({ ...params, query: "" });
          break;
        case "states":
          onFilter && onFilter({ ...params, states: [] });
          break;
        case "coupon":
          onFilter && onFilter({ ...params, coupon: "" });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  // end handle tag filter

  return (
    <ContentContainer
      title="Danh sách đợt phát hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: "Đợt phát hành",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
      ]}
      extra={
        allowCreatePromotionRelease && (
          <ButtonCreate path={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`}>
            Thêm mới đợt phát hành
          </ButtonCreate>
        )
      }
    >
      <Card>
        <div className="promotion-code__search">
          <CustomFilter
            onMenuClick={onMenuClick}
            menu={promotionReleaseAction}
            actionDisable={!allowActivePromotionRelease}
          >
            <Form onFinish={onFilter} initialValues={params} layout="inline" form={form}>
              <Item name="query" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo mã, tên đợt phát hành"
                  allowClear
                  onBlur={(e) => {
                    form.setFieldsValue({ query: e.target.value?.trim() });
                  }}
                />
              </Item>
              <Item name="states">
                <Select
                  showArrow
                  allowClear
                  mode="multiple"
                  maxTagCount="responsive"
                  optionFilterProp="children"
                  placeholder="Chọn trạng thái"
                  style={{ minWidth: "250px" }}
                >
                  {STATE_LIST?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Item>

              <Item name="coupon" className="search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tìm kiếm theo mã giảm giá"
                  allowClear
                  onBlur={(e) => {
                    form.setFieldsValue({ coupon: e.target.value?.trim() });
                  }}
                />
              </Item>

              <Item style={{ marginRight: 0 }}>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item>

              <Item style={{ display: "none" }}>
                <Button icon={<FilterOutlined />} onClick={openFilter}>
                  Thêm bộ lọc
                </Button>
              </Item>
            </Form>
          </CustomFilter>

          <div className="filter-tags">
            {filters?.map((filter: any) => {
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

          <CustomTable
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => {
              setSelectedRowKey(rowKey);
            }}
            isRowSelection
            isLoading={tableLoading}
            locale={{ emptyText: "Không có bản ghi" }}
            sticky={{
              offsetScroll: 5,
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            pagination={{
              pageSize: dataSource?.metadata.limit || 0,
              total: dataSource?.metadata.total || 0,
              current: dataSource?.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isShowPaginationAtHeader
            dataSource={dataSource?.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
    </ContentContainer>
  );
};

export default PromotionCode;
