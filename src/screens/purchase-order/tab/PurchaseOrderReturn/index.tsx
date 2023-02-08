import moment from "moment";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PurchaseOrderLineReturnItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseOrderReturn,
  PurchaseOrderReturnQuery,
} from "model/purchase-order/purchase-order.model";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE, STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";
import { getQueryParams, useQuery } from "utils/useQuery";
import { getTotalQuantityReturn } from "./helper";
import { PurchaseOrderTabUrl } from "screens/purchase-order/helper";
import { ConvertDateToUtc, ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { callApiNative } from "utils/ApiUtils";
import { getPurchaseOrderReturnList } from "service/purchase-order/purchase-order.service";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import PurchaseOrderReturnFilter from "screens/purchase-order/component/PurchaseOrderReturnFilter";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import phoneIcon from "assets/icon/phone-2.svg";
import { ExportModal } from "component";
import { START_PROCESS_PERCENT } from "screens/products/helper";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import { HttpStatus } from "config/http-status.config";
import { DATE_CURRENT } from "config/app.config";

interface PurchaseOrderReturnProps {
  showExportModal: boolean;
  setShowExportModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const PurchaseOrderReturnList: React.FC<PurchaseOrderReturnProps> = (
  props: PurchaseOrderReturnProps,
) => {
  const { showExportModal, setShowExportModal } = props;
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(START_PROCESS_PERCENT);
  const [selected, setSelected] = useState<Array<PurchaseOrderReturn>>([]);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);

  const query = useQuery();
  let initQuery: PurchaseOrderReturnQuery = { page: 1, limit: 30 };

  let dataQuery: PurchaseOrderReturnQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  const [params, setParams] = useState<PurchaseOrderReturnQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<PurchaseOrderReturn>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const dispatch = useDispatch();

  const getPOReturnList = useCallback(
    async (params: PurchaseOrderReturnQuery) => {
      setLoading(true);
      try {
        const response = await callApiNative(
          { isShowError: true },
          dispatch,
          getPurchaseOrderReturnList,
          params,
        );
        if (response) {
          setData(response);
        }
      } catch (error: any) {
        showError(error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const value: PurchaseOrderReturnQuery = {
      ...params,
    };
    const created_date_from = params.created_date_from
      ? moment(params?.created_date_from, DATE_FORMAT.DDMMYYY).startOf("day").utc(true)
      : "";

    const created_date_to = params.created_date_to
      ? moment(params?.created_date_to, DATE_FORMAT.DDMMYYY).endOf("day").utc(true)
      : "";

    created_date_from && (value.created_date_from = ConvertDateToUtc(created_date_from));
    created_date_to && (value.created_date_to = ConvertDateToUtc(created_date_to));
    getPOReturnList(value);
  }, [dispatch, getPOReturnList, params]);

  const history = useHistory();

  const onSelectedChange = useCallback((selectedRow: Array<PurchaseOrderReturn>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const onPageChange = (page: number, size?: number) => {
    const newParams = { ...params, page: page, limit: size };
    setParams(newParams);
    history.replace(`${PurchaseOrderTabUrl.RETURN}?${generateQuery(newParams)}`);
  };

  const defaultColumns: Array<ICustomTableColumType<PurchaseOrderReturn>> = useMemo(() => {
    return [
      {
        title: "Mã phiếu trả hàng",
        dataIndex: "code",
        fixed: "left",
        width: "18%",
        visible: true,
        render: (value, record, index) => {
          return (
            <>
              <div>
                <span style={{ color: "#2A2A86" }}>
                  <b>{value}</b>
                </span>
              </div>
              <div style={{ fontSize: 12 }}>
                <div>
                  Mã đơn đặt hàng:{" "}
                  <Link
                    to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.purchase_order.code}
                  </Link>
                </div>
                <div>
                  Mã tham chiếu:{" "}
                  <Link
                    to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.purchase_order.reference}
                  </Link>
                </div>
              </div>
            </>
          );
        },
      },
      {
        title: "Nhà cung cấp",
        dataIndex: "purchase_order",
        visible: true,
        width: "20%",
        render: (value, record: PurchaseOrderReturn) => {
          return (
            <div style={{ fontSize: 12 }}>
              <Link
                style={{ color: "#2A2A86" }}
                to={`${UrlConfig.SUPPLIERS}/${value.supplier_id}`}
                className="link-underline"
                target="_blank"
              >
                <b>{value?.supplier_code}</b>
              </Link>
              <div>{value?.supplier}</div>
              <img src={phoneIcon} alt="phone" />{" "}
              <span className="text-muted fs-12">{record.purchase_order.phone}</span>
              <div>
                Merchandiser:{" "}
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${value.merchandiser_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${value?.merchandiser_code} - ${value?.merchandiser}`}
                </Link>
              </div>
            </div>
          );
        },
      },
      {
        title: "Kho trả hàng",
        dataIndex: "store",
        align: "center",
        width: "10%",
        render: (value, record, index) => {
          return <>{value}</>;
        },
        visible: true,
      },
      {
        title: (
          <div>
            <span>SL </span>
            <span style={{ color: "#2A2A86" }}>{`(${getTotalQuantityReturn(data.items)})`}</span>
          </div>
        ),
        dataIndex: "line_return_items",
        align: "center",
        width: "12%",
        render: (value: Array<PurchaseOrderLineReturnItem>, record, index) => {
          let total = 0;
          value.forEach((item: PurchaseOrderLineReturnItem) => {
            total += item.quantity_return;
          });
          return <>{formatCurrency(total)}</>;
        },
        visible: true,
      },
      {
        title: "Thành tiền",
        dataIndex: "line_return_items",
        align: "center",
        width: "10%",
        render: (value: Array<PurchaseOrderLineReturnItem>, record, index) => {
          let totalAmount = 0;
          value.forEach((item: PurchaseOrderLineReturnItem) => {
            const calculatePrice = POUtils.caculatePrice(
              item.price,
              item.discount_rate,
              item.discount_value,
            );
            totalAmount +=
              item.quantity_return * calculatePrice +
              (item.tax_rate / 100) * item.quantity_return * calculatePrice;
          });
          return <>{formatCurrency(totalAmount)}</>;
        },
        visible: true,
      },
      {
        title: "Lý do trả",
        align: "center",
        width: "15%",
        dataIndex: "return_reason",
        visible: true,
        render: (value, record, index) => {
          return value;
        },
      },
      {
        title: "Ngày tạo",
        dataIndex: "created_date",
        width: "15%",
        render: (value, record: PurchaseOrderReturn, index) => {
          return (
            <>
              {ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}
              <div style={{ fontSize: 12 }}>
                <span style={{ color: "#666666" }}>Người tạo:</span>
                <div>
                  <Link
                    to={`${UrlConfig.ACCOUNTS}/${record.created_by}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {record.created_by} - {record.created_name}
                  </Link>
                </div>
              </div>
            </>
          );
        },
        visible: true,
      },
    ];
  }, [data.items]);

  const [columns, setColumns] =
    useState<Array<ICustomTableColumType<PurchaseOrderReturn>>>(defaultColumns);

  useEffect(() => {
    setColumns(defaultColumns);
  }, [defaultColumns, dispatch]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onFilter = (values: PurchaseOrderReturnQuery) => {
    const newParams = { ...params, ...values, page: 1 };
    setParams(newParams);
    const queryParam = generateQuery(newParams);
    history.push(`${PurchaseOrderTabUrl.RETURN}?${queryParam}`);
  };

  const getConditions = useCallback(
    (type: string) => {
      let conditions = {};
      switch (type) {
        case TYPE_EXPORT.selected:
          const variant_ids = selected.map((e) => e.id).toString();

          conditions = { variant_ids: variant_ids };
          break;
        case TYPE_EXPORT.page:
          conditions = {
            ...params,
            limit: params.limit ?? 30,
            page: params.page ?? 1,
          };
          break;
        case TYPE_EXPORT.all:
          conditions = { ...params, page: undefined, limit: undefined };
          break;
      }
      return conditions;
    },
    [params, selected],
  );

  const resetExport = () => {
    setShowExportModal(false);
    // setIsLoadingExport(false);
    setExportProgressDetail(START_PROCESS_PERCENT);
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      // setIsLoadingExport(true);
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm để xuất file");
        setShowExportModal(false);
        return;
      }

      const conditions = getConditions(typeExport);
      const queryParam = generateQuery({ ...conditions });
      exportFileV2({
        conditions: queryParam,
        type: "TYPE_EXPORT_PRODUCT_VARIANT",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            showSuccess("Đã gửi yêu cầu xuất file");
            setStatusExportDetail(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            setListExportFileDetail([...listExportFileDetail, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
          resetExport();
        });
    },
    Cancel: () => {
      resetExport();
    },
  };

  const checkExportFileDetail = useCallback(() => {
    const getFilePromises = listExportFileDetail.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            setExportProgressDetail(response.data.percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFileDetail.filter((item) => {
              return item !== fileCode;
            });
            let downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";
            downLoad.click();
            setListExportFileDetail(newListExportFile);
            resetExport();
          } else if (response.data && response.data.status === "ERROR") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
            if (response.data.message) {
              showError(response.data.message);
            }
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listExportFileDetail]);

  useEffect(() => {
    if (
      listExportFileDetail.length === STATUS_IMPORT_EXPORT.NONE ||
      statusExportDetail === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExportDetail === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFileDetail();

    const getFileInterval = setInterval(checkExportFileDetail, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFileDetail, checkExportFileDetail, statusExportDetail]);

  return (
    <div>
      <PurchaseOrderReturnFilter
        params={params}
        openSetting={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        setParams={setParams}
      />
      <CustomTable
        isRowSelection
        selectedRowKey={selected.map((e) => e.id)}
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        columns={columnFinal}
        rowKey={(item) => item.id}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        isShowPaginationAtHeader
        bordered
      />
      {showSettingColumn && (
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumns(data);
          }}
          data={columns}
        />
      )}
      <ExportModal
        title="Xuất file danh sách phiếu trả hàng"
        moduleText="sản phẩm"
        onCancel={() => {}}
        onOk={() => {}}
        isVisible={showExportModal}
        // isLoading={isLoadingExport}
        exportProgress={exportProgressDetail}
      />
    </div>
  );
};

export default PurchaseOrderReturnList;
