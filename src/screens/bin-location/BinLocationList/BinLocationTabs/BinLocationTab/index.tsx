import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import BinLocationListFilters from "../../Components/Filters/BinLocationListFilter";
import { InventoryTransferDetailItem } from "model/inventory/transfer";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";

import ModalSettingColumn from "component/table/ModalSettingColumn";
import { BinLocationListTabStylesWrapper } from "./styles";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";

import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { AccountResponse } from "model/account/account.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import CustomPagination from "component/table/CustomPagination";
import { StoreResponse } from "model/core/store.model";
import { ellipseName } from "../../../../products/helper";
import { Image } from "antd";
import { ImageProduct } from "../../../../products/product/component";
import TextEllipsis from "component/table/TextEllipsis";
import { callApiNative } from "utils/ApiUtils";
import {
  getListBinLocationApi,
  getListBinLocationSumApi,
} from "service/inventory/bin-location/index.service";
import {
  BinDataResponse,
  BinLocationExport,
  BinLocationResponse,
  BinLocationSearchQuery,
  SumBinDataResponse,
} from "model/bin-location";
import { showError, showWarning } from "utils/ToastUtils";
import ExportFileModal, { ResultLimitModel } from "component/modal/ExportFileModal/ExportFileModal";
import { ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";
import { utils, writeFile } from "xlsx";
import moment from "moment";

type InventoryTransferTabProps = {
  accountStores?: Array<StoreResponse> | null;
  stores?: Array<StoreResponse>;
  accounts?: Array<AccountResponse>;
  defaultAccountProps?: PageResponse<AccountResponse>;
  setAccounts?: (e: any) => any;
  setCountTransferIn?: (e: number) => void;
  setCountTransferOut?: (e: number) => void;
  activeTab?: string;
  storeIdSelected?: number | null;
  isExportBinList: boolean;
  setIsExportBinList: React.Dispatch<React.SetStateAction<boolean>>;
};

const initQuery: BinLocationSearchQuery = {
  page: 1,
  limit: 30,
  condition: undefined,
  filter_status: undefined,
};

const BinLocationTab: React.FC<InventoryTransferTabProps> = (props: InventoryTransferTabProps) => {
  const {
    accountStores,
    stores,
    accounts,
    defaultAccountProps,
    activeTab,
    storeIdSelected,
    isExportBinList,
    setIsExportBinList,
  } = props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);
  const [sumBinData, setSumBinData] = useState<Array<SumBinDataResponse>>([]);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(ExportFileStatus.Export);
  const exportRef: { current: NodeJS.Timeout | null } = useRef(null);

  const dispatch = useDispatch();
  let dataQuery: BinLocationSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<BinLocationSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

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
      isHidden: selectedRowData.length <= 0,
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultColumns: Array<ICustomTableColumType<BinLocationResponse>> = useMemo(() => {
    return [
      {
        title: "Sản phẩm",
        visible: true,
        dataIndex: "sku",
        align: "left",
        fixed: "left",
        width: 250,
        className: "column-product",
        render: (value, record) => {
          const strName = ellipseName(record.name);
          return (
            <div className="image-product">
              {record.variantImage ? (
                <Image width={40} height={40} placeholder="Xem" src={record.variantImage ?? ""} />
              ) : (
                <ImageProduct isDisabled={true} path={record.variantImage} />
              )}
              <div className="product-name">
                <div>
                  <Link
                    to={`${UrlConfig.PRODUCT}/${record.productId}/variants/${record.variantId}`}
                  >
                    {record.sku}
                  </Link>
                </div>
                <div>
                  <TextEllipsis value={strName} line={1} />
                </div>
              </div>
            </div>
          );
        },
      },
      {
        titleCustom: "Sàn trưng bày",
        title: () => {
          const disPlayBinSum = sumBinData.find(
            (bin: SumBinDataResponse) => bin.binCode === "0A-01-01-01-0A",
          );
          const total = disPlayBinSum ? disPlayBinSum.onHand : 0;
          return (
            <>
              <div>Sàn trưng bày</div>
              <div>({formatCurrency(total)})</div>
            </>
          );
        },
        dataIndex: "bins",
        visible: true,
        align: "right",
        render: (value: any, record) => {
          if (record.bins.length === 0) return <></>;
          const valueSelected = record.bins.filter((bin: any) => bin.binCode.indexOf("0A") === 0);
          if (valueSelected.length === 0) return <></>;
          return `${formatCurrency(valueSelected[0].onHand, ".")} (${
            valueSelected[0].onHand > 0
              ? record.onHand > 0
                ? ((valueSelected[0].onHand / record.onHand) * 100).toFixed(2)
                : 0
              : 0
          }%)`;
        },
      },
      {
        titleCustom: "Kho lưu trữ",
        title: () => {
          const binStoredSum = sumBinData.find(
            (bin: SumBinDataResponse) => bin.binCode === "0B-01-01-01-0A",
          );

          const total = binStoredSum ? binStoredSum.onHand : 0;
          return (
            <>
              <div>Kho lưu trữ</div>
              <div>({formatCurrency(total)})</div>
            </>
          );
        },
        dataIndex: "bins",
        visible: true,
        align: "right",
        render: (value: any, record) => {
          if (record.bins.length === 0) return <></>;
          const valueSelected = record.bins.filter((bin: any) => bin.binCode.indexOf("0B") === 0);
          if (valueSelected.length === 0) return <></>;
          return `${formatCurrency(valueSelected[0].onHand, ".")} (${
            valueSelected[0].onHand > 0
              ? record.onHand > 0
                ? ((valueSelected[0].onHand / record.onHand) * 100).toFixed(2)
                : 0
              : 0
          }%)`;
        },
      },
      {
        titleCustom: "Tồn trong kho",
        title: () => {
          let total = 0;
          sumBinData.forEach((bin: SumBinDataResponse) => {
            total += bin.onHand;
          });
          return (
            <>
              <div>Tồn trong kho</div>
              <div>({formatCurrency(total)})</div>
            </>
          );
        },
        dataIndex: "onHand",
        visible: true,
        align: "right",
        render: (value: number) => {
          return formatCurrency(value, ".");
        },
      },
    ];
  }, [sumBinData]);

  const [columns, setColumn] = useState<Array<any>>(defaultColumns);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery({ ...params });
      history.push(`${history.location.pathname}?${queryParam}`);
    },
    [history, params],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...params, ...values, page: 1 };
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      // setTableLoading(true);
      history.push(`${history.location.pathname}?${queryParam}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, params],
  );

  const onClearFilter = useCallback(() => {
    setParams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_TRANSFERS}#1?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback(
    (
      selectedRow: Array<InventoryTransferDetailItem>,
      selected: boolean | undefined,
      changeRow: any,
    ) => {
      const newSelectedRowKeys = changeRow.map((row: any) => row.id);

      if (selected) {
        setSelectedRowKeys([...selectedRowKeys, ...newSelectedRowKeys]);
        setSelectedRowData([...selectedRowData, ...changeRow]);
        return;
      }

      const newSelectedRowKeysByDeselected = selectedRowKeys.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item);

        return findIndex === -1;
      });

      const newSelectedRowByDeselected = selectedRowData.filter((item) => {
        const findIndex = changeRow.findIndex((row: any) => row.id === item.id);

        return findIndex === -1;
      });

      setSelectedRowKeys(newSelectedRowKeysByDeselected);
      setSelectedRowData(newSelectedRowByDeselected);
    },
    [selectedRowData, selectedRowKeys],
  );

  const getBinLocationListByStoreId = async (storeIdSelected: number) => {
    return await callApiNative(
      { isShowError: true },
      dispatch,
      getListBinLocationApi,
      storeIdSelected,
      params,
    );
  };

  const getBinLocationSummaryStoreId = (storeIdSelected: number) => {
    return getListBinLocationSumApi(storeIdSelected, {
      condition: params.condition,
      filter_status: params.filter_status,
    });
  };

  useEffect(() => {
    // setTableLoading(true);
    if (activeTab === "") return;

    let queryParam = generateQuery(params);
    history.push(`${history.location.pathname}?${queryParam}`);

    // CALL API

    if (!storeIdSelected) return;
    setTableLoading(true);
    getBinLocationListByStoreId(storeIdSelected).then((res) => {
      setData(res);
    });
    getBinLocationSummaryStoreId(storeIdSelected)
      .then((res) => {
        setTableLoading(false);
        setSumBinData(res.data);
      })
      .catch((err) => {
        showError(err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, params, storeIdSelected]);

  useEffect(() => {
    setColumn(defaultColumns);
  }, [defaultColumns]);

  const convertItemExport = (item: BinLocationResponse) => {
    const displayBin = item.bins.find((e: BinDataResponse) => e.binCode.indexOf("0A") === 0);
    const storedBin = item.bins.find((e: BinDataResponse) => e.binCode.indexOf("0B") === 0);
    return {
      [`Barcode`]: item.barcode,
      [`SKU`]: item.sku,
      [`Sản phẩm`]: item.name,
      [`Sàn trưng bày`]: displayBin?.onHand,
      [`Kho dự trữ`]: storedBin?.onHand,
      [`Tồn trong kho`]: item.onHand,
    };
  };

  const getItemsExportInPage = async (params: BinLocationSearchQuery) => {
    const response = await getListBinLocationApi(storeIdSelected as number, params);
    return response.data;
  };

  const getItemsExport = async (
    params: BinLocationSearchQuery,
    total: number,
    exportType: string,
  ): Promise<Array<BinLocationResponse>> => {
    const limit = params.limit ?? 50;
    const newParams = exportType === ExportFileType.CURRENT_SEARCH ? { ...params } : {};
    const roundAll = Math.round(total / limit);
    const times = roundAll < total / limit ? roundAll + 1 : roundAll;
    let items: Array<BinLocationResponse> = [];
    let currentPage = 1;
    const intervalFun = async (resolve: any, reject: any) => {
      const res = await getListBinLocationApi(storeIdSelected as number, {
        ...newParams,
        page: currentPage,
        limit: limit,
      });
      if (res) {
        items = items.concat(res.data.items);
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

  const actionExport = {
    Ok: async (typeExport: string) => {
      try {
        setStatusExport(ExportFileStatus.Exporting);
        const dataExport: Array<BinLocationExport> = [];
        let dataResult: Array<BinLocationResponse> = [];
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
            const result = await getListBinLocationApi(storeIdSelected as number, {
              page: 1,
              limit: 30,
            });
            const totalRecord = result.data.metadata.total;
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
        writeFile(workbook, `bin_location_${day}_${month}_${year}.xlsx`);
      } catch (e) {
        setStatusExport(ExportFileStatus.ExportError);
      }
    },
    Cancel: () => {
      clearInterval(exportRef.current as NodeJS.Timeout);
      setIsExportBinList(false);
      setExportProgress(0);
      setStatusExport(ExportFileStatus.Export);
    },
  };

  return (
    <BinLocationListTabStylesWrapper>
      <BinLocationListFilters
        isLoadingAction={tableLoading}
        activeTab={activeTab}
        accounts={accounts}
        defaultAccountProps={defaultAccountProps}
        params={params}
        stores={stores}
        accountStores={accountStores}
        actions={[]}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        onClearFilter={() => onClearFilter()}
      />
      <CustomPagination
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      <CustomTable
        bordered
        isRowSelection
        selectedRowKey={selectedRowKeys}
        isLoading={tableLoading}
        scroll={{ x: 1000 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        onSelectedChange={(selectedRows, selected, changeRow) =>
          onSelectedChange(selectedRows, selected, changeRow)
        }
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: VariantResponse) => item.id}
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
      {isExportBinList && (
        <ExportFileModal
          results={resultsExportFile}
          visible={isExportBinList}
          isExportList={true}
          onOk={(exportType) => actionExport.Ok(exportType)}
          title="vị trí sản phẩm"
          status={statusExport}
          onCancel={actionExport.Cancel}
          exportProgress={exportProgress}
        />
      )}
    </BinLocationListTabStylesWrapper>
  );
};

export default BinLocationTab;
