import AuthWrapper from "component/authorization/AuthWrapper";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import { AppConfig } from "config/app.config";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  searchVariantsRequestAction,
  variantDeleteManyAction,
  variantUpdateAction,
  variantUpdateManyAction,
} from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import {
  VariantImage,
  VariantPricesResponse,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest,
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { TYPE_EXPORT } from "screens/products/constants";
import { formatCurrencyForProduct, generateQuery, Products, splitEllipsis } from "utils/AppUtils";
import { COLUMN_CONFIG_TYPE, OFFSET_HEADER_TABLE, STATUS_IMPORT_EXPORT } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import ExportProduct from "../../component/ExportProduct";
import ImageProduct from "../../component/image-product.component";
import UploadImageModal, { VariantImageModel } from "../../component/upload-image.modal";
import ProductFilter from "../../filter/ProductFilter";
import { StyledComponent } from "../style";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import { HttpStatus } from "config/http-status.config";
import useSetTableColumns from "hook/table/useSetTableColumns";
import useHandleFilterColumns from "hook/table/useHandleTableColumns";
import { SuppliersPermissions } from "config/permissions/supplier.permisssion";

const ACTIONS_INDEX = {
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const initQuery: VariantSearchQuery = {
  info: "",
  barcode: "",
  status: "",
  brands: "",
  made_ins: "",
  sizes: "",
  main_colors: "",
  colors: "",
};

let variantResponse: VariantResponse | null = null;

const TabProduct: React.FC<any> = (props) => {
  const { vExportProduct, setVExportProduct } = props;
  const query = useQuery();
  const history = useHistory();
  const listBrands = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.brand;
  });
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.variant_status;
  });
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );
  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [listCountry, setCountry] = useState<Array<CountryResponse>>();
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
  const [selected, setSelected] = useState<Array<VariantResponse>>([]);
  let dataQuery: VariantSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<VariantSearchQuery>(dataQuery);
  let [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [data, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [rowKey, setRowKey] = useState<Array<any>>([]);
  const dispatch = useDispatch();
  const [canUpdatesaleable] = useAuthorization({
    acceptPermissions: [ProductPermission.update_saleable],
  });
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [statusExportDetail, setStatusExportDetail] = useState<number>(0);
  const [listExportFileDetail, setListExportFileDetail] = useState<Array<string>>([]);
  const [exportProgressDetail, setExportProgressDetail] = useState<number>(0);
  const [allowReadSuppiers] = useAuthorization({
    acceptPermissions: [SuppliersPermissions.READ],
  });

  const actionsDefault: Array<MenuAction> = useMemo(() => {
    const disabled = !(selected && selected.length > 0);

    return [
      {
        id: ACTIONS_INDEX.PRINT_BAR_CODE,
        name: "In mã vạch",
        disabled,
      },
      {
        id: ACTIONS_INDEX.ACTIVE,
        name: "Cho phép bán",
        disabled: disabled || !canUpdatesaleable,
      },
      {
        id: ACTIONS_INDEX.INACTIVE,
        name: "Ngừng bán",
        disabled: disabled || !canUpdatesaleable,
      },
      {
        id: ACTIONS_INDEX.DELETE,
        name: "Xóa sản phẩm",
        disabled: disabled,
      },
    ];
  }, [canUpdatesaleable, selected]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.VARIANTS}${history.location.hash}?${queryParam}`);
    },
    [history, params],
  );

  const onFilter = useCallback(
    (values) => {
      let { info } = values;
      values.info = info && info.trim();
      let newPrams = {
        ...params,
        ...{
          ...values,
          info: values.info ? values.info : values.info === "" ? null : params.info,
        },
        page: 1,
      };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(`${ProductTabUrl.VARIANTS}?${queryParam}`);
    },
    [params, history],
  );

  const setSearchResult = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!!result) {
      setData(result);
    }
    setTableLoading(false);
  }, []);

  const onResultUpdateSaleable = useCallback(
    (success: Array<VariantResponse>, error: Array<VariantResponse>, isException) => {
      dispatch(hideLoading());
      if (!isException) {
        data.items.forEach((item) => {
          let index = success.findIndex((item1) => item.id === item1.id);
          if (index !== -1) {
            item = { ...item, ...success[index] };
          }
        });
        setData({ ...data, items: [...data.items] });
        dispatch(searchVariantsRequestAction(params, setSearchResult));
        showSuccess("Cập nhật thông tin thành công");
        setRowKey([]);
      }
    },
    [data, dispatch, params, setSearchResult],
  );

  const onActive = useCallback(() => {
    if (selected.length > 0) {
      dispatch(showLoading());
      let request: Array<VariantUpdateRequest> = [];
      selected.forEach((value) => {
        let variantRequest: VariantUpdateRequest = Products.convertVariantResponseToRequest(value);
        variantRequest.saleable = true;
        variantRequest.status = "active";
        request.push(variantRequest);
      });
      dispatch(variantUpdateManyAction(request, onResultUpdateSaleable));
    }
  }, [dispatch, onResultUpdateSaleable, selected]);

  const onInActive = useCallback(() => {
    if (selected.length > 0) {
      dispatch(showLoading());
      let request: Array<VariantUpdateRequest> = [];
      selected.forEach((value) => {
        let variantRequest: VariantUpdateRequest = Products.convertVariantResponseToRequest(value);
        variantRequest.saleable = false;
        request.push(variantRequest);
      });
      dispatch(variantUpdateManyAction(request, onResultUpdateSaleable));
    }
  }, [dispatch, onResultUpdateSaleable, selected]);

  const onResultDelete = useCallback(
    (isException) => {
      dispatch(hideLoading());
      if (!isException) {
        showSuccess("Xóa sản phẩm thành công");
        dispatch(searchVariantsRequestAction(params, setSearchResult));
        setRowKey([]);
        setSelected([]);
      }
    },
    [dispatch, params, setSearchResult],
  );

  const onDelete = useCallback(() => {
    if (selected.length > 0) {
      dispatch(showLoading());
      let request: Array<any> = [];
      selected.forEach((value) => {
        request.push({ product_id: value.product_id, variant_id: value.id });
      });
      dispatch(variantDeleteManyAction(request, onResultDelete));
    }
  }, [dispatch, onResultDelete, selected]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT_BAR_CODE:
          history.push(`${UrlConfig.PRODUCT}/barcode`, { selected: selected });
          break;
        case ACTIONS_INDEX.ACTIVE:
          onActive();
          break;
        case ACTIONS_INDEX.INACTIVE:
          onInActive();
          break;
        case ACTIONS_INDEX.DELETE:
          setConfirmDelete(true);
          break;
      }
    },
    [history, onActive, onInActive, selected],
  );

  const onSave = useCallback(
    (variant_images: Array<VariantImage>) => {
      setUploadVisible(false);
      if (variantResponse !== null) {
        dispatch(showLoading());
        let variantRequest: VariantUpdateRequest =
          Products.convertVariantResponseToRequest(variantResponse);
        variantRequest.variant_images = variant_images;
        dispatch(
          variantUpdateAction(variantResponse.id, variantRequest, () => {
            dispatch(hideLoading());
            setTableLoading(true);
            dispatch(searchVariantsRequestAction(params, setSearchResult));
          }),
        );
      }
    },
    [dispatch, params, setSearchResult],
  );

  const ckeckPermissionReadCostPrice = (): boolean => {
    if (currentPermissions) {
      if (currentPermissions.find((e) => e === ProductPermission.read_cost)) return true;
      else return false;
    } else {
      return false;
    }
  };

  const ckeckPermissionReadImportPrice = (): boolean => {
    if (currentPermissions) {
      if (currentPermissions.find((e) => e === ProductPermission.read_import)) return true;
      else return false;
    } else {
      return false;
    }
  };

  const defaultColumn: Array<ICustomTableColumType<VariantResponse>> = [
    {
      width: 70,
      title: "Ảnh",
      align: "center",
      render: (value: VariantResponse) => {
        let image = Products.findAvatar(value.variant_images);
        return (
          <ImageProduct
            path={image !== null ? image.url : null}
            isUpload={true}
            onClick={() => {
              setVariant({
                name: value.name,
                sku: value.sku,
                variant_images: value.variant_images,
              });
              variantResponse = value;
              setUploadVisible(true);
            }}
          />
        );
      },
      visible: true,
      key: "image",
    },

    {
      title: "Sản phẩm",
      dataIndex: "sku",
      key: "sku",
      render: (value: string, i: VariantResponse) => {
        let strName = i.name.trim();
        strName =
          window.screen.width >= 1920
            ? splitEllipsis(strName, 100, 30)
            : window.screen.width >= 1600
            ? (strName = splitEllipsis(strName, 60, 30))
            : window.screen.width >= 1366
            ? (strName = splitEllipsis(strName, 47, 30))
            : strName;
        return (
          <div>
            <Link
              to={`${UrlConfig.PRODUCT}/${i.product_id}/variants/${i.id}`}
              className="yody-text-ellipsis"
            >
              {value}
            </Link>
            <div>
              <TextEllipsis value={strName} line={1} />
            </div>
          </div>
        );
      },
      visible: true,
    },
    {
      title: "Giá vốn",
      dataIndex: "variant_prices",
      align: "right",
      key: "cost_price",
      visible: ckeckPermissionReadCostPrice(),
      width: 110,
      render: (value) => {
        let prices: VariantPricesResponse | null = Products.findPrice(value, AppConfig.currency); //cần phải xem lại đơn vị tiền tệ
        if (prices !== null) {
          return formatCurrencyForProduct(prices.cost_price);
        }
        return "";
      },
    },
    {
      title: "Giá nhập",
      dataIndex: "variant_prices",
      align: "right",
      key: "import_price",
      visible: ckeckPermissionReadImportPrice(),
      width: 110,
      render: (value) => {
        let prices: VariantPricesResponse | null = Products.findPrice(value, AppConfig.currency);
        if (prices !== null) {
          return formatCurrencyForProduct(prices.import_price);
        }
        return "";
      },
    },
    {
      title: "Giá bán",
      dataIndex: "variant_prices",
      key: "retail_price",
      align: "right",
      visible: true,
      width: 110,
      render: (value) => {
        let prices: VariantPricesResponse | null = Products.findPrice(value, AppConfig.currency);
        if (prices !== null) {
          return formatCurrencyForProduct(prices.retail_price);
        }
        return "";
      },
    },
    {
      title: "Có thể bán",
      dataIndex: "available",
      key: "available",
      visible: true,
      align: "right",
      width: 110,
      render: (value: number) => <div> {value ? formatCurrencyForProduct(value) : "0"}</div>,
    },

    {
      title: "Trạng thái",
      dataIndex: "saleable",
      key: "saleable",
      visible: true,
      align: "center",
      width: 120,
      render: (value: string) => (
        <div className={value ? "text-success" : "text-error"}>
          {value ? "Cho phép bán" : "Ngừng  bán"}
        </div>
      ),
    },
    {
      title: "Nhà thiết kế",
      key: "designer",
      visible: true,
      align: "left",
      width: 150,
      render: (record: VariantResponse) => {
        return (
          <div>
            {record?.product?.designer !== null ? (
              <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record?.product?.designer_code}`}>
                {record?.product?.designer}
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
      align: "left",
      width: 150,
      visible: true,
      render: (record: VariantResponse) => {
        return (
          <div>
            {record?.product?.merchandiser !== null ? (
              <Link
                target="_blank"
                to={`${UrlConfig.ACCOUNTS}/${record?.product?.merchandiser_code}`}
              >
                {record?.product?.merchandiser}
              </Link>
            ) : (
              "---"
            )}
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      key: "created_date",
      visible: true,
      align: "left",
      width: 110,
      render: (value, record) => {
        return record?.created_date !== null
          ? ConvertUtcToLocalDate(record?.created_date, DATE_FORMAT.DDMMYYY)
          : "---";
      },
    },
  ];

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<VariantResponse>>>(defaultColumn);

  const { tableColumnConfigs, onSaveConfigTableColumn } = useHandleFilterColumns(
    COLUMN_CONFIG_TYPE.COLUMN_VARIANT,
  );
  useSetTableColumns(
    COLUMN_CONFIG_TYPE.COLUMN_VARIANT,
    tableColumnConfigs,
    defaultColumn,
    setColumn,
  );

  const columnFinal = useMemo(() => {
    return columns.filter((item) => item.visible === true);
  }, [columns]);

  const [canPrintBarcode] = useAuthorization({
    acceptPermissions: [ProductPermission.print_temp],
  });
  const [canDeleteVariants] = useAuthorization({
    acceptPermissions: [ProductPermission.delete_variant],
  });
  const [canUpdateProduct] = useAuthorization({
    acceptPermissions: [ProductPermission.update],
  });

  const actions = useMemo(() => {
    return actionsDefault.filter((item) => {
      if (item.id === ACTIONS_INDEX.PRINT_BAR_CODE) {
        return canPrintBarcode;
      }
      if (item.id === ACTIONS_INDEX.ACTIVE || item.id === ACTIONS_INDEX.INACTIVE) {
        return canUpdateProduct;
      }
      if (item.id === ACTIONS_INDEX.DELETE) {
        return canDeleteVariants;
      }
      return false;
    });
  }, [canPrintBarcode, canDeleteVariants, canUpdateProduct, actionsDefault]);

  const onSelect = useCallback(
    (selectedRow: Array<VariantResponse>) => {
      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        }),
      );
    },
    [setSelected],
  );

  const getConditions = useCallback(
    (type: string) => {
      let conditions = {};
      switch (type) {
        case TYPE_EXPORT.selected:
          let variant_ids = selected.map((e) => e.id).toString();

          conditions = { variant_ids: variant_ids };

          break;
        case TYPE_EXPORT.page:
          conditions = {
            ...params,
            limit: params.limit ?? 30,
            page: params.page ?? 1,
          };
          break;
        case TYPE_EXPORT.all:
          conditions = { ...params, page: undefined, limit: undefined };
          break;
      }
      return conditions;
    },
    [params, selected],
  );

  const resetExport = () => {
    setVExportProduct(false);
    setLoadingExport(false);
    setExportProgressDetail(0);
  };

  const actionExport = {
    Ok: async (typeExport: string) => {
      setLoadingExport(true);
      if (typeExport === TYPE_EXPORT.selected && selected && selected.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm để xuất file");
        setVExportProduct(false);
        return;
      }

      const conditions = getConditions(typeExport);
      const queryParam = generateQuery({ ...conditions });
      exportFileV2({
        conditions: queryParam,
        type: "TYPE_EXPORT_PRODUCT_VARIANT",
      })
        .then((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            showSuccess("Đã gửi yêu cầu xuất file");
            setStatusExportDetail(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            setListExportFileDetail([...listExportFileDetail, response.data.code]);
          }
        })
        .catch(() => {
          setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
          resetExport();
        });
    },
    Cancel: () => {
      resetExport();
    },
  };

  const checkExportFileDetail = useCallback(() => {
    let getFilePromises = listExportFileDetail.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data.total || response.data.total !== 0) {
            setExportProgressDetail(response.data.percent);
          }
          if (response.data && response.data.status === "FINISH") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFileDetail.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();
            setListExportFileDetail(newListExportFile);
            resetExport();
          } else if (response.data && response.data.status === "ERROR") {
            setStatusExportDetail(STATUS_IMPORT_EXPORT.ERROR);
            if (response.data.message) {
              showError(response.data.message);
            }
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listExportFileDetail]);

  useEffect(() => {
    if (
      listExportFileDetail.length === STATUS_IMPORT_EXPORT.NONE ||
      statusExportDetail === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExportDetail === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFileDetail();

    const getFileInterval = setInterval(checkExportFileDetail, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFileDetail, checkExportFileDetail, statusExportDetail]);

  useEffect(() => {
    dispatch(CountryGetAllAction(setCountry));
    setTableLoading(true);
  }, [dispatch]);

  useEffect(() => {
    setTableLoading(true);
    dispatch(searchVariantsRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);

  return (
    <StyledComponent>
      <ProductFilter
        onMenuClick={onMenuClick}
        actions={actions}
        onFilter={onFilter}
        params={params}
        listStatus={listStatus}
        listBrands={listBrands}
        listCountries={listCountry}
        onClickOpen={() => setShowSettingColumn(true)}
        allowReadSuppiers={allowReadSuppiers}
      />
      <CustomTable
        className="small-padding"
        bordered
        selectedRowKey={rowKey}
        onChangeRowKey={(rowKey) => setRowKey(rowKey)}
        isRowSelection
        isLoading={tableLoading}
        // scroll={{ x: 100 }}
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
        onSelectedChange={onSelect}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: VariantResponse) => item.id}
      />
      <AuthWrapper acceptPermissions={[ProductPermission.upload_image]}>
        <UploadImageModal
          onCancel={() => setUploadVisible(false)}
          variant={variant}
          visible={uploadVisible}
          onSave={onSave}
        />
      </AuthWrapper>
      <ModalSettingColumn
        isSetDefaultColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumn(data);
          onSaveConfigTableColumn(data);
        }}
        data={defaultColumn}
      />
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          dispatch(showLoading());
          onDelete();
        }}
        title="Bạn chắc chắn xóa sản phẩm này?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />

      <ExportProduct
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportProduct}
        loading={loadingExport}
        exportProgress={exportProgressDetail}
      />
    </StyledComponent>
  );
};

export default TabProduct;
