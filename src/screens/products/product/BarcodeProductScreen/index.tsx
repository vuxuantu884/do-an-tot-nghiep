import { Button, Card, Image, Input } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { StyledComponent } from "./style";
import { BiAddToQueue } from "react-icons/bi";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import {
  VariantPricesResponse,
  VariantResponse,
} from "model/product/product.model";
import { PageResponse } from "model/base/base-metadata.response";
import BarcodeLineItem from "../component/BarcodeLineItem";
import { formatCurrency, Products } from "utils/AppUtils";
import variantdefault from "assets/icon/variantdefault.jpg";
import { AppConfig } from "config/app.config";

export interface VariantBarcodeLineItem extends VariantResponse {
  quantity_req: number | "";
}

const BarcodeProductScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [dataSelected, setDataSelected] = useState<
    Array<VariantBarcodeLineItem>
  >([]);
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
  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (!result) {
        setData([]);
      } else {
        setData(result.items);
      }
    },
    []
  );
  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
            },
            onResultSearch
          )
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch]
  );
  const onSelectProduct = useCallback(
    (value: string) => {
      let index = data.findIndex((item) => item.id.toString() === value);
      if (index !== -1) {
        let indexItem = dataSelected.findIndex(item => item.id === data[index].id);
        if(indexItem === -1) {
          dataSelected.push({ ...data[index], quantity_req: 1 });
          setDataSelected([...dataSelected]);
        }
        
      }
      setData([]);
    },
    [data, dataSelected]
  );
  return (
    <ContentContainer
      title="In mã vạch"
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
          name: "In mã vạch",
        },
      ]}
    >
      <StyledComponent>
        <Card>
          <div className="padding-20">
            <Input.Group className="display-flex">
              <CustomAutoComplete
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F1)"
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
                // onClick={() => setVisibleManyProduct(true)}
                style={{ width: 132, marginLeft: 10 }}
              >
                Chọn nhiều
              </Button>
            </Input.Group>
            <CustomTable
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
                      <Image className="avatar" preview={false} src={img === null ? variantdefault : img.url} />
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
                  render: (value: Array<VariantPricesResponse>) => {
                    let price = Products.findPrice(value, AppConfig.currency);
                    return price == null
                      ? 0
                      : formatCurrency(price?.import_price);
                  },
                },
              ]}
            />
          </div>
        </Card>
        <BottomBarContainer
          back="Quay lại sản phẩm"
          rightComponent={<Button type="primary">Xuất Excel</Button>}
        />
      </StyledComponent>
    </ContentContainer>
  );
};

export default BarcodeProductScreen;
