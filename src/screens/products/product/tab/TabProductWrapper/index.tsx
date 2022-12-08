import { Image } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import {
  productWrapperDeleteAction,
  searchProductWrapperRequestAction,
} from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import {
  ProductResponse,
  ProductWrapperResponse,
  ProductWrapperSearchQuery,
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ProductWrapperFilter } from "screens/products/product/filter";
import { generateQuery } from "utils/AppUtils";
import {
  convertCategory,
  formatCurrencyForProduct,
  ACTIONS_INDEX_TAB_PRODUCT,
  ProductResponseStatuses
} from "screens/products/helper";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showInfo, showSuccess, showWarning } from "utils/ToastUtils";
import ImageProduct from "../../component/ImageProduct";
import { StyledComponent } from "../style";
import { getQueryParams, useQuery } from "utils/useQuery";
import { callApiNative } from "utils/ApiUtils";
import { updateStatusProductApi } from "service/product/product.service";
import { searchProductWrapperApi } from "service/product/product.service";
import useSetTableColumns from "hook/table/useSetTableColumns";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";

const TabProductWrapper: React.FC = () => {
  const query = useQuery();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isConfirmDelete, setIsConfirmDelete] = useState(false);

  const [isTableLoading, setIsTableLoading] = useState(true);
  const [isShowSettingColumn, setIsShowSettingColumn] = useState(false);
  const goods = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.goods);
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);

  const [selected, setSelected] = useState<Array<ProductResponse>>([]);
  const [rowKeys, setRowKeys] = useState<Array<any>>([]);

  const [data, setData] = useState<PageResponse<ProductResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const actionsDefault: Array<MenuAction> = useMemo(() => {
    const disabled = !(selected && selected.length > 0);
    return [
      {
        id: ACTIONS_INDEX_TAB_PRODUCT.EXPORT_EXCEL,
        name: "Xuất thông tin excel",
      },
      {
        id: ACTIONS_INDEX_TAB_PRODUCT.ACTIVE,
        name: "Đang hoạt động",
        disabled: disabled,
      },
      {
        id: ACTIONS_INDEX_TAB_PRODUCT.INACTIVE,
        name: "Ngừng hoạt động",
        disabled: disabled,
      },
      {
        id: ACTIONS_INDEX_TAB_PRODUCT.DELETE,
        name: "Xóa sản phẩm",
        disabled: disabled,
      },
    ];
  }, [selected]);

  const dataQuery = useMemo(() => getQueryParams(query), [query]);

  const [params, setParams] = useState<ProductWrapperSearchQuery>(dataQuery);

  const defaultColumns: Array<ICustomTableColumType<ProductResponse>> = [
    {
      title: "Ảnh",
      align: "center",
      width: 70,
      dataIndex: "product_avatar",
      render: (value: string) => {
        return (
          <>
            {value ? (
              <Image width={40} height={40} placeholder="Xem" src={value ?? ""} />
            ) : (
              <ImageProduct isDisabled={true} path={value} />
            )}
          </>
        );
      },
      key: "image",
      visible: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: "code",
      key: "code",
      render: (value: string, i: ProductWrapperResponse) => {
        return (
          <>
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${i.id}`}>{value}</Link>
            </div>
            <div>
              <TextEllipsis value={i.name} line={1} />
            </div>
          </>
        );
      },
      visible: true,
    },
    {
      align: "right",
      title: "SL Phiên bản",
      dataIndex: "num_variant",
      key: "num_variant",
      width: 110,
      visible: true,
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      key: "on_hand",
      align: "right",
      visible: true,
      width: 120,
      render: (value: number) => (
        <div> {value !== null ? formatCurrencyForProduct(value) : "0"}</div>
      ),
    },
    {
      align: "right",
      title: "Có thể bán",
      dataIndex: "available",
      key: "available",
      visible: true,
      width: 100,
      render: (value: number) => (
        <div> {value !== null ? formatCurrencyForProduct(value) : "0"}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
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
      key: "created_date",
      render: (value) => (value !== null ? ConvertUtcToLocalDate(value, "DD/MM/YYYY") : "---"),
      width: 110,
      visible: true,
    },
    {
      title: "Nhà thiết kế",
      visible: false,
      width: 100,
      key: "designer",
      render: (record: ProductWrapperResponse) => {
        return (
          <div>
            {record?.designer !== null ? (
              <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record?.designer_code}`}>
                {record?.designer}
              </Link>
            ) : (
              "---"
            )}
          </div>
        );
      },
    },
    {
      title: "Merchandiser",
      key: "merchandiser",
      visible: false,
      render: (record: ProductWrapperResponse) => {
        return (
          <div>
            {record?.merchandiser !== null ? (
              <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record?.merchandiser_code}`}>
                {record?.merchandiser}
              </Link>
            ) : (
              "---"
            )}
          </div>
        );
      },
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      visible: false,
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods",
      key: "goods",
      visible: false,
    },
    {
      title: "Chất liệu",
      dataIndex: "material",
      key: "material",
      visible: false,
    },
  ];

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<ProductResponse>>>(defaultColumns);

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT,
  );
  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_PRODUCT,
    tableColumnConfigs,
    defaultColumns,
    setColumn,
  );

  const [canDeleteParentProduct] = useAuthorization({
    acceptPermissions: [ProductPermission.delete],
  });
  const [canUpdateParentProduct] = useAuthorization({
    acceptPermissions: [ProductPermission.update],
  });

  const actions = actionsDefault.filter((item) => {
    if (item.id === ACTIONS_INDEX_TAB_PRODUCT.DELETE) {
      return canDeleteParentProduct;
    }
    if (item.id === ACTIONS_INDEX_TAB_PRODUCT.ACTIVE || item.id === ACTIONS_INDEX_TAB_PRODUCT.INACTIVE) {
      return canUpdateParentProduct;
    }
    return item.id === ACTIONS_INDEX_TAB_PRODUCT.EXPORT_EXCEL;
  });

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    const temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const setSearchResult = useCallback(
    (result: PageResponse<ProductResponse> | false) => {
      dispatch(hideLoading());
      setIsTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    [dispatch],
  );

  const setSearchResultDelete = useCallback((result: PageResponse<ProductResponse> | false) => {
    if (!!result) {
      setData(result);
    }
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      const newParams = { ...params, page, limit: size };
      setParams(newParams);
      const queryParam = generateQuery(newParams);
      history.push(`${UrlConfig.PRODUCT}${history.location.hash}?${queryParam}`);
    },
    [history, params],
  );

  const columnsFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const onFilter = useCallback(
    (values) => {
      const { info } = values;

      values.info = info && info.trim();
      const newPrams = {
        ...params,
        ...{
          ...values,
          info: values.info ? values.info : values.info === "" ? null : params.info,
        },
        page: 1,
      };
      setParams(newPrams);
      const queryParam = generateQuery(newPrams);
      history.replace(`${ProductTabUrl.PRODUCTS}?${queryParam}`);
    },
    [params, history],
  );

  const onDeleteSuccess = useCallback(
    (res: any) => {
      if (res) {
        showSuccess("Xóa sản phẩm thành công");
        setSelected([]);
        dispatch(searchProductWrapperRequestAction(params, setSearchResultDelete));
      }
      dispatch(hideLoading());
      setIsTableLoading(false);
    },
    [dispatch, setSearchResultDelete, params],
  );

  const onActiveSuccess = useCallback(async () => {
    setSelected([]);
    setRowKeys([]);
    const res = await callApiNative(
      { isShowLoading: false },
      dispatch,
      searchProductWrapperApi,
      params,
    );
    if (res) {
      setSearchResult(res);
    }
  }, [dispatch, params, setSearchResult]);

  const changeActiveProduct = useCallback(
    async (selected: any, type: string) => {
      if (!selected || selected.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm cha nào.");
        return;
      }
      const res = await callApiNative({ isShowLoading: true }, dispatch, updateStatusProductApi, {
        product_ids: selected.map((e: ProductResponse) => e.id),
        status: type,
      });
      if (res === ProductResponseStatuses.SUCCESS) {
        showSuccess("Cập nhật dữ liệu thành công");
        onActiveSuccess();
      }
    },
    [dispatch, onActiveSuccess],
  );

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX_TAB_PRODUCT.ACTIVE:
          changeActiveProduct(selected, "active");
          break;
        case ACTIONS_INDEX_TAB_PRODUCT.INACTIVE:
          changeActiveProduct(selected, "inactive");
          break;
        case ACTIONS_INDEX_TAB_PRODUCT.DELETE:
          setIsConfirmDelete(true);
          break;
        case ACTIONS_INDEX_TAB_PRODUCT.EXPORT_EXCEL:
          showInfo("Tính năng đang phát triển");
          break;
        case 3:
          break;
      }
    },
    [changeActiveProduct, selected],
  );

  const onSelect = useCallback((selectedRows: Array<ProductResponse>) => {
    setSelected(
      selectedRows.filter(function (el) {
        return el !== undefined;
      }),
    );
  }, []);

  useEffect(() => {
    dispatch(getCategoryRequestAction({}, setDataCategory));
    setIsTableLoading(true);
  }, [dispatch, setDataCategory]);

  const getProductWrapper = useCallback(async () => {
    setIsTableLoading(true);
    const res = await callApiNative(
      { isShowLoading: false },
      dispatch,
      searchProductWrapperApi,
      params,
    );
    setIsTableLoading(false);
    if (res) setSearchResult(res);
  }, [dispatch, params, setSearchResult]);

  useEffect(() => {
    getProductWrapper();
  }, [getProductWrapper]);

  return (
    <StyledComponent>
      <ProductWrapperFilter
        onClickOpen={() => setIsShowSettingColumn(true)}
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
        selectedRowKey={rowKeys}
        onChangeRowKey={(rowKeys) => setRowKeys(rowKeys)}
        isRowSelection
        isLoading={isTableLoading}
        onSelectedChange={onSelect}
        isShowPaginationAtHeader
        scroll={{ x: "max-content" }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={data.items}
        columns={columnsFinal}
        rowKey={(item: ProductResponse) => item.id}
        className="yody-table-product-search small-padding"
      />
      <ModalSettingColumn
        isSetDefaultColumn
        visible={isShowSettingColumn}
        onCancel={() => setIsShowSettingColumn(false)}
        onOk={(data) => {
          setIsShowSettingColumn(false);
          setColumn(data);
          onSaveConfigTableColumn(data);
        }}
        data={columns}
      />
      <ModalDeleteConfirm
        onCancel={() => setIsConfirmDelete(false)}
        onOk={() => {
          setIsConfirmDelete(false);
          dispatch(showLoading());
          const ids: Array<number> = [];
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
