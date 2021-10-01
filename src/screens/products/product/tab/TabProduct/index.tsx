import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountGetListAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { listColorAction } from "domain/actions/product/color.action";
import {
  searchVariantsRequestAction,
  variantDeleteManyAction,
  variantUpdateAction,
  variantUpdateManyAction,
} from "domain/actions/product/products.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { ColorResponse, ColorSearchQuery } from "model/product/color.model";
import {
  VariantImage,
  VariantPricesResponse,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest,
} from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, Products } from "utils/AppUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import ImageProduct from "../../component/image-product.component";
import UploadImageModal, {
  VariantImageModel,
} from "../../component/upload-image.modal";
import ProductFilter from "../../filter/ProductFilter";

const ACTIONS_INDEX = {
  PRINT_BAR_CODE: 2,
  ACTIVE: 3,
  INACTIVE: 4,
  DELETE: 5,
};

const actions: Array<MenuAction> = [
  {
    id: ACTIONS_INDEX.PRINT_BAR_CODE,
    name: "In mã vạch",
  },
  {
    id: ACTIONS_INDEX.ACTIVE,
    name: "Cho phép bán",
  },
  {
    id: ACTIONS_INDEX.INACTIVE,
    name: "Ngừng bán",
  },
  {
    id: ACTIONS_INDEX.DELETE,
    name: "Xóa sản phẩm",
  },
];

const initQuery: VariantSearchQuery = {
  info: "",
  barcode: "",
  status: "",
  brand: "",
  made_in: "",
  size: "",
  main_color: "",
  color: "",
  supplier: "",
};

const initAccountQuery: AccountSearchQuery = {
  department_ids: [4],
};

const initMainColorQuery: ColorSearchQuery = {
  is_main_color: 1,
};
const initColorQuery: ColorSearchQuery = {
  is_main_color: 0,
};

