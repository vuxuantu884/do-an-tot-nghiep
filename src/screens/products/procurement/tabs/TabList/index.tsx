import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { POSearchProcurement } from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import { ProcurementQuery, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

const TabList: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<PurchaseProcument>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [params, setParams] = useState<ProcurementQuery>({})
  const search = useCallback(
    () => {
      setLoading(true);
      dispatch(POSearchProcurement(params, (result) => {
        setLoading(false);
        if(result) {
          setData(result)
        }
      }))
    },
    [dispatch, params],
  )
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({...params});
    },
    [params]
  );
  useEffect(() => {
    search();
  }, [search]);
  return (
    <div className="margin-top-20">
      <CustomTable
        isLoading={loading}
        dataSource={data.items}
        sticky={{ offsetScroll: 5, offsetHeader: 109 }}
        columns={[
          {
            title: "Mã nhập kho",
            dataIndex: "code",
            fixed: "left",
            render: (value, record, index) => <Link to={`${UrlConfig.PURCHASE_ORDER}#procurement${record.id}`}>{value}</Link> 
          },
          {
            title: "Kho nhận hàng dự kiến",
            dataIndex: "store",
            render: (value, record, index) => value
          },
          {
            title: "Ngày nhận hàng dự kiến",
            dataIndex: "expect_receipt_date",
            render: (value, record, index) => ConvertUtcToLocalDate(value)
          },
          {
            title: "Ngày duyệt",
            dataIndex: "activated_date",
            render: (value, record, index) => ConvertUtcToLocalDate(value)
          },
          {
            title: "Người duyệt",
            dataIndex: "activated_by",
            render: (value, record, index) => value
          },
          {
            title: "Ngày nhập kho",
            dataIndex: "stock_in_date",
            render: (value, record, index) => ConvertUtcToLocalDate(value)
          },
          {
            title: "Người nhập",
            dataIndex: "stock_in_by",
            render: (value, record, index) => value
          },
          {
            title: "Trạng thái",
            dataIndex: "status",
            render: (value, record, index) => value
          },
          {
            title: "Đã hủy",
            dataIndex: "is_cancelled",
            render: (value, record, index) => value ? "Đã hủy" : ""
          },
        ]}
        rowKey={(item) => item.id}
        scroll={{ x: 1700}}
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
  )
};

export default TabList;