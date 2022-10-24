import { Button, Card, Dropdown, Form, Input, Menu, Space, Tag } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { MaterialQuery, MaterialResponse } from "model/product/material.model";
import { getQueryParams, useQuery } from "utils/useQuery";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  getMaterialAction,
  updateMaterialOtherAction,
} from "domain/actions/product/material.action";
import { PageResponse } from "model/base/base-metadata.response";
import { showSuccess } from "utils/ToastUtils";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";
import EditNote from "../../order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { SupplierResponse } from "../../../model/core/supplier.model";
import TextShowMore from "component/container/show-more/text-show-more";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table";
import currency from "currency.js";

const { Item } = Form;
const ListMaterial: React.FC = () => {
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

  const onGetSuccess = useCallback((data: PageResponse<MaterialResponse> | false) => {
    setLoading(false);
    if (!!data) {
      setData(data);
    }
  }, []);

  // check if current user has right to update/delete material:
  const [canUpdateMaterial] = useAuthorization({
    acceptPermissions: [ProductPermission.materials_update],
    not: false,
  });

  const RenderActionColumn = (value: any, row: MaterialResponse, idx: number) => {
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {canUpdateMaterial && (
          <Menu.Item key="1">
            <Button
              icon={<EditOutlined />}
              type="text"
              onClick={() => {
                history.push(`${UrlConfig.MATERIALS}/${row.id}/update`);
              }}
            >
              Chỉnh sửa
            </Button>
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <Button type="text" size="small" icon={<EllipsisOutlined />}></Button>
      </Dropdown>
    );
  };

  const columns: ColumnsType<any> = [
    {
      title: "ID chất liệu",
      width: 140,
      dataIndex: "code",
      key: "code",
      render: (value: string, item: MaterialResponse) => {
        return (
          <div>
            <Link
              style={{ fontSize: 16, fontWeight: "bold" }}
              to={`${UrlConfig.MATERIALS}/${item.id}`}
            >
              {value}
            </Link>
            <div>{ConvertUtcToLocalDate(item.created_date, DATE_FORMAT.DDMMYYY)}</div>
          </div>
        );
      },
    },
    {
      title: <div>Chất liệu</div>,
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (value: string, item: MaterialResponse) => {
        return (
          <div>
            <div>
              Tên: <span className="font-weight-500">{value}</span>
            </div>
            <div>
              Mã: <span className="font-weight-500">{item.fabric_code}</span>
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
      width: 150,
      render: (value: string, item: MaterialResponse) => {
        const marterial = marterialStatusList?.find((e: any) => e.value === value);
        let statusName = "";
        if (marterial) statusName = marterial.name;
        return (
          <Tag className="material-status" color={value === "active" ? "green" : "red"}>
            {statusName}
          </Tag>
        );
      },
    },
    {
      title: "Thông tin vải",
      dataIndex: "fabric_size",
      key: "fabric_size",
      width: 200,
      render: (value: string, item: MaterialResponse) => {
        return (
          <div>
            <div>
              Khổ vải:{" "}
              <span className="font-weight-500">
                {value ? `${value} ${item.fabric_size_unit}` : ""}
              </span>
            </div>
            <div>
              Trọng lượng:{" "}
              <span className="font-weight-500">
                {item.weight ? `${item.weight} ${item.weight_unit}` : ""}
              </span>
            </div>
            <div>
              Giá:{" "}
              <span className="font-weight-500">
                {item.price
                  ? `${currency(item.price).format({ symbol: "", separator: "," })} ${
                      item.price_unit
                    }/${item.price_measure_unit}`
                  : ""}
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
    {
      title: "",
      width: 50,
      fixed: "right",
      dataIndex: "action",
      render: (value: string, item: MaterialResponse, idx: number) =>
        RenderActionColumn(value, item, idx),
    },
  ];

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
          <div className="page-filter">
            <div className="page-filter-heading">
              {/* <div className="page-filter-left"></div> */}
              <div className="page-filter-right">
                <Space size={12}>
                  <Form onFinish={onFinish} initialValues={params} layout="inline">
                    <Item name="info" className="input-search">
                      <Input
                        prefix={<img src={search} alt="" />}
                        placeholder="Tên / Mã chất liệu"
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
                </Space>
              </div>
            </div>
          </div>
        </div>
        <CustomTable
          bordered
          isLoading={loading}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isShowPaginationAtHeader
          dataSource={data.items}
          columns={columns}
          scroll={{ x: 1360 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          rowKey={(item: MaterialResponse) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default ListMaterial;
