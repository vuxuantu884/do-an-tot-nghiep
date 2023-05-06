import { MenuAction } from "component/table/ActionButton";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

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
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import BinHistoriesListFilter from "../../Components/Filters/BinHistoriesListFilter";
import { callApiNative } from "utils/ApiUtils";
import { getListBinLocationHistoryApi } from "service/inventory/bin-location/index.service";
import { BinLocationHistoryResponse, BinLocationSearchQuery } from "model/bin-location";

type InventoryTransferTabProps = {
  accountStores?: Array<StoreResponse> | null;
  stores?: Array<StoreResponse>;
  accounts?: Array<AccountResponse>;
  defaultAccountProps?: PageResponse<AccountResponse>;
  setAccounts?: (e: any) => any;
  storeIdSelected?: number | null;
  setCountTransferIn?: (e: number) => void;
  setCountTransferOut?: (e: number) => void;
  activeTab?: string;
};

const initQuery: BinLocationSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
};

const BinHistoriesListTab: React.FC<InventoryTransferTabProps> = (
  props: InventoryTransferTabProps,
) => {
  const { accountStores, stores, accounts, defaultAccountProps, activeTab, storeIdSelected } =
    props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);

  const dispatch = useDispatch();
  let dataQuery: BinLocationSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<BinLocationSearchQuery>(dataQuery);
  const [actions, setActions] = useState<MenuAction[]>([]);
  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultColumns: Array<ICustomTableColumType<BinLocationHistoryResponse>> = [
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
                <Link to={`${UrlConfig.PRODUCT}/${record.productId}/variants/${record.id}`}>
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
      title: "Bin gửi",
      dataIndex: "fromBinCode",
      visible: true,
    },
    {
      title: "Bin nhận",
      dataIndex: "toBinCode",
      visible: true,
    },
    {
      title: "Số lượng",
      dataIndex: "onHand",
      visible: true,
      align: "right",
      width: 150,
      render: (value: number) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "Hành động",
      dataIndex: "action",
      visible: true,
      align: "right",
    },
    {
      title: "Người chuyển",
      dataIndex: "updatedBy",
      visible: true,
      align: "left",
      width: 200,
      render: (value: string, item: any) => {
        return (
          <>
            <Link to={`${UrlConfig.ACCOUNTS}/${value}`}>
              {item.updatedBy} - {item.updatedName}
            </Link>
          </>
        );
      },
    },
    {
      title: "Ngày chuyển",
      dataIndex: "transactionDate",
      visible: true,
      align: "left",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYY_HHmm)}</div>,
    },
  ];

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
      console.log(newParams);
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

  const getBinLocationHistoryListByStoreId = async (storeIdSelected: number) => {
    return await callApiNative(
      { isShowError: true },
      dispatch,
      getListBinLocationHistoryApi,
      storeIdSelected,
      params,
    );
  };

  useEffect(() => {
    // setTableLoading(true);
    if (activeTab === "") return;

    let queryParam = generateQuery(params);
    history.push(`${history.location.pathname}?${queryParam}`);

    if (!storeIdSelected) return;

    // CALL API

    if (!storeIdSelected) return;

    setTableLoading(true);

    getBinLocationHistoryListByStoreId(storeIdSelected).then((res) => {
      setTableLoading(false);
      if (!res) return;
      setData(res);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, activeTab, params, storeIdSelected]);

  return (
    <BinLocationListTabStylesWrapper>
      <BinHistoriesListFilter
        isLoadingAction={tableLoading}
        activeTab={activeTab}
        accounts={accounts}
        defaultAccountProps={defaultAccountProps}
        params={params}
        stores={stores}
        accountStores={accountStores}
        actions={actions}
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
    </BinLocationListTabStylesWrapper>
  );
};

export default BinHistoriesListTab;
