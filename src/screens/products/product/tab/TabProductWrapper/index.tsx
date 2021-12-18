import {Image} from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {MenuAction} from "component/table/ActionButton";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import {ProductPermission} from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import {AccountGetListAction} from "domain/actions/account/account.action";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {getCategoryRequestAction} from "domain/actions/product/category.action";
import {materialSearchAll} from "domain/actions/product/material.action";
import {
  productWrapperDeleteAction,
  productWrapperUpdateAction,
  searchProductWrapperRequestAction,
} from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import {AccountResponse, AccountSearchQuery} from "model/account/account.model";
import {PageResponse} from "model/base/base-metadata.response";
import {CategoryResponse, CategoryView} from "model/product/category.model";
import {MaterialResponse} from "model/product/material.model";
import {
  ProductResponse,
  ProductWrapperResponse,
  ProductWrapperSearchQuery,
  ProductWrapperUpdateRequest,
  VariantResponse,
} from "model/product/product.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import ProductWrapperFilter from "screens/products/product/filter/ProductWrapperFilter";
import {convertCategory} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {showSuccess, showWarning} from "utils/ToastUtils";
import ImageProduct from "../../component/image-product.component";
const ACTIONS_INDEX = {
  EXPORT_EXCEL: 1,
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const actionsDefault: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.EXPORT_EXCEL,
    name: "Xuất thông in excel",
  },
  {
    id: ACTIONS_INDEX.ACTIVE,
    name: "Đang hoạt động",
  },
  {
    id: ACTIONS_INDEX.INACTIVE,
    name: "Ngừng hoạt động",
  },
  {
    id: ACTIONS_INDEX.DELETE,
    name: "Xóa sản phẩm",
  },
];

const initAccountQuery: AccountSearchQuery = {
  department_ids: [4],
};

var idDelete = -1;

