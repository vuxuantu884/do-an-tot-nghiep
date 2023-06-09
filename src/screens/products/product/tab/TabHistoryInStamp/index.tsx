import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { cloneDeep } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { BaseQuery } from "model/base/base.query";
import {
  BarcodePrintHistoriesResponse,
  BarcodePrintTemEditNoteRequest,
  ProductBarcodePrintHistories,
  VariantResponse,
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import ModalPickManyProduct from "screens/products/product/component/ModalPickManyProduct";
import { productGetHistoryInTem, productUpdateHistoryInTem } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { generateQuery, splitEllipsis } from "utils/AppUtils";
import {
  formatCurrencyForProduct,
  ACTIONS_INDEX,
  START_PROCESS_PERCENT,
  FINISH_PROCESS_PERCENT
} from "screens/products/helper";
import { OFFSET_HEADER_TABLE, STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { primaryColor } from "utils/global-styles/variables";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { StyledComponent } from "../style";
import { EditNote, ExportModal } from "component";
import HistoryInStampFilter from "./HistoryInStampFilter";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";

type TabHistoryInStampProps = {
  isVisiblePickManyModal: boolean;
  onTogglePickManyModal: () => void;
  isVExportProduct: boolean;
  setIsVExportProduct: React.Dispatch<React.SetStateAction<boolean>>;
}

const initQuery: BaseQuery = {
  sort_column: "created_date",
  sort_type: "desc",
};

const TabHistoryInStamp: React.FC<TabHistoryInStampProps> = (props: TabHistoryInStampProps) => {
  //props
  const { isVisiblePickManyModal, onTogglePickManyModal, isVExportProduct, setIsVExportProduct } = props;
  //page hooks
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  //page state
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PageResponse<BarcodePrintHistoriesResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState<boolean>(false);
  const [selected, setSelected] = useState<Array<BarcodePrintHistoriesResponse>>([]);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [exportProgress, setExportProgress] = useState<number>(START_PROCESS_PERCENT);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.DEFAULT);
  const [exportError, setExportError] = useState<string>("");

  //redux state
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const onResult = useCallback((result: PageResponse<BarcodePrintHistoriesResponse> | false) => {
    setIsLoading(false);
    if (result) {
      setData({ ...result });
    }
  }, []);

  const dataQuery: ProductBarcodePrintHistories = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<ProductBarcodePrintHistories>(dataQuery);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      const queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${ProductTabUrl.STAMP_PRINTING_HISTORY}?${queryParam}`);
    },
    [history, params],
  );

  const getTotalQuantityPrint = useCallback(() => {
    const barcodePrintHistories = cloneDeep(data.items);
    const total = barcodePrintHistories.reduce((value, element) => {
      return value + element.quantity_print || 0;
    }, 0);
    return formatCurrencyForProduct(total);
  }, [data]);

  const getTotalCountDistinct = useCallback(() => {
    const barcodePrintHistories = cloneDeep(data.items);
    const total: Array<any> = [];
    barcodePrintHistories.forEach((element) => {
      if (!total.includes(element?.order_code) && element?.order_code) {
        total.push(element.order_code);
      }
    });

    return formatCurrencyForProduct(total.length);
  }, [data]);

  const onFilter = useCallback(
    (values) => {
      const newPrams = {
        ...params,
        ...{
          ...values,
        },
        page: 1,
      };
      setParams(newPrams);
      const queryParam = generateQuery(newPrams);
      history.replace(`${ProductTabUrl.STAMP_PRINTING_HISTORY}?${queryParam}`);
    },
    [params, history],
  );

  const getDataPrintHistories = useCallback(
    async (paramsQuery: ProductBarcodePrintHistories) => {
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        productGetHistoryInTem,
        paramsQuery,
      );
      onResult(response);
    },
    [dispatch, onResult],
  );

  const onUpdateNoteItem = useCallback(
    async (
      note: Pick<BarcodePrintHistoriesResponse, "note">,
      item: BarcodePrintHistoriesResponse,
      paramsQuery: ProductBarcodePrintHistories,
    ) => {
      setIsLoading(true);
      const values: BarcodePrintTemEditNoteRequest = {
        note,
      };
      const response = await callApiNative(
        { isShowError: true },
        dispatch,
        productUpdateHistoryInTem,
        item.id,
        values,
      );
      if (response) {
        showSuccess("Cập nhật ghi chú thành công");
        getDataPrintHistories(paramsQuery);
      }
    },
    [dispatch, getDataPrintHistories],
  );
  const actionsDefault: Array<MenuAction> = useMemo(() => {
    return [
      {
        id: ACTIONS_INDEX.PRINT_BAR_CODE,
        name: "In mã vạch",
      },
    ];
  }, []);
  const [canPrintBarcode] = useAuthorization({
    acceptPermissions: [ProductPermission.print_temp],
  });
  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.PRINT_BAR_CODE) {
        return canPrintBarcode;
      }
      return false;
    });
  }, [canPrintBarcode, actionsDefault]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT_BAR_CODE:
          history.push(`${UrlConfig.PRODUCT}/barcode`, { selected: selected });
          break;
      }
    },
    [history, selected],
  );

  const defaultColumns: Array<ICustomTableColumType<BarcodePrintHistoriesResponse>> =
    useMemo(() => {
      return [
        {
          title: "STT",
          key: "index",
          render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
          visible: true,
          width: 60,
          fixed: "left",
          align: "center",
        },
        {
          title: "Sản phẩm",
          dataIndex: "",
          fixed: "left",
          visible: true,
          render: (value, item) => {
            let strName = item.name.trim();
            strName =
              window.screen.width >= 1920
                ? splitEllipsis(strName, 100, 30)
                : window.screen.width >= 1600
                ? (splitEllipsis(strName, 60, 30))
                : window.screen.width >= 1366
                ? (splitEllipsis(strName, 47, 30))
                : strName;
            return (
              <div>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}
                >
                  {item.sku}
                </Link>
                <div>
                  {" "}
                  <TextEllipsis value={strName} line={1} />
                </div>
              </div>
            );
          },
        },
        {
          title: "Giá bán",
          dataIndex: "retail_price",
          visible: true,
          align: "right",
          width: 120,
          render: (value) => (value ? formatCurrencyForProduct(value) : "---"),
        },
        {
          title: (
            <div>
              {" "}
              Số lượng tem (<span style={{ color: "#2A2A86" }}>{getTotalQuantityPrint()}</span>)
            </div>
          ),
          dataIndex: "quantity_print",
          visible: true,
          align: "center",
          width: 200,
          render: (value) => (value ? formatCurrencyForProduct(value) : "---"),
        },
        {
          title: "Thời gian in",
          dataIndex: "created_date",
          visible: true,
          align: "right",
          width: 120,
          render: (value) => (value ? ConvertUtcToLocalDate(value) : "---"),
        },
        {
          title: "Người thao tác",
          dataIndex: "created_by",
          visible: true,
          width: 200,
          render: (value, item) =>
            value ? (
              <div>
                {" "}
                <Link to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>{value}</Link>
                <div>{item.created_name}</div>
              </div>
            ) : (
              "---"
            ),
        },
        {
          title: (
            <div>
              {" "}
              Đơn đặt hàng (<span style={{ color: "#2A2A86" }}>{getTotalCountDistinct()}</span>)
            </div>
          ),
          visible: true,
          align: "left",
          dataIndex: "supplier",
          width: 200,
          render: (value, item) => {
            return (
              <>
                {" "}
                {value || item.order_code ? (
                  <div>
                    <Link to={`${UrlConfig.PURCHASE_ORDERS}/${item.order_id}`}>
                      {item.order_code}
                    </Link>
                    {value && (
                      <div>
                        <span className="txt-muted">NCC: </span>{" "}
                        <Link to={`${UrlConfig.SUPPLIERS}/${item.supplier_id}`}>{value}</Link>
                      </div>
                    )}
                  </div>
                ) : (
                  "---"
                )}
              </>
            );
          },
        },
        {
          title: "Ghi chú",
          visible: true,
          align: "center",
          dataIndex: "note",
          render: (value, item) => {
            const hasPermission = [ProductPermission.update].some((element) => {
              return currentPermissions.includes(element);
            });
            return (
              <div className="note">
                <EditNote
                  isHaveEditPermission={hasPermission}
                  note={value}
                  title=""
                  color={primaryColor}
                  onOk={(newNote) => {
                    const value = newNote as unknown;
                    const urlSearchParams = new URLSearchParams(window.location.search);
                    const paramsQuery = Object.fromEntries(urlSearchParams.entries());
                    onUpdateNoteItem(value as Pick<BarcodePrintHistoriesResponse, "note">, item, {
                      ...initQuery,
                      ...paramsQuery,
                    });
                  }}
                />
              </div>
            );
          },
          width: 200,
        },
      ];
    }, [currentPermissions, getTotalQuantityPrint, onUpdateNoteItem, getTotalCountDistinct]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<BarcodePrintHistoriesResponse>>>(defaultColumns);

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  const actionExport = {
    Ok: async (typeExport: string) => {
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExport(STATUS_IMPORT_EXPORT.NONE);
        showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
        setIsVExportProduct(false);
        return;
      }
      setExportProgress(START_PROCESS_PERCENT);
      setIsLoadingExport(true);
      let newParams: any = {
        ...params,
        type: typeExport,
        limit: params.limit ?? 30,
      };
      switch (typeExport) {
        case TYPE_EXPORT.page:
          break;
        case TYPE_EXPORT.all:
          delete newParams.page;
          delete newParams.limit;
          break;
        case TYPE_EXPORT.selected:
          newParams.ids = selected.map((item: BarcodePrintHistoriesResponse) => item.id);
          break;
        case TYPE_EXPORT.allin:
          newParams = { type: TYPE_EXPORT.allin };
          break;
        default:
          break;
      }

      const queryParams = generateQuery(newParams);
      exportFile({
        conditions: queryParams,
        type: "TYPE_EXPORT_BARCODE_PRINT_HISTORIES",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            showSuccess("Đã gửi yêu cầu xuất file");
            setListExportFile([...listExportFile, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    },
    Cancel: () => {
      setIsVExportProduct(false);
      setIsLoadingExport(false);
    },
  };

  const checkExportFile = useCallback(() => {
    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProgress(response.data.percent ?? START_PROCESS_PERCENT);
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            setExportProgress(FINISH_PROCESS_PERCENT);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url, "_self");
            setListExportFile(newListExportFile);
            setIsVExportProduct(false);
            setIsLoadingExport(false);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
            setExportError(response.data.message);
            setIsLoadingExport(false);
          }
        } else {
          setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
          setIsLoadingExport(false);
        }
      });
    });
  }, [listExportFile, setIsVExportProduct]);

  useEffect(() => {
    if (
      listExportFile.length === 0 ||
      statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  useEffect(() => {
    setIsLoading(true);
    getDataPrintHistories(params);
  }, [getDataPrintHistories, params]);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns]);

  const onSelectedChange = useCallback((selectedRows: Array<BarcodePrintHistoriesResponse>) => {
    setSelected(
      selectedRows.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  return (
    <StyledComponent>
      <HistoryInStampFilter
        onMenuClick={onMenuClick}
        actions={actions}
        onFilter={onFilter}
        params={params}
        listCountries={[]}
        onClickOpen={() => setIsShowSettingColumn(true)}
      />
      <ModalPickManyProduct
        visible={isVisiblePickManyModal}
        onCancel={onTogglePickManyModal}
        selected={[]}
        onSave={(result: Array<VariantResponse>) => {
          history.push(`${UrlConfig.PRODUCT}/barcode`, { selected: result });
          onTogglePickManyModal();
        }}
      />
      <CustomTable
        className="small-padding"
        bordered
        isRowSelection
        selectedRowKey={selected.map((e) => e.id)}
        isShowPaginationAtHeader
        scroll={{ x: "max-content" }}
        columns={columnFinal}
        dataSource={data.items}
        isLoading={isLoading}
        rowKey={(item) => item.id}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <ModalSettingColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          setIsShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
      <ExportModal
        title="Xuất file danh sách sản phẩm"
        moduleText="sản phẩm"
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        isVisible={isVExportProduct}
        isLoading={isLoadingExport}
        exportProgress={exportProgress}
        statusExport={statusExport}
        exportError={exportError}
      />
    </StyledComponent>
  );
};

export default TabHistoryInStamp;
