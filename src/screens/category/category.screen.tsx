import { Button, Card, Form, Input, Select, Table } from "antd"
import { Link, useHistory } from "react-router-dom";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryRequestAction } from "domain/actions/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useQuery } from "utils/useQuery";
import search from 'assets/img/search.svg';
import { CategoryParent, CategoryView } from "model/other/category-view";
import ButtonSetting from "component/table/ButtonSetting";

const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<CategoryView>>([]);
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
  const onFinish = useCallback((values) => {
    return history.push(`/products/categories?name=${values.name}&goods=${values.goods}`);
  }, [history]);
  useLayoutEffect(() => {
    dispatch(getCategoryRequestAction(null, null, good, name, setData))
  }, [dispatch, good, name]);
  return (
    <div>
      <Card className="contain">
        {
          name === null && good === null && data.length === 0 ? (
            <div className="view-empty">
              <span className="text-empty">Danh sách danh mục trống</span>
              <Link to="/products/categories/create" className="buttom-empty">
                Thêm mới danh mục
              </Link>
            </div>
          ) : (
            <React.Fragment>
              <Card
                className="view-control"
                style={{ display: 'flex', justifyContent: 'flex-end' }}
                bordered={false}
              >
                <Form
                  size="middle"
                  onFinish={onFinish}
                  initialValues={{
                    name: name != null ? name : '',
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
                rowSelection={{
                  type: "checkbox",
                  columnWidth: 80,
                }}
                pagination={false}
                dataSource={data}
                columns={columns}
                rowKey={(item) => item.id}
              />
            </React.Fragment>
          )
        }
      </Card>
    </div>
  )
}

export default Category;