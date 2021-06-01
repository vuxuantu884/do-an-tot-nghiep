import { Button, Card, Form, Input, Table } from "antd";
import React, { useCallback, useLayoutEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from 'assets/img/search.svg';
import { MaterialResponse } from 'model/response/product/material.response';
import ButtonSetting from "component/table/ButtonSetting";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { deleteManyMaterialAction, deleteOneMaterialAction, getMaterialAction } from "domain/actions/material.action";
import { BaseMetadata } from "model/response/base-metadata.response";
import CustomPagination from "component/table/CustomPagination";
import { MaterialQuery } from "model/query/material.query";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import {showWarning} from 'utils/ToastUtils';

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

const selected: Array<MaterialResponse> = [];
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
      render: (value: MaterialResponse) => {
        return <Link to={`materials/${value.id.toString()}`}>{value.code}</Link>
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
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params])
  const onDelete = useCallback(() => {
    if(selected.length === 0) {
      showWarning('Vui lòng chọn phần từ cần xóa');
      return;
    }
    if(selected.length === 1) {
      let id = selected[0].id;
      dispatch(deleteOneMaterialAction(id, onDeleteSuccess))
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(deleteManyMaterialAction(ids, onDeleteSuccess))
  }, [dispatch, onDeleteSuccess]);
  const onSelect = useCallback((record) => {
    selected.push(record);
  }, []);
  const onFinish = useCallback((values) => {
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/materials?${queryParam}`);
  }, [history, params]);
  const onPageSizeChange = useCallback((size: number) => {
    params.limit = size;
    params.page = 0;
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/materials?${queryParam}`);
  }, [history, params]);
  const onPageChange = useCallback((page) => {
    params.page = page - 1;
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/materials?${queryParam}`);
  }, [history, params]);
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        onDelete();
        break;
    }
  }, [onDelete]);
  useLayoutEffect(() => {
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params])
  return (
    <div>
      <Card className="contain">
        <Card
          className="view-control"
          style={{ display: 'flex' }}
          bordered={false}
        >
          <Form
            className="form-search"
            size="middle"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <ActionButton onMenuClick={onMenuClick} menu={action} />
            <div className="right-form">
              <Form.Item className="form-group form-group-with-search" name="info">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã/ID nhân viên" />
              </Form.Item>
              <Form.Item className="form-group form-group-with-search" name="component">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Thành phần" />
              </Form.Item>
              <Form.Item className="form-group form-group-with-search" name="description">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Ghi chú" />
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
            onSelect: onSelect,
          }}
          className="yody-table"
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item) => item.id}
        />
        <CustomPagination
          metadata={metadata}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </Card>
    </div>
  )
}

export default ListMaterial;