var variantResponse: VariantResponse | null = null;
const TabProduct: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const listBrands = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.brand;
  });
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.variant_status;
  });
  const [tableLoading, setTableLoading] = useState(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [listCountry, setCountry] = useState<Array<CountryResponse>>();
  const [listMainColor, setMainColor] = useState<Array<ColorResponse>>();
  const [listColor, setColor] = useState<Array<ColorResponse>>();
  const [listSize, setSize] = useState<Array<SizeResponse>>();
  const [listSupplier, setSupplier] = useState<Array<SupplierResponse>>();
  const [uploadVisible, setUploadVisible] = useState<boolean>(false);
  const [variant, setVariant] = useState<VariantImageModel | null>(null);
  const [selected, setSelected] = useState<Array<VariantResponse>>([]);
  const [listMerchandiser, setMerchandiser] =
    useState<Array<AccountResponse>>();
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
  const [columns, setColumn] = useState<
    Array<ICustomTableColumType<VariantResponse>>
  >([
    {
      width: 80,
      title: "Ảnh",
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
    },
    {
      title: "Sản phẩm",
      dataIndex: "sku",
      width: 300,
      render: (value: string, i: VariantResponse) => (
        <div>
          <Link to={`${UrlConfig.PRODUCT}/${i.product_id}/variants/${i.id}`}>
            {value}
          </Link>
          <div>{i.name}</div>
        </div>
      ),
      visible: true,
    },
    {
      title: "Giá bán",
      dataIndex: "variant_prices",
      align: "right",
      visible: true,
      render: (value) => {
        let prices: VariantPricesResponse | null = Products.findPrice(
          value,
          AppConfig.currency
        );
        if (prices !== null) {
          return formatCurrency(prices.retail_price);
        }
        return 0;
      },
    },
    {
      title: "Nhà thiết kế",
      render: (value: VariantResponse) => <div> {value.product.designer}</div>,
      visible: true,
      align: "center",
    },
    {
      title: "Merchandiser",
      render: (value: VariantResponse) => (
        <div> {value.product.merchandiser}</div>
      ),
      align: "center",
      visible: true,
    },
    {
      title: "Có thể bán",
      dataIndex: "inventory",
      visible: true,
      align: "right",
    },

    {
      title: "Trạng thái",
      dataIndex: "saleable",
      render: (value: string, row: VariantResponse) => (
        <div className={value ? "text-success" : "text-error"}>
          {value ? "Cho phép bán" : "Ngừng  bán"}
        </div>
      ),
      visible: true,
      align: "center",
    },
    {
      title: "Ngày khởi tạo",
      dataIndex: "created_date",
      visible: true,
      align: "center",
      render: (value, record) =>
        ConvertUtcToLocalDate(record.product.created_date),
    },
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
    },
    [params]
  );
  const onFilter = useCallback((values) => {
    let newPrams = { ...values, page: 1 };
    setPrams(newPrams);
  }, []);

  const setSearchResult = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      setTableLoading(false);
      if (!!result) {
        setData(result);
      }
    },
    []
  );

  const onResultUpdateSaleable = useCallback(
    (
      success: Array<VariantResponse>,
      error: Array<VariantResponse>,
      isException
    ) => {
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
        setRowKey([])
      }
    },
    [data, dispatch, params, setSearchResult]
  );

  const onActive = useCallback(() => {
    if (selected.length > 0) {
      dispatch(showLoading());
      let request: Array<VariantUpdateRequest> = [];
      selected.forEach((value) => {
        let variantRequest: VariantUpdateRequest =
          Products.convertVariantResponseToRequest(value);
        variantRequest.saleable = true;
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
        let variantRequest: VariantUpdateRequest =
          Products.convertVariantResponseToRequest(value);
        variantRequest.saleable = false;
        request.push(variantRequest);
      });
      dispatch(variantUpdateManyAction(request, onResultUpdateSaleable));
    }
  }, [dispatch, onResultUpdateSaleable, selected]);

  const onResultDelete = useCallback(
    (
      isException
    ) => {
      dispatch(hideLoading());
      if (!isException) {
        dispatch(searchVariantsRequestAction(params, setSearchResult));
        showSuccess("Cập nhật thông tin thành công");
        setRowKey([]);
        setSelected([]);
      }
    },
    [dispatch, params, setSearchResult]
  );

  const onDelete = useCallback(() => {
    if (selected.length > 0) {
      dispatch(showLoading());
      let request: Array<any> = [];
      selected.forEach((value) => {
        request.push({product_id: value.product_id, variant_id: value.id});
      });
      dispatch(variantDeleteManyAction(request, onResultDelete));
    }
  }, [dispatch, onResultDelete, selected])

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
    [history, onActive, onInActive, selected]
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
          variantUpdateAction(variantResponse.id, variantRequest, (result) => {
            dispatch(hideLoading());
            setTableLoading(true);
            dispatch(searchVariantsRequestAction(params, setSearchResult));
          })
        );
      }
    },
    [dispatch, params, setSearchResult]
  );
  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onSelect = useCallback((selectedRow: Array<VariantResponse>) => {
    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  }, []);

  useEffect(() => {
    dispatch(CountryGetAllAction(setCountry));
    dispatch(listColorAction(initMainColorQuery, setMainColor));
    dispatch(listColorAction(initColorQuery, setColor));
    dispatch(sizeGetAll(setSize));
    dispatch(SupplierGetAllAction(setSupplier));
    dispatch(AccountGetListAction(initAccountQuery, setMerchandiser));
    setTableLoading(true);
  }, [dispatch]);
  useEffect(() => {
    setTableLoading(true);
    dispatch(searchVariantsRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);
  return (
    <div className="padding-20">
      <ProductFilter
        onMenuClick={onMenuClick}
        actions={actions}
        onFilter={onFilter}
        params={params}
        listStatus={listStatus}
        listBrands={listBrands}
        listMerchandisers={listMerchandiser}
        listSize={listSize}
        listMainColors={listMainColor}
        listColors={listColor}
        listSupplier={listSupplier}
        listCountries={listCountry}
        onClickOpen={() => setShowSettingColumn(true)}
      />
      <CustomTable
        selectedRowKey={rowKey}
        onChangeRowKey={(rowKey) => setRowKey(rowKey)}
        isRowSelection
        isLoading={tableLoading}
        scroll={{ x: 1300 }}
        sticky={{ offsetScroll: 5, offsetHeader: 55 }}
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
      <UploadImageModal
        onCancel={() => setUploadVisible(false)}
        variant={variant}
        visible={uploadVisible}
        onSave={onSave}
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
          onDelete();
        }}
        title="Bạn chắc chắn xóa sản phẩm này?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </div>
  );
};

export default TabProduct;
