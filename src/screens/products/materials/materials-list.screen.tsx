import { Button, Card, Form, Input } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { MaterialQuery, MaterialResponse } from "model/product/material.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteManyMaterialAction,
  deleteOneMaterialAction,
  getMaterialAction,
  updateMaterialOtherAction,
} from "domain/actions/product/material.action";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { showSuccess, showWarning } from "utils/ToastUtils";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import EditNote from "../../order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { SupplierResponse } from "../../../model/core/supplier.model";
import TextShowMore from "component/container/show-more/text-show-more";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { RootReducerType } from "model/reducers/RootReducerType";

const actionsDefault: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
    icon: <EditOutlined />,
  },
  {
    id: 2,
    name: "Xóa",
    icon: <DeleteOutlined />,
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
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const marterialStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.material_status,
  );

  const onUpdateNote = (note: string, items: MaterialResponse) => {
    const newValue: any = {
      description: note,
      status: items.status,
    };
    dispatch(updateMaterialOtherAction(items.id, newValue, onUpdateStatus));
  };

  const columns = [
    {
      title: "ID chất liệu",
      width: 140,
      dataIndex: "code",
      key: "code",
      render: (value: string, item: MaterialResponse) => {
        return (
          <div>
            <Link to={`${UrlConfig.MATERIALS}/${item.id}`}>{value}</Link>
            <div>{ConvertUtcToLocalDate(item.created_date, DATE_FORMAT.DDMMYY_HHmm)}</div>
          </div>
        );
      },
    },
    {
      title: <div className="text-center">Chất liệu</div>,
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (value: string, item: MaterialResponse) => {
        return (
          <div className="text-center">
            <TextShowMore maxLength={100}>{value}</TextShowMore>
            <div>
              <span style={{ color: "#666666" }}>{item.fabric_code}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Thành phần",
      dataIndex: "component",
      key: "component",
      width: 150,
      render: (value: string) => {
        return <TextShowMore maxLength={100}>{value}</TextShowMore>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (value: string, item: MaterialResponse) => {
        const marterial = marterialStatusList?.find((e: any) => e.value === value);
        let statusName = "";
        if (marterial) statusName = marterial.name;
        return (
          <label className={value === "active" ? "text-success" : "text-error"}>{statusName}</label>
        );
      },
    },
    {
      title: "Thông tin vải",
      dataIndex: "fabric_size",
      key: "fabric_size",
      width: 150,
      render: (value: string, item: MaterialResponse) => {
        return (
          <div>
            <div>
              Khổ vải:{" "}
              <span className="font-weight-500">
                {formatCurrency(value)} {value ? item.fabric_size_unit : ""}
              </span>
            </div>
            <div>
              Trọng lượng:{" "}
              <span className="font-weight-500">
                {formatCurrency(item.weight)} {item.weight ? item.weight_unit : ""}
              </span>
            </div>
            <div>
              Giá:{" "}
              <span className="font-weight-500">
                {formatCurrency(item.price)} {item.price ? item.price_unit : ""}
                {item.price_measure_unit ? `/${item.price_measure_unit}` : ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "suppliers",
      key: "suppliers",
      width: 150,
      render: (value: Array<SupplierResponse>) => {
        return (
          <div>
            {value?.length > 0 &&
              value?.map((i: SupplierResponse) => {
                return (
                  <div>
                    <Link to={`${UrlConfig.SUPPLIERS}/${i.id}`}>{i.name}</Link>
                  </div>
                );
              })}
          </div>
        );
      },
    },
    {
      title: "Ứng dụng",
      width: 200,
      dataIndex: "application",
      key: "application",
      render: (value: string) => {
        return <TextShowMore maxLength={100}>{value}</TextShowMore>;
      },
    },
    {
      title: "Người tạo",
      width: 130,
      key: "created_name",
      render: (item: MaterialResponse) => {
        return item.created_name ? (
          <div>
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>
              {item.created_by} - {item.created_name}
            </Link>
          </div>
        ) : (
          "---"
        );
      },
    },
    {
      title: "Ngày tạo",
      width: 140,
      dataIndex: "created_date",
      render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Ghi chú",
      width: 140,
      dataIndex: "description",
      render: (value: string, item: MaterialResponse) => {
        return (
          <>
            <EditNote
              isHaveEditPermission={true}
              note={value}
              title=""
              color={primaryColor}
              onOk={(newNote) => {
                onUpdateNote(newNote, item);
              }}
            />
          </>
        );
      },
    },
  ];

  const onGetSuccess = useCallback((data: PageResponse<MaterialResponse> | false) => {
    setLoading(false);
    if (!!data) {
      setData(data);
    }
  }, []);

  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    setSelected([...selected]);
    showSuccess("Xóa thành công");
    dispatch(getMaterialAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params, selected]);

  const onDelete = useCallback(() => {
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
      let newPrams = {
        ...params,
        ...values,
        info: values.info?.trim(),
        description: values.description?.trim(),
        page: 1,
      };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.MATERIALS}?${queryParam}`);
    },
    [history, params],
  );
  const onPageChange = useCallback(
    (page, size) => {
      let newPrams = {
        ...params,
        info: params.info?.trim(),
        description: params.description?.trim(),
        page: page,
        limit: size,
      } as MaterialQuery;

      let queryParam = generateQuery(params);

      setPrams({ ...newPrams });
      history.replace(`${UrlConfig.MATERIALS}?${queryParam}`);
    },
    [history, params],
  );
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          onUpdate();
          break;
        case 2:
          if (selected.length === 0) {
            showWarning("Vui lòng chọn chất liệu cần xóa");
            return;
          }
          setConfirmDelete(true);
          break;
      }
    },
    [selected, onUpdate],
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

  const onUpdateStatus = useCallback(
    (material: MaterialResponse | false) => {
      if (!!material) {
        showSuccess("Cập nhật trạng thái thành công.");
        setPrams({ ...params });
      }
    },
    [params],
  );

  return (
    <ContentContainer
      title="Quản lý chất liệu"
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Thuộc tính",
        },
        {
          name: "Danh sách chất liệu",
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[ProductPermission.materials_create]}>
          <ButtonCreate child="Thêm chất liệu" path={`${UrlConfig.MATERIALS}/create`} />
        </AuthWrapper>
      }
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
            <Form onFinish={onFinish} initialValues={params} layout="inline">
              <Item name="info" className="input-search">
                <Input prefix={<img src={search} alt="" />} placeholder="Tên / Mã chất liệu" />
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
          bordered
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
          scroll={{ x: 1360 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          rowKey={(item: MaterialResponse) => item.id}
        />
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            setConfirmDelete(false);
            onDelete();
          }}
          title="Bạn chắc chắn xóa chất liệu?"
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={isConfirmDelete}
        />
      </Card>
    </ContentContainer>
  );
};

export default ListMaterial;
