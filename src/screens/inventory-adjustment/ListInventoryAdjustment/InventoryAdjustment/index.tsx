import { MenuAction } from "component/table/ActionButton";
import { InventoryAdjustmentGetPrintContentAction, inventoryGetSenderStoreAction } from "domain/actions/inventory/inventory-adjustment.action";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryAdjustmentFilters from "../components/InventoryAdjustmentFilter";
import { InventoryAdjustmentDetailItem, InventoryAdjustmentSearchQuery } from "model/inventoryadjustment";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Tag, Space } from "antd";
import { InventoryAdjustmentWrapper } from "./styles";
import { INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY, STATUS_INVENTORY_ADJUSTMENT } from "../constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { AccountResponse } from "model/account/account.model";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { getListInventoryAdjustmentAction } from "domain/actions/inventory/inventory-adjustment.action";
import { StoreResponse } from "model/core/store.model";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";

const ACTIONS_INDEX = {
  PRINT: 1,
  UPDATE: 2,
  ADJUSTMENT: 3,
};

const initQuery: InventoryAdjustmentSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  adjusted_store_id: null,
  status: [],
  from_total_variant: null,
  to_total_variant: null,
  from_total_quantity: null,
  to_total_quantity: null,
  from_total_amount: null,
  to_total_amount: null,
  created_by: [],
  from_created_date: null,
  to_created_date: null,
  from_inventoryadjustment_date: null,
  to_inventoryadjustment_date: null,
};

const actions: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.PRINT,
    name: "In phiếu",
  }, 
  {
    id: ACTIONS_INDEX.ADJUSTMENT,
    name: "Cân tồn kho",
  },
];

const InventoryAdjustment: React.FC = () => {

  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);

  const printElementRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const [printContent, setPrintContent] = useState("");

  const dispatch = useDispatch();
  let dataQuery: InventoryAdjustmentSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryAdjustmentSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<Array<InventoryAdjustmentDetailItem>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  
  const pageBreak = "<div class='pageBreak'></div>";
  const printContentCallback = useCallback(
    (printContent) => {
      
      const textResponse = printContent.map((single: any) => {
      return (
        "<div class='singleOrderPrint'>" +
        single.html_content +
        "</div>"
        );
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );

  const [columns, setColumn] = useState<Array<ICustomTableColumType<InventoryAdjustmentDetailItem>>>([
    {
      title: "Mã phiếu/Ngày tạo",
      dataIndex: "code",
      visible: true,
      align: "center",
      fixed: "left",
      width: "150px",
      render: (value: string, row: InventoryAdjustmentDetailItem) => (
        <Link to={`${UrlConfig.INVENTORY_ADJUSTMENT}/${row.id}`}>{value}</Link>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      width: "100px",
      align: "center",
      render: (item: string) => {
        let textTag = '';
        let classTag = '';
        switch (item) {
          case STATUS_INVENTORY_ADJUSTMENT.DRAFT.status:
            textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
            break;
          case STATUS_INVENTORY_ADJUSTMENT.AUDITED.status:
            textTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.AUDITED.status;
            break;
          case STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status:
            textTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.ADJUSTED.status;
            break;
          default:
            textTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.name;
            classTag = STATUS_INVENTORY_ADJUSTMENT.DRAFT.status;
            break;
        }
        return (
          <Tag className={classTag}>{textTag}</Tag>
        )
      }
    },
    {
      title: "Loại kho kiểm",
      dataIndex: "audit_type",
      render: (item: string) => {
        let text = 'Một phần';
        const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.find(e => e.value === item);
        if (auditType && item === auditType?.value) {
          text = auditType.name;
        }

        return (
          <Space>{text}</Space>
        )
      },
      visible: true,
      width: "120px",
    },
    {
      title: "Kho kiểm",
      width: "120px",
      dataIndex: "adjusted_store_name",
      visible: true,
    },
    {
      title: "Ngày tạo",
      width: '100px',
      dataIndex: "created_date",
      visible: true,
      align: "left",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Ngày kiểm",
      width: '100px',
      dataIndex: "audited_date",
      visible: true,
      align: "left",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Cân tồn kho",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return <div>
          <div>{item.adjusted_by}</div>
          <div>{ConvertUtcToLocalDate(item.adjusted_date)}</div>
        </div>;
      },
    },
    {
      title: "Số SP",
      width: '80',
      dataIndex: "total_variant",
      visible: true,
      align: "right",
    },
    {
      title: "Tổng SL",
      width: '80',
      dataIndex: "total_real_on_hand",
      visible: true,
      align: "right",
      render: (value: number) => {
        return value && value !== 0 ? value : "";
      }
    },
    {
      title: "Thừa/Thiếu",
      width: '120',
      align: "center",
      visible: true,
      render: (item: InventoryAdjustmentDetailItem) => {
        return <Space>
          {
            (!item.total_excess || item.total_excess === 0) ? null :
              <div style={{ color: '#27AE60' }}>
                +{item.total_excess}</div>
          }
          {item.total_excess && item.total_missing ? <Space>/</Space> : null}
          {
            (!item.total_missing || item.total_missing === 0) ? null :
              <div style={{ color: 'red' }}>
                {item.total_missing}</div>
          }
        </Space>
      },
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
    (result: PageResponse<Array<InventoryAdjustmentDetailItem>> | false) => {
      setTableLoading(true);
      if (!!result) {
        setTableLoading(false);
        setData(result);
      }
    },
    []
  );

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}?${queryParam}`);
    },
    [history, params]
  );

  const printTicketAction = useCallback((index: number) => {
    let printType = "";
    if (index === ACTIONS_INDEX.PRINT) {
      printType = "inventory_transfer_bill";
    }

    let params = {
      ids: selectedRowKeys,
      "type": printType,
    };

    const queryParam = generateQuery(params);
    dispatch(InventoryAdjustmentGetPrintContentAction(queryParam, printContentCallback));
  }, [dispatch, printContentCallback, selectedRowKeys]);


  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT:
          printTicketAction(index);
          break;
        default:
          break;
      }
    },
    [printTicketAction]
  );

  /**
   * clear filter trong basefilter
   */
  const onClearFilter = useCallback(
    () => {
      setPrams(initQuery);
      let queryParam = generateQuery(initQuery);
      history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}#1?${queryParam}`);
    },
    [history]
  );

  const onSelectedChange = useCallback((selectedRow) => {

    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowKeys(selectedRowKeys);

  }, []);

  //get store
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [dispatch, setDataAccounts]);

  //get list
  useEffect(() => {
    //  dispatch(getListInventoryTransferAction(params, setSearchResult)); 
    dispatch(getListInventoryAdjustmentAction(params, setSearchResult));
  }, [history, dispatch, params, setSearchResult]);

  return (
    <InventoryAdjustmentWrapper>
      <InventoryAdjustmentFilters
        onShowColumnSetting={() => setShowSettingColumn(true)}
        accounts={accounts}
        params={params}
        stores={stores}
        actions={actions}
        onMenuClick={onMenuClick}
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
      <div style={{ display: "none" }}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          ></div>
        </div>
      </div>
    </InventoryAdjustmentWrapper>
  )
}

export default InventoryAdjustment;