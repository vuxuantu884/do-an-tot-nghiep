import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  InventoryExportImportTransferDetailItem,
  InventoryTransferImportExportSearchQuery,
  Store,
} from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { getQueryParams, useQuery } from "utils/useQuery";

import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Input, Modal, Form, Row, Col } from "antd";
import { ExportImportTransferTabWrapper } from "./styles";
import rightArrow from "assets/icon/arrow-right.svg";

import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { FormOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import UrlConfig from "config/url.config";

import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";

import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import InventoryExportFilters from "../../Components/FIlter/InventoryListExportFilter";
import {
  getListImportExportTransferApi,
  updateNoteTransferApi,
} from "service/inventory/transfer/index.service";
import CustomPagination from "component/table/CustomPagination";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { STATUS_INVENTORY_TRANSFER, STATUS_INVENTORY_TRANSFER_ARRAY } from "../../../constants";
import transferringIcon from "assets/icon/dang_chuyen.svg";
import pendingIcon from "assets/icon/cho_xu_ly.svg";
import receivedIcon from "assets/icon/da_nhan.svg";
import canceledIcon from "assets/icon/da_huy.svg";
import confirmedIcon from "assets/icon/cho_chuyen.svg";
import TransferExport from "../../Components/TransferExport";
import { STATUS_IMPORT_EXPORT } from "utils/Constants";
import moment from "moment";
import * as XLSX from "xlsx";
import { TYPE_EXPORT } from "screens/products/constants";
import { TransferExportLineItemField } from "model/inventory/field";
const { TextArea } = Input;

const initQuery: InventoryTransferImportExportSearchQuery = {
  page: 1,
  limit: 30,
  simple: true,
  condition: null,
  from_store_id: [],
  to_store_id: [],
  status: [],
  note: null,
  created_by: [],
  received_by: [],
  cancel_by: [],
  transfer_by: [],
  from_created_date: null,
  to_created_date: null,
  from_transfer_date: null,
  to_transfer_date: null,
  from_receive_date: null,
  to_receive_date: null,
  from_cancel_date: null,
  to_cancel_date: null,
  from_pending_date: null,
  to_pending_date: null,
};

type InventoryTransferTabProps = {
  accountStores?: Array<AccountStoreResponse>;
  stores?: Array<Store>;
  accounts?: Array<AccountResponse>;
  setAccounts?: (e: any) => any;
  activeTab?: string;
  vExportDetailTransfer: boolean;
  setVExportDetailTransfer: (param: boolean) => void;
};

let firstLoad = true;

const ExportImportTab: React.FC<InventoryTransferTabProps> = (props: InventoryTransferTabProps) => {
  const {
    accountStores,
    stores,
    accounts,
    setAccounts,
    activeTab,
    vExportDetailTransfer,
    setVExportDetailTransfer,
  } = props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [statusExport, setStatusExport] = useState<number>(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState<Array<any>>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const query = useQuery();

  const [tableLoading, setTableLoading] = useState(false);
  const [isModalVisibleNote, setIsModalVisibleNote] = useState(false);
  const [itemData, setItemData] = useState<InventoryExportImportTransferDetailItem>();

  const dispatch = useDispatch();
  let dataQuery: InventoryTransferImportExportSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [formNote] = Form.useForm();
  let [params, setParams] = useState<InventoryTransferImportExportSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<Array<InventoryExportImportTransferDetailItem>>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const defaultColumns = [
    {
      title: "Sản phẩm",
      width: "180px",
      visible: true,
      fixed: "left",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse) => (
        <div>
          <div>
            <div className="product-item-sku custom-title">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name custom-name">
              <span>{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Mã phiếu chuyển",
      dataIndex: "code",
      visible: true,
      align: "left",
      width: 180,
      render: (value: string, row: InventoryExportImportTransferDetailItem) => (
        <div>
          <div className="custom-title">
            <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${row.inventory_transfer.id}`}>
              {value}
            </Link>
          </div>
          <div className="product-item-name custom-name">
            Ngày tạo: {ConvertUtcToLocalDate(row.created_date, DATE_FORMAT.DDMMYY_HHmm)}
          </div>
          <div className="product-item-name custom-name">
            Ngày gửi: {ConvertUtcToLocalDate(row.exported_date, DATE_FORMAT.DDMMYY_HHmm)}
          </div>
          <div className="product-item-name custom-name">
            Ngày nhận: {ConvertUtcToLocalDate(row.receive_date, DATE_FORMAT.DDMMYY_HHmm)}
          </div>
        </div>
      ),
    },
    {
      title: "Kho",
      dataIndex: "",
      visible: true,
      align: "left",
      width: 150,
      render: (value: string, row: InventoryExportImportTransferDetailItem) => (
        <div>
          <div>{row.inventory_transfer.from_store_name}</div>
          <span className="mr-5">
            <img src={rightArrow} alt="arrow" />
          </span>
          {row.inventory_transfer.to_store_name}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      align: "center",
      render: (item: string, row: InventoryExportImportTransferDetailItem) => {
        let textTag: string;
        let classTag: string;
        let img: any;
        switch (row.inventory_transfer.status) {
          case STATUS_INVENTORY_TRANSFER.REQUESTED.status:
            textTag = STATUS_INVENTORY_TRANSFER.REQUESTED.name;
            classTag = STATUS_INVENTORY_TRANSFER.REQUESTED.status;
            img = confirmedIcon;
            break;

          case STATUS_INVENTORY_TRANSFER.TRANSFERRING.status:
            textTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.name;
            classTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.status;
            img = transferringIcon;
            break;

          case STATUS_INVENTORY_TRANSFER.PENDING.status:
            textTag = STATUS_INVENTORY_TRANSFER.PENDING.name;
            classTag = STATUS_INVENTORY_TRANSFER.PENDING.status;
            img = pendingIcon;
            break;
          case STATUS_INVENTORY_TRANSFER.RECEIVED.status:
            textTag = STATUS_INVENTORY_TRANSFER.RECEIVED.name;
            classTag = STATUS_INVENTORY_TRANSFER.RECEIVED.status;
            img = receivedIcon;
            break;
          case STATUS_INVENTORY_TRANSFER.CANCELED.status:
            textTag = STATUS_INVENTORY_TRANSFER.CANCELED.name;
            classTag = STATUS_INVENTORY_TRANSFER.CANCELED.status;
            img = canceledIcon;
            break;
          default:
            textTag = STATUS_INVENTORY_TRANSFER.CONFIRM.name;
            classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
            img = confirmedIcon;
            break;
        }
        return (
          <div className="status">
            <div className={classTag}>
              <img className="mrh-5" src={img} alt="" />
              {textTag}
            </div>
          </div>
        );
      },
      width: 130,
    },
    {
      title: () => {
        return (
          <div className="text-center">
            <div>SL Gửi</div>
            <div className="total-quantity">{formatCurrency(0, ".")}</div>
          </div>
        );
      },
      dataIndex: "total_quantity",
      visible: true,
      align: "left",
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <span>{formatCurrency(row.transfer_quantity, ".")}</span>
          </div>
        );
      },
      width: "100px",
    },
    {
      title: () => {
        return (
          <div className="text-center">
            <div>SL Nhận</div>
            <div className="total-quantity">{formatCurrency(0, ".")}</div>
          </div>
        );
      },
      dataIndex: "received_quantity",
      visible: true,
      align: "left",
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <span>{formatCurrency(row.received_quantity, ".")}</span>
          </div>
        );
      },
      width: "100px",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      visible: true,
      align: "center",
      width: 100,
      render: (value: number) => {
        return (
          <div>
            <span>{formatCurrency(value, ".")}</span>
          </div>
        );
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      visible: true,
      width: 120,
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <div>
              Gửi:{" "}
              <span className="text-bold">
                {formatCurrency(row.transfer_quantity * row.price, ".")}
              </span>
            </div>
            <div>
              Nhận:{" "}
              <span className="text-bold">
                {formatCurrency(row.received_quantity * row.price, ".")}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      width: "170px",
      visible: true,
      dataIndex: "",
      render: (value: string, record: InventoryExportImportTransferDetailItem) => (
        <div>
          <Row className="mb-10" gutter={6}>
            <Col span={9}>
              <div className="custom-name">Người tạo:</div>
            </Col>
            <Col span={15}>
              <div className="product-item-sku custom-title">
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.created_by}`}>
                  {record.created_by}
                </Link>
              </div>
              <div className="product-item-name custom-name">
                <span className="product-item-name-detail">{record.created_name}</span>
              </div>
            </Col>
          </Row>
          <Row className="mb-10" gutter={6}>
            <Col span={9}>
              <div className="custom-name">Người gửi:</div>
            </Col>
            <Col span={15}>
              <div className="product-item-sku custom-title">
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.exported_code}`}>
                  {record.exported_code}
                </Link>
              </div>
              <div className="product-item-name custom-name">
                <span className="product-item-name-detail">{record.exported_name}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={9}>
              <div className="custom-name">Người nhận:</div>
            </Col>
            <Col span={15}>
              <div className="product-item-sku custom-title">
                <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.received_by}`}>
                  {record.received_by}
                </Link>
              </div>
              <div className="product-item-name custom-name">
                <span className="product-item-name-detail">{record.received_name}</span>
              </div>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      align: "left",
      width: "170px",
      render: (item: string, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div className={item ? "note" : ""}>
            <span className="mr-5">{row.inventory_transfer.note}</span>
            <FormOutlined
              onClick={() => {
                setItemData(row);
                setIsModalVisibleNote(true);
              }}
              className={item ? "note-icon" : ""}
            />
          </div>
        );
      },
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
      let newParams = { ...params, ...values, page: 1 };
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      setTableLoading(true);
      history.push(`${history.location.pathname}?${queryParam}`);
      let codes = "";

      if (newParams.created_by) {
        codes = newParams.created_by;
      }
      if (newParams.updated_by) {
        codes = codes + "," + newParams.updated_by;
      }
      if (newParams.received_by) {
        codes = codes + "," + newParams.received_by;
      }
      if (newParams.transfer_by) {
        codes = codes + "," + newParams.transfer_by;
      }
      if (newParams.cancel_by) {
        codes = codes + "," + newParams.cancel_by;
      }
      getAccounts(codes).then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, params],
  );

  const location = useLocation();

  const onClearFilter = useCallback(() => {
    setParams(initQuery);
    let queryParam = generateQuery(initQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }, [history, location.pathname]);

  const getListExportImportTransfer = async () => {
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      getListImportExportTransferApi,
      { ...params },
    );

    if (response.items.length > 0) {
      let total = 0;
      let totalReceived = 0;

      response.items.forEach((item: any) => {
        total = total + item.transfer_quantity;
        totalReceived = totalReceived + item.received_quantity;
      });

      const newColumns = [...columns];

      for (let i = 0; i < newColumns.length; i++) {
        if (newColumns[i].dataIndex === "total_quantity") {
          newColumns[i] = {
            // eslint-disable-next-line no-loop-func
            title: () => {
              return (
                <div className="text-center">
                  <div>SL Gửi</div>
                  <div className="total-quantity">{formatCurrency(total, ".")}</div>
                </div>
              );
            },
            dataIndex: "total_quantity",
            visible: true,
            align: "center",
            // eslint-disable-next-line no-loop-func
            render: (value: number, row: InventoryExportImportTransferDetailItem) => {
              return (
                <div>
                  <span>{formatCurrency(row.transfer_quantity, ".")}</span>
                </div>
              );
            },
            width: "100px",
          };
        }
        if (newColumns[i].dataIndex === "received_quantity") {
          newColumns[i] = {
            // eslint-disable-next-line no-loop-func
            title: () => {
              return (
                <div className="text-center">
                  <div>SL Nhận</div>
                  <div className="total-quantity">{formatCurrency(totalReceived, ".")}</div>
                </div>
              );
            },
            dataIndex: "received_quantity",
            visible: true,
            align: "center",
            // eslint-disable-next-line no-loop-func
            render: (value: number, row: InventoryExportImportTransferDetailItem) => {
              return (
                <div>
                  <span>{formatCurrency(row.received_quantity, ".")}</span>
                </div>
              );
            },
            width: "100px",
          };
        }
      }

      setColumn(newColumns);
    } else {
      setColumn(defaultColumns);
    }

    setTableLoading(false);

    setData(response);
    if (firstLoad) {
      setTotalItems(response.metadata.total);
    }
    firstLoad = false;
  };

  useEffect(() => {
    setTableLoading(true);

    let queryParam = generateQuery(params);
    history.push(`${history.location.pathname}?${queryParam}`);

    getListExportImportTransfer().then();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, params, accountStores]);

  const updateNote = async (id: number, data: any) => {
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      updateNoteTransferApi,
      id,
      data,
    );

    setItemData(undefined);
    if (response) showSuccess(`Cập nhật ${itemData?.code} thành công`);
    getListExportImportTransfer().then();
  };

  const onSelectedChange = useCallback((selectedRow) => {
    const selectedRowKeys = selectedRow.map((row: any) => row && row.id);
    setSelectedRowData(selectedRow);
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  const getItemsByCondition = useCallback(
    async (type: string) => {
      let res: any;
      let items: Array<InventoryExportImportTransferDetailItem> = [];
      const limit = 50;
      let times = 0;

      setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            getListImportExportTransferApi,
            { ...params, limit: params.limit ?? 50 },
          );
          if (res) {
            items = items.concat(res.items);
          }
          break;
        case TYPE_EXPORT.selected:
          res = await callApiNative(
            { isShowLoading: false },
            dispatch,
            getListImportExportTransferApi,
            { ...params, limit: params.limit ?? 50 },
          );
          if (res) {
            for (let index = 0; index < selectedRowData.length; index++) {
              const transfer = res.items.find(
                (e: InventoryExportImportTransferDetailItem) => e.id === selectedRowData[index].id,
              );
              if (transfer) {
                items.push(transfer);
              }
            }
          }
          break;
        case TYPE_EXPORT.all:
          const roundAll = Math.round(data.metadata.total / limit);
          times = roundAll < data.metadata.total / limit ? roundAll + 1 : roundAll;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListImportExportTransferApi,
              { ...params, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
          }

          break;
        case TYPE_EXPORT.allin:
          if (!totalItems || totalItems === 0) {
            break;
          }
          const roundAllin = Math.round(totalItems / limit);
          times = roundAllin < totalItems / limit ? roundAllin + 1 : roundAllin;

          for (let index = 1; index <= times; index++) {
            const res = await callApiNative(
              { isShowLoading: false },
              dispatch,
              getListImportExportTransferApi,
              { ...params, page: index, limit: limit },
            );
            if (res) {
              items = items.concat(res.items);
            }
            const percent = Math.round(Number.parseFloat((index / times).toFixed(2)) * 100);
            setExportProgress(percent);
          }
          break;
        default:
          break;
      }
      setExportProgress(100);
      return items;
    },
    [dispatch, selectedRowData, params, data, totalItems],
  );

  const convertItemExport = (item: InventoryExportImportTransferDetailItem) => {
    return {
      [TransferExportLineItemField.code]: item.code,
      [TransferExportLineItemField.from_store]: item.inventory_transfer.from_store_name,
      [TransferExportLineItemField.to_store]: item.inventory_transfer.to_store_name,
      [TransferExportLineItemField.status]: STATUS_INVENTORY_TRANSFER_ARRAY.find(
        (e) => e.value === item.inventory_transfer.status,
      )?.name,
      [TransferExportLineItemField.sku]: item.sku,
      [TransferExportLineItemField.variant_name]: item.variant_name,
      [TransferExportLineItemField.barcode]: item.barcode ?? "",
      [TransferExportLineItemField.price]: item.price,
      [TransferExportLineItemField.transfer_quantity]: item.transfer_quantity,
      [TransferExportLineItemField.total_amount]: item.amount ?? 0,
      [TransferExportLineItemField.real_quantity]: item.received_quantity,
      [TransferExportLineItemField.created_date]: ConvertUtcToLocalDate(
        item.created_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportLineItemField.created_name]:
        !item.created_by || !item.created_name ? "" : `${item.created_by} - ${item.created_name}`,
      [TransferExportLineItemField.transfer_date]: ConvertUtcToLocalDate(
        item.exported_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportLineItemField.receive_date]: ConvertUtcToLocalDate(
        item.receive_date,
        DATE_FORMAT.DDMMYY_HHmm,
      ),
      [TransferExportLineItemField.updated_name]:
        !item.received_by || !item.received_name
          ? ""
          : `${item.received_by} - ${item.received_name}`,
      [TransferExportLineItemField.note]: item.inventory_transfer.note ?? "",
    };
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selectedRowData && selectedRowData.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn phiếu chuyển nào để xuất file");
        // setVExportTransfer(false);
        setVExportDetailTransfer(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (res && res.length === 0) {
        setStatusExport(0);
        showWarning("Không có phiếu chuyển nào đủ điều kiện");
        return;
      }

      const workbook = XLSX.utils.book_new();

      // if (vExportDetailTransfer) {
      //   let item: any = [];
      //   for (let i = 0; i < res.length; i++) {
      //     if (!res[i] || !res[i].inventory_transfer) continue;

      //     if (workbook.Sheets[`${res[i].code}`]) {
      //       continue;
      //     }
      //     item=item.concat(convertTransferDetailExport(res[i],res[i].line_items));
      //   }
      //   const ws = XLSX.utils.json_to_sheet(item);

      //   XLSX.utils.book_append_sheet(workbook, ws, 'data');
      // }
      // else{
      for (let i = 0; i < res.length; i++) {
        const e = res[i];
        const item = convertItemExport(e);
        dataExport.push(item);
      }

      let worksheet = XLSX.utils.json_to_sheet(dataExport);
      XLSX.utils.book_append_sheet(workbook, worksheet, "data");
      // }

      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      XLSX.writeFile(
        workbook,
        `${vExportDetailTransfer ? "transfer_detail" : "transfer"}_${day}_${month}_${year}.xlsx`,
      );
      // setVExportTransfer(false);
      setVExportDetailTransfer(false);
      setExportProgress(0);
      setStatusExport(0);
    },
    Cancel: () => {
      // setVExportTransfer(false);
      setVExportDetailTransfer(false);
      setExportProgress(0);
      setStatusExport(0);
    },
  };

  return (
    <ExportImportTransferTabWrapper>
      <InventoryExportFilters
        activeTab={activeTab}
        accounts={accounts}
        params={params}
        stores={stores}
        accountStores={accountStores}
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
        sticky={{ offsetScroll: 5, offsetHeader: 55 }}
        pagination={false}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
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
              const newData = {
                version: itemData?.inventory_transfer.version,
                note: data.note,
              };

              if (itemData?.id) {
                updateNote(itemData.inventory_transfer.id, newData).then();
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
                  formNote.setFieldsValue({ note: e.target.value });
                }}
                defaultValue={itemData?.inventory_transfer.note}
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>
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
        visible={vExportDetailTransfer}
        exportProgress={exportProgress}
        statusExport={statusExport}
      />
    </ExportImportTransferTabWrapper>
  );
};

export default ExportImportTab;
