import { Button, Card, Image, Input, Tooltip } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomTable from "component/table/CustomTable";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import { StyledComponent } from "./style";
import { BiAddToQueue } from "react-icons/bi";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import {
  productBarcodeAction,
  searchVariantsRequestAction,
} from "domain/actions/product/products.action";
import {
  ProductBarcodeItem,
  ProductBarcodeRequest,
  VariantPricesResponse,
  VariantResponse,
} from "model/product/product.model";
import { PageResponse } from "model/base/base-metadata.response";
import BarcodeLineItem from "../component/BarcodeLineItem";
import { formatCurrency, formatCurrencyForProduct, Products } from "utils/AppUtils";
import variantdefault from "assets/icon/variantdefault.jpg";
import { AppConfig } from "config/app.config";
import NumberInput from "component/custom/number-input.custom";
import { showSuccess } from "utils/ToastUtils";
import { CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router";
import ModalPickManyProduct from "../component/ModalPickManyProduct";
import { cloneDeep } from "lodash";

export interface VariantBarcodeLineItem extends VariantResponse {
  quantity_req: number | null;
}

const BarcodeProductScreen: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const state: any = location.state;
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [loadingButton, setLoadingButton] = useState<boolean>(false);
  const [visibleProduct, setVisibleProduct] = useState<boolean>(false);
  const [dataSelected, setDataSelected] = useState<Array<VariantBarcodeLineItem>>([]);
  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <BarcodeLineItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [data]);
  const onResultSearch = useCallback((result: PageResponse<VariantResponse> | false) => {
    if (!result) {
      setData([]);
    } else {
      setData(result.items);
    }
  }, []);
  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        dispatch(
          searchVariantsRequestAction(
            {
              limit: 10,
              page: 1,
              info: value.trim(),
            },
            onResultSearch,
          ),
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch],
  );

  const onResult = useCallback(
    (data: string | false) => {
      setLoadingButton(false);
      if (!data) {
      } else {
        window.open(data);
        setDataSelected([]);
        showSuccess("Xuất excel thành công");
        history.push(ProductTabUrl.STAMP_PRINTING_HISTORY);
      }
    },
    [history],
  );

  const onInTemp = useCallback(() => {
    setLoadingButton(true);
    let array: Array<ProductBarcodeItem> = [];
    dataSelected.forEach((item) => {
      array.push({
        variant_id: item?.variant_id ? item?.variant_id : item.id,
        quantity_req: item.quantity_req ? item.quantity_req : 1,
      });
    });
    let request: ProductBarcodeRequest = {
      type_name: "excel",
      variants: array,
    };
    dispatch(productBarcodeAction(request, onResult));
  }, [dataSelected, dispatch, onResult]);
  const onSelectProduct = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      if (index !== -1) {
        let indexItem = dataSelected.findIndex((item) => item.id === data[index].id);
        if (indexItem === -1) {
          dataSelected.unshift({ ...data[index], quantity_req: 1 });
          setDataSelected([...dataSelected]);
        }
      }
      setData([]);
    },
    [data, dataSelected],
  );

  const getTotalQuantityReq = useCallback(() => {
    const quantityReq = cloneDeep(dataSelected);
    const total = quantityReq.reduce((value, element) => {
      return value + (element.quantity_req || 0);
    }, 0);
    return formatCurrencyForProduct(total);
  }, [dataSelected]);

  useEffect(() => {
    if (state && state.selected) {
      let dataSelect1: Array<VariantBarcodeLineItem> = [];
      state.selected.forEach((item: VariantBarcodeLineItem) => {
        dataSelect1.push({ ...item, quantity_req: item?.quantity_req || 1 });
      });
      setDataSelected(dataSelect1);
    }
  }, [state]);

  return (
    <ContentContainer
      title="In mã vạch"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: "In mã vạch",
        },
      ]}
    >
      <StyledComponent>
        <Card>
          <div>
            <Input.Group className="display-flex">
              <CustomAutoComplete
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tên/Mã sản phẩm"
                onSearch={onSearch}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                showAdd={true}
                textAdd="Thêm mới sản phẩm"
                onSelect={onSelectProduct}
                options={renderResult}
                // ref={productSearchRef}
              />
              <Button
                className="button-pick-many"
                icon={<BiAddToQueue />}
                onClick={() => setVisibleProduct(true)}
                style={{ width: 132, marginLeft: 10 }}
              >
                Chọn nhiều
              </Button>
            </Input.Group>
            <CustomTable
              rowKey={(record) => record.id}
              dataSource={dataSelected}
              className="margin-top-20"
              pagination={false}
              columns={[
                {
                  title: "STT",
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  dataIndex: "variant_images",
                  render: (data) => {
                    let img = Products.findAvatar(data);
                    return (
                      <Image
                        className="avatar"
                        preview={false}
                        src={img === null ? variantdefault : img.url}
                      />
                    );
                  },
                },
                {
                  title: "Mã sản phẩm",
                  dataIndex: "sku",
                },
                {
                  title: "Tên sản phẩm",
                  dataIndex: "name",
                },
                {
                  title: "Giá",
                  dataIndex: "variant_prices",
                  render: (value: Array<VariantPricesResponse>, row) => {
                    if (row?.retail_price) return formatCurrency(row.retail_price);
                    let price = Products.findPrice(value, AppConfig.currency);
                    return price == null ? 0 : formatCurrency(price?.retail_price);
                  },
                },
                {
                  title: (
                    <>
                      <div>
                        {" "}
                        Số lượng tem
                        <Tooltip title="SL tem in chia hết cho 3">
                          {" "}
                          <InfoCircleOutlined />{" "}
                        </Tooltip>
                      </div>
                      <>({getTotalQuantityReq()})</>
                    </>
                  ),
                  dataIndex: "quantity_req",
                  align: "center",
                  width: 140,
                  render: (value: number, record, index) => {
                    return (
                      <NumberInput
                        value={value}
                        maxLength={12}
                        onChange={(v) => {
                          dataSelected[index].quantity_req = v;
                          setDataSelected([...dataSelected]);
                        }}
                      />
                    );
                  },
                },
                {
                  title: "",
                  width: 60,
                  render: (value, record, index) => {
                    return (
                      <Button
                        onClick={() => {
                          dataSelected.splice(index, 1);
                          setDataSelected([...dataSelected]);
                        }}
                        icon={<CloseOutlined />}
                      />
                    );
                  },
                },
              ]}
            />
          </div>
        </Card>
        <BottomBarContainer
          back="Quay lại sản phẩm"
          rightComponent={
            <Button onClick={onInTemp} loading={loadingButton} type="primary">
              Xuất Excel
            </Button>
          }
        />
      </StyledComponent>
      <ModalPickManyProduct
        visible={visibleProduct}
        onCancel={() => setVisibleProduct(false)}
        selected={dataSelected}
        onSave={(result: Array<VariantResponse>) => {
          let dataSelect1: Array<VariantBarcodeLineItem> = [];
          result.forEach((item: VariantResponse) => {
            let index = dataSelected.findIndex((item1) => item.id === item1.id);
            if (index === -1) {
              dataSelect1.unshift({ ...item, quantity_req: 1 });
            } else {
              dataSelect1.unshift({
                ...item,
                quantity_req: dataSelected[index].quantity_req,
              });
            }
          });
          setDataSelected(dataSelect1);
          setVisibleProduct(false);
        }}
      />
    </ContentContainer>
  );
};

export default BarcodeProductScreen;
