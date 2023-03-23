import { Button, Card, Form, Input, Image, Select, Menu, Dropdown } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { showSuccess, showWarning } from "utils/ToastUtils";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { ColorResponse, ColorSearchQuery } from "model/product/color.model";
import imgDefault from "assets/icon/img-default.svg";
import {
  colorDeleteAction,
  colorDeleteManyAction,
  getColorAction,
} from "domain/actions/product/color.action";
import { isUndefinedOrNull } from "utils/AppUtils";
import CustomFilter from "component/table/custom.filter";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import ButtonCreate from "component/header/ButtonCreate";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const actionsDefault: Array<MenuAction> = [
  {
    id: 0,
    name: "Xóa",
    icon: <DeleteOutlined />,
  },
];

const { Option } = Select;
const ColorListScreen: React.FC = () => {
  const [selected, setSelected] = useState<Array<ColorResponse>>([]);
  const [data, setData] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [listMainColor, setListMainColor] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);
  let [params, setPrams] = useState<ColorSearchQuery>(getQueryParams(query));

  const [allowDeleteColors] = useAuthorization({
    acceptPermissions: [ProductPermission.colors_delete],
    not: false,
  });

  const RenderActionColumn = (value: any, row: ColorResponse) => {
    // check if current user has right to update/delete colors:
    const [allowUpdateColors] = useAuthorization({
      acceptPermissions: [ProductPermission.colors_update],
      not: false,
    });

    const [allowDeleteColors] = useAuthorization({
      acceptPermissions: [ProductPermission.colors_delete],
      not: false,
    });

    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {allowUpdateColors && (
          <Menu.Item key="1">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                history.push(`${UrlConfig.COLORS}/${row.id}`);
              }}
            >
              Chỉnh sửa
            </Button>
          </Menu.Item>
        )}

        {allowDeleteColors && (
          <Menu.Item key="2">
            <Button
              style={{ color: "red" }}
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelected([...selected, row]);
                setIsConfirmDelete(true);
              }}
            >
              Xóa
            </Button>
          </Menu.Item>
        )}
      </Menu>
    );

    return (
      <>
        {(allowUpdateColors || allowDeleteColors) && (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button type="text" size="small" icon={<EllipsisOutlined />}></Button>
          </Dropdown>
        )}
      </>
    );
  };

  const [columns, setColumns] = useState<Array<ICustomTableColumType<ColorResponse>>>([
    {
      title: "Mã màu",
      dataIndex: "code",
      render: (value: string, item: ColorResponse) => {
        return <Link to={`colors/${item.id}`}>{value}</Link>;
      },
      visible: true,
      width: 90,
    },
    {
      title: "Tên màu",
      dataIndex: "name",
      visible: true,
      width: 200,
    },
    {
      title: "Số sản phẩm",
      dataIndex: "total_variant",
      visible: true,
      width: 120,
      align: "center",
      render: (value: number, item: ColorResponse) => {
        return (
          value && (
            <Link target="_blank" to={`${UrlConfig.VARIANTS}?colors=${item.id}`}>
              {value}
            </Link>
          )
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      visible: true,
      align: "center",
      width: 150,
      render: (value: string) => (
        <div className={value === "active" ? "text-success" : "text-error"}>
          {value === "active" ? "Hoạt động" : "Ngừng hoạt động"}
        </div>
      ),
    },
    {
      title: "Màu chủ đạo",
      dataIndex: "parent",
      visible: true,
      width: 150,
    },
    {
      title: "Mã hex",
      dataIndex: "hex_code",
      render: (value: string) => (value !== null ? `#${value}` : ""),
      visible: true,
      width: 120,
    },
    {
      title: "Ảnh màu",
      dataIndex: "image",
      className: "image-product",
      render: (value: string) => {
        return !isUndefinedOrNull(value) && value !== "" ? (
          <Image
            width={40}
            height={40}
            src={value}
            className=""
            style={{ fontSize: 10, textAlign: "center" }}
            alt="preview"
            placeholder={<img alt="preview" src={imgDefault} />}
          />
        ) : (
          ""
        );
      },
      visible: true,
      width: 120,
    },
    {
      title: "Người tạo",
      visible: true,
      render: (item: ColorResponse) => {
        return item.created_name ? (
          <div>
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>
              {item.created_name}
            </Link>
          </div>
        ) : (
          "---"
        );
      },
      width: 200,
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      visible: false,
      width: 120,
    },
    {
      title: "",
      dataIndex: "description",
      visible: true,
      width: "5%",
      fixed: "right",
      render: (value, record) => RenderActionColumn(value, record),
    },
  ]);

  const columnsFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === 0) {
        return allowDeleteColors && !!selected.length;
      }
      return true;
    });
  }, [allowDeleteColors, selected]);

  const searchColorCallback = useCallback((listResult: PageResponse<ColorResponse>) => {
    setIsTableLoading(false);
    setData(listResult);
  }, []);

  const onDeleteSuccess = useCallback(() => {
    setSelected([]);
    showSuccess("Xóa màu sắc thành công");
    setIsTableLoading(true);
    dispatch(getColorAction({ ...params, is_main_color: 0 }, searchColorCallback));
  }, [dispatch, params, searchColorCallback]);

  const deleteColor = useCallback(() => {
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(colorDeleteAction(id, onDeleteSuccess));
      return;
    }

    dispatch(
      colorDeleteManyAction(
        selected.map((color) => color.id),
        onDeleteSuccess,
      ),
    );
  }, [dispatch, onDeleteSuccess, selected]);

  const changeSelectedRecord = useCallback((selectedRow: Array<ColorResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const searchColor = useCallback(
    (values: ColorSearchQuery) => {
      let newPrams = {
        ...params,
        ...values,
        info: values.info?.trim(),
        hex_code: values.hex_code?.trim(),
        page: 1,
      };

      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.COLORS}?${queryParam}`);
    },
    [history, params],
  );

  const changePage = (page: number, size?: number) => {
    const newPrams = {
      ...params,
      info: params.info?.trim(),
      hex_code: params.hex_code?.trim(),
      page: page,
      limit: size,
    };

    const queryParam = generateQuery(params);
    setPrams({ ...newPrams });
    history.replace(`${UrlConfig.COLORS}?${queryParam}`);
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 0:
          if (selected.length === 0) {
            showWarning("Vui lòng chọn màu sắc cần xóa");
            return;
          }
          setIsConfirmDelete(true);
          break;
      }
    },
    [selected],
  );

  useEffect(() => {
    dispatch(getColorAction({ ...params, is_main_color: 0 }, searchColorCallback));
    setIsTableLoading(true);
    dispatch(getColorAction({ is_main_color: 1 }, setListMainColor));
    return () => {};
  }, [dispatch, params, searchColorCallback]);

  return (
    <ContentContainer
      title="Quản lý màu sắc"
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Thuộc tính",
        },
        {
          name: "Màu sắc",
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[ProductPermission.colors_create]}>
          <ButtonCreate child="Thêm màu sắc" path={`${UrlConfig.COLORS}/create`} />
        </AuthWrapper>
      }
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={actions} onMenuClick={onMenuClick}>
            <Form
              className="form-search"
              size="middle"
              onFinish={searchColor}
              initialValues={params}
              layout="inline"
            >
              <Form.Item name="info" className="input-search">
                <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã màu sắc" />
              </Form.Item>
              <Form.Item name="parent_id">
                <Select placeholder="Chọn màu chủ đạo" style={{ width: 200 }}>
                  <Option value="">Chọn màu chủ đạo</Option>
                  {listMainColor.items.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="hex_code">
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ width: 200 }}
                  placeholder="Mã hex"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
            </Form>
          </CustomFilter>
        </div>
        <CustomTable
          isRowSelection
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: changePage,
            onShowSizeChange: changePage,
          }}
          isShowPaginationAtHeader
          sticky={{ offsetScroll: 10, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          isLoading={isTableLoading}
          scroll={{ x: "max-content" }}
          dataSource={data.items}
          showColumnSetting={true}
          onShowColumnSetting={() => setIsShowSettingColumn(true)}
          columns={columnsFinal}
          onSelectedChange={changeSelectedRecord}
          rowKey={(item: ColorResponse) => item.id}
        />
        <ModalSettingColumn
          visible={isShowSettingColumn}
          onCancel={() => setIsShowSettingColumn(false)}
          onOk={(data) => {
            setIsShowSettingColumn(false);
            setColumns(data);
          }}
          data={columns}
        />
        <ModalDeleteConfirm
          onCancel={() => setIsConfirmDelete(false)}
          onOk={() => {
            setIsConfirmDelete(false);
            deleteColor();
          }}
          title="Bạn chắc chắn xóa màu sắc ?"
          subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
          visible={isConfirmDelete}
        />
      </Card>
    </ContentContainer>
  );
};

export default ColorListScreen;
