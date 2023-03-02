import { Image } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreResponse } from "model/core/store.model";
import { callApiNative } from "utils/ApiUtils";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { generateQuery, splitEllipsis } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import {
  InventoryDefectHistoryFieldsMapping,
  InventoryDefectHistoryResponse,
  InventoryDefectQuery,
  LineItemDefect,
} from "model/inventory-defects";
import { getQueryParams, useQuery } from "utils/useQuery";
import { PageResponse } from "model/base/base-metadata.response";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { EyeOutlined } from "@ant-design/icons";
import { ImageProduct } from "screens/products/product/component";
import { getListInventoryDefectHistory } from "service/inventory/defect/index.service";
import CopyIcon from "screens/order-online/component/CopyIcon";
import TextEllipsis from "component/table/TextEllipsis";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { showError, showWarning } from "utils/ToastUtils";
import { cloneDeep } from "lodash";
import { formatCurrencyForProduct } from "screens/products/helper";
import InventoryDefectHistoryFilter from "./components/InventoryDefectHistoryFilter";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";
import ExportFileModal, { ResultLimitModel } from "component/modal/ExportFileModal/ExportFileModal";
import moment from "moment";
import { utils, writeFile } from "xlsx";

type ListInventoryDefectHistoryProps = {
  isExportHistoryDefects: boolean;
  setIsExportHistoryDefects: (value: boolean) => void;
};

