import { Button, Card, Form, Input, Select, Table } from "antd";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from 'assets/img/search.svg';
import {MaterialResponse} from 'model/response/product/material.response';
import ButtonSetting from "component/table/ButtonSetting";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { getMaterialAction } from "domain/actions/material.action";
import { BaseMetadata } from "model/response/base-metadata.response";
import CustomPagination from "component/table/CustomPagination";
import { MaterialQuery } from "model/query/material.query";

const ListMaterial: React.FC = () => {
  const [data, setData] = useState<Array<MaterialResponse>>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let [params, setPrams] = useState<MaterialQuery>(getQueryParams(query));
  const [metadata, setMetadata] = useState<BaseMetadata>({
    limit: params.limit ? params.limit : 30,
    page: params.page ? params.page : 0,
    total: 0,
  });
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
  const onFinish = useCallback((values) => {
    let newPrams ={...params, ...values, page: 0};
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/products/materials?${queryParam}`);
  }, [history, params]);
  const onPageSizeChange = useCallback((size: number) => {
    params.limit = size;
    let queryParam = generateQuery(params);
    setPrams({...params});
    history.push(`/products/materials?${queryParam}`);
  }, [history, params]);
  useLayoutEffect(() => {
      dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params])
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
                  initialValues={params}
                  layout="inline"
                >
                  <Form.Item name="info">
                    <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã/Id nhân viên" />
                  </Form.Item>
                  <Form.Item name="component">
                    <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Thành phần" />
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
              <CustomPagination
                metadata={metadata} 
                onPageSizeChange={onPageSizeChange}
              />
            </React.Fragment>
          )
        }
      </Card>
    </div>
  )
}

export default ListMaterial;