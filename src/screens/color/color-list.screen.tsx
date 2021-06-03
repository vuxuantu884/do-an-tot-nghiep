import CustomTable from "component/table/CustomTable";
import {Button, Card, Form, Input} from 'antd'
import ActionButton, { MenuAction } from "component/table/ActionButton";
import search from 'assets/img/search.svg';
import React, { useCallback, useLayoutEffect, useState } from "react";
import { deleteManyMaterialAction, deleteOneMaterialAction, getMaterialAction } from "domain/actions/product/material.action";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { useQuery } from "utils/useQuery";
import { Link } from "react-router-dom";
import { MaterialResponse } from "model/response/product/material.response";
import { showWarning } from "utils/ToastUtils";
import ButtonSetting from "component/table/ButtonSetting";



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


const selected = [];

const ColorListScreen = () => {
  const [data, setData] = useStatee<Array<MaterialResponse>>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  // let [params, setPrams] = useState<MaterialQuery>(getQueryParams(query));
  // const [metadata, setMetadata] = useState<BaseMetadata>({
  //   limit: params.limit ? params.limit : 30,
  //   page: params.page ? params.page : 0,
  //   total: 0,
  // });
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

  }, []);
  const onPageChange = useCallback((size, page) => {

  }, []);
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        onDelete();
        break;
    }
  }, [onDelete]);
  useLayoutEffect(() => {
  }, [dispatch])
  return (
    <div>
      <Card className="contain">
        <Card
          className="view-control"
          style={{ display: "flex" }}
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
              <Form.Item
                className="form-group form-group-with-search"
                name="info"
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ width: 250 }}
                  placeholder="Tên/Mã/ID nhân viên"
                />
              </Form.Item>
              <Form.Item
                className="form-group form-group-with-search"
                name="component"
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ width: 250 }}
                  placeholder="Thành phần"
                />
              </Form.Item>
              <Form.Item
                className="form-group form-group-with-search"
                name="description"
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ width: 250 }}
                  placeholder="Ghi chú"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="yody-search-button"
                >
                  Lọc
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
        <CustomTable
          onSelect={onSelect}
          onChange={onPageChange}
          className="yody-table"
          pagination={metadata}
          dataSource={data}
          columns={columns}
          rowKey={(item: MaterialResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default ColorListScreen;
