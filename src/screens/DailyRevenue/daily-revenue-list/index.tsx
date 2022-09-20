import exportIcon from "assets/icon/export.svg";
import { Button, Card, Space } from "antd";
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
import { confirmPayMoneyDailyRevenueService, getDailyRevenueService } from "service/daily-revenue";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import { UploadOutlined } from "@ant-design/icons";
import { showError, showModalError, showModalSuccess, showModalWarning } from "utils/ToastUtils";
import { MenuAction } from "component/table/ActionButton";
import { DAILY_REVENUE_IMPORT } from "utils/Constants";
import queryString from "query-string";
import useAuthorization from "hook/useAuthorization";
import { DAILY_REVENUE_PERMISSIONS } from "config/permissions/daily-revenue.permission";
import DailyRevenueExport from "../components/DailyRevenueExport";

type Props = { location: any };

const ACTION_ID = {
  PAYMENT_CONFIRM: 1,
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
    ],
    [selectedRowKeys, allowDailyPaymentsConfirm],
  );

  const onFilter = useCallback(
    (values: any) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam !== queryParam) {
        history.replace(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
        setPrams({ ...newPrams });
      }
    },
    [history, params],
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQueryDefault);
    let queryParam = generateQuery(initQueryDefault);
    history.replace(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
  }, [history]);

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
        default:
          break;
      }
    },
    [handlePaymentConfirm, selectedRowKeys.length, allowDailyPaymentsConfirm],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, location.search]);

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
