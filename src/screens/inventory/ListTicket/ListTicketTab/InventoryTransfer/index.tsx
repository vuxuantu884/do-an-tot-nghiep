import {MenuAction} from "component/table/ActionButton";
import {
  deleteInventoryTransferAction,
  getListInventoryTransferAction,
  inventoryGetSenderStoreAction,
  updateInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch} from "react-redux";

import InventoryFilters from "../../Components/FIlter/InventoryListFilter";
import {
  InventoryTransferDetailItem,
  InventoryTransferSearchQuery,
  Store,
} from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";
import purify from "dompurify";

import {PageResponse} from "model/base/base-metadata.response";
import {VariantResponse} from "model/product/product.model";
import {getQueryParams, useQuery} from "utils/useQuery";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";

import ModalSettingColumn from "component/table/ModalSettingColumn";
import {Input, Modal, Tag, Form} from "antd";
import {InventoryTransferTabWrapper} from "./styles";
import {STATUS_INVENTORY_TRANSFER} from "../../constants";

import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {
  BarsOutlined,
  CopyOutlined,
  ExportOutlined,
  FormOutlined,
  PaperClipOutlined,
  PrinterOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {Link} from "react-router-dom";
import UrlConfig from "config/url.config";

import {generateQuery} from "utils/AppUtils";
import {useHistory} from "react-router-dom";
import {AccountResponse} from "model/account/account.model";
import {AccountSearchAction} from "domain/actions/account/account.action";

import NumberFormat from "react-number-format";
import {showSuccess, showWarning} from "utils/ToastUtils";
import DeleteTicketModal from "screens/inventory/common/DeleteTicketPopup";
import {useReactToPrint} from "react-to-print";

import {PrinterInventoryTransferResponseModel} from "model/response/printer.response";
import {actionFetchPrintFormByInventoryTransferIds} from "domain/actions/printer/printer.action";
import {InventoryTransferPermission} from "config/permissions/inventory-transfer.permission";
import useAuthorization from "hook/useAuthorization";
const {TextArea} = Input;

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  DELETE_TICKET: 3,
  PRINT: 4,
  PRINT_TICKET: 5,
  EXPORT_EXCEL: 6,
  MAKE_COPY: 7,
};

const initQuery: InventoryTransferSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  from_store_id: null,
  to_store_id: null,
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
  from_transfer_date: null,
  to_transfer_date: null,
  from_receive_date: null,
  to_receive_date: null,
};

