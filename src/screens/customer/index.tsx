import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { Card, Button, Modal, Radio, Space, Progress } from "antd";
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

import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import {
  StyledCustomer,
  StyledCustomerExtraButton,
} from "screens/customer/customerStyled";
import { showError, showSuccess } from "utils/ToastUtils";
import { generateQuery } from "utils/AppUtils";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import ImportCustomerFile from "screens/customer/import-file/ImportCustomerFile";

import { StyledModalFooter } from "screens/ecommerce/common/commonStyle";
import { getQueryParams, useQuery } from "../../utils/useQuery";
// import { getListSourceRequest } from "domain/actions/product/source.action";
// import { SourceResponse } from "model/response/order/source.response";

const viewCustomerPermission = [CustomerListPermission.customers_read];
const createCustomerPermission = [CustomerListPermission.customers_create];
const exportCustomerPermission = [CustomerListPermission.customers_export];

const Customer = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();

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
  const initQuery: CustomerSearchQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      request: "",
      gender: null,
      customer_group_ids: [],
      customer_level_ids: [],
      responsible_staff_codes: null,
      customer_type_ids: [],
      assign_store_ids: [],
      store_ids: [],
      channel_ids: [],
      day_of_birth_from: undefined,
      day_of_birth_to: undefined,
      month_of_birth_from: undefined,
      month_of_birth_to: undefined,
      year_of_birth_from: undefined,
      year_of_birth_to: undefined,
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
      store_of_first_order_ids: [],
      store_of_last_order_ids: [],
      number_of_days_without_purchase_from: undefined,
      number_of_days_without_purchase_to: undefined,
      point_from: undefined,
      point_to: undefined,
      first_order_time_from: null,
      first_order_time_to: null,
      last_order_time_from: null,
      last_order_time_to: null,

      from_birthday: null,
      to_birthday: null,
      company: null,
      from_wedding_date: null,
      to_wedding_date: null,
      customer_level_id: undefined,
      ...getQueryParams(query),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [params, setParams] = useState<CustomerSearchQuery>(initQuery);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Array<any>>(
    []
  );

  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [groups, setGroups] = useState<Array<any>>([]);
  const [types, setTypes] = useState<Array<any>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
  // const [listSource, setListSource] = useState<Array<SourceResponse>>([]);

  const [columns, setColumn] = useState<Array<ICustomTableColumType<any>>>([
    {
      title: "Mã khách hàng",
      dataIndex: "code",
      visible: true,
      fixed: "left",
      render: (value: string, item: any) => (
        <Link to={`/customers/${item.id}`}>{value}</Link>
      ),
      width: 90,
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
      width: 90,
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
      width: 60,
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
      width: 100,
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthday",
      visible: true,
      width: 80,
      render: (value: string) => (
        <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>
      ),
    },
    {
      title: "Ngày cưới",
      dataIndex: "wedding_date",
      visible: true,
      width: 80,
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

  const reloadPage = () => {
    window.location.reload();
  }

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
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      history.push(`${UrlConfig.CUSTOMER}?${queryParam}`);
    },
    [history, params]
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

  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);

  React.useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(StoreGetListAction(setStore));
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(getListChannelRequest(setListChannel));
    // dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  React.useEffect(() => {
    setIsLoading(true);
    dispatch(getCustomerListAction(params, setResult));
  }, [dispatch, params, setResult]);

  const onFilter = useCallback(
    (values: CustomerSearchQuery) => {
      let newPrams = { ...params, ...values, page: 1 };
      setParams(newPrams);
    },
    [params]
  );

  const onClearAdvancedFilter = useCallback(() => {
    setParams(initQuery);
  }, [initQuery]);

  // handle export file
  const [isVisibleExportModal, setIsVisibleExportModal] = useState(false);
  const [isVisibleWarningExportModal, setIsVisibleWarningExportModal] =
    useState(false);
  const [exportAll, setExportAll] = useState(true);
  const [exportCodeList, setExportCodeList] = useState<Array<any>>([]);

  const handleExportFile = () => {
    setExportProgress(0);
    setIsVisibleExportModal(true);
  };

  const onChangeExportOption = (e: any) => {
    setExportAll(e.target.value);
  };

  // warning export 10k customers
  const onOkWarningExportModal = () => {
    setIsVisibleWarningExportModal(false);
  };

  const onCancelWarningExportModal = () => {
    setIsVisibleWarningExportModal(false);
    cancelExportModal();
  };

  const onOkExportModal = () => {
    if (exportAll && data?.metadata.total >= 10000) {
      setIsVisibleWarningExportModal(true);
    } else {
      okExportModal();
    }
  };

  const okExportModal = () => {
    let newParams = { ...params };
    if (exportAll) {
      newParams.limit = undefined;
      newParams.page = undefined;
    }
    const exportParams = generateQuery(newParams);

    exportFile({
      conditions: exportParams,
      type: "EXPORT_CUSTOMER",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setIsVisibleProgressModal(true);
          cancelExportModal();
          setExportCodeList([...exportCodeList, response.data.code]);
        }
      })
      .catch((error) => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  };

  const cancelExportModal = () => {
    setIsVisibleExportModal(false);
    setExportAll(true);
  };

  // process export modal
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const onCancelProgressModal = () => {
    setExportCodeList([]);
    setIsVisibleProgressModal(false);
  };

  const checkExportFile = useCallback(() => {
    let getFilePromises = exportCodeList.map((code) => {
      return getFile(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          response.data.total > 0
        ) {
          if (!!response.data.url) {
            const newExportCode = exportCodeList.filter((item) => {
              return item !== response.data.code;
            });
            setExportCodeList(newExportCode);
            setExportProgress(100);
            setIsVisibleProgressModal(false);
            showSuccess("Xuất file dữ liệu khách hàng thành công!");
            window.open(response.data.url);
          } else {
            if (response.data.num_of_record >= response.data.total) {
              setExportProgress(99);
            } else {
              const percent = Math.floor(
                (response.data.num_of_record / response.data.total) * 100
              );
              setExportProgress(percent);
            }
          }
        }
      });
    });
  }, [exportCodeList]);

  useEffect(() => {
    if (exportProgress === 100 || exportCodeList.length === 0) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, exportProgress, exportCodeList]);
  // end handle export file

  // handle import file
  const [isVisibleImportModal, setIsVisibleImportModal] = useState(false);

  const handleImportFile = () => {
    setIsVisibleImportModal(true);
  }

  const onOkImportCustomerFile = () => {
    setIsVisibleImportModal(false);
    reloadPage();
  }

  const onCancelImportCustomerFile = () => {
    setIsVisibleImportModal(false);
  }
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
              onClick={handleImportFile}>
              Nhập file
            </Button>

            {allowExportCustomer && (
              <Button
                className="export-file-button"
                disabled={isLoading}
                size="large"
                icon={
                  <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
                }
                onClick={handleExportFile}>
                Xuất file
              </Button>
            )}

            {allowCreateCustomer && (
              <Link to={`${UrlConfig.CUSTOMER}/create`}>
                <Button
                  disabled={isLoading}
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<PlusOutlined />}>
                  Thêm khách hàng mới
                </Button>
              </Link>
            )}
          </StyledCustomerExtraButton>
        }>
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
        {isVisibleImportModal &&
          <ImportCustomerFile
            onCancel={onCancelImportCustomerFile}
            onOk={onOkImportCustomerFile}
          />
        }

        {/* Export customer data */}
        <Modal
          centered
          width="600px"
          visible={isVisibleExportModal}
          title="Xuất excel dữ liệu khách hàng"
          okText="Xuất dữ liệu"
          cancelText="Đóng"
          onCancel={cancelExportModal}
          onOk={onOkExportModal}
          maskClosable={false}>
          <Radio.Group onChange={onChangeExportOption} value={exportAll}>
            <Space direction="vertical">
              <Radio value={false}>Tải trang hiện tại</Radio>
              <Radio value={true}>Tải tất cả các trang</Radio>
            </Space>
          </Radio.Group>
        </Modal>

        {/* Warning export customer data */}
        <Modal
          centered
          width="600px"
          visible={isVisibleWarningExportModal}
          title=""
          closable={false}
          maskClosable={false}
          footer={
            <StyledModalFooter>
              <Button danger onClick={onCancelWarningExportModal}>
                Thoát
              </Button>

              <Button type="primary" onClick={onOkWarningExportModal}>
                Đồng ý
              </Button>
            </StyledModalFooter>
          }>
          <div>
            Để đảm bảo hệ thống và tốc độ tải dữ liệu, xin vui lòng xuất dưới{" "}
            <b>10.000</b> khách hàng.
          </div>
          <div>Xin cảm ơn!</div>
        </Modal>

        {/* Progress export customer data */}
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file"
          centered
          width={600}
          footer={[
            <Button key="cancel" type="primary" onClick={onCancelProgressModal}>
              Thoát
            </Button>,
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              Đang tạo file, vui lòng đợi trong giây lát
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </div>
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
