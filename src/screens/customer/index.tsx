import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertTimestampToDate, ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import ContentContainer from "component/container/content.container";
import { getCustomerListAction } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";

import { CustomerGroups, CustomerTypes } from "domain/actions/customer/customer.action";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { StoreResponse } from "model/core/store.model";
import { getListAllStoresSimpleAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { ChannelResponse } from "model/response/product/channel.response";
import { getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import CustomerListFilter from "screens/customer/component/CustomerListFilter";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";

import "screens/customer/customer.scss";

import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import { StyledCustomer, StyledCustomerExtraButton } from "screens/customer/customerStyled";
import { generateQuery, isNullOrUndefined } from "utils/AppUtils";
import ImportCustomerFile from "screens/customer/import-file/ImportCustomerFile";

import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import NumberFormat from "react-number-format";
import ExportCustomerFile from "screens/customer/export-file/ExportCustomerFile";
import { COLUMN_CONFIG_TYPE } from "utils/Constants";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import useSetTableColumns from "hook/table/useSetTableColumns";

const viewCustomerPermission = [CustomerListPermission.customers_read];
const createCustomerPermission = [CustomerListPermission.customers_create];
const exportCustomerPermission = [CustomerListPermission.customers_export];

const Customer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const [allowCreateCustomer] = useAuthorization({
    acceptPermissions: createCustomerPermission,
    not: false,
  });

  const [allowExportCustomer] = useAuthorization({
    acceptPermissions: exportCustomerPermission,
    not: false,
  });

  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const LIST_GENDER = bootstrapReducer.data?.gender;
  const initQuery: CustomerSearchQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      search_type: "LIST",
      request: "",
      gender: null,
      customer_group_ids: [],
      customer_level_ids: [],
      responsible_staff_codes: null,
      customer_type_ids: [],
      assign_store_ids: [],
      store_ids: [],
      source_ids: [],
      source_of_first_order_online_ids: [],
      source_of_last_order_online_ids: [],
      first_order_type: null,
      last_order_type: null,
      channel_ids: [],
      day_of_birth_from: undefined,
      day_of_birth_to: undefined,
      month_of_birth_from: undefined,
      month_of_birth_to: undefined,
      year_of_birth_from: undefined,
      year_of_birth_to: undefined,
      wedding_day_from: undefined,
      wedding_day_to: undefined,
      wedding_month_from: undefined,
      wedding_month_to: undefined,
      wedding_year_from: undefined,
      wedding_year_to: undefined,
      age_from: null,
      age_to: null,
      city_ids: [],
      district_ids: [],
      ward_ids: [],
      total_finished_order_from: undefined,
      total_finished_order_to: undefined,
      total_paid_amount_from: undefined,
      total_paid_amount_to: undefined,
      total_returned_order_from: undefined,
      total_returned_order_to: undefined,
      remain_amount_to_level_up_from: undefined,
      remain_amount_to_level_up_to: undefined,
      average_order_amount_from: undefined,
      average_order_amount_to: undefined,
      total_returned_amount_from: undefined,
      total_returned_amount_to: undefined,
      store_of_first_order_offline_ids: [],
      store_of_last_order_offline_ids: [],
      number_of_days_without_purchase_from: undefined,
      number_of_days_without_purchase_to: undefined,
      point_from: undefined,
      point_to: undefined,
      first_order_time_from: null,
      first_order_time_to: null,
      last_order_time_from: null,
      last_order_time_to: null,
      utm_source: null,
      utm_medium: null,
      utm_content: null,
      utm_term: null,
      utm_id: null,
      utm_campaign: null,

      from_birthday: null,
      to_birthday: null,
      company: null,
      from_wedding_date: null,
      to_wedding_date: null,
      customer_level_id: undefined,
    }),
    [],
  );

  const [params, setParams] = useState<CustomerSearchQuery>(initQuery);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Array<any>>([]);

  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [groups, setGroups] = useState<Array<any>>([]);
  const [types, setTypes] = useState<Array<any>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  // handle columns
  const [columns, setColumns] = useState<Array<ICustomTableColumType<any>>>([]);

  const initColumns: Array<ICustomTableColumType<any>> = useMemo(() => {
    return [
      {
        title: "Mã khách hàng",
        dataIndex: "code",
        key: "code",
        visible: true,
        fixed: "left",
        // align: "center",
        render: (value: string, item: any) => (
          <Link to={`/customers/${item.id}`}>{value ? value : item.id}</Link>
        ),
        width: 130,
      },
      {
        title: "Tên khách hàng",
        dataIndex: "full_name",
        key: "full_name",
        visible: true,
        width: 160,
        render: (value: string, item: any) => (
          <span className="customer-name-textoverflow">{item.full_name}</span>
        ),
      },
      {
        title: "SĐT",
        dataIndex: "phone",
        key: "phone",
        visible: true,
        width: 120,
        align: "center",
      },
      {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        visible: true,
        width: 80,
        align: "center",
        render: (value: any) => (
          <div>{LIST_GENDER?.find((item) => item.value === value)?.name}</div>
        ),
      },
      {
        title: "Ngày sinh",
        dataIndex: "birthday",
        key: "birthday",
        visible: true,
        width: 110,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Điểm",
        dataIndex: "point",
        key: "point",
        visible: true,
        width: 100,
        align: "center",
        render: (value: any) => (
          <div style={{ textAlign: "right" }}>
            {!isNullOrUndefined(value) ? (
              <NumberFormat value={value} displayType={"text"} thousandSeparator={true} />
            ) : (
              ""
            )}
          </div>
        ),
      },
      {
        title: "Hạng thẻ",
        dataIndex: "customer_level",
        key: "customer_level",
        visible: true,
        width: 90,
        align: "center",
      },
      {
        title: "Nhóm khách hàng",
        dataIndex: "customer_group",
        key: "customer_group",
        visible: true,
        width: 150,
        align: "center",
      },
      {
        title: "Tiền tích lũy",
        dataIndex: "total_paid_amount",
        key: "total_paid_amount",
        visible: true,
        width: 120,
        align: "center",
        render: (value: any) => (
          <div style={{ textAlign: "right" }}>
            {!isNullOrUndefined(value) ? (
              <NumberFormat value={value} displayType={"text"} thousandSeparator={true} />
            ) : (
              ""
            )}
          </div>
        ),
      },
      {
        title: "Ngày mua đầu",
        dataIndex: "first_order_time",
        key: "first_order_time",
        visible: true,
        width: 110,
        align: "center",
        render: (value: string) => <div>{ConvertTimestampToDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Ngày mua cuối",
        dataIndex: "last_order_time",
        key: "last_order_time",
        visible: true,
        width: 110,
        align: "center",
        render: (value: string) => <div>{ConvertTimestampToDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Loại khách hàng",
        dataIndex: "customer_type",
        key: "customer_type",
        visible: true,
        width: 150,
        align: "center",
      },
      {
        title: "Nhân viên phụ trách",
        dataIndex: "responsible_staff_code",
        key: "responsible_staff_code",
        visible: true,
        width: 180,
        align: "center",
        render: (value: string, item: any) => {
          const staff =
            (item.responsible_staff_code ? item.responsible_staff_code + " - " : "") +
            (item.responsible_staff ? item.responsible_staff : "");
          return <div>{staff}</div>;
        },
      },
      {
        title: "Ngày cưới",
        dataIndex: "wedding_date",
        key: "wedding_date",
        visible: true,
        width: 110,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Mã số thẻ",
        dataIndex: "card_number",
        key: "card_number",
        visible: false,
        width: 150,
        align: "center",
      },
      {
        title: "Ngày kích hoạt thẻ",
        dataIndex: "assigned_date",
        key: "assigned_date",
        visible: false,
        width: 110,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Cửa hàng kích hoạt",
        dataIndex: "assigned_store",
        key: "assigned_store",
        visible: false,
        width: 150,
        align: "center",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        visible: true,
        width: 200,
      },
      {
        title: "website/facebook",
        dataIndex: "website",
        key: "website",
        visible: false,
        width: 200,
      },
      {
        title: "Đơn vị",
        dataIndex: "company",
        key: "company",
        visible: false,
        width: 200,
      },
    ];
  }, [LIST_GENDER]);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns]);

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.CUSTOMER_COLUMNS,
  );
  useSetTableColumns(
    COLUMN_CONFIG_TYPE.CUSTOMER_COLUMNS,
    tableColumnConfigs,
    initColumns,
    setColumns,
  );
  // end handle columns

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const reloadPage = () => {
    window.location.reload();
  };

  const onSelectRow = useCallback((selectedRow) => {
    let selectedRowIds: Array<any> = [];
    selectedRow?.forEach((item: any) => {
      if (item) {
        selectedRowIds.push(item.id);
      }
    });
    setSelectedCustomerIds(selectedRowIds);
  }, []);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      const queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, params],
  );

  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns],
  );

  const setResult = React.useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);

  React.useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getListAllStoresSimpleAction(setStore));
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);

  const onFilter = useCallback(
    (values: CustomerSearchQuery) => {
      const newParams = { ...params, ...values, page: 1 };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(params);
      if (currentParam === queryParam) {
        getCustomerList(newParams);
      } else {
        history.push(`${location.pathname}?${queryParam}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, location.pathname, params],
  );

  const onClearAdvancedFilter = useCallback(() => {
    const queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, initQuery, location.pathname]);

  //get customer data
  const getCustomerList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setIsLoading(true);
      dispatch(getCustomerListAction(params, setResult));
    },
    [dispatch, setResult],
  );

  useEffect(() => {
    const dataQuery: CustomerSearchQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      first_order_time_from: queryParamsParsed.first_order_time_from,
      first_order_time_to: queryParamsParsed.first_order_time_to,
      last_order_time_from: queryParamsParsed.last_order_time_from,
      last_order_time_to: queryParamsParsed.last_order_time_to,
    };
    setParams(dataQuery);
    getCustomerList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  // handle export file
  const [isVisibleExportModal, setIsVisibleExportModal] = useState(false);

  const handleExportFile = () => {
    setIsVisibleExportModal(true);
  };

  const cancelExportModal = () => {
    setIsVisibleExportModal(false);
  };
  // end handle export file

  // handle import file
  const [isVisibleImportModal, setIsVisibleImportModal] = useState(false);

  const handleImportFile = () => {
    setIsVisibleImportModal(true);
  };

  const onOkImportCustomerFile = () => {
    setIsVisibleImportModal(false);
    reloadPage();
  };

  const onCancelImportCustomerFile = () => {
    setIsVisibleImportModal(false);
  };
  // end handle import file

  return (
    <StyledCustomer>
      <ContentContainer
        title="Danh sách khách hàng"
        extra={
          <StyledCustomerExtraButton>
            <Button
              className="import-file-button"
              disabled={isLoading}
              size="large"
              icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={handleImportFile}
            >
              Nhập file
            </Button>

            {allowExportCustomer && (
              <Button
                className="export-file-button"
                disabled={isLoading}
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={handleExportFile}
              >
                Xuất file
              </Button>
            )}

            {allowCreateCustomer && (
              <Link to={`${UrlConfig.CUSTOMER}/create`}>
                <Button
                  disabled={isLoading}
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Thêm khách hàng mới
                </Button>
              </Link>
            )}
          </StyledCustomerExtraButton>
        }
      >
        <AuthWrapper acceptPermissions={viewCustomerPermission} passThrough>
          {(allowed: boolean) =>
            allowed ? (
              <Card>
                <CustomerListFilter
                  onClearFilter={onClearAdvancedFilter}
                  onFilter={onFilter}
                  isLoading={isLoading}
                  params={params}
                  initQuery={initQuery}
                  selectedCustomerIds={selectedCustomerIds}
                  groups={groups}
                  types={types}
                  setShowSettingColumn={() => setShowSettingColumn(true)}
                  loyaltyUsageRules={loyaltyUsageRules}
                  listStore={listStore}
                  listChannel={listChannel}
                />

                <CustomTable
                  isRowSelection
                  bordered
                  isLoading={isLoading}
                  scroll={{ x: 0 }}
                  sticky={{ offsetScroll: 5, offsetHeader: 55 }}
                  pagination={{
                    pageSize: data.metadata?.limit,
                    total: data.metadata?.total,
                    current: data.metadata?.page,
                    showSizeChanger: true,
                    onChange: onPageChange,
                    onShowSizeChange: onPageChange,
                  }}
                  isShowPaginationAtHeader
                  onSelectedChange={(selectedRows) => onSelectRow(selectedRows)}
                  dataSource={data.items}
                  columns={columnFinal}
                  rowKey={(item: any) => item.id}
                />
              </Card>
            ) : (
              <NoPermission />
            )
          }
        </AuthWrapper>

        {/* Import customer file */}
        {isVisibleImportModal && (
          <ImportCustomerFile onCancel={onCancelImportCustomerFile} onOk={onOkImportCustomerFile} />
        )}

        <ExportCustomerFile
          isVisibleExportModal={isVisibleExportModal}
          cancelExportModal={cancelExportModal}
          customerData={data}
          params={params}
        />

        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => {
            setShowSettingColumn(false);
          }}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
            onSaveConfigTableColumn(data);
          }}
          data={columns}
        />
      </ContentContainer>
    </StyledCustomer>
  );
};

export default Customer;
