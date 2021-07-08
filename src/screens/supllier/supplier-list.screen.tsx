import {Card} from 'antd';
import {MenuAction} from 'component/table/ActionButton';
import {PageResponse} from 'model/base/base-metadata.response';
import {
  SupplierResponse,
  GoodsObj,
  SupplierQuery,
} from 'model/core/supplier.model';
import {useCallback, useEffect, useState} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {generateQuery} from 'utils/AppUtils';
import {getQueryParams, useQuery} from 'utils/useQuery';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import SupplierFilter from 'component/filter/supplier.filter';
import {RootReducerType} from 'model/reducers/RootReducerType';
import CustomTable from 'component/table/CustomTable';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/UrlConfig';
import ButtonCreate from 'component/header/ButtonCreate';
import {SupplierSearchAction} from 'domain/actions/core/supplier.action'

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

const initQuery: SupplierQuery = {
  goods: '',
  status: '',
  scorecard: '',
};

const ListSupplierScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const supplierStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.supplier_status;
  }, shallowEqual);
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const scorecard = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.scorecard
  );
  let dataQuery: SupplierQuery = {...initQuery, ...getQueryParams(query)};
  let [params, setPrams] = useState<SupplierQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<SupplierResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      render: (value: string, item: SupplierResponse) => {
        return <Link to={`${UrlConfig.SUPPLIERS}/${item.id}`}>{value}</Link>;
      },
    },
    {
      title: 'Tên NCC',
      dataIndex: 'name',
    },
    {
      title: 'Loại NCC',
      dataIndex: 'type_name',
    },
    {
      title: 'Ngành hàng',
      dataIndex: 'goods',
      render: (values: Array<GoodsObj>) => {
        return (
          <div>
            {values.map((item, index) => (
              <div key={index}>{item.name}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      title: 'Phân cấp',
      dataIndex: 'scorecard',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_name',
      render: (value: string, item: SupplierResponse) => (
        <div
          className={item.status === 'active' ? 'text-success' : 'text-error'}
        >
          {value}
        </div>
      ),
    },
  ];
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({...params});
      history.replace(`/suppliers?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = {...params, ...values, page: 1};
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`/suppliers?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    dispatch(SupplierSearchAction(params, setData));
  }, [dispatch, params]);
  return (
    <ContentContainer
      title="Quản lý nhà cung cấp"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Nhà cung cấp',
        },
      ]}
      extra={
        <ButtonCreate path={`${UrlConfig.SUPPLIERS}/create`} />
      }
    >
      <Card>
        <SupplierFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          goods={goods}
          supplierStatus={supplierStatus}
          scorecard={scorecard}
          params={params}
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
          rowKey={(item: SupplierResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default ListSupplierScreen;
