import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/url.config";
import { inventoryGetDetailAction } from "domain/actions/inventory/inventory.action";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryQuery, InventoryResponse } from "model/inventory";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import InventoryFilter from "../filter/inventory.filter";
import { TabProps } from "./tab.props";

const DetailTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
 
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  let initQuery: InventoryQuery = {};
  const [loading, setLoading] = useState<boolean>(true);
  let dataQuery: InventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<InventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const onResult = useCallback(
    (result: PageResponse<InventoryResponse> | false) => {
      if (result) {
        setLoading(false);
        setData(result);
      }
    },
    []
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      
      history.replace(
        `${UrlConfig.INVENTORY}#2?${queryParam}`
      );
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      console.log(values);
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(
        `${UrlConfig.INVENTORY}#2?${queryParam}`
      );
    },
    [history, params]
  );
  useEffect(() => {
    if (
      props.stores.length > 0 &&
      params.store_id === undefined
    ) {
      setPrams({ ...params, store_id: props.stores[0].id });
    }
  }, [params, props]);
  useEffect(() => {
      setLoading(true);
      dispatch(inventoryGetDetailAction(params, onResult));
  }, [dispatch, onResult, params]);
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<InventoryResponse>>
  >([
    {
      width: 300,
      title: 'Sản phẩm',
      visible: true,
      dataIndex: 'sku',
      fixed: 'left',
      render: (value, record, index) => (
        <div>
          <Link to="">{value}</Link>
          <div>{record.name}</div>
        </div>
      )
    },
    {
      align: 'right',
      title: 'Tổng tồn',
      visible: true,
      dataIndex: 'total_stock'
    },
    {
      align: 'right',
      title: 'Tồn trong kho',
      visible: true,
      dataIndex: 'on_hand'
    },
    {
      align: 'right',
      title: 'Đang giao dịch',
      visible: true,
      dataIndex: 'committed'
    },
    {
      align: 'right',
      title: 'Có thể bán',
      visible: true,
      dataIndex: 'available'
    },
    {
      align: 'right',
      title: 'Hàng tạm giữ',
      visible: true,
      dataIndex: 'on_hold'
    },
    {
      align: 'right',
      title: 'Hàng lỗi',
      visible: true,
      dataIndex: 'defect'
    },
    {
      align: 'right',
      title: 'Chờ nhập',
      visible: true,
      dataIndex: 'in_coming'
    },
    {
      align: 'right',
      title: 'Hàng đang chuyển đến',
      visible: true,
      dataIndex: 'transferring'
    },
    {
      align: 'right',
      title: 'Hàng đang chuyển đi',
      visible: true,
      dataIndex: 'on_way'
    },
    {
      align: 'right',
      title: 'Hàng đang giao',
      visible: true,
      dataIndex: 'shipping'
    },
    {
      align: 'right',
      title: 'Giá nhập',
      visible: true,
      dataIndex: 'shipping'
    },
    {
      align: 'right',
      title: 'Giá bán',
      visible: true,
      dataIndex: 'shipping'
    },
    {
      align: 'center',
      title: 'Ngày khởi tạo',
      visible: true,
      dataIndex: 'created_date',
      render: (value) => ConvertUtcToLocalDate(value)
    },
    {
      align: 'center',
      title: 'Ngày cập nhật',
      visible: true,
      dataIndex: 'transaction_date',
      render: (value) => ConvertUtcToLocalDate(value)
    },
  ]);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  return (
    <div className="padding-20">
      <InventoryFilter
        openColumn={() => setShowSettingColumn(true)}
        id="detail"
        isMulti={false}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={props.stores}
      />
      <CustomTable
        isLoading={loading}
        isRowSelection
        dataSource={data.items}
        columns={columnFinal}
        scroll={{ x: 2500 }}
        sticky={{ offsetScroll: 300}}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        rowKey={(data) => data.id}
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
    </div>
  );
};

export default DetailTab;
