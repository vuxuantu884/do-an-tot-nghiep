import { Button } from "antd";
import CustomTable from "component/table/CustomTable";
import { POSearchProcurement } from "domain/actions/po/po-procument.action";
import { PageResponse } from "model/base/base-metadata.response";
import { ProcurementQuery, PurchaseProcument } from "model/purchase-order/purchase-procument";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ConvertDateToUtc, getDateFromNow } from "utils/DateUtils";

const TabCurrent: React.FC = () => {
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
  const currentDate = getDateFromNow(0, "day");
  const [params, setParams] = useState<ProcurementQuery>({
    expect_receipt_from: ConvertDateToUtc(currentDate),
    expect_receipt_to: ConvertDateToUtc(currentDate),
  })
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
            title: "STT",
            render: (value, record, index) => index + 1
          },
          {
            title: "Mã nhập kho",
            dataIndex: "code",
            render: (value, record, index) => value
          },
          {
            title: "Kho nhận hàng dự kiến",
            dataIndex: "store",
            render: (value, record, index) => value
          },
          {
            title: "Hành động",
            dataIndex: "",
            render: (value, record, index) => <Button>Nhận hàng</Button>
          },
        ]}
        rowKey={(item) => item.id}
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

export default TabCurrent;