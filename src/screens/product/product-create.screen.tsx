import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Divider,
  Switch,
  Table,
  Space,
  Image,
} from 'antd';
import CustomEditor from 'component/custom-editor';
import UrlConfig from 'config/UrlConfig';
import {CountryGetAllAction} from 'domain/actions/content/content.action';
import {supplierGetAllAction} from 'domain/actions/core/supplier.action';
import {getCategoryRequestAction} from 'domain/actions/product/category.action';
import {colorSearchAll} from 'domain/actions/product/color.action';
import {materialSearchAll} from 'domain/actions/product/material.action';
import {sizeGetAll} from 'domain/actions/product/size.action';
import {CategoryView} from 'model/product/category.model';
import {RootReducerType} from 'model/reducers/RootReducerType';
import {SizeCreateRequest} from 'model/product/size.model';
import {CountryResponse} from 'model/content/country.model';
import {CategoryResponse} from 'model/product/category.model';
import {ColorResponse} from 'model/product/color.model';
import {MaterialResponse} from 'model/product/material.model';
import {SizeResponse} from 'model/product/size.model';
import {SupplierResponse} from 'model/core/supplier.model';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {convertCategory} from 'utils/AppUtils';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import CustomCard from 'component/custom/card.custom';
import CustomSelect from 'component/custom/select.custom';
import {VariantRequest} from 'model/product/product.model';

