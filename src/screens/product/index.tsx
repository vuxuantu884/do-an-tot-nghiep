import {InputNumber,Drawer, Button, Card, Form,Col, Row, Input, Select, Table,DatePicker  } from "antd"
import { Link, useHistory } from "react-router-dom";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { getCountry } from "domain/actions/content/content.action";
import { getAllSize } from "domain/actions/product/size.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import search from 'assets/img/search.svg';
import { generateQuery } from "utils/AppUtils";
import CustomPagination from "component/table/CustomPagination";
import ButtonSetting from "component/table/ButtonSetting";
import { VariantResponse } from "model/response/products/variant.response";
import {SearchVariantQuery} from "model/query/search.variant.query";
import { getQueryParams, useQuery } from "utils/useQuery";
import { BaseMetadata } from "model/response/base-metadata.response";
import { CountryResponse } from "model/response/content/country.response";
import { SizeResponse } from "model/response/products/size.response";

const Product: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [made_ins, setMadeInData] = useState<Array<CountryResponse>>([]);
  const [sizes, setSizesData] = useState<Array<SizeResponse>>([]);
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
  const status = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.product_status) {
      return bootstrapReducer.data.product_status;
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
    debugger;
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
      dispatch(getCountry(setMadeInData));
      dispatch(getAllSize(setSizesData));
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
          width={400}
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
                <Form.Item name="made_in"   label="Xuất xứ">
                    <Select defaultValue=""  showSearch
                    >
                      <Select.Option value="">
                        Xuất sứ
                      </Select.Option>
                      {
                        made_ins.map((item, index) => (
                          <Select.Option key={index} value={item.name}>
                            {item.name}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="from_create_date"   label="Thời gian tạo từ">
                <DatePicker />
                  </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="to_create_date"   label="đến">
                <DatePicker />
                  </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="size"   label="Size">
                    <Select defaultValue=""  showSearch
                    >
                      <Select.Option value="">
                        Size
                      </Select.Option>
                      {
                        sizes.map((item, index) => (
                          <Select.Option key={index} value={item.id}>
                            {item.code}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status"   label="Trạng thái">
                    <Select defaultValue=""  showSearch >
                      <Select.Option value="">
                        Trạng thái
                      </Select.Option>
                      {
                        status.map((item, index) => (
                          <Select.Option key={index} value={item.value}>
                            {item.name}
                          </Select.Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
              </Col>
            </Row>
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
                onChange={onPageSizeChange}
              />
             
            </React.Fragment>
          
        }
      </Card>
    </div>
  )
}

export default Product;