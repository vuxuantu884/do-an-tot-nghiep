import { Card, Tooltip } from "antd";
import StoreFilter from "component/filter/store.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { StoreRankAction, StoreSearchAction } from "domain/actions/core/store.action";
import { StoreQuery } from "model/core/store.model";
import { StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { RootReducerType } from "model/reducers/RootReducerType";
import { RiCheckboxCircleLine } from "react-icons/ri";
import { StoreRankResponse } from "model/core/store-rank.model";
import { GroupGetAction } from "domain/actions/content/content.action";
import { GroupResponse } from "model/content/group.model";

const initQuery: StoreQuery = {};

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
  },
  {
    id: 2,
    name: "Xóa",
  },
  {
    id: 3,
    name: "Export",
  },
];

const StoreListScreen: React.FC = () => {
  //hook
  const dispatch = useDispatch();
  const query = useQuery();
  const history = useHistory();
  //end hook
  //master data
  const storeStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.store_status
  );
  const [storeRanks, setStoreRank] = useState<Array<StoreRankResponse>>([]);
  const [groups, setGroups] = useState<Array<GroupResponse>>([]);
  //end master data
  let dataQuery: StoreQuery = { ...initQuery, ...getQueryParams(query) };
  let [params, setPrams] = useState<StoreQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<StoreResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: "Mã cửa hàng",
      dataIndex: "code",
      render: (value: string, item: StoreResponse) => {
        return <Link to={`${UrlConfig.STORE}/${item.id}`}>{value}</Link>;
      },
    },
    {
      title: "Tên cửa hàng",
      dataIndex: "name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "hotline",
    },
    {
      title: "Thành phố",
      dataIndex: "city_name",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Phân cấp",
      dataIndex: "rank_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status_name",
      render: (value: string, item: StoreResponse) => {
        let text = "";
        switch (item.status) {
          case "active":
            text = "text-success";
            break;
          case "temp_lock":
            text = "text-secondary";
            break;
          case "permanent_lock":
            text = "text-error";
            break;
        }
        return (
          <div
            style={{ textAlign: "center", fontSize: "20px" }}
            className={text}
          >
            <Tooltip title={value}>
              <RiCheckboxCircleLine />
            </Tooltip>
          </div>
        );
      },
    },
  ];
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    dispatch(StoreSearchAction(params, setData));
    dispatch(StoreRankAction(setStoreRank));
    dispatch(GroupGetAction(setGroups));
  }, [dispatch, params]);
  console.log(storeStatusList);
  return (
    <div>
      <Card className="contain">
        <StoreFilter
          storeStatusList={storeStatusList}
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          storeRanks={storeRanks}
          groups={groups}
        />
        <CustomTable
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: StoreResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default StoreListScreen;
