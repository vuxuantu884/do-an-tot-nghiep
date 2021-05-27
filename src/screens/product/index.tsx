import {Drawer, Button, Card, Form,Col, Row, Input, Select, Table,DatePicker  } from "antd"
import { Link, useHistory } from "react-router-dom";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchVariantsRequestAction } from "domain/actions/products.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useQuery } from "utils/useQuery";
import search from 'assets/img/search.svg';
import { CategoryParent, CategoryView } from "model/other/category-view";
import ButtonSetting from "component/table/ButtonSetting";
import { VariantResponse } from "model/response/products/variant.response";


const { Option } = Select;
const Product = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const brands = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.brand) {
      return bootstrapReducer.data.brand;
    }
    return [];
  }, [bootstrapReducer]);
  const query = useQuery();
  const info = query.get('info');
  const barcode = query.get('barcode');
  const brand=query.get('brand');
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
  const showDrawer = useCallback(() => {
    setVisible(true)
  }, []);

  const onClose = useCallback(() => {
    setVisible(false);
  }, []);
  const onFinish = useCallback((values) => {
    return history.push(`/products?info=${values.info}&barcode=${values.barcode}&brand=${values.brand}`);
  }, [history]);
  useLayoutEffect(() => {
    dispatch(searchVariantsRequestAction(info,barcode, setData))
  }, [dispatch, info, barcode]);

  

  return (
    <div>
      <Card className="contain">
        {
          info === null && barcode === null && data.length === 0 ? (
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
                    info: info != null ? info : '',
                    barcode: barcode != null ? barcode : '',
                    brand:brand!=null?brand:''
                  }}
                  layout="inline"
                >
                  <Form.Item name="info">
                    <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã sản phẩm" />
                  </Form.Item>
                  <Form.Item name="barcode">
                    <Input  style={{ width: 250 }} placeholder="Barcode" />
                  </Form.Item>
                  <Form.Item name="brand">
                    <Select
                      style={{
                        width: 250,
                      }}
                    >
                      <Select.Option value="">
                        Thương hiệu
                      </Select.Option>
                      {
                        brands.map((item, index) => (
                          <Select.Option key={index} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="yody-search-button">Lọc</Button>
                    <Button type="primary" htmlType="button" className="yody-search-button" onClick={showDrawer}>Bộ lọc nâng cao</Button>
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
              <Drawer
          title="Create a new account"
          width={720}
          onClose={onClose}
          visible={visible}
          bodyStyle={{ paddingBottom: 80 }}
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Button onClick={onClose} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button onClick={onClose} type="primary">
                Submit
              </Button>
            </div>
          }
        >
          <Form layout="vertical" hideRequiredMark>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[{ required: true, message: 'Please enter user name' }]}
                >
                  <Input placeholder="Please enter user name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="url"
                  label="Url"
                  rules={[{ required: true, message: 'Please enter url' }]}
                >
                  <Input
                    style={{ width: '100%' }}
                    addonBefore="http://"
                    addonAfter=".com"
                    placeholder="Please enter url"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="owner"
                  label="Owner"
                  rules={[{ required: true, message: 'Please select an owner' }]}
                >
                  <Select placeholder="Please select an owner">
                    <Option value="xiao">Xiaoxiao Fu</Option>
                    <Option value="mao">Maomao Zhou</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: 'Please choose the type' }]}
                >
                  <Select placeholder="Please choose the type">
                    <Option value="private">Private</Option>
                    <Option value="public">Public</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="approver"
                  label="Approver"
                  rules={[{ required: true, message: 'Please choose the approver' }]}
                >
                  <Select placeholder="Please choose the approver">
                    <Option value="jack">Jack Ma</Option>
                    <Option value="tom">Tom Liu</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dateTime"
                  label="DateTime"
                  rules={[{ required: true, message: 'Please choose the dateTime' }]}
                >
                 
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    {
                      required: true,
                      message: 'please enter url description',
                    },
                  ]}
                >
                  <Input.TextArea rows={4} placeholder="please enter url description" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Drawer>
            </React.Fragment>
          )
        }
      </Card>
    </div>
  )
}

export default Product;