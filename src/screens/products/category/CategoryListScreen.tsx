import { Button, Card, Form, Input, Select } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { categoryDeleteAction } from "domain/actions/product/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getQueryParams, useQuery } from "utils/useQuery";
import search from "assets/img/search.svg";
import { CategoryParent, CategoryView } from "model/product/category.model";
import { MenuAction } from "component/table/ActionButton";
import { CategoryResponse, CategoryQuery } from "model/product/category.model";
import { generateQuery } from "utils/AppUtils";
import {
  convertCategory,
  FINISH_PROCESS_PERCENT,
  START_PROCESS_PERCENT,
} from "screens/products/helper";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import {
  ApartmentOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExportOutlined,
} from "@ant-design/icons";
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
import { callApiNative } from "utils/ApiUtils";
import { getCategoryApi } from "service/product/category.service";
import "./index.scss";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import moment from "moment";
import { utils, writeFile } from "xlsx";
import { CategoryExportModal } from "./component";
import { OFFSET_HEADER_UNDER_NAVBAR, STATUS_IMPORT_EXPORT, TYPE_EXPORT } from "utils/Constants";

const actions: Array<MenuAction> = [
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
  {
    id: 3,
    name: "Xuất file",
    icon: <ExportOutlined />,
  },
];

const { Item } = Form;

