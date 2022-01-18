import { Button, Card, Form, Input } from "antd";
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
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { showSuccess, showWarning } from "utils/ToastUtils";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import { DeleteOutlined, EditOutlined, ExportOutlined } from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
    icon:<EditOutlined />
  },
  {
    id: 2,
    name: "Xóa",
    icon:<DeleteOutlined />
  },
  {
    id: 3,
    name: "Export",
    icon:<ExportOutlined />
  },
];
const { Item } = Form;
const ListMaterial: React.FC = () => {
  const [selected, setSelected] = useState<Array<MaterialResponse>>([]);
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let [params, setPrams] = useState<MaterialQuery>(getQueryParams(query));
  const [data, setData] = useState<PageResponse<MaterialResponse>>({
    items: [],
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const columns = [
    {
      title: "Mã chất liệu",
      dataIndex: "code",
      key: "code",
      render: (value: string, item: MaterialResponse) => {
        return <Link to={`${UrlConfig.MATERIALS}/${item.id}`}>{value}</Link>;
      },
    },
    {
      title: "Tên chất liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thành phần",
      dataIndex: "component",
      key: "component",
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
      key: "created_name",
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
    },
  ];
  const onGetSuccess = useCallback(
    (data: PageResponse<MaterialResponse> | false) => {
      setLoading(false);
      if (!!data) {
        setData(data);
      }
    },
    []
  );
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    setSelected([...selected]);
    showSuccess("Xóa thành công");
    dispatch(getMaterialAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params, selected]);

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
    (values: MaterialQuery) => {
      let newPrams = { ...params, ...values, 
        info: values.info?.trim(),  
        description: values.description?.trim(),
        page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.MATERIALS}?${queryParam}`);
    },
    [history, params]
  );
  const onPageChange = useCallback(
    (page, size) => {
      let newPrams = { ...params, 
        info: params.info?.trim(),  
        description: params.description?.trim(),
        page: page,
        limit: size } as MaterialQuery; 

      let queryParam = generateQuery(params);

      setPrams({ ...newPrams });
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

  const [canDeleteMaterials] = useAuthorization({
    acceptPermissions: [ProductPermission.materials_delete],
  });
  const [canUpdateMaterials] = useAuthorization({
    acceptPermissions: [ProductPermission.materials_update],
  });

  const menuFilter = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 1) {
        return selected.length === 1 && canUpdateMaterials;
      }
      if (item.id === 2) {
        return canDeleteMaterials;
      }
      return true;
    });
  }, [selected, canDeleteMaterials, canUpdateMaterials]);

  useEffect(() => {
    setLoading(true);
    dispatch(getMaterialAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  console.log(menuFilter);
  return (
    <ContentContainer
      title="Quản lý chất liệu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Chất liệu",
        },
      ]}
      extra={<AuthWrapper acceptPermissions={[ProductPermission.materials_create]}>
        <ButtonCreate child="Thêm chất liệu" path={`${UrlConfig.MATERIALS}/create`} />
        </AuthWrapper>}
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
            <Form onFinish={onFinish} initialValues={params} layout="inline">
              <Item name="info" className="input-search">
                <Input
                  prefix={<img src={search} alt="" />}
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
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item> 
            </Form>
          </CustomFilter>
        </div>
        <CustomTable
          isRowSelection
          isLoading={loading}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={data.items}
          columns={columns}
          onSelectedChange={onSelect}
          rowKey={(item: MaterialResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default ListMaterial;
