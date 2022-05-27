import { FilterOutlined } from "@ant-design/icons";
import {Button, Card, Form, Input, Select, Tag} from "antd";
import search from "assets/img/search.svg";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import TagStatus, { TagStatusType } from "component/tag/tag-status";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading } from "domain/actions/loading.action";
import {
  bulkDeletePriceRules,
  bulkDisablePriceRulesAction,
  bulkEnablePriceRulesAction, getListDiscountAction
} from "domain/actions/promotion/discount/discount.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { PriceRule } from "model/promotion/price-rules.model";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch } from "react-redux";
import {Link, useHistory, useLocation} from "react-router-dom";
import { OFFSET_HEADER_UNDER_NAVBAR, PROMO_TYPE } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { ACTIONS_PROMO } from "../constants";
import DatePromotionColumn from "../shared/date-column";
import actionColumn from "./actions/action.column";
import { generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import "./promo-code.scss";

const PromotionCode = () => {
  const dispatch = useDispatch();
  const location = useLocation()

  const queryParamsParsed: any = queryString.parse(
    location.search
  );

  const initQuery: any = useMemo(
    () => ({
      page: 1,
      limit: 30,
      type: PROMO_TYPE.MANUAL,
      query: "",
      coupon: "",
      state: null,
    }),
    []
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

  const [actionsPromo, setAcionsPromo] = useState<Array<MenuAction>>(ACTIONS_PROMO);
  //phân quyền

  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });

  // handle get coupon release
  const fetchData = useCallback(
    (data: PageResponse<PriceRule> | null) => {
      dispatch(hideLoading());
      if (data) {
        setDataSource(data);
      }
      setTableLoading(false);
    },
    [dispatch]
  );

  const getCouponReleaseList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setTableLoading(true);
      dispatch(getListDiscountAction(params, fetchData));
    },
    [dispatch, fetchData]
  );

  const handleSetFormFieldsValue = useCallback(
    (fieldsValue) => {
      form.setFieldsValue({
        ...fieldsValue
      });
    },
    [form]
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

  useEffect(() => {
    setAcionsPromo([...ACTIONS_PROMO]);
    if (!allowCancelPromoCode)
      setAcionsPromo([...ACTIONS_PROMO.filter((e) => e.id !== 1 && e.id !== 2)]);
  }, [allowCancelPromoCode]);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      const queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params]
  );

  const onFilter = useCallback(
    (values) => {
      const newParams = { ...params, ...values, page: 1 };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);
      if (currentParam === queryParam) {
        getCouponReleaseList(newParams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
    },
    [getCouponReleaseList, history, location.pathname, params]
  );

  const statuses: any = useMemo(
    () => ([
      {
        code: "ACTIVE",
        value: "Đang áp dụng",
      },
      {
        code: "DISABLED",
        value: "Tạm ngưng",
      },
      {
        code: "DRAFT",
        value: "Chờ áp dụng",
      },
      {
        code: "CANCELLED",
        value: "Đã huỷ",
      },
    ]),
    []
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
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date}/>
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_by",
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
      render: (value: string) => {
        const status = statuses?.find((e: any) => e.code === value)?.value || "";
        let type = TagStatusType.normal;
        switch (value) {
          case statuses[0].code:
            type = TagStatusType.primary;
            break;
          case statuses[1].code:
            type = TagStatusType.warning;
            break;
          case statuses[2].code:
            type = TagStatusType.normal;
            break;
          case statuses[3].code:
            type = TagStatusType.danger;
            break;
          default:
            break;
        }
        return <TagStatus type={type}>{status}</TagStatus>;
      },
    },
    actionColumn(),
  ];

  const handleCallback = useCallback(
    (response) => {
      if (response) {
        setTimeout(() => {
          showSuccess("Thao tác thành công");
          dispatch(getListDiscountAction(params, fetchData));
        }, 1500);
      }
    },
    [dispatch, params, fetchData]
  );

  const onMenuClick = useCallback(
    async (index: number) => {
      const body = { ids: selectedRowKey };
      switch (index) {
        case 1:
          setTableLoading(true);
          dispatch(bulkEnablePriceRulesAction(body, handleCallback));
          break;
        case 2:
          setTableLoading(true);
          dispatch(bulkDisablePriceRulesAction(body, handleCallback));
          break;
        case 3:
          break;
        case 4:
          setTableLoading(true);
          dispatch(bulkDeletePriceRules(body, handleCallback));
          break;
      }
    },
    [dispatch, handleCallback, selectedRowKey]
  );

  const { Item } = Form;
  const { Option } = Select;

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, []);

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];
    if (params.query) {
      list.push({
        key: "query",
        name: "Mã, tên đợt phát hành",
        value: params.query,
      });
    }

    if (params.state) {
      const status = statuses?.find(
        (item: any) => item.code?.toString() === params.state?.toString()
      );
      list.push({
        key: "state",
        name: "Trạng thái",
        value: status?.value || params.state,
      });
    }
    
    if (params.coupon) {
      list.push({
        key: "coupon",
        name: "Mã giảm giá",
        value: params.coupon,
      });
    }
    return list;
  }, [params.coupon, params.query, params.state, statuses]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          onFilter && onFilter({ ...params, query: "" });
          break;
        case "state":
          onFilter && onFilter({ ...params, state: "" });
          break;
        case "coupon":
          onFilter && onFilter({ ...params, coupon: "" });
          break;
        default:
          break;
      }
    },
    [onFilter, params]
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
        allowCreatePromoCode && (
          <ButtonCreate path={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`}>
            Thêm mới đợt phát hành
          </ButtonCreate >
        )
      }
    >
      <Card>
        <div className="promotion-code__search">
          <CustomFilter onMenuClick={onMenuClick} menu={actionsPromo}>
            <Form
              onFinish={onFilter}
              initialValues={params}
              layout="inline"
              form={form}
            >
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
              <Item name="state">
                <Select
                  showArrow
                  showSearch
                  style={{ minWidth: "200px" }}
                  optionFilterProp="children"
                  placeholder="Chọn trạng thái"
                  allowClear={true}
                >
                  {statuses?.map((item: any) => (
                    <Option key={item.code} value={item.code}>
                      {item.value}
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
                  onClose={(e) => onCloseTag(e, filter)}>
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
            sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
            pagination={{
              pageSize: dataSource?.metadata.limit || 0,
              total: dataSource?.metadata.total || 0,
              current: dataSource?.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={dataSource?.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
    </ContentContainer >
  );
};

export default PromotionCode;
