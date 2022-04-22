import { Button, Card, Form, Input, Image, Select } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from "assets/img/search.svg";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { showSuccess, showWarning } from "utils/ToastUtils";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
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
import { DeleteOutlined } from "@ant-design/icons";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";

const actionDefault: Array<MenuAction> = [
  {
    id: 0,
    name: "Xóa",
    icon:<DeleteOutlined />
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
  const [listMainColor, setListMainColor] = useState<
    PageResponse<ColorResponse>
  >({
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
  const [tableLoading, setTableLoading] = useState(false);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  let [params, setPrams] = useState<ColorSearchQuery>(getQueryParams(query));
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<ColorResponse>>
  >([
    {
      title: "Mã màu",
      dataIndex: "code",
      render: (value: string, item: ColorResponse) => {
        return <Link to={`colors/${item.id}`}>{value}</Link>;
      },
      visible: true,
    },
    {
      title: "Tên màu",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Màu chủ đạo",
      dataIndex: "parent",
      visible: true,
    },
    {
      title: "Mã hex",
      dataIndex: "hex_code",
      render: (value: string) => (value !== null ? `#${value}` : ""),
      visible: true,
    },
    {
      title: "Ảnh màu",
      dataIndex: "image",
      render: (value: string) => {
        return !isUndefinedOrNull(value) && value !== "" ? (
          <Image
            width={40}
            src={value}
            placeholder={<img alt="" src={imgDefault} />}
          />
        ) : (
          ""
        );
      },
      visible: true,
    },
    {
      title: "Người tạo",
      visible: true,
      render: (item: ColorResponse) => {
        return item.created_name ?
             <div>
               <Link target="_blank"  to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>{item.created_name}</Link>
             </div> :"---"
       },
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      visible: false,
    },
  ]);

  const [canDeleteColor] = useAuthorization({acceptPermissions: [ProductPermission.colors_delete]});

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );
  
  const actions = useMemo(() => {
    return actionDefault.filter((item) => {
      if (item.id === 0) {
        return canDeleteColor;
      } else {
        return true;
      }
    });
  }, [canDeleteColor]);

  const searchColorCallback = useCallback(
    (listResult: PageResponse<ColorResponse>) => {
      setTableLoading(false);
      setData(listResult);
    },
    []
  );
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    showSuccess("Xóa màu sắc thành công");
    setTableLoading(true);
    dispatch(
      getColorAction({ ...params, is_main_color: 0 }, searchColorCallback)
    );
  }, [dispatch, params, searchColorCallback, selected]);

  const onDelete = useCallback(() => {
    if (selected.length === 1) {
      let id = selected[0].id;
      dispatch(colorDeleteAction(id, onDeleteSuccess));
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));

    dispatch(colorDeleteManyAction(ids, onDeleteSuccess));
  }, [dispatch, onDeleteSuccess, selected]);

  const onSelect = useCallback((selectedRow: Array<ColorResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);
  const onFinish = useCallback(
    (values: ColorSearchQuery) => {
      let newPrams = { ...params, ...values,
         info: values.info?.trim(),
         hex_code: values.hex_code?.trim(),
         page: 1 };

      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.COLORS}?${queryParam}`);
    },
    [history, params]
  );
  const onPageChange = useCallback(
    (page, size) => {
      let newPrams = { ...params,
        info: params.info?.trim(),
        hex_code: params.hex_code?.trim(),
        page: page, 
        limit: size };
    
      let queryParam = generateQuery(params);
      setPrams({ ...newPrams });
      history.replace(`${UrlConfig.COLORS}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        if (selected.length === 0) {
          showWarning("Vui lòng chọn màu sắc cần xóa");
          return;
        }
        setConfirmDelete(true);
        break;
    }
  }, [selected]);

  useEffect(() => {
    dispatch(
      getColorAction({ ...params, is_main_color: 0 }, searchColorCallback)
    );
    setTableLoading(true);
    dispatch(getColorAction({ is_main_color: 1 }, setListMainColor));
    return () => {};
  }, [dispatch, params, searchColorCallback]);
  return (
    <ContentContainer
      title="Quản lý màu sắc"
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
              onFinish={onFinish}
              initialValues={params}
              layout="inline"
            >
              <Form.Item name="info" className="input-search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên/Mã màu sắc"
                />
              </Form.Item>
              <Form.Item name="parent_id">
                <Select placeholder="Chọn màu chủ đạo" style={{width: 200}}>
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
                  style={{width: 200}}
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
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isLoading={tableLoading}
          dataSource={data.items}
          showColumnSetting={true}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          columns={columnFinal}
          onSelectedChange={onSelect}
          rowKey={(item: ColorResponse) => item.id}
        />
        <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data);
          }}
          data={columns}
        />
        <ModalDeleteConfirm
          onCancel={() => setConfirmDelete(false)}
          onOk={() => {
            setConfirmDelete(false);
            // dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
            onDelete();
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
