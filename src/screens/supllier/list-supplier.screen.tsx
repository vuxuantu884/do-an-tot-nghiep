import { Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import { SearchSupplierQuerry } from "model/query/supplier.query";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResposne, GoodsObj } from "model/response/supplier/supplier.response";
import { useCallback, useLayoutEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import SupplierFilter from "component/filter/supplier.filter";
import SupplierAction from 'domain/actions/supplier.action';
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable from "component/table/CustomTable";
import { CategoryView } from "model/other/category-view";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa"
  },
  {
    id: 2,
    name: "Export"
  },
]

const initQuery: SearchSupplierQuerry = {
   goods: '',
   status: '',
   scorecard: '',
}

const ListSupplierScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const supplierStatus = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_status)
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods)
  const scorecard = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.scorecard)
  let dataQuery: SearchSupplierQuerry =  {...initQuery, ...getQueryParams(query)};
  let [params, setPrams] = useState<SearchSupplierQuerry>(dataQuery);
  const [data, setData] = useState<PageResponse<SupplierResposne>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const columns = [
    {
      title: 'Mã NCC',
      render: (value: SupplierResposne) => {
        return <Link to={`suppliers/${value.id}`}>{value.code}</Link>
      }
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
            {
              values.map((item, index) => (<div key={index}>{item.name}</div>))
            }
          </div>
        )
      }
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
      render: (value: string, row: SupplierResposne) => (
        <div className={row.status === 'active' ? 'status-active' : 'status-not-active'}>{value}</div>
      )
    },
    {
      title: () => <ButtonSetting />,
      width: 70
    },
  ];
  const onPageSizeChange = useCallback((size: number) => {
    params.limit = size;
    params.page = 0;
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/suppliers?${queryParam}`);
  }, [history, params]);
  const onPageChange = useCallback((page) => {
    params.page = page - 1;
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/suppliers?${queryParam}`);
  }, [history, params]);
  const onFilter = useCallback((values) => {
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/suppliers?${queryParam}`);
  }, [history, params]);
  const onMenuClick = useCallback((index: number) => {

  }, []);
  useLayoutEffect(() => {
    dispatch(SupplierAction.searchSupplier(params, setData));
  }, [dispatch, params])
  return (
    <div>
      <Card className="contain">
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
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          className="yody-table"
          pagination={data.metadata}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: CategoryView) => item.id}
        />
      </Card>
    </div>
  )
}

export default ListSupplierScreen;