const InventoryTransferTab: React.FC = () => {
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);

  const [tableLoading, setTableLoading] = useState(true);
  const [isModalVisibleNote, setIsModalVisibleNote] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);

  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [itemData, setItemData] = useState<InventoryTransferDetailItem>();
  const printElementRef = useRef(null);

  const [printContent, setPrintContent] = useState<string>("");
  const pageBreak = "<div class='pageBreak'></div>";
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });
  const printContentCallback = useCallback(
    (printContent: Array<PrinterInventoryTransferResponseModel>) => {
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );

  //phân quyền
  const [allowCancel] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.cancel],
  });
  const [allowPrint] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.print],
  });
  const [allowClone] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.clone],
  });

  const actions: Array<MenuAction> = [
    // {
    //   id: ACTIONS_INDEX.ADD_FORM_EXCEL,
    //   name: "Thêm mới từ Excel",
    //   icon: <ImportOutlined />,
    //   disabled: !allowImportFromExcel,
    // },
    {
      id: ACTIONS_INDEX.WATCH_MANY_TICKET,
      name: "Xem nhiều phiếu",
      icon: <BarsOutlined />,
      disabled: true,
    },
    {
      id: ACTIONS_INDEX.DELETE_TICKET,
      name: "Hủy phiếu",
      icon: <StopOutlined />,
      disabled: !allowCancel,
    },
    {
      id: ACTIONS_INDEX.PRINT,
      name: "In vận đơn",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
    {
      id: ACTIONS_INDEX.PRINT_TICKET,
      name: "In phiếu",
      icon: <PrinterOutlined />,
      disabled: !allowPrint,
    },
    {
      id: ACTIONS_INDEX.EXPORT_EXCEL,
      name: "Xuất Excel",
      icon: <ExportOutlined />,
      disabled: true,
    },
    {
      id: ACTIONS_INDEX.MAKE_COPY,
      name: "Tạo bản sao",
      icon: <CopyOutlined />,
      disabled: !allowClone,
    },
  ];

  const dispatch = useDispatch();
  let dataQuery: InventoryTransferSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [formNote] = Form.useForm();
  let [params, setParams] = useState<InventoryTransferSearchQuery>(dataQuery);
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
        <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${row.id}`}>{value}</Link>
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
        let textTag = "";
        let classTag = "";
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
          case STATUS_INVENTORY_TRANSFER.CANCELED.status:
            textTag = STATUS_INVENTORY_TRANSFER.CANCELED.name;
            classTag = STATUS_INVENTORY_TRANSFER.CANCELED.status;
            break;
          default:
            textTag = STATUS_INVENTORY_TRANSFER.CONFIRM.name;
            classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
            break;
        }
        return <Tag className={classTag}>{textTag}</Tag>;
      },
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
      width: "100px",
      render: (value: number) => {
        return (
          <NumberFormat
            value={value}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        );
      },
    },
    {
      title: "Ngày chuyển",
      dataIndex: "transfer_date",
      visible: true,
      align: "center",
      width: "150px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Ngày nhận",
      dataIndex: "receive_date",
      visible: true,
      align: "center",
      width: "150px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
    {
      title: "Tệp đính kèm",
      dataIndex: "attached_files",
      visible: true,
      align: "center",
      width: "250px",
      render: (item: any) => {
        return (
          <span>
            {item?.map((link: string) => {
              return (
                <a className="file-pin" target="_blank" rel="noreferrer" href={link}>
                  <PaperClipOutlined /> {link}
                </a>
              );
            })}
          </span>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      align: "center",
      width: "250px",
      render: (item: string, row: InventoryTransferDetailItem, index: number) => {
        return (
          <div className="note">
            {item}
            <FormOutlined
              onClick={() => {
                setItemData(row);
                setIsModalVisibleNote(true);
              }}
              className="note-icon"
            />
          </div>
        );
      },
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
      align: "center",
      width: "150px",
      render: (value: string, item: InventoryTransferDetailItem, index: number) => {
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
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: true,
      align: "center",
      width: "150px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
    },
  ]);

  const onDeleteTicket = (value: string | undefined) => {
    dispatch(
      deleteInventoryTransferAction(
        selectedRowKeys[0],
        {note: value ? value : ""},
        () => {
          setIsDeleteTicket(false);
          dispatch(getListInventoryTransferAction(params, setSearchResult));
        }
      )
    );
  };

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({...params});
    },
    [params]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const setSearchResult = useCallback(
    (result: PageResponse<Array<InventoryTransferDetailItem>> | false) => {
      if (!!result) {
        setTableLoading(false);
        setData(result);
      }
    },
    []
  );

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const onFilter = useCallback(
    (values) => {
      let newParams = {...params, ...values, page: 1};
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      setTableLoading(true);
      history.push(`${UrlConfig.INVENTORY_TRANSFERS}?${queryParam}`);
    },
    [history, params]
  );

  const printTicketAction = useCallback(
    (index: number) => {
      let printType = "";
      if (index === ACTIONS_INDEX.PRINT) {
        printType = "inventory_transfer_bill";
      } else if (index === ACTIONS_INDEX.PRINT_TICKET) {
        printType = "inventory_transfer";
      }
      dispatch(
        actionFetchPrintFormByInventoryTransferIds(
          selectedRowKeys,
          printType,
          printContentCallback
        )
      );
    },
    [dispatch, printContentCallback, selectedRowKeys]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      if (selectedRowKeys && selectedRowKeys.length === 0) {
        showWarning("Cần chọn ít nhất một phiếu chuyển.");
        return;
      }

      switch (index) {
        case ACTIONS_INDEX.PRINT_TICKET:
          printTicketAction(index);
          break;
        case ACTIONS_INDEX.PRINT:
          printTicketAction(index);
          break;
        // case ACTIONS_INDEX.ADD_FORM_EXCEL:
        //   history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`);
        //   break;
        case ACTIONS_INDEX.MAKE_COPY:
          history.push(
            `${UrlConfig.INVENTORY_TRANSFERS}/${selectedRowKeys}/update?cloneId=${selectedRowKeys}`
          );
          break;
        case ACTIONS_INDEX.DELETE_TICKET:
          setIsDeleteTicket(true);
          break;
        default:
          break;
      }
    },
    [history, printTicketAction, selectedRowKeys]
  );

  const onClearFilter = useCallback(() => {
    setParams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${UrlConfig.INVENTORY_TRANSFERS}#1?${queryParam}`);
  }, [history]);

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row.id);
    setSelectedRowData(selectedRow);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  //get store
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(inventoryGetSenderStoreAction({status: "active", simple: true}, setStores));
  }, [dispatch, setDataAccounts]);

  //get list
  useEffect(() => {
    dispatch(getListInventoryTransferAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <InventoryTransferTabWrapper>
      <div style={{display: "none"}}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          ></div>
        </div>
      </div>
      <InventoryFilters
        accounts={accounts}
        params={params}
        stores={stores}
        actions={actions}
        onMenuClick={onMenuClick}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        onClearFilter={() => onClearFilter()}
      />
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        scroll={{x: 2000}}
        sticky={{offsetScroll: 5, offsetHeader: 55}}
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
      {isModalVisibleNote && (
        <Modal
          title={`Sửa ghi chú ${itemData?.code}`}
          visible={isModalVisibleNote}
          onOk={() => {
            formNote.submit();
            setIsModalVisibleNote(false);
          }}
          onCancel={() => {
            setIsModalVisibleNote(false);
          }}
        >
          <Form
            form={formNote}
            initialValues={itemData}
            onFinish={(data) => {
              stores.forEach((store) => {
                if (store.id === Number(itemData?.from_store_id)) {
                  data.store_transfer = {
                    id: itemData?.store_transfer?.id,
                    store_id: store.id,
                    hotline: store.hotline,
                    address: store.address,
                    name: store.name,
                    code: store.code,
                  };
                }
                if (store.id === Number(itemData?.to_store_id)) {
                  data.store_receive = {
                    id: itemData?.store_receive?.id,
                    store_id: store.id,
                    hotline: store.hotline,
                    address: store.address,
                    name: store.name,
                    code: store.code,
                  };
                }
              });
              data.from_store_id = itemData?.from_store_id;
              data.to_store_id = itemData?.to_store_id;
              data.attached_files = itemData?.attached_files;
              data.line_items = itemData?.line_items;
              data.exception_items = itemData?.exception_items;
              data.version = itemData?.version;

              if (itemData?.id) {
                dispatch(
                  updateInventoryTransferAction(itemData.id, data, (result) => {
                    setItemData(undefined);
                    if (result) showSuccess(`Update ${itemData?.code} thành công`);
                    dispatch(getListInventoryTransferAction(params, setSearchResult));
                  })
                );
              }
            }}
            onFinishFailed={() => {}}
          >
            <Form.Item noStyle hidden name="note">
              <Input />
            </Form.Item>
            <Form.Item>
              <TextArea
                maxLength={250}
                onChange={(e) => {
                  formNote.setFieldsValue({note: e.target.value});
                }}
                defaultValue={itemData?.note}
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
      {isDeleteTicket && (
        <DeleteTicketModal
          onOk={onDeleteTicket}
          onCancel={() => setIsDeleteTicket(false)}
          visible={isDeleteTicket}
          icon={WarningRedIcon}
          textStore={selectedRowData[0]?.from_store_name}
          okText="Đồng ý"
          cancelText="Thoát"
          title={`Bạn chắc chắn Hủy phiếu chuyển hàng ${selectedRowData[0]?.code}`}
        />
      )}
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

export default InventoryTransferTab;
