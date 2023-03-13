import { MenuAction } from "component/table/ActionButton";
import { getListLogInventoryTransferAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryListLogFilters from "../../Components/FIlter/InventoryListLogFilter";
import { InventoryTransferTabWrapper } from "./styles";
import {
  InventoryTransferDetailItem,
  InventoryTransferLog,
  InventoryTransferLogSearchQuery,
} from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountResponse } from "model/account/account.model";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";
import { Link } from "react-router-dom";
import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import CustomPagination from "component/table/CustomPagination";
import { StoreResponse } from "model/core/store.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  DELETE_TICKET: 3,
  PRINT: 4,
  PRINT_TICKET: 5,
  EXPORT_EXCEL: 6,
  MAKE_COPY: 7,
};

const ACTIONS_STATUS = {
  // REQUEST: {
  //   value: "requested",
  //   name: "Tạo phiếu yêu cầu",
  // },
  CONFIRM: {
    value: "confirmed",
    name: "Xác nhận phiếu chuyển"
  },
  UPDATE: {
    value: "updated",
    name: "Cập nhật thông tin"
  },
  EXPORT: {
    value: "exported",
    name: "Xuất hàng khỏi kho"
  },
  PENDING: {
    value: "pending",
    name: "Chờ xử lý"
  },
  BALANCE: {
    value: "balanced",
    name: "Nhận lại tồn chênh lệch"
  },
  RECEIVE: {
    value: "received",
    name: "Nhận hàng"
  },
  DELETE: {
    value: "deleted",
    name: "Xóa phiếu"
  },
  CANCEL: {
    value: "canceled",
    name: "Hủy phiếu"
  },
  FORWARD: {
    value: "forward",
    name: "Chuyển tiếp kho"
  },
  FROM_STORE_CHANGED: {
    value: "from_store_changed",
    name: "Thay đổi kho gửi"
  },
  TO_STORE_CHANGED: {
    value: "to_store_changed",
    name: "Thay đổi kho nhận"
  },
  LINE_ITEM_ADDED: {
    value: "line_item_added",
    name: "Thêm dòng sản phẩm"
  },
  LINE_ITEM_REMOVED: {
    value: "line_item_removed",
    name: "Xóa dòng sản phẩm"
  },
  LINE_ITEM_UPDATED: {
    value: "line_item_updated",
    name: "Cập nhật dòng sản phẩm"
  },
  GENERAL_UPDATED: {
    value: "general_updated",
    name: "Cập nhật"
  }
};
const initQuery: InventoryTransferLogSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  from_store_id: null,
  to_store_id: null,
  created_by: [],
  updated_by: [],
  action: [],
  from_created_date: null,
  to_created_date: null,
};

const actions: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.ADD_FORM_EXCEL,
    name: "Thêm mới từ Excel",
  },
  {
    id: ACTIONS_INDEX.WATCH_MANY_TICKET,
    name: "Xem nhiều phiếu",
  },
  {
    id: ACTIONS_INDEX.DELETE_TICKET,
    name: "Hủy phiếu",
  },
  {
    id: ACTIONS_INDEX.PRINT,
    name: "In vận đơn",
  },
  {
    id: ACTIONS_INDEX.PRINT_TICKET,
    name: "In phiếu",
  },
  {
    id: ACTIONS_INDEX.EXPORT_EXCEL,
    name: "Xuất Excel",
  },
  {
    id: ACTIONS_INDEX.MAKE_COPY,
    name: "Tạo bản sao",
  },
];

type HistoryInventoryTransferTabProps = {
  accountStores?: Array<StoreResponse> | null;
  stores?: Array<StoreResponse>;
  accounts?: Array<AccountResponse>;
  defaultAccountProps?: any;
  setAccounts?: (e: any) => any;
};

