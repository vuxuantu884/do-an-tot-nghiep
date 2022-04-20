import { Button, Card, Form, Input, Select } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  categoryDeleteAction,
  getCategoryRequestAction,
} from "domain/actions/product/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getQueryParams, useQuery } from "utils/useQuery";
import search from "assets/img/search.svg";
import { CategoryParent, CategoryView } from "model/product/category.model";
import { MenuAction } from "component/table/ActionButton";
import { CategoryResponse, CategoryQuery } from "model/product/category.model";
import { convertCategory, generateQuery } from "utils/AppUtils";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import { DeleteOutlined, EditOutlined, ExportOutlined } from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import AuthWrapper from "component/authorization/AuthWrapper";
import { ProductPermission } from "config/permissions/product.permission";
import useAuthorization from "hook/useAuthorization";
import "assets/css/custom-filter.scss";
import CustomSelect from "component/custom/select.custom";

const actions: Array<MenuAction> = [
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

var idDelete = -1;
const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CategoryQuery = getQueryParams(query);
  if (!getParams.goods) {
    getParams.goods = undefined;
  }
  const [params, setPrams] = useState<CategoryQuery>(getParams);
  const [data, setData] = useState<Array<CategoryView>>([]);
  const [selected, setSelected] = useState<Array<CategoryView>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "code",
      render: (text: string, item: CategoryView) => {
        return <Link to={`${UrlConfig.CATEGORIES}/${item.id}`}>{text}</Link>;
      },
    }, 
    {
      title: "Danh mục",
      dataIndex: "name",
      render: (value: string, item: CategoryView) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {item.level > 0 && (
            <div
              style={{
                borderRadius: 2,
                width: 20 * item.level,
                height: 3,
                background: "rgba(42, 42, 134, 0.2)",
                marginRight: 8,
              }}
            />
          )}
          <span>{value}</span>
        </div>
      ),
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods_name",
    },
    {
      title: "Thuộc danh mục",
      dataIndex: "parent",
      render: (item: CategoryParent) => (item != null ? item.name : ""),
    },
    {
      title: "Người tạo",
      render: (item: CategoryView) => {
       return item.created_name ?
            <div>
              <Link target="_blank"  to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>{item.created_name}</Link>
            </div> :"---"
      },
    },
  ];
  const onFinish = useCallback(
    (values: CategoryQuery) => {
      let query = generateQuery(values);
      
      const newValues = {...values, query: values.query?.trim()};
      setPrams({ ...newValues });
      return history.replace(`${UrlConfig.CATEGORIES}?${query}`);
    },
    [history]
  );
  const onGetSuccess = useCallback((results: Array<CategoryResponse>) => {
    let newData: Array<CategoryView> = convertCategory(results);
    setData(newData);
    setLoading(false);
  }, []);
  const onDeleteSuccess = useCallback(() => {
    setSelected([]);
    dispatch(hideLoading());
    showSuccess("Xóa danh mục thành công");
    dispatch(getCategoryRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  const onMenuClick = useCallback(
    (index: number) => {
      if (selected.length > 0) {
        console.log("selected", selected);
        let id = selected[0].id;
        switch (index) {
          case 1:
            history.push(`${UrlConfig.CATEGORIES}/${id}`);
            break;
          case 2:
            idDelete = id;
            setConfirmDelete(true);
            break;
          case 3:
            break;
        }
      } else {
        if (index !== 3) {
          showWarning("Vui lòng chọn ít nhất 1 danh mục để thao tác");
        }
      }
    },
    [selected, history]
  );

  const [canDeleteVariants] = useAuthorization({
    acceptPermissions: [ProductPermission.delete_variant],
  });
  const [canUpdateCategories] = useAuthorization({
    acceptPermissions: [ProductPermission.categories_update],
  });
  
  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (item.id === 1) {
        return selected.length === 1 && canUpdateCategories;
      }
      if (item.id === 2) {
        return canDeleteVariants;
      }
      return true;
    });
  }, [selected, canDeleteVariants, canUpdateCategories]);

  const onSelect = useCallback((selectedRow: Array<CategoryView>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getCategoryRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  return (
    <ContentContainer
      title="Quản lý danh mục"
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
          name: "Danh mục",
          path: `${UrlConfig.CATEGORIES}`,
        },
      ]}
      extra={
        <AuthWrapper acceptPermissions={[ProductPermission.categories_create]}>
          <ButtonCreate child="Thêm danh mục" path={`${UrlConfig.CATEGORIES}/create`} />
        </AuthWrapper>
      }
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
            <Form onFinish={onFinish} layout="inline" initialValues={params}>
              <Item name="query" className="input-search">
                <Input
                  prefix={<img src={search} alt="" />}
                  placeholder="Tên/Mã danh mục"
                />
              </Item>
              <Item name="goods">
                <CustomSelect
                  allowClear
                  placeholder="Chọn ngành hàng"
                  style={{
                    width: 200,
                  }}
                >
                  {goods.map((item, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item.name}
                    </Select.Option>
                  ))}
                </CustomSelect>
              </Item>
              <Item>
                <Button htmlType="submit" type="primary">
                  Lọc
                </Button>
              </Item> 
            </Form>
          </CustomFilter>
        </div> 
        <CustomTable
          isRowSelection
          isLoading={loading}
          onSelectedChange={onSelect}
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item: CategoryResponse) => item.id}
        />
      </Card>
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          dispatch(showLoading());
          dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
        }}
        title="Bạn chắc chắn xóa danh mục ?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </ContentContainer>
  );
};

export default Category;
