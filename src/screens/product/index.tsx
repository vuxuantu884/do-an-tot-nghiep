import {InputNumber,Drawer, Button, Card, Form,Col, Row, Input, Select, Table,DatePicker  } from "antd"
import { Link, useHistory } from "react-router-dom";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchVariantsRequestAction } from "domain/actions/products.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import search from 'assets/img/search.svg';
import { generateQuery } from "utils/AppUtils";
import CustomPagination from "component/table/CustomPagination";
import ButtonSetting from "component/table/ButtonSetting";
import { VariantResponse } from "model/response/products/variant.response";
import {SearchVariantQuery} from "model/query/search.variant.query";
import { getQueryParams, useQuery } from "utils/useQuery";
import { BaseMetadata } from "model/response/base-metadata.response";

const { Option } = Select;
const Product: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const query = useQuery();
  let [params, setPrams] = useState<SearchVariantQuery>(getQueryParams(query));
  const [metadata, setMetadata] = useState<BaseMetadata>({
    limit: params.limit ? params.limit : 30,
    page: params.page ? params.page : 0,
    total: 0,
  });

  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const brands = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.brand) {
      return bootstrapReducer.data.brand;
    }
    return [];
  }, [bootstrapReducer]);
  const madeins = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.currency) {
      return bootstrapReducer.data.currency;
    }
    return [];
  }, [bootstrapReducer]);

  const columns = [
    {
      title: 'Mã sản phẩm',
      dataIndex: 'sku',
      render: (text: string) => {
        return <Link to="#">{text}</Link>
      }
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
    },
    {
      title: 'Size',
      dataIndex: 'size',
    },
    {
      title: 'Nhà thiết kế',
      dataIndex: 'product',
      render: (product: any) => {
        return <Link to="#">{product.designer}</Link>
      }
    },
    {
      title: 'Marchandiser',
      dataIndex: 'product',
      render: (product: any) => {
        return <Link to="#">{product.merchandiser}</Link>
      }
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
    let newPrams ={...params, ...values, page: 0};
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/products?${queryParam}`);
  }, [history, params]);
  const onPageSizeChange = useCallback((size: number) => {
    params.limit = size;
    let queryParam = generateQuery(params);
    setPrams({...params});
    history.push(`/products?${queryParam}`);
  }, [history, params]);
  useLayoutEffect(() => {
      dispatch(searchVariantsRequestAction(params, setData, setMetadata));
  }, [dispatch, params])

  

  return (
    <div>
      <Card className="contain">
        {
         
            <React.Fragment>
              <Card
                className="view-control"
                style={{ display: 'flex', justifyContent: 'flex-end' }}
                bordered={false}
              >
                <Form
                  size="middle"
                  onFinish={onFinish}
                  initialValues={params}
                  layout="inline"
                >
                  <Form.Item name="info">
                    <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã sản phẩm" />
                  </Form.Item>
                  <Form.Item name="barcode">
                    <Input  style={{ width: 250 }} placeholder="Barcode" />
                  </Form.Item>
                  <Form.Item name="brand">
                    <Select defaultValue="" 
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
                    <Button  className="yody-search-button" onClick={showDrawer}>Bộ lọc nâng cao</Button>
                  </Form.Item>
                  <Drawer
          title="Create a new account"
          width={300}
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
                  name="from_inventory"
                  label="Tồn kho từ"
                >
                  <InputNumber  />
                </Form.Item>
              </Col>
              <Col span={12}>
              <Form.Item
                  name="to_inventory"
                  label="đến"
                >
                  <InputNumber />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="made_in"
                  label="Xuất sứ"
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
              <CustomPagination
                metadata={metadata} 
                onPageSizeChange={onPageSizeChange}
              />
             
            </React.Fragment>
          
        }
      </Card>
    </div>
  )
}

export default Product;