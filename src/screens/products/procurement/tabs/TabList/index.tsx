import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { POSearchProcurement } from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem
} from "model/purchase-order/purchase-procument";
import querystring from "querystring";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
  OFFSET_HEADER_TABLE,
  ProcurementStatus,
  ProcurementStatusName
} from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { useQuery } from "utils/useQuery";
import TabListFilter from "../../filter/TabList.filter";

const TAP_ID = 2;
const TabList: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const qurery = useQuery();
  const paramsrUrl: any = Object.fromEntries(qurery.entries());

  const onPageChange = (page: number, size?: number) => {
    paramsrUrl.page = page;
    paramsrUrl.limit = size;
    history.replace(
      `${UrlConfig.PROCUREMENT}/${TAP_ID}?${querystring.stringify(paramsrUrl)}`
    );
  };

  useEffect(() => {
    function search() {
      setLoading(true);
      dispatch(
        POSearchProcurement(paramsrUrl, (result) => {
          setLoading(false);
          if (result) {
            setData(result);
          }
        })
      );
    }
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.search, dispatch,]);

  return (
    <div className="margin-top-20">
      <TabListFilter />
      <CustomTable
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        columns={[
          {
            title: "Mã nhập kho",
            dataIndex: "code",
            fixed: "left",
            width: 120,
            render: (value, record, index) => (
              <Link
                to={`${UrlConfig.PURCHASE_ORDERS}/${record.purchase_order.id}/#procurement_${record.id}`}
              >
                {value}
              </Link>
            ),
          },
          {
            title: "Mã đơn mua",
            dataIndex: "purchase_order",
            fixed: "left",
            width: 120,
            render: (value, record, index) => (
              <Link to={`${UrlConfig.PURCHASE_ORDERS}/${value.id}`}>{value.code}</Link>
            ),
          },
          {
            title: "Kho nhận hàng dự kiến",
            dataIndex: "store",
            render: (value, record, index) => value,
          },
          {
            title: "Ngày nhận hàng dự kiến",
            dataIndex: "expect_receipt_date",
            render: (value, record, index) =>
              ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
          },
          {
            title: "Ngày duyệt",
            dataIndex: "activated_date",
            render: (value, record, index) => ConvertUtcToLocalDate(value),
          },
          {
            title: "Người duyệt",
            dataIndex: "activated_by",
            render: (value, record, index) => value,
          },
          {
            title: "Ngày nhập kho",
            dataIndex: "stock_in_date",
            render: (value, record, index) => ConvertUtcToLocalDate(value),
          },
          {
            title: "Người nhập",
            dataIndex: "stock_in_by",
            render: (value, record, index) => value,
          },
          {
            title: "Nhà cung cấp",
            dataIndex: "purchase_order",
            render: (value) => value?.supplier,
          },
          {
            title: "Merchandiser",
            dataIndex: "purchase_order",
            render: (value) => (
              <>
                {value.merchandiser_code}
                <br />
                {value.merchandiser}
              </>
            ),
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status: string) => {
              return (
                <div>
                  {status === ProcurementStatus.draft && (
                    <div
                      style={{
                        background: "#F5F5F5",
                        borderRadius: "100px",
                        color: "#666666",
                        padding: "3px 10px",
                      }}
                    >
                      {ProcurementStatusName[status]}
                    </div>
                  )}

                  {status === ProcurementStatus.not_received && (
                    <div
                      style={{
                        background: "rgba(42, 42, 134, 0.1)",
                        borderRadius: "100px",
                        color: "#2A2A86",
                        padding: "5px 10px",
                      }}
                    >
                      {ProcurementStatusName[status]}
                    </div>
                  )}

                  {status === ProcurementStatus.received && (
                    <div
                      style={{
                        background: "rgba(39, 174, 96, 0.1)",
                        borderRadius: "100px",
                        color: "#27AE60",
                        padding: "5px 10px",
                      }}
                    >
                      {ProcurementStatusName[status]}
                    </div>
                  )}
                </div>
              );
            },
            align: "center",
          },
          {
            title: "Đã hủy",
            dataIndex: "is_cancelled",
            render: (value, record, index) => (value ? "Đã hủy" : ""),
          },
          {
            title: "SL được duyệt",
            align: "center",
            dataIndex: "procurement_items",
            render: (value, record: PurchaseProcument, index) => {
              if (
                record.status === ProcurementStatus.not_received ||
                record.status === ProcurementStatus.received
              ) {
                let totalConfirmQuantity = 0;
                value.forEach((item: PurchaseProcumentLineItem) => {
                  totalConfirmQuantity += item.quantity;
                });
                return totalConfirmQuantity;
              }
            },
          },
          {
            title: "SL thực nhận",
            align: "center",
            dataIndex: "procurement_items",
            render: (value, record, index) => {
              let totalRealQuantity = 0;
              value.forEach((item: PurchaseProcumentLineItem) => {
                totalRealQuantity += item.real_quantity;
              });
              return totalRealQuantity;
            },
          },
          {
            title: "Ngày tạo",
            align: "center",
            dataIndex: "created_date",
            render: (value) => ConvertUtcToLocalDate(value),
          },
        ]}
        rowKey={(item) => item.id}
        scroll={{ x: 1700 }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
    </div>
  );
};

export default TabList;
