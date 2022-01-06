import {
  Space,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
} from 'antd';
import TextArea from "antd/es/input/TextArea"; 
import React, {
  createRef,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router';
import {
  CollectionCreateRequest,
  CollectionResponse,
} from 'model/product/collection.model';
import ContentContainer from 'component/container/content.container';
import UrlConfig, { BASE_NAME_ROUTER } from 'config/url.config';
import {RegUtil} from 'utils/RegUtils';
import { showSuccess } from 'utils/ToastUtils';
import imgDefIcon from "assets/img/img-def.svg";
import BottomBarContainer from 'component/container/bottom-bar.container'; 
import { createCollectionAction } from 'domain/actions/product/collection.action';
import PlusOutline from "assets/icon/plus-outline.svg";
import CustomAutoComplete from 'component/custom/autocomplete.cusom';
import { PageResponse } from 'model/base/base-metadata.response';
import { ProductResponse, VariantResponse } from 'model/product/product.model';
import ProductItem from 'component/custom/ProductItem';
import { SearchOutlined } from '@ant-design/icons';
import { LineItem } from 'model/inventory/transfer';
import _ from 'lodash';
import { inventoryGetVariantByStoreAction } from 'domain/actions/inventory/stock-transfer/stock-transfer.action';
import PickManyProductModal from 'component/modal/PickManyProductModal';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import { Link } from 'react-router-dom';
import { ConvertUtcToLocalDate } from 'utils/DateUtils';
import { formatCurrency } from 'utils/AppUtils';

let initialRequest: CollectionCreateRequest = {
  code: '',
  name: '',
}; 

const AddCollection: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>(); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [keySearch, setKeySearch] = useState<string>("");
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [dataTable, setDataTable] = useState<Array<LineItem> | any>(
    [] as Array<LineItem>
  );
  const [searchProduct, setSearchProduct] = useState<Array<LineItem>>(
    [] as Array<LineItem>
  );

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: 60,
      render: (value: string, record: VariantResponse, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      render: (record: ProductResponse) => {
        let url = null;
        record.variants.forEach((item) => {
          item.variant_images.forEach((item1) => {
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
      title: "Sản phẩm",
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
  ];  

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
    showSuccess('Thêm nhóm hàng thành công');
    history.push(`${UrlConfig.COLLECTIONS}`);
  }, [history]);

  const onFinish = useCallback(
    (values: CollectionCreateRequest) => {
      setLoading(true);
      dispatch(createCollectionAction(values, onSuccess));
      setLoading(false);
    },
    [dispatch, onSuccess]
  );  

  const onPickManyProduct = (result: Array<ProductResponse>) => {
    const newResult = result?.map((item) => {
      return {
        ...item,
      };
    });
    const dataTemp = [...dataTable, ...newResult];

    const arrayUnique = [...new Map(dataTemp.map((item) => [item.id, item])).values()];

    setIsLoadingTable(true);
    setDataTable(arrayUnique);
    setSearchProduct(arrayUnique);
    setIsLoadingTable(false);
    setVisibleManyProduct(false);
  };

  const onEnterFilterProduct = useCallback(
    (key: string) => {
      key = key ? key.toLocaleLowerCase() : "";
      let temps = [...dataTable];

      let dataSearch = [
        ...temps.filter((e: ProductResponse) => {
          return (
            e.name?.toLocaleLowerCase().includes(key) ||
            e.code?.toLocaleLowerCase().includes(key) 
          );
        }),
      ];

      setSearchProduct(dataSearch);
    },
    [dataTable]
  );

  const debounceSearchVariant = useMemo(()=>
  _.debounce((code: string)=>{
    onEnterFilterProduct(code);
 }, 300),
 [onEnterFilterProduct]
 );

  const onChangeKeySearch = useCallback((code)=>{
    debounceSearchVariant(code);
  },[debounceSearchVariant]); 

  const onSelectProduct = useCallback((value: string) => {
    const dataTemp = [...dataTable];
    const selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );

    if (!dataTemp.some((variant: VariantResponse) => variant.id === selectedItem.id)) {

      setDataTable((prev: Array<LineItem>) =>
        prev.concat([{...selectedItem, variant_name: selectedItem.name}])
      );
      setSearchProduct((prev: Array<LineItem>) =>
        prev.concat([{...selectedItem, variant_name: selectedItem.name}])
      );
    } 
  },[dataTable,resultSearch]);

  const onSearchProduct = (value: string) => {
    dispatch(
      inventoryGetVariantByStoreAction(
        {
          status: "active",
          limit: 10,
          page: 1,
          info: value.trim(),
        },
        setResultSearch
      )
    );
  };

  return (
    <ContentContainer
      title="Thêm mới nhóm hàng"
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
          name: 'Thêm nhóm hàng',
        },
      ]}
    >
      <Form
        ref={formRef}
        onFinish={onFinish}
        initialValues={initialRequest}
        layout="vertical"
      >
        <Card>
          <Row gutter={50}>
            <Col span={12}>
              <Form.Item
                rules={[
                  {max: 500, message: "Không được nhập quá 500 ký tự"},
                  {required: true, message: 'Vui lòng nhập tên nhóm hàng'},
                  {pattern: RegUtil.STRINGUTF8, message: 'Tên nhóm hàng không gồm kí tự đặc biệt'},
                ]}
                label="Tên nhóm hàng"
                name="name"
              >
                <Input placeholder="Nhập tên nhóm hàng" maxLength={255} />
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
        <Card title="Thông tin sản phẩm" bordered={false}>
          <Input.Group className="display-flex">
             <CustomAutoComplete
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
                   onClick={onChangeKeySearch}
                   style={{color: "#2A2A86"}}
                 />
               }
             />
            </Input.Group>
              <CustomTable
                bordered
                style={{marginTop: 20}}
                rowClassName="product-table-row"
                tableLayout="fixed"
                scroll={{y: 300}}
                columns={defaultColumns}
                pagination={false}
                loading={isLoadingTable}
                dataSource={
                  searchProduct && (searchProduct.length > 0 || keySearch !== "")
                    ? searchProduct
                    : dataTable
                }
              />
        </Card>
        {visibleManyProduct && (
              <PickManyProductModal
              selected={dataTable}
              onSave={onPickManyProduct}
              onCancel={() => setVisibleManyProduct(false)}
              visible={visibleManyProduct}
            />
          )}

        <BottomBarContainer
          back={"Quay lại danh sách"}
          rightComponent={
            <Space>
              <Button loading={loading} htmlType="submit" type="primary">
                Tạo nhóm hàng
              </Button>
            </Space>
          }
        /> 
      </Form>
    </ContentContainer>
  );
}; 

export default AddCollection;
