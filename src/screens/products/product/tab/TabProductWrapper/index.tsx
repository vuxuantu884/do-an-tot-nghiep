import {Image} from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {MenuAction} from "component/table/ActionButton";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import {ProductPermission} from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {getCategoryRequestAction} from "domain/actions/product/category.action";
import {
  productWrapperDeleteAction,
  productWrapperUpdateAction,
  searchProductWrapperRequestAction,
} from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import {PageResponse} from "model/base/base-metadata.response";
import {CategoryResponse, CategoryView} from "model/product/category.model";
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
import {Link, useHistory} from "react-router-dom";
import ProductWrapperFilter from "screens/products/product/filter/ProductWrapperFilter";
import {convertCategory, formatCurrency, generateQuery} from "utils/AppUtils";
import {OFFSET_HEADER_TABLE} from "utils/Constants";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {showInfo, showSuccess, showWarning} from "utils/ToastUtils";
import ImageProduct from "../../component/image-product.component";
import { StyledComponent } from "../style";
import { getQueryParams, useQuery } from "utils/useQuery";
import { CollectionCreateRequest } from "model/product/collection.model";

const ACTIONS_INDEX = {
  EXPORT_EXCEL: 1,
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const TabProductWrapper: React.FC = () => {
  const query = useQuery();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);

  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
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

  const actionsDefault: Array<MenuAction> = useMemo(()=>{
    const disabled = selected && selected.length > 0 ? false: true;
    return [
      {
        id: ACTIONS_INDEX.EXPORT_EXCEL,
        name: "Xuất thông tin excel",
      },
      {
        id: ACTIONS_INDEX.ACTIVE,
        name: "Đang hoạt động",
        disabled: disabled
      },
      {
        id: ACTIONS_INDEX.INACTIVE,
        name: "Ngừng hoạt động",
        disabled: disabled
      },
      {
        id: ACTIONS_INDEX.DELETE,
        name: "Xóa sản phẩm",
        disabled: disabled
      },
    ];
  },[selected]);

  let dataQuery: ProductWrapperSearchQuery = {
    ...getQueryParams(query),
  };

  const [params, setParams] = useState<ProductWrapperSearchQuery>(dataQuery);

  const [columns, setColumn] = useState<Array<ICustomTableColumType<ProductResponse>>>([
    {
      title: "Ảnh",
      align: "center",
      width: 70,
      render: (value: ProductResponse) => {
        let url = null;
        value.variants?.forEach((item) => {
          item.variant_images?.forEach((item1) => {
            if (item1.product_avatar) {
              url = item1.url;
            }
          });
        });
        return (
          <>
            {url ? <Image width={40} height={40} placeholder="Xem" src={url ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={url} />}
          </>
        );
      },
      visible: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "code",
      render: (value: string, i: ProductWrapperResponse) => {
        return (
          <>
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${i.id}`}>{value}</Link>
            </div>
            <div><TextEllipsis value={i.name} line={1} /></div>
          </>
        );
      },
      visible: true,
    },
    {
      align: "right",
      title: "SL Phiên bản",
      dataIndex: "variants",
      width: 110,
      render: (value: Array<VariantResponse>) => (
        <>
          <div>{value ? value.length : "0"}</div>
        </>
      ),
      visible: true,
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      align: "right",
      visible: true,
      width: 120,
      render: (value: number) => <div> {value!==null?formatCurrency(value,"."):"0"}</div>,
    },
    {
      align: "right",
      title: "Có thể bán",
      dataIndex: "available",
      visible: true,
      width: 100,
      render: (value: number) => <div> {value!==null?formatCurrency(value,"."):"0"}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      align: "center",
      width: 150,
      render: (value: string, row: ProductWrapperResponse) => (
        <div className={row.status === "active" ? "text-success" : "text-error"}>
          {value === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
        </div>
      ),
      visible: true,
    },
    {
      title: "Ngày tạo",
      align: "left",
      dataIndex: "created_date",
      render: (value) => value!==null?ConvertUtcToLocalDate(value, "DD/MM/YYYY"):"---",
      width: 110,
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
    dispatch(hideLoading());
    setTableLoading(false);
    if (!!result) {
      setData(result);
    }
  }, [dispatch]);

  const setSearchResultDelete = useCallback((result: PageResponse<ProductResponse> | false) => {
    dispatch(hideLoading());
    setTableLoading(false);
    showSuccess("Xóa sản phẩm thành công");
    if (!!result) {
      setData(result);
    }
  }, [dispatch]);

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

      values.info = info && info.trim();
      let newPrams = { ...params, ...{
          ...values,
          info: values.info || params.info
        }, page: 1 };
      setParams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(`${ProductTabUrl.PRODUCTS}?${queryParam}`);
    },
    [params, history]
  );

  const onDeleteSuccess = useCallback((res: any) => {
    if (res) {
      setSelected([]);
      dispatch(searchProductWrapperRequestAction(params, setSearchResultDelete));
    }

  }, [dispatch, setSearchResultDelete, params]);

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
    (selected: any) => {
      const request = {
        ...selected,
        status: "inactive",
      };
      if (selected.collections) {
        selected.collections = selected.collections.map((e: CollectionCreateRequest)=>e.code);
      }

      dispatch(productWrapperUpdateAction(selected.id, request, onUpdateSuccess));
    },
    [dispatch, onUpdateSuccess]
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.ACTIVE:
          onActive(selected[0]);
          break;
        case ACTIONS_INDEX.INACTIVE:
          onInactive(selected[0]);
          break;
        case ACTIONS_INDEX.DELETE:
          setConfirmDelete(true);
          break;
       case ACTIONS_INDEX.EXPORT_EXCEL:
          showInfo("Tính năng đang phát triển");
          break;
        case 3:
          break;
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
    setTableLoading(true);
  }, [dispatch, setDataCategory]);

  useEffect(() => {
    dispatch(searchProductWrapperRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <StyledComponent>
      <ProductWrapperFilter
        onClickOpen={() => setShowSettingColumn(true)}
        onMenuClick={onMenuClick}
        actions={actions}
        onFilter={onFilter}
        params={params}
        listCategory={listCategory}
        goods={goods}
        initValue={{} as ProductWrapperSearchQuery}
      />
      <CustomTable
        bordered
        selectedRowKey={rowKey}
        onChangeRowKey={(rowKey) => setRowKey(rowKey)}
        isRowSelection
        isLoading={tableLoading}
        onSelectedChange={onSelect}
        scroll={{x: 1200}}
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
        className="yody-table-product-search small-padding"
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
          let ids: Array<number> = [];
          selected.forEach((value) => {
            ids.push(value.id);
          });
          dispatch(productWrapperDeleteAction(ids, onDeleteSuccess));
        }}
        title="Bạn chắc chắn xóa sản phẩm này?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </StyledComponent>
  );
};

export default TabProductWrapper;
