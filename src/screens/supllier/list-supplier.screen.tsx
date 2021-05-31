import { Button, Card, Form, Input, Select, Table } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomPagination from "component/table/CustomPagination";
import { SearchSupplierQuerry } from "model/query/supplier.query";
import { PageResponse } from "model/response/base-metadata.response";
import { SupplierResposne, GoodsObj } from "model/response/supplier/supplier.response";
import { useCallback, useLayoutEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import search from 'assets/img/search.svg';
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import SupplierFilter from "component/filter/supplier.filter";
import SupplierAction from 'domain/actions/supplier.action';
import { RootReducerType } from "model/reducers/RootReducerType";


const action: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa"
  },
  {
    id: 1,
    name: "Export"
  },
]
const ListSupplierScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const supplierStatus = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.supplier_status)
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods)
  const scorecard = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.scorecard)
  const [visible, setVisible] = useState(false);
  let dataQuery: SearchSupplierQuerry = getQueryParams(query);
  if(!dataQuery.goods) {
    dataQuery.goods = '';
  }
  if(!dataQuery.status) {
    dataQuery.status = '';
  }
  if(!dataQuery.scorecard) {
    dataQuery.scorecard = '';
  }
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
  const onDelete = useCallback(() => {

  }, []);
  const onFinish = useCallback((values) => {
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/suppliers?${queryParam}`);
  }, [history, params]);
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
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        onDelete();
        break;
    }
  }, [onDelete]);
  const onFilter = useCallback((values) => {
    setVisible(false);
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/suppliers?${queryParam}`);
  }, [history, params]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  useLayoutEffect(() => {
    dispatch(SupplierAction.searchSupplier(params, setData));
  }, [dispatch, params])
  return (
    <div>
      <SupplierFilter onFilter={onFilter} goods={goods} supplierStatus={supplierStatus} scorecard={scorecard} params={params} onCancel={onCancelFilter} visible={visible} />
      <Card className="contain">
        <Card
          className="view-control"
          bordered={false}
        >
          <Form
            className="form-search"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <ActionButton onMenuClick={onMenuClick} menu={action} />
            <div className="right-form">
              <Form.Item className="form-group form-group-with-search" name="info">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã nhà cung cấp" />
              </Form.Item>
              <Form.Item className="form-group form-group-with-search" name="goods">
                <Select
                  className="select-with-search"
                  style={{
                    width: 250,
                  }}>
                  <Select.Option value="">
                    Ngành hàng
                  </Select.Option>
                  {
                    goods?.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.name}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="yody-search-button">Lọc</Button>
              </Form.Item>
              <Form.Item>
                <Button onClick={openFilter} className="yody-filter-button">Thêm bộ lọc</Button>
              </Form.Item>
            </div>
          </Form>

        </Card>
        <Table
          rowSelection={{
            type: "checkbox",
            columnWidth: 80,
          }}
          tableLayout="fixed"
          className="yody-table"
          pagination={false}
          dataSource={data.items}
          columns={columns}
          rowKey={(item) => item.id}
        />
        <CustomPagination
          metadata={data.metadata}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Card>
    </div>
  )
}

export default ListSupplierScreen;