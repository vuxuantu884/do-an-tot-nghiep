import { Card, Image } from "antd";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import { VariantSearchQuery } from "model/query/Variant.search.query";
import { PageResponse } from "model/response/base-metadata.response";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { useDispatch, useSelector } from "react-redux";
import ProductFilter from "component/filter/product.filter";
import {searchVariantsRequestAction} from "domain/actions/product/products.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import CustomTable from "component/table/CustomTable";
import { CategoryView } from "model/other/category-view";
import { VariantResponse } from "model/response/products/variant.response";
import { CountryResponse } from "model/response/content/country.response";
import { ColorResponse } from "model/response/products/color.response";
import { SupplierResposne } from "model/response/supplier/supplier.response";
import { AccountDetailResponse } from "model/response/accounts/account-detail.response";
import {getCountry} from "domain/actions/content/content.action"
import {getMaterialAction} from "domain/actions/product/color.action"
import {ColorSearchQuery} from "model/query/color.search.query"
import { SizeResponse } from "model/response/products/size.response";


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
};

const initMainColorQuery: ColorSearchQuery = {
  page:0,
  is_main_color:true,
  limit:1000
}
const initColorQuery: ColorSearchQuery = {
  page:0,
  is_main_color:false,
  limit:1000
}
const ListSupplierScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const listBrands = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.brand;
  });
  const listStatus = useSelector((state: RootReducerType) => {
    return state.bootstrapReducer.data?.variant_status;
  });
  const isFirstLoad=useRef(true);
  const [listCountry,setCountry]= useState<Array<CountryResponse>>();
  const [listMainColor,setMainColor]= useState<Array<ColorResponse>>();
  const [listColor,setColor]= useState<Array<ColorResponse>>();
  const [listSize,setSize]= useState<Array<SizeResponse>>();
  const [listSupplier,setSupplier]= useState<Array<SupplierResposne>>();
  const [listMerchandiser,setMarchandiser]= useState<Array<AccountDetailResponse>>();
  let dataQuery: VariantSearchQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<VariantSearchQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const columns = [
    // {
    //   title: "Ảnh",
    //   render: (value: VariantResponse) => {
    //     value.variant_images.map((item, index) => {
    //       if (item.variant_avatar) {
    //         return  <Image src="" width={100} />;
    //       }
    //     });
    //   }
    // },
    {
      title: "Mã sản phẩm",
      render: (value: VariantResponse) => {
        return <Link to="#">{value.sku}</Link>;
      }
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
    },
    {
      title: "Size",
      dataIndex: "size",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
    },
    {
      title: "Nhà thiết kế",
      render: (value: VariantResponse) => (
       <div> {value.product.designer}</div>
      )
    },
    {
      title: "Merchandiser",
      render: (value: VariantResponse) => (
<div> {value.product.merchandiser}</div>
      )
      
    },
    {
      title: "Tồn có thể bán",
      dataIndex: "inventory",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (value: string, row: VariantResponse) => (
        <div
          className={
            row.status === "active" ? "status-active" : "status-not-active"
          }
        >
          {value}
        </div>
      ),
    },
    {
      title: () => <ButtonSetting />,
      width: 70,
    }
  ];
  const onPageSizeChange = useCallback(
    (size: number) => {
      params.limit = size;
      params.page = 0;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`/products?${queryParam}`);
    },
    [history, params]
  );
  const onPageChange = useCallback(
    (page) => {
      params.page = page - 1;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`/products?${queryParam}`);
    },
    [history, params]
  );
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 0 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`/products?${queryParam}`);
    },
    [history, params]
  );
  const onMenuClick = useCallback((index: number) => {}, []);
  useEffect(() => {
    if(isFirstLoad){
      dispatch(getCountry( setCountry)); 
      dispatch(getMaterialAction(initMainColorQuery,setMainColor)); 
      dispatch(getMaterialAction(initColorQuery,setColor)); 
    }
    isFirstLoad.current=false;
    dispatch(searchVariantsRequestAction(params, setData));
  }, [dispatch, params]);
  return (
    <div>
      <Card className="contain">
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
        />
        <CustomTable
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          className="yody-table"
          pagination={data.metadata}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: CategoryView) => item.id}
        />
      </Card>
    </div>
  );
};

export default ListSupplierScreen;
