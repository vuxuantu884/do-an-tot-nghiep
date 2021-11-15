import React, {useCallback, useEffect, useState} from "react";
import "./discount.scss";
import UrlConfig from "../../../config/url.config";
import ContentContainer from "../../../component/container/content.container";
import {Button, Card, Col, Dropdown, Menu, Row} from "antd";
import CustomTable, {ICustomTableColumType} from "../../../component/table/CustomTable";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {DiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";
import {Link} from "react-router-dom";
import {getListDiscount} from "../../../domain/actions/promotion/discount/discount.action";
import {bulkDisablePriceRules, bulkEnablePriceRules} from "../../../service/promotion/discount/discount.service";
import {useDispatch} from "react-redux";
import moment from "moment";
import {DATE_FORMAT} from "../../../utils/DateUtils";
import {EditOutlined, PlusOutlined} from "@ant-design/icons";
import {DiscountSearchQuery} from "../../../model/query/discount.query";
import DiscountFilter from "./components/DiscountFilter";
import {getQueryParams, useQuery} from "../../../utils/useQuery";
import {showError, showSuccess} from "../../../utils/ToastUtils";
import {PROMO_TYPE} from "utils/Constants";
import {ACTIONS_DISCOUNT, STATUS_PROMO} from "../constant";
import {RiDeleteBin2Fill} from "react-icons/all";
import useAuthorization from "hook/useAuthorization";
import {PromoPermistion} from "config/permissions/promotion.permisssion";
import NoPermission from "screens/no-permission.screen";
import {MenuAction} from "component/table/ActionButton";

const DiscountPage = () => {
  const discountStatuses = STATUS_PROMO;
  const [actions, setActions] = useState<Array<MenuAction>>(ACTIONS_DISCOUNT);
  const initQuery: DiscountSearchQuery = {
    type: PROMO_TYPE.AUTOMATIC,
    request: "",
    from_created_date: "",
    to_created_date: "",
    state: null,
    applied_shop: "",
    applied_source: "",
    customer_category: "",
    discount_method: "",
  };
  const dispatch = useDispatch();
  const query = useQuery();

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<PageResponse<DiscountResponse> | null>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  let dataQuery: DiscountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  //phân quyền
  const [allowReadPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.READ],
  });
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });

  const fetchData = useCallback((data: PageResponse<DiscountResponse>) => {
    setTimeout(() => {
      setDiscounts(data);
      setTableLoading(false);
    }, 1500);
  }, []);

  useEffect(() => {
    dispatch(getListDiscount(params, fetchData));
    // dispatch(StoreGetListAction(setStore));
    // dispatch(getListSourceRequest(setListSource));
    // dispatch(actionFetchListCustomerGroup({},
    //   (data: CustomerGroupResponseModel) => setCustomerGroups(data.items),
    // ));
  }, [dispatch, fetchData, params]);

  useEffect(() => {
    setTableLoading(true);
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params]);

  useEffect(() => {
    setActions([...ACTIONS_DISCOUNT]);
    if (!allowCancelPromoCode)
      setActions([...ACTIONS_DISCOUNT.filter((e) => e.id !== 1 && e.id !== 2)]);
  }, [allowCancelPromoCode]);

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "9%",
      render: (value: any, item: any, index: number) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${value.id}`}
          style={{color: "#2A2A86", fontWeight: 500}}
        >
          {value.code}
        </Link>
      ),
    },
    {
      title: "Tên chương trình",
      visible: true,
      fixed: "left",
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
      fixed: "left",
      align: "center",
      render: (value: any, item: any, index: number) => (
        <div>{`${
          item.starts_date && moment(item.starts_date).format(DATE_FORMAT.DDMMYY_HHmm)
        } - ${
          item.ends_date ? moment(item.ends_date).format(DATE_FORMAT.DDMMYY_HHmm) : "∞"
        }`}</div>
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      fixed: "left",
      align: "center",
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: "state",
      align: "center",
      width: "12%",
      render: (value: any, item: any, index: number) => {
        const status: any | null = discountStatuses.find((e) => e.code === value);
        return <div style={status?.style}>{status?.value}</div>;
      },
    },
    {
      visible: true,
      fixed: "left",
      dataIndex: "status",
      align: "center",
      width: "12%",
      render: (value: any, item: any, index: number) => (
        <Dropdown.Button
          overlay={
            <Menu>
              <Menu.Item disabled icon={<EditOutlined />}>
                Chỉnh sửa
              </Menu.Item>
              <Menu.Item
                disabled
                icon={<RiDeleteBin2Fill />}
                onClick={async () => {
                  setTableLoading(true);
                  const deleteResponse = await bulkDisablePriceRules({ids: [item.id]});
                  if (deleteResponse.code === 20000000) {
                    setTimeout(() => {
                      showSuccess("Thao tác thành công");
                      dispatch(getListDiscount(params, fetchData));
                    }, 2000);
                  } else {
                    showError(`${deleteResponse.code} - ${deleteResponse.message}`);
                  }
                }}
              >
                Tạm ngừng
              </Menu.Item>
            </Menu>
          }
        />
      ),
    },
  ];

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({...params, page, limit});
    },
    [params],
  );

  const onFilter = useCallback(
    (values) => {
      let newParams = {...params, ...values, page: 1};
      setParams({...newParams});
    },
    [params],
  );

  const onMenuClick = useCallback(
    async (index: number) => {
      setTableLoading(true);
      const body = {ids: selectedRowKey};
      switch (index) {
        case 1:
          const bulkEnableResponse = await bulkEnablePriceRules(body);
          if (bulkEnableResponse.code === 20000000) {
            setTimeout(() => {
              showSuccess("Thao tác thành công");
              dispatch(getListDiscount(params, fetchData));
            }, 2000);
          } else {
            showError(`${bulkEnableResponse.code} - ${bulkEnableResponse.message}`);
          }
          break;
        case 2:
          const bulkDisableResponse = await bulkDisablePriceRules(body);
          if (bulkDisableResponse.code === 20000000) {
            setTimeout(() => {
              showSuccess("Thao tác thành công");
              dispatch(getListDiscount(params, fetchData));
            }, 2000);
          } else {
            showError(`${bulkDisableResponse.code} - ${bulkDisableResponse.message}`);
          }
          break;
        case 3:
          break;
      }
    },
    [dispatch, fetchData, params, selectedRowKey],
  );

  return (
    <>
      {allowReadPromoCode ? (
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
            allowCreatePromoCode ? (
              <Link to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`}>
                <Button
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Tạo mới khuyến mại
                </Button>
              </Link>
            ) : null
          }
        >
          <Card
            title={
              <div className="d-flex">
                <span className="tab-label">Danh sách chiết khấu</span>
              </div>
            }
          >
            <div>
              <DiscountFilter
                onMenuClick={onMenuClick}
                params={params}
                actions={actions}
                onFilter={onFilter}
              />
              <CustomTable
                selectedRowKey={selectedRowKey}
                onChangeRowKey={(rowKey) => setSelectedRowKey(rowKey)}
                isRowSelection
                isLoading={tableLoading}
                sticky={{offsetScroll: 5}}
                pagination={{
                  pageSize: discounts?.metadata.limit || 0,
                  total: discounts?.metadata.total || 0,
                  current: discounts?.metadata.page,
                  showSizeChanger: true,
                  onChange: onPageChange,
                  onShowSizeChange: onPageChange,
                }}
                dataSource={discounts?.items}
                columns={columns}
                rowKey={(item: any) => item.id}
              />
            </div>
          </Card>
        </ContentContainer>
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default DiscountPage;
