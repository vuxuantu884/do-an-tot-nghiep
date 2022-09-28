import exportIcon from "assets/icon/export.svg";
import { Button, Card, Modal, Space, Spin } from "antd";
import ContentContainer from "component/container/content.container";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { StyledComponent } from "./style";
import DailyRevenueFilter from "../components/Filter";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { useDispatch } from "react-redux";
import { Link, useHistory, withRouter } from "react-router-dom";
import UrlConfig from "config/url.config";
import { DailyRevenueTableModel, RevenueSearchQuery } from "model/revenue";
import { generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { PageResponse } from "model/base/base-metadata.response";
import DailyRevenueTableComponent from "../components/DailyRevenueTable";
import {
  confirmPayMoneyDailyRevenueService,
  getDailyRevenueService,
  refreshDailyRevenueService,
} from "service/daily-revenue";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { showError, showModalError, showModalSuccess, showModalWarning } from "utils/ToastUtils";
import { MenuAction } from "component/table/ActionButton";
import { DAILY_REVENUE_IMPORT } from "utils/Constants";
import queryString from "query-string";
import useAuthorization from "hook/useAuthorization";
import { DAILY_REVENUE_PERMISSIONS } from "config/permissions/daily-revenue.permission";
import DailyRevenueExport from "../components/DailyRevenueExport";
import { dailyRevenueService } from "service/order/daily-revenue.service";
import { dailyRevenueStatus } from "../helper";

type Props = { location: any };

const ACTION_ID = {
  PAYMENT_CONFIRM: 1,
  REVENUE_UPDATE: 2,
};

let itemResult: DailyRevenueTableModel[] = [];

let initQueryDefault: RevenueSearchQuery = {
  page: 1,
  limit: 30,
  ids: [],
  store_ids: [],
  states: [],
  date: null,
  created_at_min: null,
  created_at_max: null,
  opened_at_max: null,
  opened_at_min: null,
  closed_at_min: null,
  closed_at_max: null,
  opened_bys: [],
  closed_bys: [],
  remaining_amount_min: null,
  remaining_amount_max: null,
};

const DailyRevenueListScreen: React.FC<Props> = (props: Props) => {
  const { location } = props;
  const queryParamsParsed: any = queryString.parse(location.search);
  const dispatch = useDispatch();
  const history = useHistory();
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const [stores, setStores] = useState<StoreResponse[]>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [params, setPrams] = useState<RevenueSearchQuery>({
    ...initQueryDefault,
  });
  const [data, setData] = useState<PageResponse<DailyRevenueTableModel>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRow, setSelectedRow] = useState<DailyRevenueTableModel[]>([]);

  const [visibleExport, setVisibleExport] = useState<boolean>(false);

  itemResult = data.items;

  const [allowDailyPaymentsExport] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_export],
  });

  const [allowDailyPaymentsImportPayment] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_import_payment],
  });
  const [allowDailyPaymentsImportOtherPayment] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_import_other_payment],
  });
  const [allowDailyPaymentsConfirm] = useAuthorization({
    acceptPermissions: [DAILY_REVENUE_PERMISSIONS.daily_payments_confirm],
  });

  const actions: MenuAction[] = useMemo(
    () => [
      {
        id: ACTION_ID.PAYMENT_CONFIRM,
        name: "Xác nhận nộp tiền",
        disabled: selectedRowKeys.length === 0 || !allowDailyPaymentsConfirm ? true : false,
      },
      {
        id: ACTION_ID.REVENUE_UPDATE,
        name: "Cập nhật doanh thu",
        disabled: selectedRowKeys.length === 0,
      },
    ],
    [selectedRowKeys, allowDailyPaymentsConfirm],
  );

  const clearSelectRow = () => {
    setSelectedRowKeys([]);
    setSelectedRow([]);
  };

  const onFilter = useCallback(
    (values: any) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam !== queryParam) {
        history.replace(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
        setPrams({ ...newPrams });
        clearSelectRow();
      }
    },
    [history, params],
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQueryDefault);
    let queryParam = generateQuery(initQueryDefault);
    history.replace(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
  }, [history]);

  const fetchData = useCallback((dataQuery: RevenueSearchQuery) => {
    setTableLoading(true);
    setPrams(dataQuery);
    getDailyRevenueService(dataQuery)
      .then((response) => {
        if (response.status === 200) {
          const totalData = Number(response.headers["x-total-count"]);
          setData({
            metadata: {
              limit: dataQuery.limit || 30,
              page: dataQuery.page || 1,
              total: totalData,
            },
            items: response.data,
          });
          setTableLoading(false);
        } else {
          showError(`Danh sách tổng kết ca: ${response?.data?.message}`);
        }
      })
      .catch()
      .finally(() => {
        setTableLoading(false);
      });
  }, []);

  const setDataAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  };

  const handlePaymentConfirm = useCallback(() => {
    (async () => {
      let success = 0;
      let error: any = [];
      setTableLoading(true);
      await Promise.all(
        selectedRowKeys.map(async (p, index) => {
          const result = await confirmPayMoneyDailyRevenueService(p);
          if (result?.status && result?.status !== 200) {
            error.push(` Mã phiếu ${p}: ${result?.data?.detail}`);
          } else {
            const indexOrder = itemResult.findIndex((item: any) => item.id === result?.data.id);
            if (indexOrder !== -1) {
              itemResult[indexOrder].state = result?.data?.state;
            }
            success += 1;
          }
        }),
      );
      setTableLoading(false);
      if (success === selectedRowKeys.length) {
        showModalSuccess(`Xác nhận nộp tiền thành công ${success}/${selectedRowKeys.length}`);
        setData({
          ...data,
          items: itemResult,
        });
      } else {
        showModalWarning(
          <div className="yody-modal">
            <p>
              Xác nhận nộp tiền thành công{" "}
              <b>
                {success}/{selectedRowKeys.length}
              </b>
            </p>
            <div className="notification-detail">
              {error.map((p: any) => (
                <p>{p}</p>
              ))}
            </div>
          </div>,
        );
      }
    })();
  }, [data, selectedRowKeys]);

  const setModalMessage = (
    modal: any,
    type: "success" | "warning",
    content: JSX.Element,
    okDisabled?: boolean,
  ) => {
    modal.update({
      title: type === "success" ? "Thông báo" : type === "warning" ? "Cảnh báo" : null,
      icon:
        type === "success" ? (
          <CheckCircleOutlined />
        ) : type === "warning" ? (
          <WarningOutlined />
        ) : null,
      type: type,
      content: content,
      okButtonProps: {
        disabled: okDisabled,
      },
    });
  };

  const handleRevenueUpdate = useCallback(() => {
    (() => {
      let success = 0;
      let error: string[] = [];
      setTableLoading(true);
      const draffData = selectedRowKeys.filter((p) =>
        selectedRow.some((p1) => p1.id === p && p1.state === dailyRevenueStatus.draft.value),
      );
      const modal = Modal.success({});

      const handleCallRefresh = (i: number) => {
        const v = draffData[i];
        refreshDailyRevenueService(v)
          .then((response) => {
            if (response?.status && response?.status !== 200) {
              error.push(` Mã phiếu ${v}: cập nhật doanh thu thất bại`);
            } else {
              success += 1;
            }

            if (error.length === 0) {
              setModalMessage(
                modal,
                "success",
                <>
                  Cập nhật doanh thu thành công {success}/{draffData.length}
                </>,
                draffData.length - 1 > i,
              );
            } else {
              setModalMessage(
                modal,
                "warning",
                <div className="yody-modal">
                  <p>
                    Cập nhật doanh thu thành công{" "}
                    <b>
                      {success}/{draffData.length}
                    </b>
                  </p>
                  <div className="notification-detail">
                    {error.map((p: any) => (
                      <p>{p}</p>
                    ))}
                  </div>
                </div>,
                draffData.length - 1 > i,
              );
            }

            if (draffData.length - 1 > i) {
              handleCallRefresh(i + 1);
            } else {
              setTableLoading(false);
              fetchData({ ...params });
            }
          })
          .catch(() => {});
      };

      handleCallRefresh(0);
    })();
  }, [selectedRowKeys, selectedRow, fetchData, params]);

  const menuActionClick = useCallback(
    (id: number) => {
      if (selectedRowKeys.length === 0) {
        showModalError("Vui lòng chọn phiếu tổng kết ca");
        return;
      }

      switch (id) {
        case ACTION_ID.PAYMENT_CONFIRM:
          if (!allowDailyPaymentsConfirm) {
            showModalError(
              "Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ bộ phận hỗ trợ!",
            );
            break;
          }
          handlePaymentConfirm();
          break;
        case ACTION_ID.REVENUE_UPDATE:
          const notDraffData = selectedRow.filter(
            (p) => p.state !== dailyRevenueStatus.draft.value,
          );
          if (notDraffData.length !== 0) {
            Modal.confirm({
              title: "Cảnh báo",
              icon: <ExclamationCircleOutlined />,
              content: (
                <div className="yody-modal">
                  <p>
                    Không thể cập nhật doanh thu cho phiếu không ở trạng thái <b>MỚI</b>
                  </p>
                  <p>
                    Không hợp lệ ({notDraffData.length}/{selectedRow.length})
                  </p>
                </div>
              ),
              okText: "Tiếp tục",
              okType: "primary",
              cancelText: "Đóng",
              okButtonProps: {
                disabled: notDraffData.length === selectedRowKeys.length,
              },
              onOk() {
                handleRevenueUpdate();
              },
              onCancel() {
                console.log("Cancel");
              },
            });
            return;
          }
          handleRevenueUpdate();
          break;
        default:
          break;
      }
    },
    [
      handlePaymentConfirm,
      handleRevenueUpdate,
      selectedRowKeys.length,
      allowDailyPaymentsConfirm,
      selectedRow,
    ],
  );

  useEffect(() => {
    dispatch(StoreGetListAction(setStores));
    dispatch(searchAccountPublicAction({ limit: 30 }, setDataAccounts));
  }, [dispatch]);

  // useEffect(() => {
  //   let pagingParam: PagingParam = {
  //     perPage: Number(params.limit) || 30,
  //     currentPage: Number(params.page) || 1,
  //   };
  //   const dataResult = getDataTable(pagingParam);

  //   console.log("dataResult", dataResult);
  //   setData({
  //     metadata: {
  //       limit: dataResult.pserPage,
  //       page: dataResult.currentPage,
  //       total: dataResult.total,
  //     },
  //     items: dataResult.result,
  //   });
  // }, [params]);

  useEffect(() => {
    let paramDefault: RevenueSearchQuery = getQueryParamsFromQueryString(
      queryParamsParsed,
    ) as RevenueSearchQuery;
    let dataQuery: RevenueSearchQuery = {
      ...initQueryDefault,
      ...paramDefault,
      limit: paramDefault?.limit ? Number(paramDefault.limit) : initQueryDefault.limit,
      page: paramDefault?.page ? Number(paramDefault.page) : initQueryDefault.page,
    };
    fetchData(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, location.search, fetchData]);

  return (
    <ContentContainer
      title="Danh sách phiếu tổng kết ca"
      breadcrumb={[{ name: "Tổng kết ca" }, { name: "Danh sách phiếu" }]}
      extra={
        <React.Fragment>
          <Space size={8}>
            <Button
              icon={<img src={exportIcon} alt="" style={{ marginRight: 8 }} />}
              size="large"
              hidden={!allowDailyPaymentsExport}
              onClick={() => setVisibleExport(true)}
            >
              Xuất file
            </Button>
            <Link
              to={`${UrlConfig.DAILY_REVENUE}/import/${DAILY_REVENUE_IMPORT.OTHER_PAYMENT}`}
              hidden={!allowDailyPaymentsImportOtherPayment}
            >
              <Button
                icon={<UploadOutlined style={{ marginRight: 8 }} />}
                size="large"
                type="primary"
              >
                Nhập file thu chi
              </Button>
            </Link>
            <Link
              to={`${UrlConfig.DAILY_REVENUE}/import/${DAILY_REVENUE_IMPORT.CONFIRM_PAYMENT}`}
              hidden={!allowDailyPaymentsImportPayment}
            >
              <Button
                icon={<UploadOutlined style={{ marginRight: 8 }} />}
                size="large"
                type="primary"
              >
                Nhập file nhận tiền
              </Button>
            </Link>
          </Space>
        </React.Fragment>
      }
    >
      <StyledComponent>
        <Card>
          <DailyRevenueFilter
            stores={stores}
            onFilter={onFilter}
            params={params}
            accounts={accounts}
            onClearFilter={onClearFilter}
            menuActionClick={menuActionClick}
            actions={actions}
          />
          <DailyRevenueTableComponent
            params={params}
            setParams={setPrams}
            setData={setData}
            data={data}
            tableLoading={tableLoading}
            stores={stores}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedRow={setSelectedRow}
            selectedRow={selectedRow}
          />
        </Card>
        <DailyRevenueExport
          selectedItems={selectedRowKeys}
          params={params}
          totalSearchQuery={data.metadata.total}
          visible={visibleExport}
          setVisible={setVisibleExport}
        />
      </StyledComponent>
    </ContentContainer>
  );
};

export default withRouter(DailyRevenueListScreen);
