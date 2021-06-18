import { Card } from "antd";
import StoreFilter from "component/filter/store.filter";
import { MenuAction } from "component/table/ActionButton";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { StoreSearchAction } from "domain/actions/core/store.action";
import { StoreQuery } from "model/core/store.model";
import { StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

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
  let dataQuery: StoreQuery = { ...initQuery, ...getQueryParams(query) };
  let [params, setPrams] = useState<StoreQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<StoreResponse>>({
    metadata: {
      limit: 0,
      page: 0,
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
      render: (value: string, item: StoreResponse) => (
        <div
          className={
            item.status === "active" ? "status-active" : "status-not-active"
          }
        >
          {value}
        </div>
      ),
    }
  ];
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page - 1;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 0 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.STORE}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    dispatch(StoreSearchAction(params, setData));
  }, [dispatch, params]);
  return (
    <div>
      <Card className="contain">
        <StoreFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
        />
       <CustomTable
          onChange={onPageChange}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page + 1,
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
