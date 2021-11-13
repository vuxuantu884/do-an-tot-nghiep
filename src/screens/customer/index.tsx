import {
  Card,
  Button,
} from "antd";
import { ExportOutlined, ImportOutlined, PlusOutlined } from "@ant-design/icons";
import "./customer.scss";
import { RootReducerType } from "model/reducers/RootReducerType";

import ContentContainer from "component/container/content.container";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import UrlConfig from "config/url.config";
import { useDispatch } from "react-redux";
import { CustomerList } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { Link } from "react-router-dom";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { MenuAction } from "component/table/ActionButton";

import {
  CustomerGroups,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import CustomerListFilter from "./component/CustomerListFilter";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { ChannelResponse } from "model/response/product/channel.response";


const viewCustomerPermission = [CustomerListPermission.customers_read];
const createCustomerPermission = [CustomerListPermission.customers_create];
const exportCustomerPermission = [CustomerListPermission.customers_export];

const Customer = () => {
  const dispatch = useDispatch();
  // const history = useHistory();

  const [allowCreateCustomer] = useAuthorization({
    acceptPermissions: createCustomerPermission,
    not: false,
  });

  const [allowExportCustomer] = useAuthorization({
    acceptPermissions: exportCustomerPermission,
    not: false,
  });


  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_GENDER = bootstrapReducer.data?.gender;
  const params: CustomerSearchQuery = useMemo(
    () => ({
      request: "",
      page: 1,
      limit: 30,
      gender: null,
      from_birthday: null,
      to_birthday: null,
      company: null,
      from_wedding_date: null,
      to_wedding_date: null,
      customer_type_id: undefined,
      customer_group_id: undefined,
      customer_level_id: undefined,
      responsible_staff_code: null,
    }),
    []
  );
  const [query, setQuery] = useState<CustomerSearchQuery>({
    page: 1,
    limit: 30,
    request: null,
    gender: null,
    from_birthday: null,
    to_birthday: null,
    company: null,
    from_wedding_date: null,
    to_wedding_date: null,
    customer_type_id: undefined,
    customer_group_id: undefined,
    customer_level_id: undefined,
    responsible_staff_code: "",
  });


  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [groups, setGroups] = useState<Array<any>>([]);
  const [types, setTypes] = useState<Array<any>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([])
  
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<any>>
  >([
    // {
    //   title: "STT",
    //   key: "index",
    //   render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
    //   align: "center",
    //   visible: true,
    //   width: "3%",
    // },
    {
      title: "Mã khách hàng",
      dataIndex: "code",
      // align: "center",
      visible: true,
      fixed: "left",
      render: (value: string, i: any) => (
        <Link to={`/customers/${i.id}`}>{value}</Link>
      ),
      width: 150,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "full_name",
      // align: "left",
      visible: true,
      width: 150,
      render: (value: string, i: any) => (
        <span className="customer-name-textoverflow">{i.full_name}</span>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      // align: "center",
      visible: true,
      width: 150,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      // align: "center",
      render: (value: any, item: any) => (
        <div>
          {LIST_GENDER &&
            LIST_GENDER?.find((item) => item.value === value)?.name}
        </div>
      ),
      visible: true,
      width: 100,
    },
    {
      title: "Nhóm khách hàng",
      dataIndex: "customer_group",
      // align: "center",
      visible: true,
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      // align: "center",
      visible: true,
      width: 150,
    },

    {
      title: "Loại khách hàng",
      dataIndex: "customer_type",
      // align: "center",
      visible: true,
      width: 150,
    },
    {
      title: "Nhân viên phụ trách",
      dataIndex: "responsible_staff",
      visible: true,
      width: 150,
    },
    {
      title: "Hạng thẻ",
      dataIndex: "customer_level",
      // align: "center",
      visible: true,
      width: 150,
    },

    // {
    //   title: "Người tạo",
    //   dataIndex: "created_by",
    //   // align: "center",
    //   visible: false,
    //   // width: "15%",
    // },
    // {
    //   title: "Ngày tạo",
    //   dataIndex: "created_date",
    //   // align: "center",
    //   visible: false,
    //   // width: "15%",
    //   render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    // },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      // align: "center",
      visible: true,
      width: 150,
      render: (value: string) => (
        <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>
      ),
    },
    {
      title: "Ngày cưới",
      // dataIndex: "wedding_date",
      // align: "center",
      visible: true,
      width: 150,
      render: (value: string) => (
        <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>
      ),
    },
    {
      title: "website/facebook",
      dataIndex: "website",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Ngày kích hoạt thẻ",
      dataIndex: "",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Ngày hết hạn thẻ",
      dataIndex: "",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Cửa hàng kích hoạt",
      dataIndex: "",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Mã số thẻ",
      dataIndex: "",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Đơn vị",
      dataIndex: "company",
      // align: "center",
      visible: false,
      width: 150,
    },
    {
      title: "Điểm hiện tại",
      width: 100,
      dataIndex: "",
      visible: false,
    },
  ]);
  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [tableLoading, setTableLoading] = useState<boolean>(true);

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setResult = React.useCallback((result: PageResponse<any> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const [showSettingColumn, setShowSettingColumn] =
    useState<boolean>(false);

  React.useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(StoreGetListAction(setStore));
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);

  React.useEffect(() => {
    dispatch(CustomerList(query, setResult));
  }, [dispatch, query, setResult]);
  

  const onFilterClick = React.useCallback((values: CustomerSearchQuery) => {
    let newPrams = { ...query, ...values, page: 1 };
    setQuery(newPrams);
  }, [query]);

  const onClearFilterAdvanceClick = React.useCallback(() => {
    setQuery(params);
  }, [params]);


  const getAction = () => {
    const actions: Array<MenuAction> = [
      {
        id: 1,
        name: "Nhập file",
        icon:<ImportOutlined />
      }
    ]

    if (allowExportCustomer) {
      actions.push(
        {
          id: 2,
          name: "Xuất file",
          icon:<ExportOutlined />
        }
      )
    }

    return actions;
  }

  return (
    <ContentContainer
      title="Danh sách khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Danh sách khách hàng",
          path: `/customers`,
        },
      ]}
      extra={
        <>
          {allowCreateCustomer &&
            <Link to={`${UrlConfig.CUSTOMER}/create`}>
              <Button
                className="ant-btn-outline ant-btn-primary"
                size="large"
                icon={<PlusOutlined />}
              >
                Thêm khách hàng mới
              </Button>
            </Link>
          }
        </>
      }
    >
      <AuthWrapper acceptPermissions={viewCustomerPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <Card>
            <div className="padding-20 customer-search-filter">
              <CustomerListFilter
                actions={getAction()}
                onClearFilter={onClearFilterAdvanceClick}
                onFilter={onFilterClick}
                params={query}
                initQuery={params}
                groups={groups}
                types={types}
                setShowSettingColumn={() => setShowSettingColumn(true)}
                loyaltyUsageRules={loyaltyUsageRules}
                listStore={listStore}
                listChannel={listChannel}
              />
              
              <CustomTable
                isRowSelection
                isLoading={tableLoading}
                scroll={{ x: 2000 }}
                sticky={{ offsetScroll: 5, offsetHeader: 55 }}
                pagination={{
                  pageSize: data.metadata.limit,
                  total: data.metadata.total,
                  current: data.metadata.page,
                  showSizeChanger: true,
                  onChange: onPageChange,
                  onShowSizeChange: onPageChange,
                }}
                dataSource={data.items}
                columns={columnFinal}
                rowKey={(item: any) => item.id}
              />
            </div>
          </Card>
          : <NoPermission />)}
      </AuthWrapper>

      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => {
          setShowSettingColumn(false);
        }}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
    </ContentContainer>
  );
};

export default Customer;
