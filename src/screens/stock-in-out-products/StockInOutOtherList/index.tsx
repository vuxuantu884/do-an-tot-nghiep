import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { StockInOutItemsOther, StockInOutOther } from "model/stock-in-out-other";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import {
  StockInOutField,
  StockInOutStatus,
  StockInOutType,
  StockInOutTypeMapping,
  StockInReasonField,
  StockInReasonMappingField,
  StockOutReasonField,
  StockOutReasonMappingField,
} from "../constant";
import stockInOutIconFinalized from "assets/icon/stock-in-out-icon-finalized.svg";
import stockInOutIconCancelled from "assets/icon/stock-in-out-icon-cancelled.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StockInOutOthersPermission } from "config/permissions/stock-in-out.permission";
import { StyledComponent } from "./style";
import { OFFSET_HEADER_UNDER_NAVBAR, STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";
import { PageResponse } from "model/base/base-metadata.response";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { getQueryParams, useQuery } from "utils/useQuery";
import { callApiNative } from "utils/ApiUtils";
import {
  cancelledMultipleStockInOut,
  getStockInOutOtherList,
  updateStockInOutOthers,
} from "service/inventory/stock-in-out/index.service";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import StockInOutFilter from "../components/StockInOutFilter";
import EditPopover from "screens/inventory-defects/ListInventoryDefect/components/EditPopover";
import { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import StockInOutExport from "../components/StockInOutExport";
import * as XLSX from "xlsx";
import moment from "moment";
import { InventoryTransferDetailItem } from "../../../model/inventory/transfer";
import { ExportModal } from "component";
import { START_PROCESS_PERCENT } from "screens/products/helper";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import { HttpStatus } from "config/http-status.config";

interface StockInOutOtherListProps {
  showExportModal: boolean;
  setShowExportModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Xuất dữ liệu",
  },
  {
    id: 2,
    name: "Hủy phiếu",
  },
];

const StockInOutOtherList: React.FC<StockInOutOtherListProps> = (props) => {
  const { showExportModal, setShowExportModal } = props;

  const [loading, setLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<StockInOutOther>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [vExportDetailStockInOut, setVExportDetailStockInOut] = useState<boolean>(false);
  const [statusExport, setStatusExport] = useState<number>(0);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isLoadingExport, setIsLoadingExport] = useState<boolean>(false);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(START_PROCESS_PERCENT);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );
  const history = useHistory();
  const dispatch = useDispatch();

  const query = useQuery();
  let paramsUrl: any = useMemo(() => {
    return { ...getQueryParams(query) };
  }, [query]);

  const getListStockInOutOther = useCallback(async () => {
    const queryString = generateQuery(paramsUrl);
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      getStockInOutOtherList,
      queryString,
    );
    if (response) {
      setData(response);
      setLoading(false);
    }
  }, [dispatch, paramsUrl]);

  useEffect(() => {
    getListStockInOutOther();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search]);

  const updateStockInOutOthersNote = async (value: string, item: StockInOutOther) => {
    if (
      (item.stock_in_out_reason === StockOutReasonField.stock_out_other ||
        item.stock_in_out_reason === StockInReasonField.stock_in_other) &&
      !value
    ) {
      showError("Không được để trống lý do");
      return;
    }
    const dataSubmit = { ...item, [StockInOutField.internal_note]: value };
    const response = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      updateStockInOutOthers,
      item.id,
      dataSubmit,
    );
    if (response) {
      showSuccess("Cập nhật thành công");
      getListStockInOutOther();
    }
  };

  const getTotalQuantity = useCallback(() => {
    let total = 0;
    data.items?.forEach((el: StockInOutOther) => {
      el.stock_in_out_other_items.forEach((item: StockInOutItemsOther) => {
        total += item.quantity;
      });
    });
    return formatCurrency(total, ".");
  }, [data.items]);

  const defaultColumns: Array<ICustomTableColumType<StockInOutOther>> = useMemo(() => {
    return [
      {
        title: "Mã phiếu",
        dataIndex: "code",
        fixed: "left",
        width: "23%",
        visible: true,
        render: (value, record) => {
          return (
            <>
              <div>
                <Link
                  to={{
                    pathname: `${UrlConfig.STOCK_IN_OUT_OTHERS}/${record.id}`,
                  }}
                >
                  <b style={{ fontSize: 16 }}>{value}</b>
                </Link>
              </div>
              <div style={{ fontSize: 12 }}>
                <div>
                  Người tạo:{" "}
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.created_by} - {record.created_name}
                  </Link>
                </div>
                <div>
                  Ngày tạo: {ConvertUtcToLocalDate(record.created_date, DATE_FORMAT.DDMMYY_HHmm)}
                </div>
              </div>
            </>
          );
        },
      },
      {
        title: "Kho hàng",
        dataIndex: "store",
        align: "center",
        width: "10%",
        render: (value) => {
          return <>{value}</>;
        },
        visible: true,
      },
      {
        title: (
          <div>
            <div>Số lượng</div>
            <div>
              (<span style={{ color: "#2A2A86" }}>{getTotalQuantity()}</span>)
            </div>
          </div>
        ),
        align: "center",
        width: "9%",
        dataIndex: "stock_in_out_other_items",
        visible: true,
        render: (value) => {
          let totalQuantity = 0;
          value.forEach((item: StockInOutItemsOther) => {
            totalQuantity += item.quantity;
          });
          return <span>{formatCurrency(totalQuantity, ".")}</span>;
        },
      },
      {
        title: "Thành tiền",
        align: "center",
        width: "10%",
        dataIndex: "stock_in_out_other_items",
        visible: true,
        render: (value: Array<StockInOutItemsOther>) => {
          let totalAmount = 0;
          value.forEach((item: StockInOutItemsOther) => {
            totalAmount += item.amount;
          });
          return <span>{formatCurrency(totalAmount, ".")}</span>;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        visible: true,
        width: "9%",
        render: (value: string, record) => {
          let icon = "";
          let color = "";
          let text = "";
          if (!value) {
            return "";
          }
          switch (record.status) {
            case StockInOutStatus.finalized:
              icon = stockInOutIconFinalized;
              color = "#27AE60";
              text = `Đã ${StockInOutTypeMapping[record.type]}`;
              break;
            case StockInOutStatus.cancelled:
              icon = stockInOutIconCancelled;
              color = "#E24343";
              text = "Đã hủy";
              break;
          }
          return (
            <>
              <div style={{ color: color }}>
                {icon && <img src={icon} alt="" style={{ marginRight: 4, marginBottom: 2 }} />}
                {text}
              </div>
            </>
          );
        },
        align: "center",
      },
      {
        title: "Lý do",
        dataIndex: "stock_in_out_reason",
        align: "center",
        width: "10%",
        visible: true,
        render: (value: string, record: StockInOutOther) => {
          return (
            <div>
              {record.type === StockInOutType.stock_in
                ? StockInReasonMappingField[value]
                : StockOutReasonMappingField[value]}
            </div>
          );
        },
      },
      {
        title: "Người đề xuất",
        dataIndex: "account_code",
        align: "center",
        width: "12%",
        visible: true,
        render: (value: string, record: StockInOutOther) => {
          if (value) {
            return (
              <>
                <div>
                  <Link to={`${UrlConfig.ACCOUNTS}/${value}`} className="primary" target="_blank">
                    {value}
                  </Link>
                </div>
                <span>{record.account_name}</span>
              </>
            );
          } else {
            return "";
          }
        },
      },
      {
        title: <div style={{ textAlign: "center" }}>Ghi chú</div>,
        dataIndex: "internal_note",
        visible: true,
        width: "17%",
        render: (value: string, item: StockInOutOther) => {
          const hasPermission = currentPermissions.includes(StockInOutOthersPermission.update);
          const isRequire =
            item.stock_in_out_reason === StockOutReasonField.stock_out_other ||
            item.stock_in_out_reason === StockInReasonField.stock_in_other;
          return (
            <>
              <EditPopover
                isHaveEditPermission={hasPermission}
                content={value}
                isRequire={isRequire}
                title=""
                color={primaryColor}
                onOk={(newNote) => {
                  updateStockInOutOthersNote(newNote, item);
                }}
              />
            </>
          );
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPermissions, getTotalQuantity]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<StockInOutOther>>>(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onPageChange = (page: number, size?: number) => {
    paramsUrl.page = page;
    paramsUrl.limit = size;
    history.replace(`${UrlConfig.STOCK_IN_OUT_OTHERS}?${generateQuery(paramsUrl)}`);
  };

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        setVExportDetailStockInOut(true);
        break;
      case 2:
        setConfirmCancel(true);
        break;
    }
  }, []);

  const [canUpdateStockInOut] = useAuthorization({
    acceptPermissions: [StockInOutOthersPermission.update],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 2) {
        return canUpdateStockInOut;
      }
      return true;
    });
  }, [canUpdateStockInOut]);

  const onSelectedChange = useCallback((selectedRow: StockInOutOther[]) => {
    setSelectedRowData([...selectedRow]);
  }, []);

  const onCancelStockInOut = useCallback(async () => {
    if (selectedRowData.length === 0) {
      showWarning("Bạn chưa chọn phiếu nào");
      return;
    }
    const ids = selectedRowData.map((item: StockInOutOther) => item.id).join(",");
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      cancelledMultipleStockInOut,
      ids,
    );
    if (response) {
      showSuccess("Hủy phiếu thành công");
      getListStockInOutOther();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedRowData]);

  const getItemsByCondition = useCallback(
    async (type: string) => {
      const queryString: any = generateQuery(paramsUrl);
      let res: any;
      let items: Array<StockInOutOther> = [];
      const limit = 50;
      let times = 0;

      setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          res = await callApiNative(
            { isShowError: true },
            dispatch,
            getStockInOutOtherList,
            queryString,
          );
          if (res) {
            items = items.concat(res.items);
          }
          setExportProgress(100);
          break;
        case TYPE_EXPORT.selected:
          res = await callApiNative(
            { isShowError: true },
            dispatch,
            getStockInOutOtherList,
            queryString,
          );
          if (res) {
            for (let index = 0; index < selectedRowData.length; index++) {
              const transfer = res.items.find(
                (e: InventoryTransferDetailItem) => e.code === selectedRowData[index].code,
              );
              if (transfer) {
                items.push(transfer);
              }
            }
            setExportProgress(100);
          }
          break;
        case TYPE_EXPORT.all:
          const roundAll = Math.round(data.metadata.total / limit);
          times = roundAll < data.metadata.total / limit ? roundAll + 1 : roundAll;

          for (let index = 1; index <= times; index++) {
            res = await callApiNative(
              { isShowError: true },
              dispatch,
              getStockInOutOtherList,
              generateQuery({
                ...{ ...getQueryParams(query) },
                page: index,
                limit,
              }),
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
          }

          break;
        case TYPE_EXPORT.allin:
        case TYPE_EXPORT.all_out:
          if (!data.metadata.total || data.metadata.total === 0) {
            break;
          }

          let index = 1;
          let itemsTemp = [1];

          while (itemsTemp.length !== 0) {
            res = await callApiNative(
              { isShowError: true },
              dispatch,
              getStockInOutOtherList,
              `page=${index}&limit=${limit}&type=${
                type === TYPE_EXPORT.allin ? StockInOutType.stock_in : StockInOutType.stock_out
              }`,
            );
            if (res) {
              items = items.concat(res.items);
              itemsTemp = res.items;
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
            index++;
          }
          break;
        default:
          break;
      }
      setExportProgress(100);
      return items;
    },
    [paramsUrl, dispatch, data.metadata.total, selectedRowData, query],
  );

  const convertItemExport = (item: StockInOutOther) => {
    let text = "";
    switch (item.status) {
      case StockInOutStatus.finalized:
        text = `Đã ${StockInOutTypeMapping[item.type]}`;
        break;
      case StockInOutStatus.cancelled:
        text = "Đã hủy";
        break;
    }
    return item.stock_in_out_other_items.map((product: StockInOutItemsOther) => {
      return {
        [`Mã phiếu`]: item.code,
        [`Kho hàng`]: item.store,
        [`Đối tác`]: item.partner_name,
        [`Mã sản phẩm`]: product.sku,
        [`Số lượng`]: formatCurrency(product.quantity),
        [`Giá`]: formatCurrency(product[item.policy_price]),
        [`Thành tiền`]: formatCurrency(product[item.policy_price] * product.quantity),
        [`Trạng thái`]: text,
        [`Lý do`]:
          item.type === StockInOutType.stock_in
            ? StockInReasonMappingField[item.stock_in_out_reason]
            : StockOutReasonMappingField[item.stock_in_out_reason],
        [`Người đề xuất`]: `${item.account_code} - ${item.account_name}`,
        [`Người tạo`]: `${product.created_by} - ${product.created_name}`,
        [`Ngày tạo`]: ConvertUtcToLocalDate(product.created_date, DATE_FORMAT.DDMMYY_HHmm),
        [`Ghi chú`]: item.internal_note,
      };
    });
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        setVExportDetailStockInOut(false);
        return;
      }
      setIsLoading(true);
      const res = await getItemsByCondition(typeExport);
      setIsLoading(false);
      if (res && res.length === 0) {
        setStatusExport(0);
        showWarning("Không có phiếu chuyển nào đủ điều kiện");
        return;
      }

      const workbook = XLSX.utils.book_new();
      let dataExport: any = [];
      for (let i = 0; i < res.length; i++) {
        const e = res[i];
        const items = convertItemExport(e);
        dataExport = [...dataExport, ...items];
      }

      let worksheet = XLSX.utils.json_to_sheet(dataExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      XLSX.writeFile(workbook, `Nhap_xuat_khac_${day}_${month}_${year}.xlsx`);
      setVExportDetailStockInOut(false);
      setExportProgress(0);
      setStatusExport(0);
    },
    Cancel: () => {
      setVExportDetailStockInOut(false);
      setExportProgress(0);
      setStatusExport(0);
    },
  };

  const getConditions = useCallback(
    (type: string) => {
      let conditions = {};
      switch (type) {
        case TYPE_EXPORT.selected:
          const ids = selectedRowData.map((e) => e.id).toString();
          conditions = { ids: ids, type_export: TYPE_EXPORT.selected };
          break;
        case TYPE_EXPORT.page:
          conditions = {
            ...paramsUrl,
            page: paramsUrl?.page || 1,
            limit: paramsUrl?.limit || 30,
            type_export: TYPE_EXPORT.page,
          };
          break;
        case TYPE_EXPORT.all:
          conditions = {
            ...paramsUrl,
            type_export: TYPE_EXPORT.all,
            page: undefined,
            limit: undefined,
          };
          break;
        case TYPE_EXPORT.allin:
          conditions = { type_export: TYPE_EXPORT.allin };
          break;
      }
      return conditions;
    },
    [paramsUrl, selectedRowData],
  );

  const resetExport = () => {
    setShowExportModal(false);
    setIsLoadingExport(false);
    setExportProgressDetail(START_PROCESS_PERCENT);
  };

  const actionExportNXK = {
    Ok: async (typeExport: string) => {
      setIsLoadingExport(true);

      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm để xuất file");
        setIsLoadingExport(false);
        setShowExportModal(false);
        return;
      }
      const conditions = getConditions(typeExport);
      const queryParam = generateQuery({ ...conditions });
      exportFileV2({
        conditions: queryParam,
        type: "TYPE_EXPORT_STOCK_IN_OUT_OTHERS",
      })
        .then((response) => {
          console.log(response);
          if (response.code === HttpStatus.SUCCESS) {
            showSuccess("Đã gửi yêu cầu xuất file");
            setStatusExportDetail(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            setListExportFileDetail([...listExportFileDetail, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
          resetExport();
        });
    },
    Cancel: () => {
      resetExport();
    },
  };
  const checkExportFileDetail = useCallback(() => {
    const getFilePromises = listExportFileDetail.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            setExportProgressDetail(response.data.percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFileDetail.filter((item) => {
              return item !== fileCode;
            });
            let downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";
            downLoad.click();
            setListExportFileDetail(newListExportFile);
            resetExport();
          } else if (response.data && response.data.status === "ERROR") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
            if (response.data.message) {
              showError(response.data.message);
            }
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listExportFileDetail]);

  useEffect(() => {
    if (
      listExportFileDetail.length === STATUS_IMPORT_EXPORT.NONE ||
      statusExportDetail === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExportDetail === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFileDetail();

    const getFileInterval = setInterval(checkExportFileDetail, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFileDetail, checkExportFileDetail, statusExportDetail]);

  return (
    <StyledComponent>
      <div className="margin-top-20">
        <StockInOutFilter
          actions={actions}
          onMenuClick={onMenuClick}
          paramsUrl={paramsUrl}
          onClickOpen={() => setShowSettingColumn(true)}
        />
        <div style={{ marginTop: -10 }}>
          <CustomTable
            isRowSelection
            // selectedRowKey={selected.map(e => e.id)}
            isLoading={loading}
            dataSource={data.items}
            sticky={{
              offsetScroll: 5,
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            columns={columnFinal}
            rowKey={(item: StockInOutOther) => item.id}
            // scroll={{ x: 2000 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
            isShowPaginationAtHeader
            bordered
          />
        </div>
        {showSettingColumn && (
          <ModalSettingColumn
            visible={showSettingColumn}
            onCancel={() => setShowSettingColumn(false)}
            onOk={(data) => {
              setShowSettingColumn(false);
              setColumns(data);
            }}
            data={columns}
          />
        )}
        <ModalDeleteConfirm
          onCancel={() => setConfirmCancel(false)}
          onOk={() => {
            setConfirmCancel(false);
            onCancelStockInOut();
          }}
          title="Bạn chắc chắn xóa phiếu hàng ?"
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={confirmCancel}
        />
        {vExportDetailStockInOut && (
          <StockInOutExport
            isLoading={isLoading}
            onCancel={actionExport.Cancel}
            onOk={actionExport.Ok}
            visible={vExportDetailStockInOut}
            exportProgress={exportProgress}
            statusExport={statusExport}
          />
        )}
        <ExportModal
          title="Xuất file danh sách phiếu nhập xuất khác"
          moduleText="sản phẩm"
          onCancel={actionExportNXK.Cancel}
          onOk={actionExportNXK.Ok}
          isVisible={showExportModal}
          isLoading={isLoadingExport}
          exportProgress={exportProgressDetail}
        />
      </div>
    </StyledComponent>
  );
};

export default StockInOutOtherList;
