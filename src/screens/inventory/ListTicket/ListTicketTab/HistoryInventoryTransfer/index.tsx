import { MenuAction } from "component/table/ActionButton";
import { getListLogInventoryTransferAction, inventoryGetSenderStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryListLogFilters from "../../Components/FIlter/InventoryListLogFilter";
import { InventoryTransferTabWrapper } from "../HistoryInventoryTransfer/styles";
import { InventoryTransferLog, InventoryTransferLogSearchQuery, Store } from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";
import { Link } from "react-router-dom";

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  DELETE_TICKET: 3,
  PRINT : 4,
  PRINT_TICKET: 5,
  EXPORT_EXCEL: 6,
  MAKE_COPY: 7,
};

const ACTIONS_STATUS = {
  CREATE : {
    value: 'CREATE',
    name: 'Tạo phiếu chuyển kho',
  },
  UPDATE : {
    value: 'UPDATE',
    name: 'Sửa phiếu chuyển kho',
  },
  DELETE : {
    value: 'DELETE',
    name: 'Huỷ phiếu chuyển kho',
  },
  CONFIRM_EXCEPTION : {
    value: 'CONFIRM_EXCEPTION',
    name: 'Xác nhận hàng thừa thiếu',
  },
  CREATE_SHIPMENT : {
    value: 'CREATE_SHIPMENT',
    name: 'Tạo mới đơn vận chuyển',
  },
  CANCEL_SHIPMENT : {
    value: 'CANCEL_SHIPMENT',
    name: 'Huỷ đơn vận chuyển',
  },
  EXPORT_SHIPMENT : {
    value: 'EXPORT_SHIPMENT',
    name: 'Xuất hàng khỏi kho',
  },
  RECEIVE : {
    value: 'RECEIVE',
    name: 'Nhận hàng',
  }
}
const initQuery: InventoryTransferLogSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  from_store_id: null,
  to_store_id: null,
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

const HistoryInventoryTransferTab: React.FC = () => {

  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [tableLoading, setTableLoading] = useState(true);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
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

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );

  const [columns, setColumn] = useState<Array<any>>([
    {
      title: "Phiếu chuyển",
      dataIndex: "data",
      width: "150px",
      fixed: "left",
      visible: true,
      align: "center",
      render: (value: string) => {

        const dataItem = JSON.parse(value);

        return <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${dataItem?.id}`}>{dataItem?.code}</Link>
      }
    },
    {
      title: "Kho gửi",
      dataIndex: "from_store_name",
      visible: true,
      align: "center",
    },
    {
      title: "Kho nhận",
      dataIndex: "to_store_name",
      visible: true,
      align: "center",
    },
    {
      title: "Người sửa",
      dataIndex: "updated_by",
      visible: true,
      align: "center",
      render: (value: string, item: InventoryTransferLog, index: number) => {
        return (
          <>
          <div>
            <b>{item.created_by ?? ""}</b>
          </div>
          <div>
            {item.created_name ?? ""}
          </div>
        </>
        );
      },
    },
    {
      title: "Log ID",
      dataIndex: "id",
      visible: true,
      align: "center",
    },
    {
      title: "Thao tác",
      dataIndex: "action",
      visible: true,
      align: "center",
      render: (value: string) => {
        let displayName = "";
        switch (value.toUpperCase()) {
          case ACTIONS_STATUS.CREATE.value:
            displayName = ACTIONS_STATUS.CREATE.name;
            break;
          case ACTIONS_STATUS.UPDATE.value:
            displayName = ACTIONS_STATUS.UPDATE.name;
            break;
          case ACTIONS_STATUS.DELETE.value:
            displayName = ACTIONS_STATUS.DELETE.name;
            break;
          case ACTIONS_STATUS.CONFIRM_EXCEPTION.value:
            displayName = ACTIONS_STATUS.CONFIRM_EXCEPTION.name;
            break;
          case ACTIONS_STATUS.CREATE_SHIPMENT.value:
            displayName = ACTIONS_STATUS.CREATE_SHIPMENT.name;
            break;
          case ACTIONS_STATUS.CANCEL_SHIPMENT.value:
            displayName = ACTIONS_STATUS.CANCEL_SHIPMENT.name;
            break;
          case ACTIONS_STATUS.EXPORT_SHIPMENT.value:
            displayName = ACTIONS_STATUS.EXPORT_SHIPMENT.name;
            break;
          case ACTIONS_STATUS.RECEIVE.value:
            displayName = ACTIONS_STATUS.RECEIVE.name;
            break;
        }
        return displayName;
      }
    },
    {
      title: "Thời gian",
      dataIndex: "updated_date",
      visible: true,
      align: "center",
      render: (value: string) => {
        return ConvertUtcToLocalDate(value, 'DD/MM/YYYY HH:mm:ss')
      }
    },
  ]);

  const dispatch = useDispatch();

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
    },
    [params]
  );

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryTransferLog>> | false) => {
      setTableLoading(true);
      if (!!result) {
        setTableLoading(false);
        setData(result);
      }
    },
    []
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${InventoryTransferTabUrl.HISTORIES}?${queryParam}`);
    },
    [history, params]
  );

  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/histories?${queryParam}`);
    },
    [history]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  //get store
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    setTableLoading(false);
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [dispatch, setDataAccounts]);

  //get list
  useEffect(() => {
    dispatch(getListLogInventoryTransferAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <InventoryTransferTabWrapper>
      <InventoryListLogFilters
        accounts={accounts}
        params={params}
        stores={stores}
        actions={actions}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onMenuClick={() => {}}
        onFilter={onFilter}
        onClearFilter={() => onClearFilter()}
      />
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        scroll={{ x: 1300 }}
        sticky={{ offsetScroll: 5, offsetHeader: 55 }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
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
  )
}

export default HistoryInventoryTransferTab;
