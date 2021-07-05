import {Card, Tag} from 'antd';
import {MenuAction} from 'component/table/ActionButton';
import {PageResponse} from 'model/base/base-metadata.response';
import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {generateQuery} from 'utils/AppUtils';
import {getQueryParams, useQuery} from 'utils/useQuery';
import {useDispatch, useSelector} from 'react-redux';
import CustomTable from 'component/table/CustomTable';
import {VariantResponse} from 'model/product/product.model';
import {
  AccountSearchQuery,
  AccountResponse,
  AccountRolesResponse,
  AccountStoreResponse,
} from 'model/account/account.model';
import AccountFilter from 'component/filter/account.filter';
import {
  AccountSearchAction,
  DepartmentGetListAction,
  PositionGetListAction,
} from 'domain/actions/account/account.action';
import {RootReducerType} from 'model/reducers/RootReducerType';
import {StoreResponse} from 'model/core/store.model';
import {StoreGetListAction} from 'domain/actions/core/store.action';
import {ConvertUtcToLocalDate} from 'utils/DateUtils';
import {DepartmentResponse} from 'model/account/department.model';
import {PositionResponse} from 'model/account/position.model';
import UrlConfig from 'config/UrlConfig';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
const actions: Array<MenuAction> = [
  {
    id: 1,
    name: 'Xóa',
  },
  {
    id: 2,
    name: 'Export',
  },
];

const initQuery: AccountSearchQuery = {
  info: '',
  code: '',
};

const ListAccountScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);
  const [tableLoading,setTableLoading]=useState(true);
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
      page: 1,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: 'Mã nhân viên',
      render: (value: AccountResponse) => {
        return (
          <Link to={`${UrlConfig.ACCOUNTS}/${value.id}`}>{value.code}</Link>
        );
      },
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'user_name',
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'mobile',
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'account_stores',
      render: (stores: Array<AccountStoreResponse>) => (
        <span>
          {stores.map((stores) => {
            return <Tag color="green">{stores.store}</Tag>;
          })}
        </span>
      ),
    },
    {
      title: 'Phân quyền',
      dataIndex: 'account_roles',
      render: (values: Array<AccountRolesResponse>) => (
        <span>
          {values.map((item) => {
            return <Tag color="blue">{item.role_name}</Tag>;
          })}
        </span>
      ),
    },
    {
      title: 'Ngày tạo',
      render: (value: AccountResponse) => {
        return ConvertUtcToLocalDate(value.created_date, 'DD/MM/YYYY');
      },
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: string, row: VariantResponse) => (
        <div
          className={row.status === 'active' ? 'text-success' : 'text-error'}
        >
          {value === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </div>
      ),
    },
  ];

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page - 1;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.replace(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.ACCOUNTS}?${queryParam}`);
    },
    [history, params]
  );
  const setSearchResult = useCallback((listResult: PageResponse<AccountResponse>) => {
    setTableLoading(false);
    setData(listResult);

  },[]);
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(DepartmentGetListAction(setDepartment));
      dispatch(PositionGetListAction(setPosition));
      dispatch(StoreGetListAction(setStore));
    }
    isFirstLoad.current = false;
    dispatch(AccountSearchAction(params, setSearchResult));
  }, [dispatch, params]);
  return (
    <ContentContainer
      title="Quản lý người dùng"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: '/',
        },
        {
          name: 'Quản lý người dùng',
          path: '/accounts',
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.ACCOUNTS}/create`} />}
    >
      <Card>
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
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isLoading={tableLoading}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: AccountResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default ListAccountScreen;
