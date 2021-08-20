import { Card } from "antd";
import { MenuAction } from "component/table/ActionButton";
import { PageResponse } from "model/base/base-metadata.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery, Products } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
// import ProductFilter from "component/filter/product.filter";
import OrderFilter from "component/filter/order.filter";
import { searchVariantsRequestAction, variantUpdateAction } from "domain/actions/product/products.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  VariantImage,
  VariantResponse,
  VariantSearchQuery,
  VariantUpdateRequest,
} from "model/product/product.model";
import { CountryResponse } from "model/content/country.model";
import { ColorResponse } from "model/product/color.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { listColorAction } from "domain/actions/product/color.action";
import { ColorSearchQuery } from "model/product/color.model";
import { SizeResponse } from "model/product/size.model";
import { sizeGetAll } from "domain/actions/product/size.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { AccountGetListAction } from "domain/actions/account/account.action";
import {
  AccountResponse,
  AccountSearchQuery,
} from "model/account/account.model";
import UrlConfig from "config/UrlConfig";
import ButtonCreate from "component/header/ButtonCreate";
import ContentContainer from "component/container/content.container";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import ModalSettingColumn from "component/table/ModalSettingColumn";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa",
  },
  {
    id: 2,
    name: "Export",
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

var variantResponse: VariantResponse|null = null;

const ListOrderScreen: React.FC = () => {
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
  const isFirstLoad = useRef(true);
  const [showSettingColumn, setShowSettingColumn] = useState(false);
  const [listCountry, setCountry] = useState<Array<CountryResponse>>();
  const [listMainColor, setMainColor] = useState<Array<ColorResponse>>();
  const [listColor, setColor] = useState<Array<ColorResponse>>();
  const [listSize, setSize] = useState<Array<SizeResponse>>();
  const [listSupplier, setSupplier] = useState<Array<SupplierResponse>>();
  const [listMerchandiser, setMarchandiser] =
    useState<Array<AccountResponse>>();
  let dataQuery: VariantSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<VariantSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [columns, setColumn]  = useState<Array<ICustomTableColumType<VariantResponse>>>([
    {
      title: "ID đơn hàng",
      dataIndex: "sku",
      visible: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      visible: true,
    },
    {
      title: "Số điện thoại",
      dataIndex: "color",
      visible: true,
    },
    {
      title: "Khu vực",
      dataIndex: "size",
      visible: true,
    },
    {
      title: "Kho cửa hàng",
      dataIndex: "size",
      visible: true,
    },
    {
      title: "Nguồn đơn hàng",
      dataIndex: "size",
      visible: true,
    },
    {
      title: "Trạng thái đơn",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Đóng gói",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Xuất kho",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Thanh toán",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Tổng số lượng sản phẩm",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Khách cần phải trả",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Khách đã trả",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Còn phải trả",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Hình thức vận chuyển",
      dataIndex: "inventory",
      visible: true,
    },

    {
      title: "Phương thức thanh toán",
      dataIndex: "inventory",
      visible: true,
    },{
      title: "Nhân viên bán hàng",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Nhân viên tạo đơn",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Ngày hoàn tất đơn",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Ngày huỷ đơn",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Ghi chú nội bộ",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Ghi chú của khách",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Tag",
      dataIndex: "inventory",
      visible: true,
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "inventory",
      visible: true,
    }
  ]);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PRODUCT}?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);

  const setSearchResult = useCallback(
    (result: PageResponse<VariantResponse>|false) => {
      setTableLoading(false);
      if(!!result) {
        setData(result);
      }
    },
    []
  );

  const onSave = useCallback((variant_images: Array<VariantImage>) => {
    if(variantResponse !== null) {
      dispatch(showLoading());
      let variantRequet: VariantUpdateRequest = Products.converVariantResponseToRequest(variantResponse);
      variantRequet.variant_images = variant_images;
      dispatch(variantUpdateAction(variantResponse.id, variantRequet, (result) => {
        dispatch(hideLoading());
      }))
    }
  }, [dispatch]);
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);
  
  useEffect(() => {
    if (isFirstLoad.current) {
      dispatch(CountryGetAllAction(setCountry));
      dispatch(listColorAction(initMainColorQuery, setMainColor));
      dispatch(listColorAction(initColorQuery, setColor));
      dispatch(sizeGetAll(setSize));
      dispatch(SupplierGetAllAction(setSupplier));
      dispatch(AccountGetListAction(initAccountQuery, setMarchandiser));
      setTableLoading(true);
    }
    isFirstLoad.current = false;
    dispatch(searchVariantsRequestAction(params, setSearchResult));
  }, [dispatch, params, setSearchResult]);
  return (
    <ContentContainer
      title="Quản lý đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
         path: UrlConfig.HOME,
        },
        {
          name: "Danh sách đơn hàng",
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.ORDER}/create`} />}
    >
      <Card>
        <div className="padding-20">
        <OrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          params={params}
          listStatus={listStatus}
          listMerchandisers={listMerchandiser}
          listSize={listSize}
          listMainColors={listMainColor}
          listColors={listColor}
          listSupplier={listSupplier}
          listCountries={listCountry}
        />
        <CustomTable
          isRowSelection
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 4320 }}
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
          rowKey={(item: VariantResponse) => item.id}
        />
        </div>
      </Card>
      
      <ModalSettingColumn
          visible={showSettingColumn}
          onCancel={() => setShowSettingColumn(false)}
          onOk={(data) => {
            setShowSettingColumn(false);
            setColumn(data)
          }}
          data={columns}
        />
    </ContentContainer>
  );
};

export default ListOrderScreen;
