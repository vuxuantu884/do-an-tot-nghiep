import { Button, Card, Form, Input, Select, Table } from "antd"
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryRequestAction } from "domain/actions/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getQueryParams, useQuery } from "utils/useQuery";
import search from 'assets/img/search.svg';
import { CategoryParent, CategoryView } from "model/other/category-view";
import ButtonSetting from "component/table/ButtonSetting";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { CategoryResponse } from "model/response/category.response";
import { convertCategory, generateQuery } from "utils/AppUtils";
import { CategoryQuery } from "model/query/category.query";

const action: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa"
  },
  {
    id: 2,
    name: "Export"
  },
]

const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CategoryQuery = getQueryParams(query);
  if(!getParams.goods) {
    getParams.goods = ''
  }
  const [params, setPrams] = useState<CategoryQuery>(getParams);
  const [data, setData] = useState<Array<CategoryView>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const columns = [
    {
      title: 'Mã danh mục',
      dataIndex: 'code',
      render: (text: string) => {
        return <Link to="">{text}</Link>
      }
    },
    {
      title: 'Danh mục',
      render: (item: CategoryView) => (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
          {
            item.level > 0 && (
              <div style={{
                borderRadius: 2,
                width: 20 * item.level,
                height: 3,
                background: 'rgba(42, 42, 134, 0.2)',
                marginRight: 8
              }}
              />
            )
          }
          <span>{item.name}</span>
        </div>
      )
    },
    {
      title: 'Thuộc danh mục',
      dataIndex: 'parent',
      render: (item: CategoryParent) => item != null ? item.name : ''
    },
    {
      title: 'Ngành hàng',
      dataIndex: 'goods_name',
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: () => <ButtonSetting />,
      width: 70
    },
  ];
  const onFinish = useCallback((values: CategoryQuery) => {
    let query = generateQuery(values);
    setPrams({ ...values});
    return history.replace(`/categories?${query}`);
  }, [history]);
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        break;
    }
  }, []);
  
  const onGetSuccess = useCallback((results: Array<CategoryResponse>) => {
    let newData: Array<CategoryView> = convertCategory(results);
    setData(newData);
    setLoading(false);
  }, []);
  useEffect(() => {
    dispatch(getCategoryRequestAction(params, onGetSuccess))
  }, [dispatch, onGetSuccess, params]);
  return (
    <div>
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
              <Form.Item className="form-group form-group-with-search" name="name">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã danh mục" />
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
                    goods.map((item, index) => (
                      <Select.Option key={index} value={item.value}>
                        {item.name}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="yody-search-button">Lọc</Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
        <Table
          rowSelection={{
            type: "checkbox",
            columnWidth: 80,
          }}
          loading={loading}
          className="yody-table"
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item) => item.id}
        />
      </Card>
    </div>
  )
}

export default Category;