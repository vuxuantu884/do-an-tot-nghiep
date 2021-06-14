import { Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "component/table/CustomTable";
import { VariantResponse } from "model/product/product.model";
import {
  AccountSearchQuery,
  AccountResponse,
} from "model/account/account.model";
import AccountFilter from "component/filter/account.filter";
import {
  AccountSearchAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from "domain/actions/account/account.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { convertUtcToLocalDate } from "utils/DateUtils";
import { DepartmentResponse } from "model/account/department.model";
import { PositionResponse } from "model/account/position.model";
import UrlConfig from "config/UrlConfig";
const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
  },
];

const initQuery: AccountSearchQuery = {
  info: "",
  code: "",
};

const ListAccountScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [listDepartment, setDepartment] = useState<Array<DepartmentResponse>>();
  const [listPosition, setPosition] = useState<Array<PositionResponse>>();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.account_status;
  });
  let dataQuery: AccountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<AccountSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<AccountResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: "Mã nhân viên",
      render: (value: AccountResponse) => {
        return <Link to="#">{value.code}</Link>;
      },
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      sorter: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "mobile",
    },
    {
      title: "Cửa hàng",
      dataIndex: "mobile",
    },
    {
      title: "Phân quyền",
      render: (value: AccountResponse) => {
        let role = "";
        return <Link to="#">{value.code}</Link>;
      },
    },
    {
      title: "Ngày tạo",
      render: (value: AccountResponse) => {
        return convertUtcToLocalDate(value.created_date);
      },
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value: string, row: VariantResponse) => (
        <div
          className={
            row.status === "active" ? "status-active" : "status-not-active"
          }
        >
          {value === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
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
      history.replace(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 0 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(DepartmentGetListAction(setDepartment));
      dispatch(PositionGetListAction(setPosition));
      dispatch(StoreGetListAction(setStore));
    }
    isFirstLoad.current = false;
    dispatch(AccountSearchAction(params, setData));
  }, [dispatch, params]);
  return (
    <div>
      <Card className="contain">
        <AccountFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          listDepartment={listDepartment}
          listPosition={listPosition}
          listStatus={listStatus}
          listStore={listStore}
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
          rowKey={(item: AccountResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default ListAccountScreen;
