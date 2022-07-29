import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { StockInOutItemsOther, StockInOutOther } from "model/stock-in-out-other";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
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
// import { isEmpty } from "lodash";

interface StockInOutOtherListProps {}

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Hủy phiếu",
  },
];

const StockInOutOtherList: React.FC<StockInOutOtherListProps> = (props) => {
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
        render: (value, record, index) => {
          return (
            <>
              <div>
                <Link
                  to={{
                    pathname: `${UrlConfig.STOCK_IN_OUT_OTHERS}/${record.id}`,
                  }}
                >
                  <b>{value}</b>
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
        render: (value, record, index) => {
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
        render: (value, record, index) => {
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
        render: (value: Array<StockInOutItemsOther>, record, index) => {
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
        setConfirmCancel(true);
        break;
    }
  }, []);

  const [canUpdateStockInOut] = useAuthorization({
    acceptPermissions: [StockInOutOthersPermission.update],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 1) {
        return canUpdateStockInOut;
      }
      return false;
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
      </div>
    </StyledComponent>
  );
};

export default StockInOutOtherList;