export const ListInventoryDefectHistory: React.FC<ListInventoryDefectHistoryProps> = (
  props: ListInventoryDefectHistoryProps,
) => {
  const { isExportHistoryDefects, setIsExportHistoryDefects } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const query = useQuery();
  const initialQuery: InventoryDefectQuery = {
    page: 1,
    limit: 30,
    condition: undefined,
    store_ids: undefined,
    from_date: undefined,
    to_date: undefined,
    from_defect: undefined,
    to_defect: undefined,
    updated_by: undefined,
  };
  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT_HISTORY,
  );

  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false);
  const [data, setData] = useState<PageResponse<InventoryDefectHistoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [statusExport, setStatusExport] = useState<number>(ExportFileStatus.Export);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const exportRef: { current: NodeJS.Timeout | null } = useRef(null);
  const [selectedRowData, setSelectedRowData] = useState<Array<InventoryDefectHistoryResponse>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);

  const resultsExportFile: ResultLimitModel[] = [
    {
      value: ExportFileType.INPAGE,
      name: ExportFileType.INPAGE,
      title: "Sản phẩm trên trang này",
      isHidden: false,
      isChecked: true,
    },
    {
      value: ExportFileType.SELECTED,
      name: ExportFileType.SELECTED,
      title: "Các sản phẩm được chọn",
      isHidden: selectedRowData.length > 0 ? false : true,
      isChecked: false,
    },
    {
      value: ExportFileType.CURRENT_SEARCH,
      name: ExportFileType.CURRENT_SEARCH,
      title: "Các sản phẩm phù hợp với điều kiện lọc",
      isHidden: false,
      isChecked: false,
    },
    {
      value: ExportFileType.ALL,
      name: ExportFileType.ALL,
      title: "Tất cả các sản phẩm",
      isHidden: false,
      isChecked: false,
    },
  ];

  const initColumns: Array<ICustomTableColumType<InventoryDefectHistoryResponse>> = useMemo(() => {
    return [
      {
        title: "Ảnh",
        align: "center",
        fixed: "left",
        dataIndex: "variant_image",
        width: "5%",
        render: (value: string) => {
          return (
            <>
              {value ? (
                <Image
                  width={40}
                  height={40}
                  src={value ?? ""}
                  placeholder="Xem"
                  preview={{ mask: <EyeOutlined /> }}
                />
              ) : (
                <ImageProduct isDisabled={true} onClick={undefined} path={value} />
              )}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Sản phẩm",
        width: "18%",
        dataIndex: "sku",
        align: "left",
        fixed: "left",
        visible: true,
        render: (value: string, item) => {
          let strName = item.name?.trim() ?? "";
          strName =
            window.screen.width >= 1920
              ? splitEllipsis(strName, 100, 30)
              : window.screen.width >= 1600
              ? splitEllipsis(strName, 60, 30)
              : window.screen.width >= 1366
              ? splitEllipsis(strName, 47, 30)
              : strName;
          return (
            <>
              <div style={{ whiteSpace: "nowrap" }}>
                <Link
                  to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}
                  target="_blank"
                >
                  {value}
                </Link>
                <span title="click to copy">
                  <CopyIcon copiedText={value} informationText="Đã copy mã sản phẩm!" size={18} />
                </span>
              </div>

              <TextEllipsis value={strName ?? ""} line={1}></TextEllipsis>
            </>
          );
        },
      },
      {
        title: "Cửa hàng",
        dataIndex: "store",
        align: "center",
        visible: true,
        width: "14%",
        render: (text: string, item) => {
          return (
            <Link to={`${UrlConfig.STORE}/${item.store_id}`} target="_blank">
              {text}
            </Link>
          );
        },
      },
      {
        title: () => {
          const inventoryDefects = cloneDeep(data.items);
          const total =
            inventoryDefects?.reduce((value, element) => {
              return value + element.defect || 0;
            }, 0) || 0;
          return (
            <div>
              Số tồn lỗi{" "}
              <span style={{ color: "#2A2A86" }}>({formatCurrencyForProduct(total)})</span>
            </div>
          );
        },
        dataIndex: "defect",
        align: "center",
        visible: true,
        width: "9%",
        render: (value: number) => {
          return <span>{value}</span>;
        },
      },
      {
        title: "SL thay đổi",
        dataIndex: "quantity_adj",
        align: "center",
        visible: true,
        width: "9%",
        render: (value: number | null) => {
          const quantityAdj = value && value > 0 ? `+${value}` : value;
          return <span>{quantityAdj}</span>;
        },
      },
      {
        title: "Người thao tác",
        dataIndex: "updated_name",
        align: "center",
        visible: true,
        width: "15%",
        render: (text: string, item) => {
          return (
            <span>
              <Link to={`${UrlConfig.ACCOUNTS}/${text}`} target="_blank">
                {text}
              </Link>{" "}
              {item.updated_by && " - " + item.updated_by}
            </span>
          );
        },
      },
      {
        title: "Ngày thao tác",
        dataIndex: "updated_date",
        align: "center",
        visible: true,
        width: "10%",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        align: "center",
        visible: true,
        width: "20%",
      },
    ];
  }, [data]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<InventoryDefectHistoryResponse>>>(initColumns);

  const dataQuery = { ...initialQuery, ...getQueryParams(query) } as InventoryDefectQuery;

  const [params, setParams] = useState<InventoryDefectQuery>(dataQuery);

  const myStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const getInventoryDefectsHistory = useCallback(async () => {
    const res = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      getListInventoryDefectHistory,
      params,
    );
    if (res) {
      setData(res);
    }
  }, [dispatch, params]);

  const getStores = useCallback(async () => {
    const response = await callApiNative({ isShowError: true }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (response) {
      setStores(response);
    }
  }, [dispatch]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.INVENTORY_DEFECTS_HISTORY}?${queryParam}`);
    },
    [params, history],
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  const onColumnConfigChange = (
    newColumnsConfig: Array<ICustomTableColumType<InventoryDefectHistoryResponse>>,
  ) => {
    const newColumnsOrder = [];
    for (const columnConfig of newColumnsConfig) {
      const column = initColumns.find((col) => col.dataIndex === columnConfig.dataIndex);
      if (column) {
        newColumnsOrder.push({ ...column, visible: columnConfig.visible });
      }
    }
    onSaveConfigTableColumn(newColumnsOrder);
    setColumns(newColumnsOrder);
  };

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts((account) => {
      return [...account, ...data.items];
    });
  }, []);

  useEffect(() => {
    getInventoryDefectsHistory();
  }, [getInventoryDefectsHistory, params]);

  useEffect(() => {
    getStores();
    dispatch(searchAccountPublicAction({ page: 1 }, setDataAccounts));
  }, [dispatch, getStores, setDataAccounts]);

  useEffect(() => {
    return () => {
      clearInterval(exportRef.current as NodeJS.Timeout);
    };
  }, []);

  useEffect(() => {
    if (tableColumnConfigs && tableColumnConfigs.length) {
      const userConfig = tableColumnConfigs.find(
        (e) => e.type === COLUMN_CONFIG_TYPE.COLUMN_INVENTORY_DEFECT_HISTORY,
      );
      if (userConfig) {
        try {
          const columnsConfig = JSON.parse(userConfig.json_content);
          let newColumns = [];

          for (const colConfig of columnsConfig) {
            const col = initColumns.find((column) => column.dataIndex === colConfig.dataIndex);
            if (col) {
              newColumns.push({ ...col, visible: colConfig.visible });
            }
          }
          setColumns(newColumns);
        } catch (err) {
          showError("Lỗi lấy cài đặt cột");
        }
      }
    } else {
      setColumns([...initColumns]);
    }
  }, [initColumns, tableColumnConfigs, data]);

  const changeSelected = useCallback(
    (
      selectedRow: Array<InventoryDefectHistoryResponse>,
      selected: boolean | undefined,
      changeRow: any,
    ) => {
      if (selected) {
        const newSelectedRowKeys = changeRow.map((row: any) => row.id);
        const newSelectedRows = [...selectedRowData, ...changeRow];
        const newRowKeys = [...selectedRowKeys, ...newSelectedRowKeys];
        setSelectedRowData(newSelectedRows);
        setSelectedRowKeys(newRowKeys);
        return;
      }
      const deselectedRowKeys = selectedRowKeys.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item);

        return findIndex === -1;
      });
      const deselectedRow = selectedRowData.filter((el: InventoryDefectHistoryResponse) => {
        const findIndex = changeRow.findIndex((item: any) => item.id === el.id);
        return findIndex === -1;
      });
      setSelectedRowData(deselectedRow);
      setSelectedRowKeys(deselectedRowKeys);
    },
    [selectedRowData, selectedRowKeys],
  );

  const getItemsExportInPage = (params: InventoryDefectQuery) => {
    return callApiNative({ isShowLoading: false }, dispatch, getListInventoryDefectHistory, {
      ...params,
      limit: params.limit ?? 50,
    });
  };

  const getItemsExport = async (
    params: InventoryDefectQuery,
    total: number,
    exportType: string,
  ): Promise<Array<InventoryDefectHistoryResponse>> => {
    const limit = params.limit ?? 50;
    const newParams = exportType === ExportFileType.CURRENT_SEARCH ? { ...params } : {};
    const roundAll = Math.round(total / limit);
    const times = roundAll < total / limit ? roundAll + 1 : roundAll;
    let items: Array<InventoryDefectHistoryResponse> = [];
    let currentPage = 1;
    const intervalFun = async (
      resolve: (value: Array<InventoryDefectHistoryResponse>) => void,
      reject: (reason?: any) => void,
    ) => {
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        getListInventoryDefectHistory,
        {
          ...newParams,
          page: currentPage,
          limit: limit,
        },
      );
      if (res) {
        items = items.concat(res.items);
        const percent = Math.round(Number.parseFloat((currentPage / times).toFixed(2)) * 100);
        setExportProgress(percent);
        currentPage = currentPage + 1;
        if (currentPage > times) {
          clearInterval(exportRef.current as NodeJS.Timeout);
          currentPage = 1;
          resolve(items);
        }
      } else {
        clearInterval(exportRef.current as NodeJS.Timeout);
        currentPage = 1;
        setExportProgress(0);
        setStatusExport(ExportFileStatus.ExportError);
        reject();
      }
    };
    return new Promise((resolve, reject) => {
      exportRef.current = setInterval(() => intervalFun(resolve, reject), 3000);
    });
  };

  const convertItemExport = (item: InventoryDefectHistoryResponse) => {
    return {
      [InventoryDefectHistoryFieldsMapping.sku]: item.sku,
      [InventoryDefectHistoryFieldsMapping.name]: item.name,
      [InventoryDefectHistoryFieldsMapping.store_id]: item.store_id,
      [InventoryDefectHistoryFieldsMapping.store]: item.store,
      [InventoryDefectHistoryFieldsMapping.defect]: item.defect === 0 ? null : item.defect,
      [InventoryDefectHistoryFieldsMapping.quantity_adj]:
        item.quantity_adj === 0 ? null : item.quantity_adj,
      [InventoryDefectHistoryFieldsMapping.updated_name]: item.updated_name,
      [InventoryDefectHistoryFieldsMapping.updated_by]: item.updated_by,
      [InventoryDefectHistoryFieldsMapping.updated_date]: ConvertUtcToLocalDate(item.updated_date),
      [InventoryDefectHistoryFieldsMapping.note]: item.note,
    };
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      try {
        setStatusExport(ExportFileStatus.Exporting);
        const dataExport: Array<any> = [];
        let dataResult: Array<InventoryDefectHistoryResponse> = [];
        if (
          typeExport === ExportFileType.SELECTED &&
          selectedRowData &&
          selectedRowData.length === 0
        ) {
          setStatusExport(ExportFileStatus.Export);
          showWarning("Bạn chưa chọn sản phẩm nào để xuất file");
          return;
        }

        switch (typeExport) {
          case ExportFileType.INPAGE:
            const res = await getItemsExportInPage(params);
            dataResult = res.items;
            break;
          case ExportFileType.SELECTED:
            dataResult = [...selectedRowData];
            break;
          case ExportFileType.CURRENT_SEARCH:
            dataResult = await getItemsExport(
              params,
              data.metadata.total,
              ExportFileType.CURRENT_SEARCH,
            );
            break;
          case ExportFileType.ALL:
            const result = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListInventoryDefectHistory,
              {
                page: 1,
                limit: 30,
              },
            );
            const totalRecord = result.metadata.total;
            dataResult = await getItemsExport(params, totalRecord, ExportFileType.ALL);
            break;
          default:
            break;
        }
        if (dataResult.length === 0) {
          showWarning("Không có sản phẩm nào đủ điều kiện");
          return;
        }

        const workbook = utils.book_new();
        if (dataResult.length > 0) {
          for (let i = 0; i < dataResult.length; i++) {
            const e = dataResult[i];
            const item = convertItemExport(e);
            dataExport.push(item);
          }
        }
        const worksheet = utils.json_to_sheet(dataExport);
        utils.book_append_sheet(workbook, worksheet, "data");

        setStatusExport(ExportFileStatus.ExportSuccess);
        setExportProgress(100);
        const today = moment(new Date(), "YYYY/MM/DD");
        const month = today.format("M");
        const day = today.format("D");
        const year = today.format("YYYY");
        writeFile(workbook, `inventory_defects_history_${day}_${month}_${year}.xlsx`);
      } catch (e) {
        setStatusExport(ExportFileStatus.ExportError);
      }
    },
    Cancel: () => {
      clearInterval(exportRef.current as NodeJS.Timeout);
      setIsExportHistoryDefects(false);
      setExportProgress(0);
      setStatusExport(ExportFileStatus.Export);
    },
  };

  const filterDefectHistory = (values: InventoryDefectQuery) => {
    const newParams = { ...params, ...values, page: 1 };
    setParams(newParams);
    const queryParam = generateQuery(newParams);
    history.push(`${history.location.pathname}?${queryParam}`);
  };

  const clearFilterDefectHistory = () => {
    setParams(initialQuery);
    const queryParams = generateQuery(initialQuery);
    history.push(`${UrlConfig.INVENTORY_DEFECTS_HISTORY}?${queryParams}`);
  };

  const showColumnSetting = () => {
    setShowSettingColumn(true);
  };

  return (
    <>
      <InventoryDefectHistoryFilter
        myStores={myStores}
        stores={stores}
        filterDefects={filterDefectHistory}
        accounts={accounts}
        params={params}
        showColumnSetting={showColumnSetting}
        clearFilterDefect={clearFilterDefectHistory}
        setAccounts={(data) => {
          setAccounts((account) => {
            return [...data, ...account];
          });
        }}
      />
      <CustomTable
        className="small-padding"
        bordered
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
        columns={columnFinal}
        selectedRowKey={selectedRowKeys}
        onSelectedChange={changeSelected}
        isRowSelection
        rowKey={(item: LineItemDefect) => item.id}
        isShowPaginationAtHeader
        pagination={{
          showSizeChanger: true,
          pageSize: data?.metadata?.limit || 0,
          current: data?.metadata?.page || 0,
          total: data?.metadata?.total || 0,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        isSetDefaultColumn
        onResetToDefault={() => onColumnConfigChange(initColumns)}
        onOk={(data) => {
          setShowSettingColumn(false);
          onColumnConfigChange(data);
        }}
        data={columns}
      />
      {isExportHistoryDefects && (
        <ExportFileModal
          results={resultsExportFile}
          visible={isExportHistoryDefects}
          isExportList={true}
          onOk={(exportType) => actionExport.Ok(exportType)}
          title="lịch sử hàng lỗi"
          status={statusExport}
          onCancel={actionExport.Cancel}
          exportProgress={exportProgress}
        />
      )}
    </>
  );
};
