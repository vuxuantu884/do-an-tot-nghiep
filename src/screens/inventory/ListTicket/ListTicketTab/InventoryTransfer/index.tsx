import { MenuAction } from "component/table/ActionButton";
import { getListInventoryTransferAction, inventoryGetSenderStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryFilters from "../../Components/FIlter/InventoryListFilter";
import { InventoryTransferDetailItem, InventoryTransferSearchQuery, Store } from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Tag } from "antd";
import { InventoryTransferTabWrapper } from "./styles";
import { STATUS_INVENTORY_TRANSFER } from "../../constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { PaperClipOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  DELETE_TICKET: 3,
  PRINT : 4,
  PRINT_TICKET: 5,
  EXPORT_EXCEL: 6,
  MAKE_COPY: 7,
};

const initQuery: InventoryTransferSearchQuery = {
  page: 1,
  limit: 30,
  condition: "",
  from_store_id: "",
  to_store_id: "",
  status: "",
  from_total_variant: "",
  to_total_variant: "",
  from_total_quantity: "",
  to_total_quantity: "",
  from_total_amount: "",
  to_total_amount: "",
  created_by: "",
  from_created_date: "",
  to_created_date: "",
  from_transfer_date: "",
  to_transfer_date: "",
  from_receive_date: "",
  to_receive_date: ""
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

const InventoryTransferTab: React.FC = () => {

  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  const dispatch = useDispatch();
  let dataQuery: InventoryTransferSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryTransferSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<Array<InventoryTransferDetailItem>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  
  const [columns, setColumn] = useState<Array<any>>([
    {
      title: "ID phiếu chuyển",
      dataIndex: "code",
      visible: true,
      align: "center",
      fixed: "left",
      width: "150px",
      render: (value: string, row: InventoryTransferDetailItem) => (
        <Link to={`${UrlConfig.INVENTORY_TRANSFER}/${row.id}`}>{value}</Link>
      ),
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
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      align: "center",
      render: (item: string) => {
        let textTag = '';
        let classTag = '';
        switch (item) {
          case STATUS_INVENTORY_TRANSFER.TRANSFERRING.status:
            textTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.name;
            classTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.status;
            break;
          
          case STATUS_INVENTORY_TRANSFER.PENDING.status:
            textTag = STATUS_INVENTORY_TRANSFER.PENDING.name;
            classTag = STATUS_INVENTORY_TRANSFER.PENDING.status;
            break;
          case STATUS_INVENTORY_TRANSFER.RECEIVED.status:
            textTag = STATUS_INVENTORY_TRANSFER.RECEIVED.name;
            classTag = STATUS_INVENTORY_TRANSFER.RECEIVED.status;
            break;
          default:
            textTag = STATUS_INVENTORY_TRANSFER.CONFIRM.name;
            classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
            break;
        }
        return (
          <Tag className={classTag}>{textTag}</Tag>
        )
      }
    },
    {
      title: "SP",
      dataIndex: "total_variant",
      visible: true,
      align: "center",
    },
    {
      title: "SL",
      dataIndex: "total_quantity",
      visible: true,
      align: "center",
    },
    {
      title: "Thành tiền",
      dataIndex: "total_amount",
      visible: true,
      align: "center",
    },
    {
      title: "Ngày chuyển",
      dataIndex: "transfer_date",
      visible: true,
      align: "center",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Ngày nhận",
      dataIndex: "receive_date",
      visible: true,
      align: "center",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Tệp đính kèm",
      dataIndex: "attached_files",
      visible: true,
      align: "center",
      width: "250px",
      render: (item: any) => {
       return(
        <span>
            {item?.map((link: string) => {
              return (
                <a className="file-pin" target="_blank" rel="noreferrer" href={link}><PaperClipOutlined /> {link}</a>
              );
            })}
        </span>
      )
      }
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      align: "center",
    },
    {
      title: "Người tạo",
      dataIndex: "updated_by",
      visible: true,
      align: "center",
    },
    {
      title: "Ngày tạo",
      dataIndex: "updated_date",
      visible: true,
      align: "center",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    
  ]);

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
  
  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryTransferDetailItem>> | false) => {
      setTableLoading(true);
      if (!!result) {
        setTableLoading(false);
        setData(result);
      }
    },
    []
  );

  const printTicketAction = useCallback((index: number) => {
    let printType = "";
    if (index === ACTIONS_INDEX.PRINT) {
      printType = "inventory_transfer_bill";
    } else if (index === ACTIONS_INDEX.PRINT_TICKET) {
      printType = "inventory_transfer";
    }
    console.log('selectedRowKeys', selectedRowKeys);

    let params = {
      ids: selectedRowKeys,
      "type": printType,
    };
    const queryParam = generateQuery(params);
    
    history.push(`${UrlConfig.INVENTORY_TRANSFER}/print-preview?${queryParam}`);
  }, [history, selectedRowKeys]);


  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT_TICKET:
          printTicketAction(index);
          break;
        case ACTIONS_INDEX.PRINT:
          printTicketAction(index);
          break;
      
        default:
          break;
      }
    },
    [printTicketAction]
  );

  const onSelectedChange = useCallback((selectedRow) => {
    
    const selectedRowKeys = selectedRow.map((row: any) => row.id);    
    setSelectedRowKeys(selectedRowKeys);

  }, []);

  //get store
  useEffect(() => {
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [dispatch]);

  //get list
  useEffect(() => {
    dispatch(getListInventoryTransferAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <InventoryTransferTabWrapper>
      <InventoryFilters
        params={[]}
        stores={stores}
        actions={actions}
        onMenuClick={onMenuClick}
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
        onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
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

export default InventoryTransferTab;