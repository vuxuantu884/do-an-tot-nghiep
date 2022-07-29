import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PurchaseOrderLineReturnItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseOrderReturn,
  PurchaseOrderReturnQuery,
} from "model/purchase-order/purchase-order.model";
import React, { useCallback, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { getQueryParams, useQuery } from "utils/useQuery";
import { getTotalQuantityReturn, useFetchPOReturn } from "./helper";
import { PurchaseOrderTabUrl } from "screens/purchase-order/helper";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POUtils } from "utils/POUtils";

interface PurchaseOrderReturnProps {}

const PurchaseOrderReturnList: React.FC<PurchaseOrderReturnProps> = (
  props: PurchaseOrderReturnProps,
) => {
  const [selected, setSelected] = useState<Array<PurchaseOrderReturn>>([]);
  const query = useQuery();
  let initQuery: PurchaseOrderReturnQuery = { page: 1, limit: 30 };

  let dataQuery: PurchaseOrderReturnQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<PurchaseOrderReturnQuery>(dataQuery);
  const { data, loading } = useFetchPOReturn(params);
  // const currentPermissions: string[] = useSelector(
  //   (state: RootReducerType) => state.permissionReducer.permissions
  // );
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
        width: "20%",
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
        render: (value, record) => {
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
        title: "Kho nhập hàng",
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
            <span>SL</span>
            <div style={{ color: "#2A2A86" }}>{`(${getTotalQuantityReturn(data.items)})`}</div>
          </div>
        ),
        dataIndex: "line_return_items",
        align: "center",
        width: "10%",
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
        // align: 'center',
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
      // {
      //   title: "Ghi chú",
      //   // align: "center",
      //   dataIndex: "supplier_note",
      //   visible: true,
      //   render: (value, record) => {
      //     const hasPermission = [PurchaseOrderPermission.update].some((element) => {
      //       return currentPermissions.includes(element);
      //     });
      //     return (
      //       <>
      //         <EditNote
      //           isHaveEditPermission={hasPermission}
      //           note={value}
      //           title=""
      //           color={primaryColor}
      //           onOk={(newNote) => {
      //             // onUpdateReceivedProcurement(newNote, record)
      //             // editNote(newNote, "customer_note", record.id, record);
      //           }}
      //         // isDisable={record.status === OrderStatus.FINISHED}
      //         />
      //       </>
      //     )
      //   },
      // },
    ];
  }, [data.items]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div>
      <CustomTable
        isRowSelection
        selectedRowKey={selected.map((e) => e.id)}
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        columns={defaultColumns}
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
    </div>
  );
};

export default PurchaseOrderReturnList;
