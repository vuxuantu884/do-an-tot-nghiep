import { Button, Card, Form, Input, Tooltip } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { MaterialResponse, MaterialQuery } from "model/product/material.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import {
  deleteManyMaterialAction,
  deleteOneMaterialAction,
  getMaterialAction,
} from "domain/actions/product/material.action";
import { BaseMetadata } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { showWarning } from "utils/ToastUtils";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import CustomFilter from "component/table/custom.filter";
import { StarOutlined } from "@ant-design/icons";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
  },
  {
    id: 2,
    name: "Xóa",
  },
  {
    id: 3,
    name: "Export",
  },
];
const { Item } = Form;
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
      title: "Mã chất liệu",
      dataIndex: "code",
      key: 'code',
      render: (value: string, item: MaterialResponse) => {
        return (
          <Link to={`${UrlConfig.MATERIALS}/${item.id}`}>
            {value}
          </Link>
        );
      },
    },
    {
      title: "Tên chất liệu",
      dataIndex: "name",
      key: 'name',
    },
    {
      title: "Thành phần",
      dataIndex: "component",
      key: 'component',
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      key: 'created_name',
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: 'description',
    },
  ];
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    setSelected([...selected]);
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần từ cần xóa");
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(deleteOneMaterialAction(id, onDeleteSuccess));
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(deleteManyMaterialAction(ids, onDeleteSuccess));
  }, [dispatch, onDeleteSuccess, selected]);

  const onUpdate = useCallback(() => {
    if (selected.length === 0) {
      showWarning("Vui lòng chọn phần từ cần xóa");
      return;
    }
    if (selected.length === 1) {
      let id = selected[0].id;
      history.push(`${UrlConfig.MATERIALS}/${id}`);
      return;
    }
  }, [history, selected]);

  const onSelect = useCallback((selectedRow: Array<MaterialResponse>) => {
    setSelected(selectedRow);
  }, []);
  const onFinish = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.MATERIALS}?${queryParam}`);
    },
    [history, params]
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.MATERIALS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          onUpdate();
          break;
        case 2:
          onDelete();
          break;
      }
    },
    [onDelete, onUpdate]
  );
  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length === 0) {
        return item.id !== 1 && item.id !== 2;
      }
      if (selected.length > 1) {
        return item.id !== 1;
      }

      return true;
    });
  }, [selected]);
  useEffect(() => {
    dispatch(getMaterialAction(params, setData, setMetadata));
  }, [dispatch, params]);
  console.log(menuFilter);
  return (
    <div>
      <Card className="contain">
        <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
          <Form
            size="middle"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <Item name="info">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Tên/Mã/ID nhân viên"
              />
            </Item>
            <Item name="component">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Thành phần"
              />
            </Item>
            <Item name="description">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 200 }}
                placeholder="Ghi chú"
              />
            </Item>
            <Item>
              <Button
                type="primary"
                htmlType="submit"
                className="yody-search-button"
              >
                Lọc
              </Button>
            </Item>
            <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item>
          </Form>
        </CustomFilter>
        <CustomTable
          pagination={{
            pageSize: metadata.limit,
            total: metadata.total,
            current: metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={data}
          columns={columns}
          onSelectedChange={onSelect}
          rowKey={(item: MaterialResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default ListMaterial;
