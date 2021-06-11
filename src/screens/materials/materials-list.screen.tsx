import { Button, Card, Form, Input } from "antd";
import React, { useCallback, useEffect,  useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from 'assets/img/search.svg';
import { MaterialResponse } from 'model/response/products/material.response';
import ButtonSetting from "component/table/ButtonSetting";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { deleteManyMaterialAction, deleteOneMaterialAction, getMaterialAction } from "domain/actions/product/material.action";
import { BaseMetadata } from "model/base/base-metadata.response";
import { MaterialQuery } from "model/query/material.query";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import {showWarning} from 'utils/ToastUtils';
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa"
  },
  {
    id: 2,
    name: "Xóa"
  },
  {
    id: 3,
    name: "Export"
  },
]

const ListMaterial: React.FC = () => {
  const [data, setData] = useState<Array<MaterialResponse>>([]);
  const [selected, setSelected] = useState<Array<MaterialResponse>>([]);
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
        return <Link to={`${UrlConfig.MATERIALS}/${value.id.toString()}`}>{value.code}</Link>
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
    setSelected([...selected])
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params, selected])

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
  }, [dispatch, onDeleteSuccess, selected]);

  const onUpdate = useCallback(() => {
    if(selected.length === 0) {
      showWarning('Vui lòng chọn phần từ cần xóa');
      return;
    }
    if(selected.length === 1) {
      let id = selected[0].id;
     history.push(`${UrlConfig.MATERIALS}/${id}`)
      return;
    }
  }, [history, selected]);

  const onSelect = useCallback((selectedRow: Array<MaterialResponse>) => {
    setSelected(selectedRow)
  }, []);
  const onFinish = useCallback((values) => {
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/${UrlConfig.MATERIALS}?${queryParam}`);
  }, [history, params]);
  const onPageChange = useCallback((size, page) => {
    params.page = page - 1;
    params.limit = size
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/${UrlConfig.MATERIALS}?${queryParam}`);
  }, [history, params]);
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        onUpdate();
        break;
      case 2:
        onDelete();
        break;
    }
  }, [onDelete, onUpdate]);
  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length === 0) {
        return item.id !== 1 && item.id !== 2
      }
      if (selected.length > 1) {
        return item.id !== 1
      }
      
      return true;
    });
  }, [selected]);
  useEffect(() => {
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params])
  console.log(menuFilter);
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
            <ActionButton onMenuClick={onMenuClick} menu={menuFilter} />
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
        <CustomTable
          onSelectedChange={onSelect}
          onChange={onPageChange}
          className="yody-table"
          pagination={metadata}
          dataSource={data}
          columns={columns}
          rowKey={(item: MaterialResponse) => item.id}
        />
      </Card>
    </div>
  )
}

export default ListMaterial;