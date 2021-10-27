import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/url.config";
import { inventoryGetHistoryAction } from "domain/actions/inventory/inventory.action";
import { PageResponse } from "model/base/base-metadata.response";
import { HistoryInventoryQuery, HistoryInventoryResponse } from "model/inventory";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import HistoryInventoryFilter from "../filter/history.filter";
import { TabProps } from "./tab.props";

enum DocumentType {
  PURCHASE_ORDER = "purchase_order",
  ORDER = "order",
  RETURN_ORDER = "return_order",
  RETURN_PO = "return_po",
}

const HistoryTab: React.FC<TabProps> = (props: TabProps) => {
  const {stores} = props;
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
  
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [data, setData] = useState<PageResponse<HistoryInventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  let initQuery: HistoryInventoryQuery = {};
  let dataQuery: HistoryInventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<HistoryInventoryQuery>(dataQuery);
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(
        `${UrlConfig.INVENTORY}#3?${queryParam}`
      );
    },
    [history, params]
  );
  const onResult = useCallback(
    (result: PageResponse<HistoryInventoryResponse> | false) => {
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
        `${UrlConfig.INVENTORY}#3?${queryParam}`
      );
    },
    [history, params]
  );

  const getUrlByDocumentType = (type: string) => {
    switch (type) {
      case DocumentType.ORDER:
        return UrlConfig.ORDER;
      case DocumentType.RETURN_ORDER:
        return UrlConfig.ORDERS_RETURN;
      case DocumentType.PURCHASE_ORDER:
      case DocumentType.RETURN_PO:
        return UrlConfig.PURCHASE_ORDER;
      default:
        return type;
    }
  };

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<HistoryInventoryResponse>>
  >([
    {
      width: 300,
      title: 'Sản phẩm',
      visible: true,
      dataIndex: 'sku',
      fixed: 'left',
      render: (value, record, index) => (
        <div>
          <Link to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}>{value}</Link>
          <div>{record.name}</div>
        </div>
      )
    },
    {
      title: 'ID chứng từ',
      visible: true,
      dataIndex: 'code',
      render: (value, record:HistoryInventoryResponse) => (
        <div>
          <Link to={`${getUrlByDocumentType(record.document_type)}/${record.parent_document_id}`}>{value}</Link>          
        </div>
      )
    },
    {
      title: 'Thao tác',
      visible: true,
      dataIndex: 'action'
    },
    {
      align: 'center',
      title: 'Thời gian',
      visible: true,
      dataIndex: 'created_date',
      render: (value) => ConvertUtcToLocalDate(value)
    },
    {
      align: 'right',
      title: 'SL thay đổi',
      visible: true,
      dataIndex: 'quantity',
      render: (value)=> parseInt(value) >0 ? `+${value}` : value 
    },
    {
      align: 'right',
      title: 'Tồn trong kho',
      visible: true,
      dataIndex: 'on_hand',
    },
    {
      align: 'center',
      title: 'Kho hàng',
      visible: true,
      dataIndex: 'store',
    },
    {
      align: 'center',
      title: 'Người sửa',
      visible: true,
      dataIndex: 'updated_name',
    },
  ]);
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  useEffect(() => {
    dispatch(inventoryGetHistoryAction(params, onResult));
  }, [dispatch, onResult, params])
  return (
    <div>
      <HistoryInventoryFilter
        openColumn={() => setShowSettingColumn(true)}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={stores}
      />
      <CustomTable
        isLoading={loading}
        isRowSelection
        dataSource={data.items}
        columns={columnFinal}
        scroll={{ x: 1800 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE}}
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
  )
}

export default HistoryTab;