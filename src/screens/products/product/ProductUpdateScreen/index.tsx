import { Col, Row, Form, Switch, Card } from "antd";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { listColorAction } from "domain/actions/product/color.action";
import { materialSearchAll } from "domain/actions/product/material.action";
import { productGetDetail } from "domain/actions/product/products.action";
import { sizeGetAll } from "domain/actions/product/size.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { SupplierResponse } from "model/core/supplier.model";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { ColorResponse } from "model/product/color.model";
import { MaterialResponse } from "model/product/material.model";
import { ProductResponse } from "model/product/product.model";
import { SizeResponse } from "model/product/size.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useMemo, useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { convertCategory } from "utils/AppUtils";
import { ProductParams } from "../ProductDetailScreen";
import { StyledComponent } from "./styles";

const { Item } = Form;

const ProductDetailScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams<ProductParams>();
  const idNumber = parseInt(id);

  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status
  );

  const isLoadMaterData = useRef(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProductResponse | null>(null);
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [listSupplier, setListSupplier] = useState<Array<SupplierResponse>>([]);
  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [listMaterial, setListMaterial] = useState<Array<MaterialResponse>>([]);
  const [listSize, setListSize] = useState<Array<SizeResponse>>([]);
  const [listColor, setListColor] = useState<Array<ColorResponse>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [status, setStatus] = useState<string>("inactive");

  const categoryFilter = useMemo(() => {
    if (data === null) {
      return listCategory;
    }
    return listCategory.filter((item) => item.goods === data.goods);
  }, [data, listCategory]);

  const onResult = useCallback((result: ProductResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);

  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return false;
      }
      setAccounts(data.items);
    },
    []
  );

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex((item) => item.value === status);
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [productStatusList, status]);

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);
  useEffect(() => {
    if (!isLoadMaterData.current) {
      dispatch(getCategoryRequestAction({}, setDataCategory));
      dispatch(SupplierGetAllAction(setListSupplier));
      dispatch(materialSearchAll(setListMaterial));
      dispatch(CountryGetAllAction(setListCountry));
      dispatch(sizeGetAll(setListSize));
      dispatch(listColorAction({ is_main_color: 0 }, setListColor));
      dispatch(
        AccountSearchAction(
          { department_ids: [AppConfig.WIN_DEPARTMENT] },
          setDataAccounts
        )
      );
    }
    isLoadMaterData.current = true;
    return () => {};
  }, [dispatch, setDataAccounts, setDataCategory]);
  return (
    <StyledComponent>
      <ContentContainer
        isError={error}
        isLoading={loading}
        title="Sửa thông tin sản phẩm"
        breadcrumb={[
          {
            name: "Tổng quản",
            path: UrlConfig.HOME,
          },
          {
            name: "Sản phẩm",
            path: `${UrlConfig.PRODUCT}`,
          },
          {
            name: data !== null ? data.name : "",
          },
        ]}
      >
        {data !== null && (
          <React.Fragment>
            <Row gutter={24}>
              <Col span={24} md={18}>
                <Card
                  className="card"
                  extra={
                    <div className="extra-cards status">
                      <Item noStyle>
                        <b>Trạng thái:</b>
                        <Switch
                          onChange={(checked) =>
                            setStatus(checked ? "active" : "inactive")
                          }
                          className="ant-switch-success"
                          defaultChecked
                        />
                      </Item>
                      <label
                        className={
                          status === "active" ? "text-success" : "text-error"
                        }
                      >
                        {statusValue}
                      </label>
                    </div>
                  }
                ></Card>
              </Col>
              <Col span={24} md={6}></Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} md={18}></Col>
              <Col span={24} md={6}></Col>
            </Row>
          </React.Fragment>
        )}
      </ContentContainer>
    </StyledComponent>
  );
};

export default ProductDetailScreen;
