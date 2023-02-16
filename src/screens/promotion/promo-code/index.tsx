import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
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
import { DISCOUNT_STATUS, PROMOTION_RELEASE_ACTIONS } from "screens/promotion/constants";
import DatePromotionColumn from "../shared/date-column";
import actionColumn from "./actions/action.column";
import { generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import "./promo-code.scss";
import {
  deactivatePromotionReleaseAction,
  activatePromotionReleaseAction,
  getPromotionReleaseListAction,
} from "domain/actions/promotion/promo-code/promo-code.action";
import PromotionReleaseFilter from "screens/promotion/promo-code/components/PromotionReleaseFilter";
import { StoreResponse } from "model/core/store.model";
import { ChannelResponse } from "model/response/product/channel.response";
import { SourceResponse } from "model/response/order/source.response";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { PromotionReleaseQuery } from "model/promotion/promotion-release.model";

const PromotionCode = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const initQuery: PromotionReleaseQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      type: "",
      query: "",
      coupon: "",
      states: [],
      is_registered: undefined,
      entitled_method: null,
      creators: [],
      store_ids: [],
      channels: [],
      source_ids: [],
      starts_date_min: "",
      starts_date_max: "",
      ends_date_min: "",
      ends_date_max: "",
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
  const history = useHistory();

  const [params, setParams] = useState<any>(initQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);
  const [channelList, setChannelList] = useState<Array<ChannelResponse>>([]);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);

  /** phân quyền */
  const [allowCreatePromotionRelease] = useAuthorization({
    acceptPermissions: [PromotionReleasePermission.CREATE],
  });
  /** */

  /** lấy danh sách cửa hàng, kênh bán hàng, nguồn đơn hàng */
  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListChannelRequest(setChannelList));
    dispatch(getListAllSourceRequest(setSourceList));
  }, [dispatch]);
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

  useEffect(() => {
    const dataQuery: any = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setParams(dataQuery);
    getCouponReleaseList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);
  // end handle get coupon release

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
      const newParams = { ...params, ...values, page: 1 };
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
      width: "120px",
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
    },
    {
      title: "SL mã",
      visible: true,
      fixed: "left",
      align: "center",
      dataIndex: "number_of_discount_codes",
      width: "90px",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      align: "center",
      dataIndex: "total_usage_count",
      width: "90px",
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: "center",
      width: "180px",
      render: (value: any, item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      fixed: "left",
      align: "center",
      render: (item: any) => {
        return (
          <>
            <span>{item.created_by ?? ""}</span>
            <span>{" - "}</span>
            <span>{item.created_name ?? ""}</span>
          </>
        );
      },
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: "state",
      align: "center",
      width: "150px",
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

  return (
    <ContentContainer
      title="Danh sách đợt phát hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
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
        <PromotionReleaseFilter
          onMenuClick={onMenuClick}
          isLoading={tableLoading}
          initQuery={initQuery}
          params={params}
          actions={promotionReleaseAction}
          onFilter={onFilter}
          listStore={listStore}
          channelList={channelList}
          sourceList={sourceList}
        />

        <CustomTable
          bordered
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
      </Card>
    </ContentContainer>
  );
};

export default PromotionCode;