const TabProductWrapper: React.FC = () => {
  const dispatch = useDispatch();

  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const [listMerchandiser, setMerchandiser] = useState<Array<AccountResponse>>();
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);

  const [selected, setSelected] = useState<Array<ProductResponse>>([]);
  const [rowKey, setRowKey] = useState<Array<any>>([]);

  const [data, setData] = useState<PageResponse<ProductResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [params, setParams] = useState<ProductWrapperSearchQuery>(
    {} as ProductWrapperSearchQuery
  );

  const [columns, setColumn] = useState<Array<ICustomTableColumType<ProductResponse>>>([
    {
      title: "Ảnh",
      fixed: "left",
      align: "left",
      width: 70,
      render: (value: ProductResponse) => {
        let url = null;
        value.variants.forEach((item) => {
          item.variant_images.forEach((item1) => {
            if (item1.product_avatar) {
              url = item1.url;
            }
          });
        });
        return (
          <>
            {url ? <Image placeholder="Xem" src={url ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={url} />}
          </>
        );
      },
      visible: true,
    },
    {
      width: 300,
      title: "Sản phẩm",
      dataIndex: "code",
      fixed: "left",
      render: (value: string, i: ProductWrapperResponse) => {
        return (
          <>
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${i.id}`}>{value}</Link>
            </div>
            <div> {i.name}</div>
          </>
        );
      },
      visible: true,
    },
    {
      align: "right",
      title: "SL Phiên bản",
      dataIndex: "variants",
      render: (value: Array<VariantResponse>) => (
        <>
          <div>{value ? value.length : ""}</div>
        </>
      ),
      visible: true,
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      align: "right",
      visible: true,
    },
    {
      align: "right",
      title: "Có thể bán",
      dataIndex: "available",
      visible: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      render: (value: string, row: ProductWrapperResponse) => (
        <div className={row.status === "active" ? "text-success" : "text-error"}>
          {value === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </div>
      ),
      visible: true,
    },
    {
      title: "Ngày khởi tạo",
      align: "left",
      dataIndex: "created_date",
      render: (value) => ConvertUtcToLocalDate(value, "DD/MM/YYYY HH:mm"),
      width: 120,
      visible: true,
    },
    {
      title: "Nhà thiết kế",
      dataIndex: "designer",
      visible: false,
    },
    {
      title: "Merchandiser",
      dataIndex: "merchandiser",
      visible: false,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      visible: false,
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods",
      visible: false,
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      visible: false,
    },
  ]);

  const [canDeleteParentProduct] = useAuthorization({
    acceptPermissions: [ProductPermission.delete],
  });
  const [canUpdateParentProduct] = useAuthorization({
    acceptPermissions: [ProductPermission.update],
  });

  const actions = actionsDefault.filter((item) => {
    if (item.id === ACTIONS_INDEX.DELETE) {
      return canDeleteParentProduct;
    }
    if (item.id === ACTIONS_INDEX.ACTIVE || item.id === ACTIONS_INDEX.INACTIVE) {
      return canUpdateParentProduct;
    }
    if (item.id === ACTIONS_INDEX.EXPORT_EXCEL) {
      return true;
    }
    return false;
  });

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const setSearchResult = useCallback((result: PageResponse<ProductResponse> | false) => {
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      let newParams = {...params, page, limit: size};
      setParams(newParams);
    },
    [params]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onFilter = useCallback(
    (values) => {
      let {info} = values;
      values.info = info.trim();
      let newParams = {...params, ...values, page: 1};
      setParams(newParams);
    },
    [params]
  );

  const onDeleteSuccess = useCallback(() => {
    setSelected([]);
    dispatch(hideLoading());
    showSuccess("Xóa sản phẩm thành công");
    dispatch(searchProductWrapperRequestAction(params, setSearchResult));
  }, [dispatch, setSearchResult, params]);

  const onUpdateSuccess = useCallback(
    (result: ProductWrapperUpdateRequest) => {
      if (result) {
        setSelected([]);
        setRowKey([]);
        dispatch(searchProductWrapperRequestAction(params, setSearchResult));
        showSuccess("Cập nhật dữ liệu thành công");
      } else {
        showWarning("Cập nhật dữ liệu thất bại");
      }
    },
    [dispatch, params, setSearchResult]
  );

  const onActive = useCallback(
    (selected: ProductWrapperResponse) => {
      const request = {
        ...selected,
        status: "active",
      };

      dispatch(productWrapperUpdateAction(selected.id, request, onUpdateSuccess));
    },
    [dispatch, onUpdateSuccess]
  );

  const onInactive = useCallback(
    (selected: ProductResponse) => {
      const request = {
        ...selected,
        status: "inactive",
      };

      dispatch(productWrapperUpdateAction(selected.id, request, onUpdateSuccess));
    },
    [dispatch, onUpdateSuccess]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      if (selected.length > 0) {
        let id = selected[0].id;
        switch (index) {
          case ACTIONS_INDEX.ACTIVE:
            onActive(selected[0]);
            break;

          case ACTIONS_INDEX.INACTIVE:
            onInactive(selected[0]);
            break;
          case ACTIONS_INDEX.DELETE:
            idDelete = id;
            setConfirmDelete(true);
            break;
          case 3:
            break;
        }
      }
    },
    [onActive, onInactive, selected]
  );

  const onSelect = useCallback((selectedRow: Array<ProductResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setDataCategory));
    dispatch(AccountGetListAction(initAccountQuery, setMerchandiser));
    dispatch(materialSearchAll(setListMaterial));
    setTableLoading(true);
  }, [dispatch, setDataCategory]);

  useEffect(() => {
    dispatch(searchProductWrapperRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <div>
      <ProductWrapperFilter
        onClickOpen={() => setShowSettingColumn(true)}
        onMenuClick={onMenuClick}
        actions={actions}
        onFilter={onFilter}
        params={params}
        listMerchandisers={listMerchandiser}
        listMaterial={listMaterial}
        listCategory={listCategory}
        goods={goods}
        initValue={{} as ProductWrapperSearchQuery}
      />
      <CustomTable
        selectedRowKey={rowKey}
        onChangeRowKey={(rowKey) => setRowKey(rowKey)}
        isRowSelection
        isLoading={tableLoading}
        onSelectedChange={onSelect}
        scroll={{x: 1500}}
        sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE}}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: ProductResponse) => item.id}
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
          dispatch(showLoading());
          dispatch(productWrapperDeleteAction(idDelete, onDeleteSuccess));
        }}
        title="Bạn chắc chắn xóa sản phẩm này?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </div>
  );
};

export default TabProductWrapper;