const {Option} = Select;
const {Item} = Form;
const ProductCreateScreen: React.FC = () => {
  //Hook
  const dispatch = useDispatch();
  const history = useHistory();
  //end hook
  //Get master data
  const isLoadMaterData = useRef(false);
  const productTypes = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const collectionList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.collection
  );
  const brandList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.brand
  );
  const productUnitList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_unit
  );
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  //End get master data
  //State
  const [colorSelected, setColorSelected] = useState<Array<ColorResponse>>([]);
  const [sizeSelected, setSizeSelected] = useState<Array<SizeResponse>>([]);
  const [variants, setVariants] = useState<Array<VariantRequest>>([]);
  //End State
  const formRef = createRef<FormInstance>();
  const [status, setStatus] = useState<string>('active');
  const statusValue = useMemo(() => {
    return 'Đang hoạt dộng';
  }, []);
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.SIZES);
  }, [history]);
  const onFinish = useCallback((values: SizeCreateRequest) => {}, []);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  //callback data
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  //end callback data
  const columns = [
    {
      title: 'Mã chi tiết',
      key: 'sku',
      dataIndex: 'sku',
    },
    {
      title: 'Tên sản phẩm',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: 'Mã màu',
      key: 'color',
      dataIndex: 'color',
    },
    {
      title: 'Size',
      key: 'size',
      dataIndex: 'size',
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      dataIndex: 'quantity',
      width: 100,
      render: (qty: string) => (
        <Input style={{textAlign: 'center'}} value={qty} />
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      render: (image: string) => (
        <Image
          width={40}
          height={40}
          src="error"
          fallback="data:image/png;base64,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"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      dataIndex: 'id',
      width: 100,
      render: (id: number) => <Button type="link" icon={<DeleteOutlined />} />,
    },
  ];
  const listVariantsFilter = useCallback((colors: Array<ColorResponse>, sizes: Array<SizeResponse>) => {
    let name = formRef.current?.getFieldValue('name');
    let width = formRef.current?.getFieldValue('width');
    let height = formRef.current?.getFieldValue('height');
    let length = formRef.current?.getFieldValue('length');
    let code = formRef.current?.getFieldValue('code');
    let length_unit = formRef.current?.getFieldValue('length_unit');
    let weight = formRef.current?.getFieldValue('weight');
    let weight_unit = formRef.current?.getFieldValue('weight_unit');
    if (name && code) {
      colors.forEach((i1) => {
        sizes.forEach((i2) => {
          let sku = `${code}-${i1.code}-${i2.code}`;
          let index = variants.findIndex((v) => v.sku === sku);
          if (index === -1) {
            variants.push({
              status: 'avtive',
              name: `${name} - ${i1.name} - ${i2.code}`,
              color_id: i1.id,
              size_id: i2.id,
              barcode: null,
              taxable: false,
              saleable: true,
              deleted: false,
              sku: sku,
              width: width,
              height: height,
              length: length,
              length_unit: length_unit,
              weight: weight,
              weight_unit: weight_unit,
              variant_prices: [],
              product: null,
              variant_images: null,
              inventory: 0,
            });
          }
        });
      });
    }
    setVariants([...variants]);
  }, [formRef, variants]);
  const onSizeChange = useCallback(
    (values: Array<number>) => {
      let filter = listSize.filter((item) => values.includes(item.id));
      setSizeSelected([...filter]);
      listVariantsFilter(colorSelected, filter);
    },
    [colorSelected, listSize, listVariantsFilter]
  );
  const onColorChange = useCallback(
    (values: Array<number>) => {
      let filter = listColor.filter((item) => values.includes(item.id));
      setColorSelected([...filter]);
      listVariantsFilter(filter, sizeSelected);
    },
    [listColor, listVariantsFilter, sizeSelected]
  );
    console.log(colorSelected);
  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(supplierGetAllAction(setListSupplier));
      dispatch(materialSearchAll(setListMaterial));
      dispatch(CountryGetAllAction(setListCountry));
      dispatch(sizeGetAll(setListSize));
      dispatch(colorSearchAll(setListColor));
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [dispatch, setDataCategory]);
  console.log(variants);
  return (
    <div>
      <Form ref={formRef} onFinish={onFinish} layout="vertical">
        <Card
          title="Thông tin cơ bản"
          extra={[
            <Space key="a" size={15}>
              <label className="text-default">Trạng thái</label>
              <Switch className="ant-switch-success" defaultChecked />
              <label className="text-success">Đang hoạt động</label>
            </Space>,
          ]}
        >
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn loại sản phẩm',
                    },
                  ]}
                  name="product_type"
                  label="Loại sản phẩm"
                >
                  <Select placeholder="Chọn loại sản phẩm ">
                    {productTypes?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn loại sản phẩm',
                    },
                  ]}
                  name="goods"
                  label="Ngành hàng"
                >
                  <Select placeholder="Chọn ngành hàng ">
                    {goods?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng chọn danh mục',
                    },
                  ]}
                  name="category_id"
                  label="Danh mục"
                >
                  <CustomSelect
                    placeholder="Chọn danh mục"
                    suffix={
                      <Button
                        style={{width: 36, height: 36}}
                        icon={<PlusOutlined />}
                      />
                    }
                  >
                    {listCategory.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="collections" label="Bộ sưu tập">
                  <Select mode="multiple" placeholder="Chọn bộ sưu tập">
                    {collectionList?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập mã sản phẩm',
                    },
                  ]}
                  name="code"
                  label="Mã sản phẩm"
                >
                  <Input placeholder="Nhập mã sản phẩm" />
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập tên sản phẩm',
                    },
                  ]}
                  name="name"
                  label="Tên sản phẩm"
                >
                  <Input
                    placeholder="Nhập tên sản phẩm"
                  />
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item
                  label="Kích thước (dài, rộng, cao)"
                  required
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input.Group compact>
                    <Item noStyle>
                      <Input
                        style={{width: 'calc((100% - 90px) / 3)'}}
                        placeholder="Dài"
                      />
                    </Item>
                    <Item noStyle>
                      <Input
                        style={{width: 'calc((100% - 90px) / 3)'}}
                        placeholder="Rộng"
                      />
                    </Item>
                    <Item noStyle>
                      <Input
                        placeholder="Cao"
                        style={{width: 'calc((100% - 90px) / 3)'}}
                      />
                    </Item>
                    <Item noStyle>
                      <Select style={{width: '90px'}} value="cm">
                        <Option value="cm">cm</Option>
                      </Select>
                    </Item>
                  </Input.Group>
                </Item>
              </Col>
              <Col md={8}>
                <Item
                  label="Khối lượng"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input.Group compact>
                    <Item noStyle>
                      <Input
                        placeholder="Khối lượng"
                        style={{width: 'calc(100% - 90px)'}}
                      />
                    </Item>
                    <Item noStyle>
                      <Select style={{width: '90px'}} value="gram">
                        <Option value="gram">gram</Option>
                      </Select>
                    </Item>
                  </Input.Group>
                </Item>
              </Col>
            </Row>

            <Divider orientation="left">Thông tin khác</Divider>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="tags" label="Từ khóa">
                  <Input placeholder="Nhập từ khóa" />
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="unit" label="Đơn vị">
                  <Select placeholder="Chọn đơn vị">
                    {productUnitList?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="suppplier_id" label="Nhà cung cấp">
                  <Select placeholder="Chọn nhà cung cấp">
                    {listSupplier?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="brand" label="Thương hiệu">
                  <Select placeholder="Chọn thương hiệu">
                    {brandList?.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="suppplier_id" label="Xuất xứ">
                  <Select placeholder="Chọn xuất xứ">
                    {listCountry?.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="brand" label="Chất liệu">
                  <Select placeholder="Chọn chất liệu">
                    {listMaterial?.map((item) => (
                      <Option key={item.id} value={item.name}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Item>
              </Col>
            </Row>
            <Button type="link" className="padding-0" icon={<MinusOutlined />}>
              Mô tả sản phẩm
            </Button>
            <Row gutter={50}>
              <Col span={50}>
                <Item name="description">
                  <CustomEditor />
                </Item>
              </Col>
            </Row>
          </div>
        </Card>
        <CustomCard title="Thông tin giá" collapse className="margin-top-20">
          <div className="padding-20">
            <Row gutter={16}>
              <Col md={4}>
                <Item
                  label="Giá bán"
                  required
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input placeholder="VD: 100,000" />
                </Item>
              </Col>
              <Col md={4}>
                <Item
                  label="Giá buôn"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input placeholder="VD: 100,000" />
                </Item>
              </Col>
              <Col md={4}>
                <Item
                  label="Giá nhập"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input placeholder="VD: 100,000" />
                </Item>
              </Col>
              <Col md={4}>
                <Item
                  label="Đơn vị tiền tệ"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Select value="VND">
                    <Select.Option value="VND">VND</Select.Option>
                  </Select>
                </Item>
              </Col>
              <Col md={4}>
                <Item
                  label="Thuế"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input placeholder="VD: 10" suffix={<span>%</span>} />
                </Item>
              </Col>
              <Col md={4} style={{display: 'flex', alignItems: 'center'}}>
                <Button icon={<DeleteOutlined />} />
              </Col>
            </Row>
            <Button type="link" className="padding-0" icon={<PlusOutlined />}>
              Thêm mới
            </Button>
          </div>
        </CustomCard>
        <Row gutter={24} className="margin-top-20">
          <Col md={12}>
            <CustomCard
              defaultopen={false}
              title="Thông tin chi tiết sản phẩm"
              collapse
            >
              <div className="padding-20">
                <Item
                  label="Chi tiết thông số"
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Input placeholder="Điền chi tiết thông số" />
                </Item>
                <Button
                  type="link"
                  className="padding-0"
                  icon={<MinusOutlined />}
                >
                  Thông tin bảo quản
                </Button>
                <Row className="margin-top-20">
                  <Col md={24}>
                    <CustomEditor />
                  </Col>
                </Row>
              </div>
            </CustomCard>
          </Col>
          <Col md={12}>
            <CustomCard defaultopen={false} title="R&D" collapse>
              <div className="padding-20">
                <Item
                  label="Merchandiser"
                  required
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Select placeholder="Chọn Merchandiser"></Select>
                </Item>
                <Item
                  label="Thiết kế"
                  required
                  tooltip={{title: 'Tooltip', icon: <InfoCircleOutlined />}}
                >
                  <Select placeholder="Chọn thiết kế"></Select>
                </Item>
              </div>
            </CustomCard>
          </Col>
        </Row>
        <CustomCard
          title="Quản lý thuộc tính"
          collapse
          className="margin-top-20"
          defaultopen={true}
        >
          <div className="padding-20">
            <Row gutter={50}>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item label="Màu sắc" name="color_id">
                  <CustomSelect
                    style={{width: 'calc((100% - 36px)'}}
                    notFoundContent={'Không có dữ liệu'}
                    showSearch
                    mode="multiple"
                    maxTagCount={'responsive'}
                    showArrow
                    onChange={onColorChange}
                    placeholder="Chọn màu sắc"
                    suffix={
                      <Button
                        style={{width: 36, height: 36}}
                        icon={<PlusOutlined />}
                      />
                    }
                  >
                    {listColor?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={50} lg={8} md={12} sm={50}>
                <Item name="size" label="Kích cỡ">
                  <CustomSelect
                    onChange={onSizeChange}
                    notFoundContent={'Không có dữ liệu'}
                    placeholder="Chọn kích cỡ"
                    maxTagCount={'responsive'}
                    mode="multiple"
                    showSearch
                    suffix={
                      <Button
                        style={{width: 36, height: 36}}
                        icon={<PlusOutlined />}
                      />
                    }
                  >
                    {listSize?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.code}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
            </Row>
          </div>
        </CustomCard>
        <CustomCard
          title="Danh sách mã"
          defaultopen
          collapse
          className="margin-top-20"
        >
          <div className="padding-20">
            <Table
              dataSource={variants}
              columns={columns}
              rowKey={(item) => item.sku}
              pagination={false}
            />
          </div>
        </CustomCard>
        <div className="margin-top-10" style={{textAlign: 'right'}}>
          <Space size={12}>
            <Button onClick={onCancel}>Huỷ</Button>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default ProductCreateScreen;
