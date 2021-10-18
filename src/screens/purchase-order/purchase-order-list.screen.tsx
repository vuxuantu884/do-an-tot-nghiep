import { Card, Tag, Row, Button, Space } from "antd";
import NumberFormat from "react-number-format";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ContentContainer from "component/container/content.container";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import UrlConfig from "config/url.config";
import { AppConfig } from "config/app.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PoSearchAction, PODeleteAction } from "domain/actions/po/po.action";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import {
  PurchaseOrder,
  PurchaseOrderQuery,
} from "model/purchase-order/purchase-order.model";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ProcumentStatus, PoPaymentStatus } from "utils/Constants";
import { getQueryParams, useQuery } from "utils/useQuery";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import importIcon from "assets/icon/import.svg";
import exportIcon from "assets/icon/export.svg";
import ExportModal from "screens/purchase-order/modal/export.modal";

import { showError } from "utils/ToastUtils";
import "./purchase-order-list.scss";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import moment from "moment";

const supplierQuery: AccountSearchQuery = {
  department_ids: [AppConfig.WIN_DEPARTMENT],
};

const rdQuery: AccountSearchQuery = {
  department_ids: [AppConfig.RD_DEPARTMENT],
};

const PurchaseOrderListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<PurchaseOrder>>([]);
  const [listSupplierAccount, setListSupplierAccount] =
    useState<Array<AccountResponse>>();
  const [listRdAccount, setListRdAccount] = useState<Array<AccountResponse>>();
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  let initQuery: PurchaseOrderQuery = {};

  let dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<PurchaseOrder>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onExport = useCallback(() => {
    let queryParams = generateQuery(params);
    exportFile({
      conditions: queryParams,
      type: "EXPORT_PURCHASE_ORDER",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          showSuccess("Đã gửi yêu cầu xuất file");
          setListExportFile([...listExportFile, response.data.code]);
        }
      })
      .catch((error) => {
        console.log("purchase order export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [params, listExportFile]);
  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            let fileCode = response.data.code,
              newListExportFile = listExportFile.filter((item) => {
                return item !== fileCode;
              });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
          }
        }
      });
    });
  }, [listExportFile]);
  useEffect(() => {
    if (listExportFile.length === 0) return;
    checkExportFile();
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile]);

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<PurchaseOrder>>
  >([
    {
      title: "ID đơn hàng",
      dataIndex: "code",
      render: (value: string, i: PurchaseOrder) => (
        <Link to={`${UrlConfig.PURCHASE_ORDER}/${i.id}`}>{value}</Link>
      ),
      visible: true,
      fixed: "left",
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      visible: true,
    },
    {
      title: "Ngày duyệt đơn",
      dataIndex: "activated_date",
      render: (value: string) => {
        return <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>;
      },
      visible: true,
    },
    {
      title: "Ngày nhận hàng dự kiến",
      dataIndex: "procurements",
      render: (value:  Array<PurchaseProcument>) => {
        let display = '';
        if(value && value.length > 0) {
          value.sort((a, b) => moment(a.expect_receipt_date).diff(moment(b.expect_receipt_date)))
          display = ConvertUtcToLocalDate(value[value.length - 1].expect_receipt_date);
        }
        return <div>{display}</div>;
      },
      visible: true,
      width: 200,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "status_name",
      render: (value: string) => {
        return <Tag className="tag-custom primary-txt">{value}</Tag>;
      },
      visible: true,
    },
    {
      title: "Nhập kho",
      dataIndex: "receive_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case ProcumentStatus.NOT_RECEIVED:
          case null:
            processIcon = "icon-blank";
            break;
          case ProcumentStatus.PARTIAL_RECEIVED:
            processIcon = "icon-partial";
            break;
          case ProcumentStatus.RECEIVED:
          case ProcumentStatus.FINISHED:
            processIcon = "icon-full";
            break;
        }
        if (processIcon)
          return (
            <div className="text-center">
              <div className={processIcon} />
            </div>
          );
        return "";
      },
      visible: true,
      width: 120,
    },
    {
      title: "Thanh toán",
      dataIndex: "financial_status",
      render: (value: string) => {
        let processIcon = null;
        switch (value) {
          case PoPaymentStatus.UNPAID:
          case null:
            processIcon = "icon-blank";
            break;
          case PoPaymentStatus.PARTIAL_PAID:
            processIcon = "icon-partial";
            break;
          case PoPaymentStatus.PAID:
          case PoPaymentStatus.FINISHED:
            processIcon = "icon-full";
            break;
        }
        if (processIcon)
          return (
            <div className="text-center">
              <div className={processIcon} />
            </div>
          );
        return "";
      },
      visible: true,
      width: 120,
    },
    {
      title: "Trả hàng",
      visible: true,
      width: 120,
    },
    {
      title: "Tổng SL sp",
      render: (row: PurchaseOrder) => {
        let total = 0;
        row?.line_items.forEach((item) => {
          total += item?.quantity ? item.quantity : 0;
        });
        return <div>{total}</div>;
      },
      visible: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      render: (value: number) => (
        <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      visible: true,
    },
    {
      title: "Chi phí",
      dataIndex: "total_cost_line",
      render: (value: number) => (
        <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      ),
      visible: true,
    },
    {
      title: "Merchandiser",
      render: (row) => {
        if (!row.merchandiser_code || !row.merchandiser) return "";
        return <div>{`${row.merchandiser_code} - ${row.merchandiser}`}</div>;
      },
      visible: true,
    },
    {
      title: "QC",
      render: (row) => {
        if (!row.qc_code || !row.qc) return "";
        return <div>{`${row.qc_code} - ${row.qc}`}</div>;
      },
      visible: true,
    },
    {
      title: "Ngày tạo đơn",
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      visible: true,
      width: 200,
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "completed_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      visible: true,
      width: 200,
    },
    {
      title: "Ngày hủy đơn",
      dataIndex: "cancelled_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      visible: true,
      width: 200,
    },
    {
      title: "Ghi chú nội bộ",
      dataIndex: "note",
      visible: true,
    },
    {
      title: "Ghi chú nhà cung cấp",
      dataIndex: "supplier_note",
      visible: true,
      width: 200,
    },
    {
      title: "Tag",
      dataIndex: "tags",
      render: (value: string) => {
        return <div className="txt-muted">{value}</div>;
      },
      visible: true,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "reference",
      visible: true,
    },
  ]);
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PURCHASE_ORDER}?${queryParam}`);
    },
    [history, params]
  );

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        setConfirmDelete(true);
        // onDelete();
        break;
    }
  }, []);
  let actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
    },
  ];

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PURCHASE_ORDER}?${queryParam}`);
    },
    [history, params]
  );
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setSearchResult = useCallback(
    (result: PageResponse<PurchaseOrder> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const onResultRd = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setListRdAccount(data.items);
    },
    []
  );

  const onResultSupplier = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setListSupplierAccount(data.items);
      dispatch(AccountSearchAction(rdQuery, onResultRd));
    },
    [dispatch, onResultRd]
  );

  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(AccountSearchAction(supplierQuery, onResultSupplier));
      dispatch(StoreGetListAction(setListStore));
    }
    isFirstLoad.current = false;
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult, onResultSupplier, onResultRd]);

  const onSelect = useCallback((selectedRow: Array<PurchaseOrder>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  const deleteCallback = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa đơn đặt hàng thành công");
    setTableLoading(true);
    dispatch(PoSearchAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần tử cần xóa");
      return;
    }

    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(PODeleteAction(id, deleteCallback));
      return;
    }
  }, [deleteCallback, dispatch, selected]);

  return (
    <ContentContainer
      isError={isError}
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
      ]}
      extra={
        <Row>
          <Space>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={importIcon} style={{ marginRight: 8 }} alt="" />}
              onClick={() => {}}
            >
              Nhập file
            </Button>
            <Button
              type="default"
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
              // onClick={onExport}
              onClick={() => {
                setShowExportModal(true);
              }}
            >
              Xuất file
            </Button>
            <ButtonCreate path={`${UrlConfig.PURCHASE_ORDER}/create`} />
          </Space>
        </Row>
      }
    >
      <Card>
        <div className="purchase-order-list">
          <PurchaseOrderFilter
            params={params}
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            listSupplierAccount={listSupplierAccount}
            listRdAccount={listRdAccount}
            listStore={listStore}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            showColumnSetting={true}
            scroll={{ x: 3630}}
            sticky={{offsetScroll: 10, offsetHeader: 55}}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onShowColumnSetting={() => setShowSettingColumn(true)}
            onSelectedChange={onSelect}
            dataSource={data.items}
            columns={columnFinal}
            rowKey={(item: PurchaseOrder) => item.id}
          />
        </div>
      </Card>
      <ExportModal
        visible={showExportModal}
        onCancel={() => setShowExportModal(false)}
        onOk={() => {
          setShowExportModal(false);
          onExport();
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
        }}
        data={columns}
      />
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
          onDelete();
        }}
        title="Bạn chắc chắn xóa đơn đặt hàng ?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </ContentContainer>
  );
};
export default PurchaseOrderListScreen;
