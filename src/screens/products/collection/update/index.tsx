import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
} from 'antd';

import TextArea from "antd/es/input/TextArea"; 
import {
  collectionDetailAction,
  getProductsCollectionAction,
  updateProductsCollectionAction,
} from 'domain/actions/product/collection.action';
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router';
import {
  CollectionUpdateRequest,
  CollectionResponse,
} from 'model/product/collection.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig, { BASE_NAME_ROUTER } from 'config/url.config';
import { RegUtil } from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';
import AuthWrapper from 'component/authorization/AuthWrapper';
import { ProductPermission } from 'config/permissions/product.permission';
import BottomBarContainer from 'component/container/bottom-bar.container';
import ModalConfirm, { ModalConfirmProps } from 'component/modal/ModalConfirm';
import { CompareObject } from 'utils/CompareObject';
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm';
import PickManyProductModal from 'component/modal/PickManyProductModal';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import { ProductResponse, VariantResponse } from 'model/product/product.model';
import CustomAutoComplete from 'component/custom/autocomplete.cusom';
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import PlusOutline from "assets/icon/plus-outline.svg";
import { PageResponse } from 'model/base/base-metadata.response';
import imgDefIcon from "assets/img/img-def.svg";
import ProductItem from 'component/custom/ProductItem';
import { searchProductWrapperRequestAction } from 'domain/actions/product/products.action';
import { Link } from 'react-router-dom';
import { ConvertUtcToLocalDate } from 'utils/DateUtils';
import { formatCurrency } from 'utils/AppUtils';
import _ from 'lodash';
import { dangerColor } from 'utils/global-styles/variables';
import CustomPagination from 'component/table/CustomPagination';
import { callApiNative } from 'utils/ApiUtils';
import { updateCollectionApi } from 'service/product/collection.service';

type CollectionParam = {
  id: string;
};

