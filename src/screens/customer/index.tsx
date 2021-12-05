import React, { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Card,
  Button,
  Modal,
  Radio,
  Space,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import ContentContainer from "component/container/content.container";
import { getCustomerListAction } from "domain/actions/customer/customer.action";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";

import {
  CustomerGroups,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { ChannelResponse } from "model/response/product/channel.response";
import { getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import CustomerListFilter from "screens/customer/component/CustomerListFilter";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { CustomerListPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";

import "screens/customer/customer.scss";

// Thêm nhập file sau
// import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import { StyledCustomer, StyledCustomerExtraButton } from "screens/customer/customerStyled";
import { showWarning } from "utils/ToastUtils";


const viewCustomerPermission = [CustomerListPermission.customers_read];
const createCustomerPermission = [CustomerListPermission.customers_create];
const exportCustomerPermission = [CustomerListPermission.customers_export];

const Customer = () => {
  const dispatch = useDispatch();

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
    {
      title: "Mã khách hàng",
      dataIndex: "code",
      visible: true,
      fixed: "left",
      render: (value: string, item: any) => (
        <Link to={`/customers/${item.id}`}>{value}</Link>
      ),
      width: 150,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "full_name",
      visible: true,
      width: 150,
      render: (value: string, item: any) => (
        <span className="customer-name-textoverflow">{item.full_name}</span>
      ),
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      visible: true,
      width: 150,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
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
      visible: true,
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      visible: true,
      width: 150,
    },
    {
      title: "Loại khách hàng",
      dataIndex: "customer_type",
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
      visible: true,
      width: 150,
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      visible: true,
      width: 150,
      render: (value: string) => (
        <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>
      ),
    },
    {
      title: "Ngày cưới",
      dataIndex: "wedding_date",
      visible: true,
      width: 150,
      render: (value: string) => (
        <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>
      ),
    },
    {
      title: "website/facebook",
      dataIndex: "website",
      visible: false,
      width: 150,
    },
    {
      title: "Ngày kích hoạt thẻ",
      dataIndex: "",
      visible: false,
      width: 150,
    },
    {
      title: "Ngày hết hạn thẻ",
      dataIndex: "",
      visible: false,
      width: 150,
    },
    {
      title: "Cửa hàng kích hoạt",
      dataIndex: "",
      visible: false,
      width: 150,
    },
    {
      title: "Mã số thẻ",
      dataIndex: "",
      visible: false,
      width: 150,
    },
    {
      title: "Đơn vị",
      dataIndex: "company",
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

  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    setIsLoading(false);
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
    setIsLoading(true);
    dispatch(getCustomerListAction(query, setResult));
  }, [dispatch, query, setResult]);
  

  const onFilterClick = React.useCallback((values: CustomerSearchQuery) => {
    let newPrams = { ...query, ...values, page: 1 };
    setQuery(newPrams);
  }, [query]);

  const onClearFilterAdvanceClick = React.useCallback(() => {
    setQuery(params);
  }, [params]);


  // handle export file
  const [isVisibleExportModal, setIsVisibleExportModal] = useState(false);
  const [exportAll, setExportAll] = useState(true);
  
  const handleExportFile = () => {
    setIsVisibleExportModal(true);
  }

  const onChangeExportOption = (e: any) => {
    setExportAll(e.target.value);
  }

  const okExportModal = () => {
    setIsVisibleExportModal(false);
    setExportAll(true);
    showWarning("Sẽ tải dữ liệu xuống sau bạn nhé!");
  }

  const cancelExportModal = () => {
    setIsVisibleExportModal(false);
    setExportAll(true);
  }
  // end handle export file
  
  // Thêm nhập file sau
  // handle import file
  // const handleImportFile = () => {
  //   showWarning("Sẽ làm chức năng này sau bạn nhé!");
  // }
  // end handle import file
  


  return (
    <StyledCustomer>
      <ContentContainer
        title="Danh sách khách hàng"
        extra={
          <StyledCustomerExtraButton>
            {/* Thêm nhập file sau */}
            {/* <Button
              className="import-file-button"
              disabled={isLoading}
              size="large"
              icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={handleImportFile}
            >
              Nhập file
            </Button> */}

            {allowExportCustomer &&
              <Button
                className="export-file-button"
                disabled={isLoading}
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={handleExportFile}
              >
                Xuất file
              </Button>
            }

            {allowCreateCustomer &&
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
            }
          </StyledCustomerExtraButton>
        }
      >
        <AuthWrapper acceptPermissions={viewCustomerPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <Card>
              <CustomerListFilter
                onClearFilter={onClearFilterAdvanceClick}
                onFilter={onFilterClick}
                isLoading={isLoading}
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
                bordered
                isLoading={isLoading}
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
            </Card>
            : <NoPermission />)}
        </AuthWrapper>

        <Modal
          width="600px"
          visible={isVisibleExportModal}
          title="Xuất excel dữ liệu khách hàng"
          okText="Xuất dữ liệu"
          cancelText="Đóng"
          onCancel={cancelExportModal}
          onOk={okExportModal}
        >
          <Radio.Group onChange={onChangeExportOption} value={exportAll}>
            <Space direction="vertical">
              <Radio value={false}>Tải trang hiện tại</Radio>
              <Radio value={true}>Tải tất cả các trang</Radio>
            </Space>
          </Radio.Group>
        </Modal>

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
    </StyledCustomer>
  );
};

export default Customer;