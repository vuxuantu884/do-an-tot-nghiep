import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch} from "react-redux";
import {
  InventoryExportImportTransferDetailItem,
  InventoryTransferImportExportSearchQuery,
  Store,
} from "model/inventory/transfer";
import CustomTable from "component/table/CustomTable";

import {PageResponse} from "model/base/base-metadata.response";
import {VariantResponse} from "model/product/product.model";
import {getQueryParams, useQuery} from "utils/useQuery";

import ModalSettingColumn from "component/table/ModalSettingColumn";
import { Input, Modal, Form, Tag, Row, Col } from "antd";
import { ExportImportTransferTabWrapper } from "./styles";
import rightArrow from "assets/icon/arrow-right.svg";

import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import {
  FormOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import UrlConfig  from "config/url.config";

import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";

import NumberFormat from "react-number-format";
import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import InventoryExportFilters from "../../Components/FIlter/InventoryListExportFilter";
import { getListImportExportTransferApi, updateNoteTransferApi } from "service/inventory/transfer/index.service";
import CustomPagination from "component/table/CustomPagination";
import { showSuccess } from "utils/ToastUtils";
import { STATUS_INVENTORY_TRANSFER } from "../../../constants";
const { TextArea } = Input;

const initQuery: InventoryTransferImportExportSearchQuery = {
  page: 1,
  limit: 30,
  condition: null,
  from_store_id: [],
  to_store_id: [],
  note: null,
  received_code: [],
  from_transfer_date: null,
  to_transfer_date: null,
  from_receive_date: null,
  to_receive_date: null,
  from_pending_date: null,
  to_pending_date: null,
};

type InventoryTransferTabProps = {
  accountStores?: Array<AccountStoreResponse>,
  stores?: Array<Store>,
  accounts?: Array<AccountResponse>,
  setAccounts?: (e: any) => any,
  activeTab?: string,
};

const ExportImportTab: React.FC<InventoryTransferTabProps> = (props: InventoryTransferTabProps) => {
  const { accountStores, stores, accounts, setAccounts, activeTab } = props;
  const history = useHistory();
  const [showSettingColumn, setShowSettingColumn] = useState(false);
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
      title: "Mã phiếu chuyển",
      dataIndex: "code",
      visible: true,
      align: "left",
      fixed: "left",
      width: 200,
      render: (value: string, row: InventoryExportImportTransferDetailItem) => (
        <div>
          <div className="custom-title">
            <Link to={`${UrlConfig.INVENTORY_TRANSFERS}/${row.inventory_transfer.id}`}>{value}</Link>
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
          <div>
            { row.inventory_transfer.from_store_name }
          </div>
          <span className="mr-5">
            <img src={rightArrow} alt="arrow"/>
          </span>
          { row.inventory_transfer.to_store_name }
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
        switch (row.inventory_transfer.status) {
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
      width: 100,
    },
    {
      title: "Sản phẩm",
      width: "200px",
      visible: true,
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
      title: () => {
        return (
          <div className="text-center">
            <div>SL Gửi</div>
            <div className="total-quantity">{formatCurrency(0)}</div>
          </div>
        );
      },
      dataIndex: "total_quantity",
      visible: true,
      align: "left",
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <span>{formatCurrency(row.transfer_quantity,".")}</span>
          </div>
        )
      },
      width: "100px",
    },
    {
      title: () => {
        return (
          <div className="text-center">
            <div>SL Nhận</div>
            <div className="total-quantity">{formatCurrency(0)}</div>
          </div>
        );
      },
      dataIndex: "received_quantity",
      visible: true,
      align: "left",
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <span>{formatCurrency(row.received_quantity,".")}</span>
          </div>
        )
      },
      width: "100px",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
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
      title: "Thành tiền",
      dataIndex: "amount",
      visible: true,
      width: 120,
      render: (value: number, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div>
            <div>Gửi: <span className="text-bold">{formatCurrency(row.transfer_quantity * row.price,".")}</span></div>
            <div>Nhận: <span className="text-bold">{formatCurrency(row.received_quantity * row.price,".")}</span></div>
          </div>
        );
      },
    },
    {
      title: "Thao tác",
      width: "300px",
      visible: true,
      dataIndex: "",
      render: (value: string, record: InventoryExportImportTransferDetailItem) => (
        <div>
          <Row gutter={12}>
            <Col span={8}>
              Người tạo:
            </Col>
            <Col span={16}>
              <div className="product-item-sku custom-title">
                <Link
                  target="_blank"
                  to={`${UrlConfig.ACCOUNTS}/${record.created_by}`}
                >
                  {record.created_by}
                </Link>
              </div>
              <div className="product-item-name custom-name">
                <span className="product-item-name-detail">{record.created_name}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              Người gửi:
            </Col>
            <Col span={16}>
              <div className="product-item-sku custom-title">
                <Link
                  target="_blank"
                  to={`${UrlConfig.ACCOUNTS}/${record.exported_code}`}
                >
                  {record.exported_code}
                </Link>
              </div>
              <div className="product-item-name custom-name">
                <span className="product-item-name-detail">{record.exported_name}</span>
              </div>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              Người nhận:
            </Col>
            <Col span={16}>
              <div className="product-item-sku custom-title">
                <Link
                  target="_blank"
                  to={`${UrlConfig.ACCOUNTS}/${record.received_by}`}
                >
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
      width: "220px",
      render: (item: string, row: InventoryExportImportTransferDetailItem) => {
        return (
          <div className={item ? 'note': ''}>
            <span className="mr-5">{row.inventory_transfer.note}</span>
            <FormOutlined
              onClick={() => {
                setItemData(row);
                setIsModalVisibleNote(true);
              }}
              className={item ? 'note-icon' : ''}
            />
          </div>
        );
      },
    }
  ];

  const [columns, setColumn] = useState<Array<any>>(defaultColumns);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({...params});
      let queryParam = generateQuery({...params});
      history.push(`${history.location.pathname}?${queryParam}`);
    },
    [history, params]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const getAccounts = async (codes: string) => {
    const initSelectedResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      searchAccountPublicApi,
      {
        codes
      }
    );

    setAccounts && setAccounts(initSelectedResponse.items);
  }

  const onFilter = useCallback(
    (values) => {
      let newParams = {...params, ...values, page: 1};
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      setTableLoading(true);
      history.push(`${history.location.pathname}?${queryParam}`);
      getAccounts(newParams.created_by).then();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, params]
  );

  const location = useLocation()

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
      { ...params }
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
        if (newColumns[i].dataIndex === 'total_quantity') {
          newColumns[i] = {
            // eslint-disable-next-line no-loop-func
            title: () => {
              return (
                <div className="text-center">
                  <div>SL Gửi</div>
                  <div className="total-quantity">{formatCurrency(total)}</div>
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
                  <span>{formatCurrency(row.transfer_quantity,".")}</span>
                </div>
              )
            },
            width: "100px",
          };
        }
        if (newColumns[i].dataIndex === 'received_quantity') {
          newColumns[i] = {
            // eslint-disable-next-line no-loop-func
            title: () => {
              return (
                <div className="text-center">
                  <div>SL Nhận</div>
                  <div className="total-quantity">{formatCurrency(totalReceived)}</div>
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
                  <span>{formatCurrency(row.received_quantity,".")}</span>
                </div>
              )
            },
            width: "100px",
          };
        }
      }

      setColumn(newColumns);
    } else {
      setColumn(defaultColumns)
    }

    setTableLoading(false);

    setData(response)
  }

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
      data
    );

    setItemData(undefined);
    if (response) showSuccess(`Cập nhật ${itemData?.code} thành công`);
    getListExportImportTransfer().then()
  }

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
          showSizeChanger: false,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
        }}
      />
      <CustomTable
        isLoading={tableLoading}
        scroll={{x: 1000}}
        sticky={{offsetScroll: 5, offsetHeader: 55}}
        pagination={false}
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
              const newData = {
                version: itemData?.inventory_transfer.version,
                note: data.note
              }

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
                  formNote.setFieldsValue({note: e.target.value});
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
    </ExportImportTransferTabWrapper>
  );
};

export default ExportImportTab;