const HistoryInventoryTransferTab: React.FC<HistoryInventoryTransferTabProps> = (
  props: HistoryInventoryTransferTabProps,
) => {
  const { accounts, stores, setAccounts, defaultAccountProps } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [tableLoading, setTableLoading] = useState(true);
  let dataQuery: InventoryTransferLogSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };

  const history = useHistory();
  let [params, setPrams] = useState<InventoryTransferLogSearchQuery>(dataQuery);

  const [data, setData] = useState<PageResponse<Array<InventoryTransferLog>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [columns, setColumn] = useState<Array<any>>([
    {
      title: "Mã phiếu chuyển",
      dataIndex: "transfer_code",
      align: "left",
      width: "150px",
      fixed: "left",
      visible: true,
      render: (value: string, item: InventoryTransferLog) => {
        return (
          <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${item.transfer_id}`}>{value}</Link>
        );
      },
    },
    {
      title: "Kho gửi",
      dataIndex: "from_store_name",
      visible: true,
      align: "left",
    },
    {
      title: "Kho nhận",
      dataIndex: "to_store_name",
      visible: true,
      align: "left",
    },
    {
      title: "Người sửa",
      dataIndex: "updated_by",
      visible: true,
      align: "left",
      render: (value: string, item: InventoryTransferLog) => {
        return (
          <>
            <div>
              <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${value}`}>
                {value}
              </Link>
            </div>
            <div>{item.updated_name}</div>
          </>
        );
      },
    },
    {
      title: "Log ID",
      dataIndex: "log_id",
      visible: true,
      align: "left",
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      visible: true,
      align: "left",
      render: (value: string) => {
        let displayName = "";
        switch (value) {
          // case ACTIONS_STATUS.REQUEST.value:
          //   displayName = ACTIONS_STATUS.REQUEST.name;
          //   break;
          case ACTIONS_STATUS.UPDATE.value:
            displayName = ACTIONS_STATUS.UPDATE.name;
            break;
          case ACTIONS_STATUS.CONFIRM.value:
            displayName = ACTIONS_STATUS.CONFIRM.name;
            break;
          case ACTIONS_STATUS.EXPORT.value:
            displayName = ACTIONS_STATUS.EXPORT.name;
            break;
          case ACTIONS_STATUS.PENDING.value:
            displayName = ACTIONS_STATUS.PENDING.name;
            break;
          case ACTIONS_STATUS.BALANCE.value:
            displayName = ACTIONS_STATUS.BALANCE.name;
            break;
          case ACTIONS_STATUS.RECEIVE.value:
            displayName = ACTIONS_STATUS.RECEIVE.name;
            break;
          case ACTIONS_STATUS.DELETE.value:
            displayName = ACTIONS_STATUS.DELETE.name;
            break;
          case ACTIONS_STATUS.CANCEL.value:
            displayName = ACTIONS_STATUS.CANCEL.name;
            break;
          case ACTIONS_STATUS.FORWARD.value:
            displayName = ACTIONS_STATUS.FORWARD.name;
            break;
          case ACTIONS_STATUS.FROM_STORE_CHANGED.value:
            displayName = ACTIONS_STATUS.FROM_STORE_CHANGED.name;
            break;
          case ACTIONS_STATUS.TO_STORE_CHANGED.value:
            displayName = ACTIONS_STATUS.TO_STORE_CHANGED.name;
            break;
          case ACTIONS_STATUS.LINE_ITEM_ADDED.value:
            displayName = ACTIONS_STATUS.LINE_ITEM_ADDED.name;
            break;
          case ACTIONS_STATUS.LINE_ITEM_REMOVED.value:
            displayName = ACTIONS_STATUS.LINE_ITEM_REMOVED.name;
            break;
          case ACTIONS_STATUS.LINE_ITEM_UPDATED.value:
            displayName = ACTIONS_STATUS.LINE_ITEM_UPDATED.name;
            break;
          case ACTIONS_STATUS.GENERAL_UPDATED.value:
            displayName = ACTIONS_STATUS.GENERAL_UPDATED.name;
            break;
        }
        return `${displayName}`;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "updated_date",
      visible: true,
      align: "left",
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, "DD/MM/YYYY HH:mm:ss");
      },
    },
  ]);

  const dispatch = useDispatch();

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      let queryParam = generateQuery({ ...params });
      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/histories?${queryParam}`);
    },
    [history, params],
  );

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryTransferLog>> | false) => {
      if (!!result) {
        setTableLoading(false);
        setData(result);
      }
    },
    [],
  );

  const getAccounts = async (codes: string) => {
    const initSelectedResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      searchAccountPublicApi,
      {
        codes,
      },
    );

    setAccounts && setAccounts(initSelectedResponse.items);
  };

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${InventoryTransferTabUrl.HISTORIES}?${queryParam}`);
      getAccounts(newPrams.updated_by).then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, params],
  );

  const onClearFilter = useCallback(() => {
    setPrams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_TRANSFERS}/histories?${queryParam}`);
  }, [history]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  useEffect(() => {
    setTableLoading(true);
    dispatch(getListLogInventoryTransferAction(params, setSearchResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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

  return (
    <InventoryTransferTabWrapper>
      <InventoryListLogFilters
        accounts={accounts}
        defaultAccountProps={defaultAccountProps}
        params={params}
        stores={stores}
        actions={actions}
        isLoading={tableLoading}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onMenuClick={() => {}}
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
        isLoading={tableLoading}
        selectedRowKey={selectedRowKeys}
        scroll={{ x: 1300 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
        pagination={false}
        onSelectedChange={(selectedRows, selected, changeRow) =>
          onSelectedChange(selectedRows, selected, changeRow)
        }
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: InventoryTransferLog) => item.id}
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
    </InventoryTransferTabWrapper>
  );
};

export default HistoryInventoryTransferTab;
