import { Button, Modal, Progress } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import TextEllipsis from "component/table/TextEllipsis";
import { AppConfig } from "config/app.config";
import { HttpStatus } from "config/http-status.config";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  searchVariantsRequestAction,
  variantDeleteManyAction,
  variantUpdateAction,
  variantUpdateManyAction
} from "domain/actions/product/products.action";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { ExportRequest } from "model/other/files/export-model";
import {
  VariantImage,
  VariantPricesResponse,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest
} from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, {
  useCallback,
  useEffect, useMemo,
  useState
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { TYPE_EXPORT } from "screens/products/constants";
import { exportFile, getJobByCode } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency, generateQuery, Products, splitEllipsis } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import ExportProduct from "../../component/ExportProduct";
import ImageProduct from "../../component/image-product.component";
import UploadImageModal, { VariantImageModel } from "../../component/upload-image.modal";
import ProductFilter from "../../filter/ProductFilter";
import { StyledComponent } from "../style";

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
  colors: ""
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
  // process export modal
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportCodeList, setExportCodeList] = useState<Array<any>>([]);

  const actionsDefault: Array<MenuAction> = useMemo(()=>{
    const disabled = !(selected && selected.length > 0);

    return [
      {
        id: ACTIONS_INDEX.PRINT_BAR_CODE,
        name: "In mã vạch",
      },
      {
        id: ACTIONS_INDEX.ACTIVE,
        name: "Cho phép bán",
        disabled: disabled
      },
      {
        id: ACTIONS_INDEX.INACTIVE,
        name: "Ngừng bán",
        disabled: disabled
      },
      {
        id: ACTIONS_INDEX.DELETE,
        name: "Xóa sản phẩm",
        disabled: disabled
      },
    ]
  },[selected]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({...params});
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.VARIANTS}${history.location.hash}?${queryParam}`);
    },
    [history,params]
  );

  const onFilter = useCallback((values) => {
    let {info} = values;
    values.info = info && info.trim();
    let newPrams = { ...params, ...{
        ...values,
        info: values.info ? values.info : values.info === '' ? null : params.info
      }, page: 1 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.replace(`${ProductTabUrl.VARIANTS}?${queryParam}`);
  }, [params, history]);

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
            item = {...item, ...success[index]};
          }
        });
        setData({...data, items: [...data.items]});
        dispatch(searchVariantsRequestAction(params, setSearchResult));
        showSuccess("Cập nhật thông tin thành công");
        setRowKey([]);
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
    (isException) => {
      dispatch(hideLoading());
      if (!isException) {
        showSuccess("Xóa sản phẩm thành công");
        dispatch(searchVariantsRequestAction(params, setSearchResult));
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
  }, [dispatch, onResultDelete, selected]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case ACTIONS_INDEX.PRINT_BAR_CODE:
          history.push(`${UrlConfig.PRODUCT}/barcode`, {selected: selected});
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
          variantUpdateAction(variantResponse.id, variantRequest, () => {
            dispatch(hideLoading());
            setTableLoading(true);
            dispatch(searchVariantsRequestAction(params, setSearchResult));
          })
        );
      }
    },
    [dispatch, params, setSearchResult]
  );

  const defaultColumn: Array<ICustomTableColumType<VariantResponse>> = [
    {
      width: 70,
      title: "Ảnh",
      align:"center",
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
      title:  "Sản phẩm",
      dataIndex: "sku",
      render: (value: string, i: VariantResponse) => {
        let strName=(i.name.trim());
        strName=window.screen.width>=1920?splitEllipsis(strName,100,30)
          :window.screen.width>=1600?strName=splitEllipsis(strName,60,30)
          :window.screen.width>=1366?strName=splitEllipsis(strName,47,30):strName;
        return(
          <div>
            <Link to={`${UrlConfig.PRODUCT}/${i.product_id}/variants/${i.id}`} className="yody-text-ellipsis">
              {value}
            </Link>
            <div><TextEllipsis value={strName} line={1} /></div>
          </div>
        )
      },
      visible: true,
    },
    {
      title: "Giá bán",
      dataIndex: "variant_prices",
      align: "right",
      visible: true,
      width: 110,
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
      title: "Có thể bán",
      dataIndex: "available",
      visible: true,
      align: "right",
      width: 110,
      render: (value: number) => <div> {value?formatCurrency(value,"."):"0"}</div>,
    },

    {
      title: "Trạng thái",
      dataIndex: "saleable",
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
      visible: true,
      align: "left",
      width: 150,
      render: (record: VariantResponse) => {
        return(
          <div>
             {
              (record?.product?.designer) !==null?
                <Link target="_blank"  to={`${UrlConfig.ACCOUNTS}/${record?.product?.designer_code}`}>
                  {record?.product?.designer}
                </Link>  :"---"
            }
          </div>
        )
      },
    },
    {
      title: "Merchandiser",
      align: "left",
      width: 150,
      visible: true,
      render: (record: VariantResponse) => {
        return(
          <div>
             {
              (record?.product?.merchandiser) !==null?
                <Link target="_blank"  to={`${UrlConfig.ACCOUNTS}/${record?.product?.merchandiser_code}`}>
                  {record?.product?.merchandiser}
                </Link>  :"---"
            }
          </div>
        )
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_date",
      visible: true,
      align: "left",
      width: 110,
      render: (value, record) => {
        return ((record?.created_date)!==null?ConvertUtcToLocalDate(record?.created_date,DATE_FORMAT.DDMMYYY):"---")
      },
    },
  ];

  const [columns, setColumn] =
    useState<Array<ICustomTableColumType<VariantResponse>>>(defaultColumn);

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
      if (item.id ===  ACTIONS_INDEX.DELETE) {
        return canDeleteVariants;
      }
      return false;
    });
  }, [canPrintBarcode, canDeleteVariants, canUpdateProduct, actionsDefault]);

    const onCancelProgressModal = () => {
      setExportCodeList([]);
      setIsVisibleProgressModal(false);
    };

  const onSelect = useCallback(
    (selectedRow: Array<VariantResponse>) => {
      setSelected(
        selectedRow.filter(function (el) {
          return el !== undefined;
        })
      );
    },
    [setSelected]
  );

  const actionExport = {
    Ok: useCallback(async(typeExport: string)=>{
      let variant_ids: Array<number> = []; let conditions = {};
      if (typeExport === TYPE_EXPORT.selected &&  selected && selected.length === 0) {
        showWarning("Bạn chưa chọn sản phẩm để xuất file");
        return;
      }

      if ((typeExport === TYPE_EXPORT.page || typeExport === TYPE_EXPORT.all) && data.items && data.items.length === 0) {
        showWarning("Không có sản phẩm nào đủ điều kiện");
        return;
      }

      if (typeExport === TYPE_EXPORT.all) {
        conditions ={...params}
      }

      if (typeExport === TYPE_EXPORT.page) {
        conditions ={
          ...conditions,
          variant_ids: data.items.map(e=>e.id)}
      }

      if (selected && selected.length > 0) {
        variant_ids = selected.map(e=>e.id);
      }
      conditions = {
        ...conditions,
        typeExport: typeExport,
        variant_ids: variant_ids
      };
      const request: ExportRequest = {
        type: "EXPORT_PRODUCT",
        conditions: JSON.stringify(conditions),
        url: AppConfig.PRODUCT_EXPORT_TEMPLATE
      };

      const res = await callApiNative({isShowLoading: false},dispatch,exportFile,request);
      if (res) {
        if (res.code === HttpStatus.SUCCESS) {
          setIsVisibleProgressModal(true);
          setVExportProduct(false);
          setExportCodeList([...exportCodeList, res.data.code]);
        }
      }
    },[dispatch,selected,data.items, params, exportCodeList, setVExportProduct]),
    Cancel:()=>{
      setVExportProduct(false);
    },
  }

  const checkExportFile = useCallback(() => {
    let getFilePromises = exportCodeList.map((code) => {
      return getJobByCode(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          response.data.total > 0
        ) {
          if (!!response.data.url) {
            const newExportCode = exportCodeList.filter((item) => {
              return item !== response.data.code;
            });
            setExportCodeList(newExportCode);
            setExportProgress(100);
            setIsVisibleProgressModal(false);
            showSuccess("Xuất file dữ liệu khách hàng thành công!");
            window.open(response.data.url);
          } else {
            if (response.data.num_of_record >= response.data.total) {
              setExportProgress(response.data.processed);
            } else {
              const percent = Math.floor(
                (response.data.num_of_record / response.data.total) * 100
              );
              setExportProgress(percent);
            }
          }
        }
      });
    });
  }, [exportCodeList]);

  useEffect(() => {
    if (exportProgress === 100 || exportCodeList.length === 0) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, exportProgress, exportCodeList]);

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
      />
      <CustomTable
        className="small-padding"
        bordered
        selectedRowKey={rowKey}
        onChangeRowKey={(rowKey) => setRowKey(rowKey)}
        isRowSelection
        isLoading={tableLoading}
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

      <ExportProduct
        onCancel={actionExport.Cancel}
        onOk={actionExport.Ok}
        visible={vExportProduct}
       />

       {/* Progress export customer data */}
       <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file"
          centered
          width={600}
          footer={[
            <Button key="cancel" type="primary" onClick={onCancelProgressModal}>
              Thoát
            </Button>,
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              Đang tạo file, vui lòng đợi trong giây lát
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </div>
        </Modal>
    </StyledComponent>
  );
};

export default TabProduct;
