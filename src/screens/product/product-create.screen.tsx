import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Switch,
} from "antd";
import CustomEditor from "component/custom-editor";
import UrlConfig from "config/UrlConfig";
import { countryGetAction } from "domain/actions/content/content.action";
import { supplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { colorSearchAll } from "domain/actions/product/color.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { CategoryView } from "model/other/Product/category-view";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SizeCreateRequest } from "model/request/size.request";
import { CategoryResponse } from "model/response/category.response";
import { CountryResponse } from "model/response/content/country.response";
import { MaterialResponse } from "model/response/product/material.response";
import { ColorResponse } from "model/response/products/color.response";
import { SizeResponse } from "model/response/products/size.response";
import { SupplierResponse } from "model/response/supplier/supplier.response";
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { convertCategory } from "utils/AppUtils";

const { Option } = Select;
const { Item } = Form;
const { Panel } = Collapse;
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

  const formRef = createRef<FormInstance>();
  const [status, setStatus] = useState<string>("active");
  const statusValue = useMemo(() => {
    return "Đang hoạt dộng";
  }, []);
  const onSuccess = useCallback(() => {
    history.push(UrlConfig.SIZES);
  }, [history]);
  const onFinish = useCallback((values: SizeCreateRequest) => {}, []);
  const onSave = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  //callback data
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  //end callback data

  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(supplierGetAllAction(setListSupplier));
      dispatch(materialSearchAll(setListMaterial));
      dispatch(countryGetAction(setListCountry));
      dispatch(sizeGetAll(setListSize));
      dispatch(colorSearchAll(setListColor));
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [dispatch, setDataCategory]);

  return (
    <div>
      <Form ref={formRef} onFinish={onFinish} layout="vertical">
        <Card
          className="card-block card-block-normal"
          title="Thông tin cơ bản"
          extra={
            <div className="v-extra d-flex align-items-center">
              Trạng thái
              <Switch className="ip-switch" defaultChecked />
              <span
                style={{ color: status === "active" ? "#27AE60" : "red" }}
                className="t-status"
              >
                {statusValue}
              </span>
              <Item noStyle name="status" hidden>
                <Input value={status} />
              </Item>
            </div>
          }
        >
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại sản phẩm",
                  },
                ]}
                className="form-group form-group-with-search"
                name="product_type"
                label="Loại sản phẩm"
              >
                <Select className="selector" placeholder="Chọn loại sản phẩm ">
                  {productTypes?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại sản phẩm",
                  },
                ]}
                className="form-group form-group-with-search"
                name="goods"
                label="Ngành hàng"
              >
                <Select className="selector" placeholder="Chọn ngành hàng ">
                  {goods?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn danh mục",
                  },
                ]}
                className="form-group form-group-with-search"
                name="category_id"
                label="Danh mục"
              >
                <Select placeholder="Chọn danh mục" className="selector">
                  {listCategory.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="collections"
                label="Bộ sưu tập"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn bộ sưu tập"
                  className="selector"
                >
                  {collectionList?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã sản phẩm",
                  },
                ]}
                className="form-group form-group-with-search"
                name="code"
                label="Mã sản phẩm"
              >
                <Input
                  className="r-5"
                  placeholder="Nhập mã sản phẩm"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên sản phẩm",
                  },
                ]}
                className="form-group form-group-with-search"
                name="name"
                label="Tên sản phẩm"
              >
                <Input
                  placeholder="Nhập tên sản phẩm"
                  className="r-5"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className="title-rule">
            <div className="title">Thông tin khác</div>
            <div className="rule" />
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="tags"
                label="Từ khóa"
              >
                <Input
                  className="r-5"
                  placeholder="Nhập từ khóa"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="unit"
                label="Đơn vị"
              >
                <Select placeholder="Chọn đơn vị" className="selector">
                  {productUnitList?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="suppplier_id"
                label="Nhà cung cấp"
              >
                <Select placeholder="Chọn nhà cung cấp" className="selector">
                  {listSupplier?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="brand"
                label="Thương hiệu"
              >
                <Select placeholder="Chọn thương hiệu" className="selector">
                  {brandList?.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="suppplier_id"
                label="Xuất xứ"
              >
                <Select placeholder="Chọn xuất xứ" className="selector">
                  {listCountry?.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8} md={12} sm={24}>
              <Form.Item
                className="form-group form-group-with-search"
                name="brand"
                label="Chất liệu"
              >
                <Select placeholder="Chọn chất liệu" className="selector">
                  {listMaterial?.map((item) => (
                    <Option key={item.id} value={item.name}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ marginTop: 30 }} gutter={24}>
            <Col span={24}>
              <Item label="Mô tả sản phẩm" name="description">
                <CustomEditor />
              </Item>
            </Col>
          </Row>
        </Card>
        <Collapse
          expandIconPosition="right"
          className="view-other card-block card-block-normal"
        >
          <Panel header="Quản lý thuộc tính" key="1">
            <Row gutter={24}>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  className="form-group form-group-with-search"
                  label="Màu sắc"
                  name="color_id"
                >
                  <Select
                    className="selector"
                    placeholder="Chọn màu sắc"
                  >
                    {
                      
                    }
                  </Select>
                </Item>
              </Col>
              <Col span={24} lg={8} md={12} sm={24}>
                <Item
                  className="form-group form-group-with-search"
                  name="size"
                  label="Kích cỡ"
                >
                  <Select
                    className="selector"
                    placeholder="Chọn kích cỡ"
                  ></Select>
                </Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <Row className="footer-row-btn" justify="end">
          <Button
            type="default"
            onClick={onCancel}
            className="btn-style btn-cancel"
          >
            Hủy
          </Button>
          <Button
            type="default"
            onClick={onSave}
            className="btn-style btn-save"
          >
            Lưu
          </Button>
        </Row>
      </Form>
    </div>
  );
};

export default ProductCreateScreen;
