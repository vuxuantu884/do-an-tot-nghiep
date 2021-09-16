import ProductWrapperFilter from "component/filter/ProductWrapperFilter";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import UrlConfig from "config/url.config";
import { AccountGetListAction } from "domain/actions/account/account.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { categoryDeleteAction, getCategoryRequestAction } from "domain/actions/product/category.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { productWrapperDeleteAction, productWrapperUpdateAction, searchProductWrapperRequestAction } from "domain/actions/product/products.action";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { MaterialResponse } from "model/product/material.model";
import { ProductWrapperResponse, ProductWrapperSearchQuery, ProductWrapperUpdateRequest } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { convertCategory, generateQuery } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

const ACTIONS_INDEX = {
  EXPORT_EXCEL: 1,
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
}

const actions: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.EXPORT_EXCEL,
    name: "Xuất thông in excel",
  },
  {
    id: ACTIONS_INDEX.PRINT_BAR_CODE,
    name: "In mã vạch",
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

const initQuery: ProductWrapperSearchQuery = {
  info: "",
  category_id: "",
  designer_code: "",
  material_id: "",
  merchandiser_code: "",
  status: "",
  goods: "",
  from_create_date: "",
  to_create_date: "",
};
var idDelete = -1;

const TabProductWrapper: React.FC = () => {

  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const isFirstLoad = useRef(true);

  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);

  const [listMerchandiser, setMarchandiser] = useState<Array<AccountResponse>>();
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  
  const [selected, setSelected] = useState<Array<ProductWrapperResponse>>([]);

  const [data, setData] = useState<PageResponse<ProductWrapperResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  let dataQuery: ProductWrapperSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<ProductWrapperSearchQuery>(dataQuery);

  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<ProductWrapperResponse>>
  >([
    {
      title: "Ảnh",
      render: (value: ProductWrapperResponse) => {
        // let image = Products.findAvatar(value.variant_images);
        return (
          // <ImageProduct
          //   path={image !== null ? image.url : null}
          //   onClick={() => {
          //     setVariant({
          //       name: value.name,
          //       sku: value.sku,
          //       variant_images: value.variant_images,
          //     });
          //     ProductWrapperResponse = value;
          //     setUploadVisible(true);
          //   }}
          // />
          <div>ảnh</div>
        );
      },
      visible: true,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "code",
      render: (value: string, i: ProductWrapperResponse) => {
        return(
        <>
          <div><Link to={`${UrlConfig.PRODUCT}/${i.id}`}>{value}</Link></div>
          <div> {i.name}</div>
        </>
      )},
      visible: true,
    },
    {
      title: "Tồn trong kho",
      // dataIndex: "color",
      render: () => (
        <>
          <div> đợi api </div>
        </>
      ),
      visible: true,
    },
    {
      title: "Có thể bán",
      // dataIndex: "color",
      render: () => (
        <>
          <div> đợi api </div>
        </>
      ),
      visible: true,
    },
    {
      title: "SL Phiên bản",
      render: (value: ProductWrapperResponse) => (
        <>
          <div>{value ? value.variants.length : ''}</div>
        </>
      ),
      visible: true,
    },
    {
      title: "Nhà thiết kế",
      render: (value: ProductWrapperResponse) => <div> {value.designer}</div>,
      visible: true,
    },
    {
      title: "Merchandiser",
      render: (value: ProductWrapperResponse) => (
          <div> {value.merchandiser}</div>
      ),
      visible: true,
    },
    {
      title: "Danh mục",
      render: (value: ProductWrapperResponse) => (
          <div> {value.category}</div>
      ),
      visible: false,
    },
    {
      title: "Ngành hàng",
      render: (value: ProductWrapperResponse) => (
          <div> {value.goods}</div>
      ),
      visible: false,
    },
    {
      title: "Chất liệu",
      render: (value: ProductWrapperResponse) => (
          <div> {value.material}</div>
      ),
      visible: false,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value: string, row: ProductWrapperResponse) => (
        <div
          className={row.status === "active" ? "text-success" : "text-error"}
        >
          {value === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </div>
      ),
      visible: true,
    },
    {
      title: "Ngày khởi tạo",
      align: "center",
      dataIndex: "created_date",
      render: (value) => ConvertUtcToLocalDate(value, 'DD/MM/YYYY HH:mm'),
      visible: true,
    },
  ]);

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const setSearchResult = useCallback(
    (result: PageResponse<ProductWrapperResponse> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;

      let queryParam = generateQuery(params);
      setParams({ ...params });
      history.replace(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onFilter = useCallback(
    (values) => {
      let newParams = { ...params, ...values, page: 1 };
      setParams(newParams);
      let queryParam = generateQuery(newParams);
      history.push(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );

  const onDeleteSuccess = useCallback(() => {
    setSelected([]);
    dispatch(hideLoading());
    showSuccess("Xóa danh mục thành công");
    dispatch(searchProductWrapperRequestAction(params, setSearchResult));
  }, [dispatch, setSearchResult, params]);

  const onActive = (selected: ProductWrapperResponse) => {
    const request = {
      ...selected,
      status: 'active',
    };
    
    dispatch(productWrapperUpdateAction(selected.id, request , onUpdateSuccess));
  }

  const onInactive = (selected: ProductWrapperResponse) => {
    const request = {
      ...selected,
      status: 'inactive',
    };
    
    dispatch(productWrapperUpdateAction(selected.id, request , onUpdateSuccess));
  }

  const onUpdateSuccess = (result: ProductWrapperUpdateRequest) => {
    if (result) {
      dispatch(searchProductWrapperRequestAction(params, setSearchResult));
      showSuccess("Cập nhật dữ liệu thành công");
    } else {
      showWarning("Cập nhật dữ liệu thất bại");
    }
  }

  const onMenuClick = useCallback((index: number) => {
    
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
  }, [selected]);

  const onSelect = useCallback((selectedRow: Array<ProductWrapperResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    )
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(AccountGetListAction(initAccountQuery, setMarchandiser));
      dispatch(materialSearchAll(setListMaterial));
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    dispatch(searchProductWrapperRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult, setDataCategory]);

  return (
    <div className="padding-20">
    <ProductWrapperFilter
      onMenuClick={onMenuClick}
      actions={actions}
      onFilter={onFilter}
      params={params}
      listMerchandisers={listMerchandiser}
      listMaterial={listMaterial}
      listCategory={listCategory}
      goods={goods}
      initValue={initQuery}
    />
    <CustomTable
      isRowSelection
      isLoading={tableLoading}
      showColumnSetting={true}
      onSelectedChange={onSelect}
      scroll={{ x: 1080 }}
      pagination={{
        pageSize: data.metadata.limit,
        total: data.metadata.total,
        current: data.metadata.page,
        showSizeChanger: true,
        onChange: onPageChange,
        onShowSizeChange: onPageChange,
      }}
      onShowColumnSetting={() => setShowSettingColumn(true)}
      dataSource={data.items}
      columns={columnFinal}
      rowKey={(item: ProductWrapperResponse) => item.id}
    />
    <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data)
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
        title="Bạn chắc chắn xóa danh mục ?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </div>
  );
}

export default TabProductWrapper;