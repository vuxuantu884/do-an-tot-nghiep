import { MenuAction } from "component/table/ActionButton";
import { inventoryGetSenderStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryFilters from "../../Components/FIlter/InventoryListFilter";
import { InventoryTransferTabWrapper } from "../HistoryInventoryTransfer/styles";
import { Store } from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  DELETE_TICKET: 3,
  PRINT : 4,
  PRINT_TICKET: 5,
  EXPORT_EXCEL: 6,
  MAKE_COPY: 7,
};

const initQuery: VariantSearchQuery = {
  info: "",
  barcode: "",
  status: "",
  brand: "",
  made_in: "",
  size: "",
  main_color: "",
  color: "",
  supplier: "",
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
  const [tableLoading, setTableLoading] = useState(false);
  let dataQuery: VariantSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<VariantSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [columns, setColumn] = useState<Array<any>>([
    {
      title: "Phiếu chuyển",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Kho gửi",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Kho nhận",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Người sửa",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Log ID",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Thao tác",
      dataIndex: "created_date",
      visible: true,
      align: "center",
    },
    {
      title: "Thời gian",
      dataIndex: "created_date",
      visible: true,
      align: "center",
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

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  //get store
  useEffect(() => {
    setData({
      metadata: {
        limit: 30,
        page: 1,
        total: 0,
      },
      items: [],
    });
    setTableLoading(false);
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [dispatch]);

  return (
    <InventoryTransferTabWrapper>
      <InventoryFilters
        params={[]}
        stores={stores}
        actions={actions}
        onMenuClick={() => {}}
        onClickOpen={() => setShowSettingColumn(true)}
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
    </InventoryTransferTabWrapper>
  )
}

export default HistoryInventoryTransferTab;