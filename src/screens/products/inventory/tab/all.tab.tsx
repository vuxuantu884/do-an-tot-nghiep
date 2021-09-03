import CustomTable from "component/table/CustomTable";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryFilter from "../filter/inventory.filter";
import { inventoryGetListAction } from "domain/actions/inventory/inventory.action";
import { getQueryParams, useQuery } from "utils/useQuery";
import { InventoryQuery, InventoryResponse } from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import { TabProps } from "./tab.props";

const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  let initQuery: InventoryQuery = {};

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

  useEffect(() => {
    if(props.current === '1') {
      dispatch(getListStoresSimpleAction((setStores)));
    }
  }, [dispatch, props]);
  useEffect(() => {
    if(props.current === '1') {
      dispatch(inventoryGetListAction(params, onResult));
    }
  }, [dispatch, onResult, params, props]);
  return (
    <div className="padding-20">
      <InventoryFilter
        id="all"
        isMulti={true}
        onFilter={(value) => {}}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={stores}
      />
      <CustomTable
        dataSource={data.items}
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
    </div>
  );
};

export default AllTab;
