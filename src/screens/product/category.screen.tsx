import { Button, Card, Form, Input, Select, Table } from "antd"
import { Link, useHistory } from "react-router-dom";
import setting from 'assets/img/setting.svg';
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryRequestAction } from "domain/actions/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useQuery } from "utils/useQuery";
import { CategoryResponse } from "model/response/CategoryResponse";
import search from 'assets/img/search.svg';

const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<CategoryResponse>>([]);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const query = useQuery();
  const name = query.get('name');
  const good = query.get('goods');
  const columns = [
    {
      title: 'Ngành hàng',
      dataIndex: 'goods_name',
      render: (text: string) => <Link to="#">{text}</Link>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'name',
    },
    {
      title: 'Thuộc danh mục',
      dataIndex: 'address',
    },
    {
      title: 'Mã danh mục',
      dataIndex: 'code',
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: () => <Button><img src={setting} alt="setting" /></Button>,
      width: 50
    },
  ];
  const onFinish = useCallback((values) => {
    return history.push(`/products/categories?name=${values.name}&goods=${values.goods}`);
  }, [history]);
  useLayoutEffect(() => {
    dispatch(getCategoryRequestAction(null, null, good, name, setData))
  }, [dispatch, good, name]);
  return (
    <div>
      <Card>
        <Card
          style={{ display: 'flex', justifyContent: 'flex-end' }}
          bordered={false}
        >
          <Form
            size="middle"
            onFinish={onFinish}
            initialValues={{
              name: name !=null ? name: '',
              goods: good != null ? good : '',
            }}
            layout="inline"
          >
            <Form.Item name="name">
              <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã danh mục" />
            </Form.Item>
            <Form.Item name="goods">
              <Select
                style={{
                  width: 250,
                }}
              >
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
          </Form>
        </Card>
        <Table
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item) =>item.id}
        />
      </Card>
    </div>
  )
}

export default Category;