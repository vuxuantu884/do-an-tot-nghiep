import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryFilter from "../filter/inventory.filter";
import { inventoryGetListAction } from "domain/actions/inventory/inventory.action";
import { getQueryParams, useQuery } from "utils/useQuery";
import { AllInventoryResponse, InventoryQuery, InventoryResponse } from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import { TabProps } from "./tab.props";

const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  let initQuery: InventoryQuery = {};

  let dataQuery: InventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<AllInventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const onResult = useCallback(
    (result: PageResponse<AllInventoryResponse> | false) => {
      setLoading(false);
      if (result) {
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
        `${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`
      );
    },
    [history, params]
  );

 

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(
        `${UrlConfig.INVENTORY}#1?${queryParam}`
      );
    },
    [history, params]
  );

  const storeColumns = useMemo(() => {
    let stores = props.stores;
    if(params.store_id instanceof Array) {
      let arr = params.store_id;
      stores = props.stores.filter((value) => arr.findIndex(item1 => item1 === value.id) !== -1);
    }
    let arrCoulmns: Array<ICustomTableColumType<InventoryResponse>> = []
    stores.forEach((item) => {
      arrCoulmns.push({
        width: 100,
        title: item.name,
        visible: true,
        align: 'right',
        dataIndex: 'inventories',
        render: (value, record, index) => {
          let index1 = value.findIndex((item1: any) => item1.store_id === item.id);
          if(index1 === -1) {
            return '';
          }
          return value[index1].on_hand;
        }
      });
    })
    return arrCoulmns;
  }, [params.store_id, props.stores]);

  const columnFinal = useMemo(() => {
    let columns: Array<ICustomTableColumType<InventoryResponse>> = [
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
        title: 'Barcode',
        visible: true,
        dataIndex: 'barcode',
      },
      {
        title: 'Giá nhập',
        visible: true,
        align: 'right',
        dataIndex: 'import_price',
        render: (value, record, index) => formatCurrency(value)
  
      },
      {
        title: 'Giá bán',
        visible: true,
        dataIndex: 'retail_price',
        align: 'right',
        render: (value, record, index) => formatCurrency(value)
      },
      {
        title: 'Tổng tồn',
        visible: true,
        dataIndex: 'total_on_hand',
        align: 'right',
        render: (value, record, index) => formatCurrency(value)
      },
    ];
    return [...columns, ...storeColumns]
  }, [storeColumns])

  useEffect(() => {
    setLoading(true);
    dispatch(inventoryGetListAction(params, onResult));
  }, [dispatch, onResult, params]);
  return (
    <div className="padding-20">
      <InventoryFilter
        openColumn={() => {}}
        id="all"
        isMulti={true}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={props.stores}
      />
      <CustomTable
        isRowSelection
        isLoading={loading}
        dataSource={data.items}
        scroll={{ x: 900 + storeColumns.length * 100}}
        // sticky={{ offsetScroll: 5, }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        columns={columnFinal}
        rowKey={(data) => data.id}
      />
    </div>
  );
};

export default AllTab;
