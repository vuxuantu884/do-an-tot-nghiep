import { Card} from "antd";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import { PageResponse } from "model/response/base-metadata.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import CustomTable from "component/table/CustomTable";
import { CategoryView } from "model/other/Product/category-view";
import { VariantResponse } from "model/response/products/variant.response";
import { AccountSearchQuery } from "model/query/account.search.query";
import { AccountResponse } from "model/response/accounts/account-detail.response";
import { DepartmentResponse } from "model/response/accounts/department.response";
import { PositionResponse } from "model/response/accounts/position.response";
import AccountFilter from "component/filter/account.filter";
import {AccountSearchAction,DepartmentGetListAction,PositionGetListAction} from "domain/actions/account/account.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreResponse } from "model/response/store.response";
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
  code:""
};

const ListAccountScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();  
  const isFirstLoad=useRef(true);  
  const [listDepartment,setDepartment]= useState<Array<DepartmentResponse>>();
  const [listPosition,setPosition]= useState<Array<PositionResponse>>();
  const [listStore,setStore]= useState<Array<StoreResponse>>();
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
      }
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
    },
    {
      title: "Họ tên",
      dataIndex: "full_name",
      sorter:true
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
        let role='';
        return <Link to="#">{value.code}</Link>;
      }
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
          {value==="active"?"Đang hoạt động":"Ngừng hoạt động"}
        </div>
      ),
    },
    {
      title: () => <ButtonSetting />,
      width: 70,
    }
  ];
  
  const onPageChange = useCallback((page, size) => {
    params.page = page - 1;
    params.limit = size
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/accounts?${queryParam}`);
  }, [history, params]);
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 0 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`/accounts?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    if(isFirstLoad.current){
      dispatch(DepartmentGetListAction(setDepartment));
      dispatch(PositionGetListAction(setPosition));
    }
    isFirstLoad.current=false;
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
          className="yody-table"
          pagination={data.metadata}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: CategoryView) => item.id}
        />
      </Card>
    </div>
  );
};

export default ListAccountScreen;