const Category = () => {
  const [isExportCategory, setIsExportCategory] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(START_PROCESS_PERCENT);
  const [statusExport, setStatusExport] = useState<number>(0);
  const [idDelete, setIdDelete] = useState<number>(0);
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  const queryParams: CategoryQuery = getQueryParams(query);
  if (!queryParams.goods) {
    queryParams.goods = undefined;
  }
  const [params, setPrams] = useState<CategoryQuery>(queryParams);
  const [data, setData] = useState<Array<CategoryView>>([]);
  const [selected, setSelected] = useState<Array<CategoryView>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);
  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "code",
      width: "90",
      render: (text: string, item: CategoryView) => {
        return <Link to={`${UrlConfig.CATEGORIES}/${item.id}`}>{text}</Link>;
      },
    },
    {
      title: "Danh mục",
      dataIndex: "name",
      render: (text: string, item: CategoryView) => {
        return <Link to={`${UrlConfig.CATEGORIES}/${item.id}`}>{text}</Link>;
      },
    },
    {
      title: "Trực thuộc danh mục",
      dataIndex: "parent",
      width: "150",
      render: (item: CategoryParent) => (item != null ? item.name : ""),
    },
    {
      title: "Cấp",
      dataIndex: "level",
      width: "60",
      render: (value: string) => {
        return <span className="high-level">{value}</span>;
      },
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods_name",
      width: "120",
    },
    {
      title: "Người tạo",
      width: "120",
      render: (item: CategoryView) => {
        return item.created_name ? (
          <div>
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${item.created_by}`}>
              {item.updated_by} - {item.created_name}
            </Link>
          </div>
        ) : (
          "---"
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      visible: true,
      width: 110,
      render: (value: string, item: CategoryView) => {
        return item?.created_date !== null
          ? ConvertUtcToLocalDate(item?.created_date, DATE_FORMAT.DDMMYYY)
          : "---";
      },
    },
  ];

  const searchCategory = useCallback(
    (categoryQuery: CategoryQuery) => {
      const query = generateQuery(categoryQuery);

      const newValues = { ...categoryQuery, query: categoryQuery.query?.trim() };
      setPrams({ ...newValues });
      return history.replace(`${UrlConfig.CATEGORIES}?${query}`);
    },
    [history],
  );

  const onGetSuccess = useCallback((results: Array<CategoryResponse>) => {
    let newData: Array<CategoryView> = convertCategory(results);
    setData(newData);
  }, []);

  const onDeleteSuccess = useCallback(async () => {
    setSelected([]);
    showSuccess("Xóa danh mục thành công");
    dispatch(hideLoading());
    setIsLoading(true);
    const res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, params);
    setIsLoading(false);
    if (res) {
      onGetSuccess(res);
    }
  }, [dispatch, onGetSuccess, params]);

  const convertItemExport = (item: CategoryView) => {
    const level = "Cấp";
    return {
      "Mã danh mục": item.code,
      "Danh mục": item.name,
      "Trực thuộc danh mục": item.parent?.name,
      [level]: item.level,
      "Ngành hàng": item.goods_name,
      "Người tạo": item.created_name ? `${item.created_by} - ${item.created_name}` : null,
      "Ngày tạo": ConvertUtcToLocalDate(item.created_date, DATE_FORMAT.DDMMYY_HHmm),
    };
  };

  const onMenuClick = useCallback(
    (index: number) => {
      if (index === 3) {
        setIsExportCategory(true);
        return;
      }
      if (selected.length > 0) {
        let id = selected[0].id;

        switch (index) {
          case 1:
            history.push(`${UrlConfig.CATEGORIES}/${id}`);
            break;
          case 2:
            setIdDelete(id);
            setConfirmDelete(true);
            break;
        }
      } else {
        if (index !== 3) {
          showWarning("Vui lòng chọn ít nhất 1 danh mục để thao tác");
        }
      }
    },
    [selected, history],
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
  }, [selected.length, canUpdateCategories, canDeleteVariants]);

  const onSelect = useCallback((selectedRow: Array<CategoryView>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  const getData = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, params);
    if (res) {
      onGetSuccess(res);
    }
    setIsLoading(false);
  }, [dispatch, onGetSuccess, params]);

  useEffect(() => {
    setIsLoading(true);
    getData();
  }, [getData]);

  const getItemsByCondition = useCallback(
    async (type: string) => {
      let items: Array<CategoryView> = [];
      let res: any = [];

      setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
      switch (type) {
        case TYPE_EXPORT.page:
          items = [...data];
          break;
        case TYPE_EXPORT.selected:
          items = [...selected];
          break;
        case TYPE_EXPORT.allin:
          res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, {});

          if (!res) return;
          items = [...convertCategory(res)];
          setExportProgress(FINISH_PROCESS_PERCENT);
          break;
        case TYPE_EXPORT.all:
          res = await callApiNative({ isShowLoading: false }, dispatch, getCategoryApi, {
            ...params,
          });

          if (!res) return;
          items = [...convertCategory(res)];
          setExportProgress(FINISH_PROCESS_PERCENT);
          break;
        default:
          break;
      }
      setExportProgress(FINISH_PROCESS_PERCENT);
      return items;
    },
    [data, selected, dispatch, params],
  );

  const actionExport = {
    Ok: async (typeExport: string) => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      let dataExport: any = [];
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        setStatusExport(0);
        showWarning("Bạn chưa chọn danh mục nào để xuất file");
        setIsExportCategory(false);
        return;
      }
      const res = await getItemsByCondition(typeExport);
      if (!res || res.length === 0) {
        setStatusExport(0);
        showWarning("Không có phiếu chuyển nào đủ điều kiện");
        return;
      }

      const workbook = utils.book_new();
      for (let i = 0; i < res.length; i++) {
        const e = res[i];
        const item = convertItemExport(e);
        dataExport.push(item);
      }

      const worksheet = utils.json_to_sheet(dataExport);
      utils.book_append_sheet(workbook, worksheet, "data");

      setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
      const today = moment(new Date(), "YYYY/MM/DD");
      const month = today.format("M");
      const day = today.format("D");
      const year = today.format("YYYY");
      writeFile(workbook, `danh_muc_${day}_${month}_${year}.xlsx`);
      setIsExportCategory(false);
      setExportProgress(START_PROCESS_PERCENT);
      setStatusExport(0);
    },
    Cancel: () => {
      setIsExportCategory(false);
      setExportProgress(START_PROCESS_PERCENT);
      setStatusExport(STATUS_IMPORT_EXPORT.NONE);
    },
  };

  return (
    <ContentContainer
      title="Quản lý danh mục"
      breadcrumb={[
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "Phân loại",
          path: `${UrlConfig.CATEGORIES}`,
        },
        {
          name: "Danh mục",
          path: `${UrlConfig.CATEGORIES}`,
        },
      ]}
      extra={
        <>
          <Link to={`${UrlConfig.CATEGORIES}/overview`}>
            <Button className="btn-view" icon={<ApartmentOutlined className="btn-view-icon" />}>
              Xem sơ đồ danh mục
            </Button>
          </Link>
          <Button
            className="btn-view"
            size="large"
            icon={<DownloadOutlined className="btn-view-icon" />}
            onClick={() => {
              setIsExportCategory(true);
            }}
          >
            Xuất file danh sách
          </Button>
          <AuthWrapper acceptPermissions={[ProductPermission.categories_create]}>
            <ButtonCreate child="Thêm danh mục" path={`${UrlConfig.CATEGORIES}/create`} />
          </AuthWrapper>
        </>
      }
    >
      <Card>
        <div className="custom-filter">
          <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
            <Form onFinish={searchCategory} layout="inline" initialValues={params}>
              <Item name="query" className="input-search">
                <Input prefix={<img src={search} alt="" />} placeholder="Tên/Mã danh mục" />
              </Item>
              <Item name="goods">
                <CustomSelect
                  allowClear
                  placeholder="Chọn ngành hàng"
                  style={{
                    width: 200,
                  }}
                >
                  {goods?.map((item, index) => (
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
          isLoading={isLoading}
          sticky={{ offsetScroll: 10, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
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
      <CategoryExportModal
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        isVisible={isExportCategory}
        exportProgress={exportProgress}
        statusExport={statusExport}
      />
    </ContentContainer>
  );
};

export default Category;
