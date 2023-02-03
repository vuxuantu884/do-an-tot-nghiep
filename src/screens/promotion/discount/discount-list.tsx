import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Menu, Row } from "antd";
import threeDot from "assets/icon/three-dot.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import { MenuAction } from "component/table/ActionButton";
import { PriceRulesPermission } from "config/permissions/promotion.permisssion";
import useAuthorization from "hook/useAuthorization";
import { PriceRule, PriceRuleState } from "model/promotion/price-rules.model";
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  bulkDisablePriceRulesAction,
  bulkEnablePriceRulesAction,
  getListDiscountAction,
} from "domain/actions/promotion/discount/discount.action";
import { PageResponse } from "model/base/base-metadata.response";
import { DiscountSearchQuery } from "model/query/discount.query";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { ACTIONS_DISCOUNT, DISCOUNT_STATUS } from "../constants";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import DiscountFilter from "screens/promotion/discount/components/DiscountFilter";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import { FiCheckCircle } from "react-icons/fi";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { SourceResponse } from "model/response/order/source.response";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { ChannelResponse } from "model/response/product/channel.response";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { DiscountStyled } from "screens/promotion/discount/discount-style";

const DiscountPage = () => {
  const initQuery: DiscountSearchQuery = {
    limit: 30,
    page: 1,
    query: "",
    variant_id: null,
    product_id: null,
    states: [],
    priorities: [],
    entitled_methods: [],
    creators: [],
    store_ids: [],
    channels: [],
    source_ids: [],
    starts_date_min: "",
    starts_date_max: "",
    ends_date_min: "",
    ends_date_max: "",
  };

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<PageResponse<PriceRule>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [params, setParams] = useState<DiscountSearchQuery>(initQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);
  const [channelList, setChannelList] = useState<Array<ChannelResponse>>([]);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);

  /** phân quyền */
  const [allowUpdateDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.UPDATE],
  });
  const [allowActiveDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.ACTIVE],
  });
  /** */

  // handle get discount list
  const getDiscountListCallback = useCallback((data: PageResponse<PriceRule> | null) => {
    setTableLoading(false);
    if (data) {
      setDiscounts(data);
    }
  }, []);

  const getDiscountList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setTableLoading(true);
      dispatch(getListDiscountAction(params, getDiscountListCallback));
    },
    [dispatch, getDiscountListCallback],
  );

  useEffect(() => {
    const dataQuery: any = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setParams(dataQuery);
    getDiscountList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);
  // end handle get discount list

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListChannelRequest(setChannelList));
    dispatch(getListAllSourceRequest(setSourceList));
  }, [dispatch]);

  const actionFilter: Array<MenuAction> = useMemo(() => {
    if (selectedRowKey.length < 1) {
      return ACTIONS_DISCOUNT.map((e) => {
        e.disabled = true;
        return e;
      });
    } else if (selectedRowKey.length > 0) {
      return ACTIONS_DISCOUNT.map((e) => {
        e.disabled = false;
        return e;
      });
    }
    return ACTIONS_DISCOUNT;
  }, [selectedRowKey]);

  function onChangePriceRuleStatus(numberOfDisabled: number): void {
    if (numberOfDisabled) {
      showSuccess(`Cập nhật chiết khấu thành công`);
      dispatch(getListDiscountAction(params, setDiscounts));
    } else {
      showError(`Cập nhật chiết khấu thất bại`);
    }
    setTableLoading(false);
  }

  const handleDeactivatePriceRule = (idNumber: number) => {
    setTableLoading(true);

    dispatch(
      bulkDisablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) =>
        onChangePriceRuleStatus(numberOfDisabled),
      ),
    );
  };

  const handleActivatePriceRule = (idNumber: number) => {
    setTableLoading(true);

    dispatch(
      bulkEnablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) =>
        onChangePriceRuleStatus(numberOfDisabled),
      ),
    );
  };

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      render: (value: any, item: any, index: number) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${value.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
        >
          {value.code}
        </Link>
      ),
    },
    {
      title: "Tên chương trình",
      visible: true,
      dataIndex: "title",
    },
    {
      title: "Ưu tiên",
      visible: true,
      dataIndex: "priority",
      align: "center",

      render: (value: any) => (
        <Row justify="center">
          <Col>
            <div
              style={{
                background: "rgba(42, 42, 134, 0.1)",
                borderRadius: "5px",
                color: "#2A2A86",
                padding: "5px 10px",
                width: "fit-content",
              }}
            >
              {value}
            </div>
          </Col>
        </Row>
      ),
    },
    {
      title: "Thời gian",
      visible: true,
      align: "center",
      render: (value: any, item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      align: "center",
    },
    {
      title: "Trạng thái",
      visible: true,
      dataIndex: "state",
      align: "center",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e) => e.code === state)?.Component ?? (
          <Fragment />
        );
        return StatusTag;
      },
    },
    {
      visible: true,
      dataIndex: "id",
      align: "center",
      render: (id: number, item: any) => (
        <Dropdown.Button
          disabled={!allowUpdateDiscount && !allowActiveDiscount}
          overlay={
            <Menu>
              {allowUpdateDiscount &&
                <Menu.Item icon={<EditOutlined />} key={1}>
                  <Link to={`discounts/${id}/update`}>Chỉnh sửa</Link>
                </Menu.Item>
              }
              {allowActiveDiscount && (
                <>
                  {(item.state === PriceRuleState.DISABLED || item.state === PriceRuleState.PENDING) ? (
                    <Menu.Item
                      key={3}
                      icon={<FiCheckCircle />}
                      onClick={() => {
                        handleActivatePriceRule(id);
                      }}
                    >
                      Kích hoạt
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      key={3}
                      icon={<RiDeleteBin2Fill />}
                      onClick={() => {
                        handleDeactivatePriceRule(id);
                      }}
                    >
                      Tạm ngừng
                    </Menu.Item>
                  )}
                </>
              )}
            </Menu>
          }
          icon={<img src={threeDot} alt="" style={{ verticalAlign: "super" }} />}
        />
      ),
    },
  ];

  const onPageChange = (page: number, limit?: number) => {
    const newParams = { ...params, page, limit };
    const queryParam = generateQuery(newParams);
    history.push(`${location.pathname}?${queryParam}`);
  };

  const onFilter = (values: DiscountSearchQuery | Object) => {
    const newParams = { ...params, ...values, page: 1 };
    const queryParam = generateQuery(newParams);
    const currentParam = generateQuery(params);
    if (currentParam === queryParam) {
      getDiscountList(newParams);
    } else {
      history.push(`${location.pathname}?${queryParam}`);
    }
  };

  const onMenuClick = (index: number) => {
    setTableLoading(true);
    const body = { ids: selectedRowKey };
    switch (index) {
      case 1:
        dispatch(
          bulkEnablePriceRulesAction(body, (numberOfActived: any) => {
            if (typeof numberOfActived === "number") {
              showSuccess(
                `Đã kích hoạt thành công ${numberOfActived}/${selectedRowKey.length} chương trình`,
              );
              dispatch(getListDiscountAction(params, setDiscounts));
            }
          }),
        );
        setTableLoading(false);
        break;
      case 2:
        dispatch(
          bulkDisablePriceRulesAction(body, (numberOfActived: any) => {
            if (typeof numberOfActived === "number") {
              showSuccess(
                `Đã tạm ngưng thành công ${numberOfActived}/${selectedRowKey.length} chương trình`,
              );
              dispatch(getListDiscountAction(params, setDiscounts));
            }
          }),
        );
        setTableLoading(false);
        break;
      case 3:
        break;
    }
  };

  return (
    <ContentContainer
      title="Chiết khấu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[PriceRulesPermission.CREATE]}>
          <Link to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`}>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
            >
              Tạo mới khuyến mại
            </Button>
          </Link>
        </AuthWrapper>
      }
    >
      <DiscountStyled>
        <Card title={"Danh sách chiết khấu"}>
          <DiscountFilter
            onMenuClick={onMenuClick}
            initQuery={initQuery}
            params={params}
            actions={actionFilter}
            onFilter={onFilter}
            listStore={listStore}
            channelList={channelList}
            sourceList={sourceList}
          />
          <CustomTable
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => setSelectedRowKey(rowKey)}
            isRowSelection
            isLoading={tableLoading}
            sticky={{
              offsetScroll: 5,
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            pagination={{
              pageSize: discounts?.metadata.limit || 0,
              total: discounts?.metadata.total || 0,
              current: discounts?.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isShowPaginationAtHeader
            dataSource={discounts?.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </Card>
      </DiscountStyled>
    </ContentContainer>
  );
};

export default DiscountPage;
