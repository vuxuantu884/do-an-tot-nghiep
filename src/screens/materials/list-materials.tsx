import { Button, Card, Form, Input, Select, Table } from "antd";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import search from 'assets/img/search.svg';
import {MaterialResponse} from 'model/response/product/material.response';
import ButtonSetting from "component/table/ButtonSetting";
import { getQueryParams, useQuery } from "utils/useQuery";
import { PageConfig } from "config/PageConfig";
import { useDispatch } from "react-redux";
import { getMaterialAction } from "domain/actions/material.action";
import { BaseMetadata } from "model/response/base-metadata.response";
import CustomPagination from "component/table/CustomPagination";

const ListMaterial: React.FC = () => {
  const [data, setData] = useState<Array<MaterialResponse>>([]);
  const [metadata, setMetadata] = useState<BaseMetadata>({
    limit: 0,
    page: 0,
    total: 0,
  });
  const dispatch = useDispatch();
  const query = useQuery();
  const columns = [
    {
      title: 'Mã chất liệu',
      dataIndex: 'code',
      render: (text: string) => {
        return <Link to="#">{text}</Link>
      }
    },
    {
      title: 'Tên chất liệu',
      dataIndex: 'name',
    },
    {
      title: 'Thành phần',
      dataIndex: 'component',
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
    },
    {
      title: () => <ButtonSetting />,
      width: 70
    },
  ];

  const limit = query.get('limit');
  const page = query.get('page');
  const component = query.get('component');
  const created_name = query.get('created_name');
  const description = query.get('description');
  const sort_column = query.get('sort_column');
  const sort_type = query.get('sort_type');
  const info = query.get('info');

  const params = getQueryParams(query);
  console.log(params);

  const onFinish = useCallback(() => {}, []);
  let limitInt = limit !== null ? parseInt(limit)  : 30;
  let pageInt = page !== null ? parseInt(page) : 1;

  useLayoutEffect(() => {
    if(!Number.isNaN(limitInt) && !Number.isNaN(pageInt)) {
      dispatch(getMaterialAction(component, created_name, description, info, limitInt, pageInt - 1, sort_column, sort_type, setData, setMetadata));
    }
  }, [component, created_name, description, dispatch, info, limit, limitInt, pageInt, sort_column, sort_type])
  if((Number.isNaN(limitInt) || Number.isNaN(pageInt))) {
    return <Redirect to='/products/materials' />
  }
  return (
    <div>
      <Card className="contain">
        {
         data.length === 0 ? (
            <div className="view-empty">
              <span className="text-empty">Danh sách chất liệu trống</span>
              <Link to="/products/materials/create" className="buttom-empty">
                Thêm mới chất liệu
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
                   
                  }}
                  layout="inline"
                >
                  <Form.Item name="name">
                    <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã/Id nhân viên" />
                  </Form.Item>
                  <Form.Item name="goods">
                    <Select 
                      style={{
                        width: 250,
                      }}
                    >
                      <Select.Option value="">
                        Bộ phận
                      </Select.Option>
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
              <CustomPagination metadata={metadata} />
            </React.Fragment>
          )
        }
      </Card>
    </div>
  )
}

export default ListMaterial;