const GroupUpdate: React.FC = () => {
  const {id} = useParams<CollectionParam>();
  let idNumber = parseInt(id);

  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>(); 
  const [detail, setDetail] = useState<CollectionResponse | null>(null);
  const [isError, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const isFirstLoad = useRef(true); 
  const [keySearch, setKeySearch] = useState<string>("");
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [resultSearch, setResultSearch] = useState<PageResponse<ProductResponse> | any>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<number>>([]);
  const [selected, setSelected] = useState<Array<ProductResponse>>([]);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [loadingSearchProduct,setLoadingSearchProduct] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  }); 
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false); 
  const [dataProductItem, setDataProductItem] = useState<PageResponse<ProductResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: ProductResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const onSuccess = useCallback((result: CollectionResponse) => {
    if (result) {
      setDetail(result);
      formRef.current?.setFieldsValue(result);
      showSuccess('Sửa nhóm hàng thành công');
      history.push(`${UrlConfig.COLLECTIONS}`);
    }
  }, [history, formRef]);
  const onFinish = useCallback(
    async (values: CollectionUpdateRequest) => {
      setLoading(true);
      const res = await callApiNative({isShowLoading:false},dispatch,updateCollectionApi,idNumber.toString(),values);
      if (res) {
        onSuccess(res);
      } 
      setLoading(false);
    },
    [dispatch, idNumber, onSuccess]
  ); 

  const onGetDetailSuccess = useCallback((data: false|CollectionResponse) => {
    setLoadingData(false)
    if(!data) {
      setError(true);
    } else {
      setDetail(data);
    }
  }, []);

  const backAction = ()=>{ 
    if (!CompareObject(formRef.current?.getFieldsValue(),detail)) {
      setModalConfirm({
        visible: true,
        onCancel: () => {
          setModalConfirm({visible: false});
        },
        onOk: () => { 
          setModalConfirm({visible: false});
          history.goBack();
        },
        title: "Bạn có muốn quay lại?",
        subTitle:
          "Sau khi quay lại thay đổi sẽ không được lưu.",
      }); 
    }else{
      history.goBack();
    }
  };

  const onSearchProduct = (value: string) => {
    setLoadingSearchProduct(true);
    dispatch(
      searchProductWrapperRequestAction(
        {
          status: "active",
          limit: 10,
          page: 1,
          info: value.trim(),
        },
        (res)=>{
          setLoadingSearchProduct(false);
          setResultSearch(res);
        }
      )
    );
  }; 

  const ActionComponent = useMemo( 
    () => {
      let Compoment = () => <span>Sản phẩm</span>;
      if (selected?.length > 0) {
        Compoment = () => (
          <div>
            {`Đã chọn ${selected.length} `}
            <Button icon={<DeleteOutlined/>} type='default' style={{color: dangerColor, paddingLeft: 5,paddingRight: 5}} onClick={()=>{setConfirmDelete(true)}}>
              Xóa
            </Button>
          </div>
        );
      }
      return <Compoment />;
  },[selected]);

  const defaultColumns: Array<ICustomTableColumType<ProductResponse>> = useMemo(()=>{ 
    return [
      {
        title: "Ảnh",
        width: "60px",
        render: (record: ProductResponse) => {
          let url = null;
          record.variants.forEach((item) => {
            item.variant_images?.forEach((item1) => {
              if (item1.product_avatar) {
                url = item1.url;
              }
            });
          });
          return (
            <div className="product-item-image">
              <img src={!url ? imgDefIcon : url} alt="" className="" />
            </div>
          );
        },
      },
      {
        title: ActionComponent,
        className: "ant-col-info",
        dataIndex: "name",
        render: (value: string, record: ProductResponse, index: number) => {
          return (
            <div>
              <div>
                <div className="product-item-sku">
                  <Link
                    target="_blank"
                    to={`${UrlConfig.PRODUCT}/${record.id}`}
                  >
                    {record.code}
                  </Link>
                </div>
                <div className="product-item-name">
                  <span className="product-item-name-detail">{value}</span>
                </div>
              </div>
            </div>
          );
        },
      }, 
      {
        align: "right",
        title: "SL Phiên bản",
        dataIndex: "variants",
        width: 120,
        render: (value: Array<VariantResponse>) => (
          <>
            <div>{value ? formatCurrency(value.length,".") : ""}</div>
          </>
        ),
        visible: true,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        align: "center",
        width: 150,
        render: (value: string, row: ProductResponse) => (
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
        render: (value) => ConvertUtcToLocalDate(value, "DD/MM/YYYY"),
        width: 120,
        visible: true,
      },
    ]
  },[ActionComponent]);       

const onSelectedChange = useCallback(
  (selectedRow: Array<ProductResponse>) => {
    const selectedRowKeys = selectedRow.filter(e=>e !==undefined).map((row) => row.id);
    setSelectedRowKeys(selectedRowKeys);

    setSelected(
      selectedRow.filter(function (el) {
        return el !== undefined;
      })
    );
  },
  []
);

const onResulProduct = useCallback(
  (result: PageResponse<ProductResponse>) => {
    if (result) {
      setDataProductItem({...result});
    }
    setTableLoading(false);
  },
  []
);

const getProductCollection = useCallback((key,page,size)=>{
  setTableLoading(true);
    dispatch(
      getProductsCollectionAction(
        {
          status: "active",
          limit: size,
          page: page,
          collections: detail?.code,
          info: (key || key ==="")  ? key.trim() : keySearch?.trim(),
        },
        onResulProduct
      )
    );
},[onResulProduct, dispatch, keySearch, detail]);

const onResultUpdateProduct = useCallback((res)=>{
  setTableLoading(false);
  if (res) {
    dispatch(collectionDetailAction(idNumber, onGetDetailSuccess));
    getProductCollection(null,dataProductItem.metadata.page,dataProductItem.metadata.limit);
  }
},[dispatch,idNumber,onGetDetailSuccess, dataProductItem, getProductCollection]);

const onSelectProduct = useCallback((value: string) => {
  setTableLoading(true);

    if (detail && detail.code) {
      let request= {
        ...formRef.current?.getFieldsValue(),
        collection_code: detail.code,
        add_product_ids: [parseInt(value)],
        remove_product_ids: []
      } as CollectionUpdateRequest;
  
     dispatch(updateProductsCollectionAction(request, onResultUpdateProduct))
    }
  
},[dispatch, onResultUpdateProduct, detail, formRef]); 

const onEnterFilterProduct = useCallback(
  (key: string) => {
    getProductCollection(key,dataProductItem.metadata.page,dataProductItem.metadata.limit);
  },
  [dataProductItem, getProductCollection]
);

const debounceSearchVariant = useMemo(()=>
_.debounce((code: string)=>{
  onEnterFilterProduct(code);
}, 300),
[onEnterFilterProduct]
);

const onPickManyProduct = useCallback((result: Array<ProductResponse>) => {
  const products = result?.map((item) => item.id);

  if (detail && detail.code) {
    let request= {
      ...formRef.current?.getFieldsValue(),
      collection_code: detail.code,
      add_product_ids: products,
      remove_product_ids: []
    } as CollectionUpdateRequest;

   dispatch(updateProductsCollectionAction(request, onResultUpdateProduct))
    
    setVisibleManyProduct(false);   
  }
},[detail,dispatch, formRef, onResultUpdateProduct]);

const onClickDelete = useCallback(()=>{
  setTableLoading(true);

  if (detail && detail.code) {
    let request= {
      ...formRef.current?.getFieldsValue(),
      collection_code: detail.code,
      add_product_ids: [],
      remove_product_ids: selectedRowKeys
    } as CollectionUpdateRequest;

   dispatch(updateProductsCollectionAction(request, onResultUpdateProduct))
  }
  showSuccess("Xóa thành công");
  setSelectedRowKeys([]);
  setSelected([]);
  setConfirmDelete(false); 
},[selectedRowKeys, detail, formRef, dispatch, onResultUpdateProduct]);

const onPageChange = useCallback(
  (page, size) => {
    setDataProductItem({
      ...dataProductItem,
      metadata: {...dataProductItem.metadata, page: page, limit: size},
    });
    getProductCollection(null, page,size);
  },
  [dataProductItem, getProductCollection]
);

const onChangeKeySearch = useCallback((code)=>{
  debounceSearchVariant(code);
},[debounceSearchVariant]); 

useEffect(() => {
  if (isFirstLoad.current) {
    if (!isNaN(idNumber)) {
      dispatch(collectionDetailAction(idNumber, onGetDetailSuccess));
    } else {
      setError(true);
    }
  }
  isFirstLoad.current = false;
}, [dispatch, idNumber, onGetDetailSuccess]);

useEffect(()=>{
  if (detail && detail.code) {
    getProductCollection(null,1,30);
   }
},[detail,getProductCollection])

  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title="Sửa nhóm hàng"
      breadcrumb={[
        {
          name: 'Tổng quan',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Nhóm hàng',
          path: `${UrlConfig.COLLECTIONS}`,
        },
        {
          name: detail!== null ? detail.name : '',
        },
      ]}
    >
      {detail !== null && (
        <Form
          ref={formRef}
          onFinish={onFinish}
          initialValues={detail}
          layout="vertical"
        >
          <Card>
            <Row gutter={50}>
              <Col span={12}>
                <Form.Item name="version" hidden></Form.Item>
                <Form.Item
                  rules={[
                    {max: 500, message: "Không được nhập quá 500 ký tự"},
                    {required: true, message: 'Vui lòng nhập tên nhóm hàng'},
                    {pattern: RegUtil.STRINGUTF8, message: 'Tên nhóm hàng không gồm kí tự đặc biệt'},
                  ]}
                  label="Tên nhóm hàng"
                  name="name"
                >
                  <Input placeholder="Nhập nhóm hàng" maxLength={255} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  name="description"
                  label="Mô tả"
                  rules={[{max: 500, message: "Không được nhập quá 500 ký tự"}]}
                >
                  <TextArea placeholder="Mô tả nhóm hàng" autoSize={{minRows: 1, maxRows: 1}} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title="Thông tin sản phẩm" bordered={false} className='product'>
            <Input.Group className="display-flex">
             <CustomAutoComplete
               loading={loadingSearchProduct}
               dropdownClassName="product"
               placeholder="Thêm sản phẩm vào nhóm hàng"
               onSearch={onSearchProduct}
               dropdownMatchSelectWidth={456}
               style={{width: "100%"}}
               showAdd={true}
               textAdd="Thêm mới sản phẩm"
               onSelect={onSelectProduct}
               options={renderResult}
               ref={productSearchRef}
               onClickAddNew={() => {
                 window.open(
                   `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                   "_blank"
                 );
               }}
             />
             <Button
               onClick={() => {
                 setVisibleManyProduct(true);
               }}
               style={{width: 132, marginLeft: 10}}
               icon={<img src={PlusOutline} alt="" />}
             >
               &nbsp;&nbsp; Chọn nhiều
             </Button>
             <Input
               name="key_search"
               value={keySearch}
               onChange={(e) => {
                 setKeySearch(e.target.value);
                 onChangeKeySearch(e.target.value);
               }} 
               style={{marginLeft: 8}}
               placeholder="Tìm kiếm sản phẩm trong phiếu"
               addonAfter={
                 <SearchOutlined
                   onClick={()=>{
                    onChangeKeySearch(null);
                   }}
                   style={{color: "#2A2A86"}}
                 />
               }
             />
            </Input.Group>
              <CustomTable
                isLoading={tableLoading}
                isRowSelection
                bordered
                style={{marginTop: 20}}
                rowClassName="product-table-row"
                tableLayout="fixed"
                scroll={{y: 300}}
                columns={defaultColumns}
                dataSource={dataProductItem.items}
                onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
                rowKey={(item: ProductResponse) => item.id}
                pagination={false}
              />
              <CustomPagination
               pagination={{
                showSizeChanger: true,
                pageSize: dataProductItem.metadata.limit,
                current: dataProductItem.metadata.page,
                total: dataProductItem.metadata.total,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
               />
          </Card>
          <PickManyProductModal
            selected={dataProductItem.items}
            onSave={onPickManyProduct}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
          />
          <ModalDeleteConfirm
            onCancel={() => setConfirmDelete(false)}
            onOk={onClickDelete}
            title="Bạn chắc chắn xóa sản phẩm?" 
            visible={isConfirmDelete}
          />
          <BottomBarContainer
            back={"Quay lại danh sách"}
            backAction={backAction}
            rightComponent={
              <AuthWrapper acceptPermissions={[ProductPermission.categories_update]}>
                <Button loading={loading} htmlType="submit" type="primary">
                  Lưu lại
                </Button>
              </AuthWrapper>
            }
          /> 
        </Form>
      )} 
      <ModalConfirm {...modalConfirm} />
    </ContentContainer>
  );
}; 

export default GroupUpdate;
