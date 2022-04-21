import {MenuAction} from "component/table/ActionButton";
import {
  deleteInventoryTransferAction,
  getListInventoryTransferAction,
  updateInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useDispatch} from "react-redux";

import InventoryFilters from "../../Components/FIlter/InventoryListFilter";
import {
  InventoryTransferDetailItem,
  InventoryTransferSearchQuery,
  LineItem,
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
import {STATUS_INVENTORY_TRANSFER,STATUS_INVENTORY_TRANSFER_ARRAY} from "../../constants";

import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import {
  BarsOutlined,
  CopyOutlined,
  FormOutlined,
  PaperClipOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {Link} from "react-router-dom";
import UrlConfig from "config/url.config";

import {formatCurrency, generateQuery} from "utils/AppUtils";
import {useHistory} from "react-router-dom";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";

import NumberFormat from "react-number-format";
import {showSuccess, showWarning} from "utils/ToastUtils";
import DeleteTicketModal from "screens/inventory/common/DeleteTicketPopup";
import {useReactToPrint} from "react-to-print";

import {PrinterInventoryTransferResponseModel} from "model/response/printer.response";
import {actionFetchPrintFormByInventoryTransferIds} from "domain/actions/printer/printer.action";
import {InventoryTransferPermission} from "config/permissions/inventory-transfer.permission";
import useAuthorization from "hook/useAuthorization";
import { callApiNative } from "../../../../../utils/ApiUtils";
import TransferExport from "../../Components/TransferExport";
import { TYPE_EXPORT } from "screens/products/constants";
import {
  getListInventoryTransferApi
} from "service/inventory/transfer/index.service";
import moment from "moment";
import * as XLSX from 'xlsx';
import { TransferExportField, TransferExportLineItemField } from "model/inventory/field";
const {TextArea} = Input;

let firstLoad = true;

const ACTIONS_INDEX = {
  ADD_FORM_EXCEL: 1,
  WATCH_MANY_TICKET: 2,
  PRINT: 4,
  PRINT_TICKET: 5,
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

type InventoryTransferTabProps = {
  accountStores?: Array<AccountStoreResponse>,
  stores?: Array<Store>,
  accounts?: Array<AccountResponse>,
  setAccounts?: (e: any) => any,
  vExportTransfer: boolean,
  vExportDetailTransfer: boolean,
  setVExportTransfer: React.Dispatch<React.SetStateAction<boolean>>,
  setVExportDetailTransfer: React.Dispatch<React.SetStateAction<boolean>>
};

const InventoryTransferTab: React.FC<InventoryTransferTabProps> = (props: InventoryTransferTabProps) => {
  const { accountStores, stores, accounts, vExportTransfer,setVExportTransfer,vExportDetailTransfer,setVExportDetailTransfer } = props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const query = useQuery();
  const [accountStoresSelected, setAccountStoresSelected] = useState<AccountStoreResponse | null>(null);

  const [tableLoading, setTableLoading] = useState(false);
  const [isModalVisibleNote, setIsModalVisibleNote] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);

  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [itemData, setItemData] = useState<InventoryTransferDetailItem>();
  const printElementRef = useRef(null);
  const [totalItems, setTotalItems] = useState<number>(0);

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
  const [allowPrint] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.print],
  });
  const [allowClone] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.clone],
  });

  let actionsInit: Array<MenuAction> = [
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
  const [actions, setActions] = useState<MenuAction[]>([]);
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
      align: "left",
      fixed: "left",
      width: 150,
      render: (value: string, row: InventoryTransferDetailItem) => (
        <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${row.id}`}>{value}</Link>
      ),
    },
    {
      title: "Kho gửi",
      dataIndex: "from_store_name",
      visible: true,
      align: "left",
      width: 150,
    },
    {
      title: "Kho nhận",
      dataIndex: "to_store_name",
      visible: true,
      align: "left",
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
      align: "right",
      render: (value: number) => {
        return formatCurrency(value,".");
      },
    },
    {
      title: "SL",
      dataIndex: "total_quantity",
      visible: true,
      align: "right",
      render: (value: number) => {
        return formatCurrency(value,".");
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "total_amount",
      visible: true,
      align: "center",
      width: 120,
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
      render: (value: string) => <div>{ConvertUtcToLocalDate(value,DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Ngày nhận",
      dataIndex: "receive_date",
      visible: true,
      align: "center",
      width: "150px",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
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
      align: "left",
      width: "250px",
      render: (item: string, row: InventoryTransferDetailItem) => {
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
      align: "left",
      width: 150,
      render: (value: string, item: InventoryTransferDetailItem) => {
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
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
    },
  ]);

  useEffect(() => {
    setActions(actionsInit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowClone, allowPrint]);

  useEffect(() => {
    if (selectedRowKeys.length === 0) return;

    let newActions = [...actions];
    newActions.forEach((element, index) => {
      if (element.id === ACTIONS_INDEX.MAKE_COPY) {
        newActions[index].disabled = selectedRowKeys.length > 1;
      }
    });

    setActions(newActions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowKeys])

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
      console.log(page, size)
      params.page = page;
      params.limit = size;
      setParams({...params});
      let queryParam = generateQuery({...params});
      history.push(`${UrlConfig.INVENTORY_TRANSFERS}?${queryParam}`);
    },
    [history, params]
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
        if (firstLoad) {
          setTotalItems(result.metadata.total);
        }
        firstLoad = false;
      }
    },
    []
  );

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
    const selectedRowKeys = selectedRow.map((row: any) => row && row.id);
    setSelectedRowData(selectedRow);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  const convertItemExport = (item: InventoryTransferDetailItem) => {

    return {
      [TransferExportField.code]: item.code,
      [TransferExportField.from_store_name]: item.from_store_name,
      [TransferExportField.to_store_name]: item.to_store_name,
      [TransferExportField.status]: STATUS_INVENTORY_TRANSFER_ARRAY.find(e=>e.value===item.status)?.name,
      [TransferExportField.total_variant]: item.total_variant,
      [TransferExportField.total_quantity]: item.total_quantity,
      [TransferExportField.total_amount]: item.total_amount,
      [TransferExportField.transfer_date]: ConvertUtcToLocalDate(item.transfer_date),
      [TransferExportField.receive_date]: ConvertUtcToLocalDate(item.receive_date),
      [TransferExportField.note]: item.note,
      [TransferExportField.created_date]: ConvertUtcToLocalDate(item.created_date),
    };
  }

  const convertTransferDetailExport = (arrItem: Array<LineItem>) => {
    let arr = [];
    for (let i = 0; i < arrItem.length; i++) {
      const item = arrItem[i];

      arr.push({
        [TransferExportLineItemField.barcode]: item.barcode,
        [TransferExportLineItemField.sku]: item.sku,
        [TransferExportLineItemField.variant_name]: item.variant_name,
        [TransferExportLineItemField.price]: item.price,
        [TransferExportLineItemField.transfer_quantity]: item.transfer_quantity,
        [TransferExportLineItemField.total_amount]: (item.transfer_quantity ?? 0) * (item.price ?? 0),
        [TransferExportLineItemField.real_quantity]: item.real_quantity,
      });
    }
    return arr;
  }

  const getItemsByCondition = useCallback(async (type: string) => {
    let res: any;
    let items: Array<InventoryTransferDetailItem> = [];
    const limit = 50;
    let times = 0;
    switch (type) {
      case TYPE_EXPORT.page:
        res = await callApiNative({ isShowLoading: true }, dispatch, getListInventoryTransferApi, {...params,limit: params.limit ?? 50});
        if (res) {
          items= items.concat(res.items);
        }
        break;
      case TYPE_EXPORT.selected:
        items = selectedRowData;
        break;
      case TYPE_EXPORT.all:
      const roundAll = Math.round(data.metadata.total / limit);
      times = roundAll < (data.metadata.total / limit) ? roundAll + 1 : roundAll;

        for (let index = 1; index <= times; index++) {
          const res = await callApiNative({ isShowLoading: true }, dispatch, getListInventoryTransferApi, {...params,page: index,limit:limit});
          if (res) {
            items= items.concat(res.items);
          }
        }

        break;
      case TYPE_EXPORT.allin:
        if (!totalItems || totalItems===0) {
          break;
        }
        const roundAllin = Math.round(totalItems / limit);
        times = roundAllin < (totalItems / limit) ? roundAllin + 1 : roundAllin;
        for (let index = 1; index <= times; index++) {

          const res = await callApiNative({ isShowLoading: true }, dispatch, getListInventoryTransferApi, {...params,page: index,limit:limit});
          if (res) {
            items= items.concat(res.items);
          }
        }
        break;
      default:
        break;
    }
    return items;
  },[dispatch,selectedRowData,params,data,totalItems])

  const actionExport = {
    Ok: async (typeExport: string) => {
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        setVExportTransfer(false);
        setVExportDetailTransfer(false);
        return;
      }

      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        showWarning("Không có phiếu chuyển nào đủ điều kiện");
        return;
      }

      const workbook = XLSX.utils.book_new();

      if (vExportDetailTransfer) {
        for (let i = 0; i < res.length; i++) {
          if (!res[i] || !res[i].line_items) return;

          const item = convertTransferDetailExport(res[i].line_items);

          const ws = XLSX.utils.json_to_sheet(item);
          XLSX.utils.book_append_sheet(workbook, ws, res[i].code);
        }

      }else{
        for (let i = 0; i < res.length; i++) {
          const e = res[i];
          const item = convertItemExport(e);
          dataExport.push(item);
        }

        let worksheet = XLSX.utils.json_to_sheet(dataExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      }

      const today = moment(new Date(), 'YYYY/MM/DD');
      const month = today.format('M');
      const day   = today.format('D');
      const year  = today.format('YYYY');
      XLSX.writeFile(workbook, `${vExportDetailTransfer ? 'transfer_detail':'transfer'}_${day}_${month}_${year}.xlsx`);
      setVExportTransfer(false);
      setVExportDetailTransfer(false);
    },
    Cancel: () => {
      setVExportTransfer(false);
      setVExportDetailTransfer(false);
    },
  }

  //get list
  useEffect(() => {
    if (stores?.length === 0) return;
    if (Array.isArray(accountStores) && accountStores?.length === 1) {
      stores?.forEach((element) => {
        if (element.id === accountStores[0].store_id) {
          const newParams = {
            ...params,
            from_store_id: params.from_store_id ? params.from_store_id : element.id,
          };
          setAccountStoresSelected(element);
          setTableLoading(true);
          dispatch(getListInventoryTransferAction(newParams, setSearchResult));
        }
      });

      return;
    }
    setTableLoading(true);
    dispatch(getListInventoryTransferAction(params, setSearchResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountStores, dispatch, setSearchResult, stores]);

  useEffect(() => {
    dispatch(getListInventoryTransferAction(params, setSearchResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setSearchResult, params]);

  return (
    <InventoryTransferTabWrapper>
      <div style={{display: "none"}}>
        <div className="printContent" ref={printElementRef}>
          <div
            dangerouslySetInnerHTML={{
              __html: purify.sanitize(printContent),
            }}
          />
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
        accountStoresSelected={accountStoresSelected}
        setAccountStoresSelected={(value: any) => setAccountStoresSelected(value)}
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
              stores?.forEach((store) => {
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
       <TransferExport
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportTransfer || vExportDetailTransfer}
      />
    </InventoryTransferTabWrapper>
  );
};

export default InventoryTransferTab;
