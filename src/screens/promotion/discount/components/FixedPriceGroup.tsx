import React, {createRef, useCallback, useMemo, useState} from "react";
import {Button, Col, Empty, Form, Input, Row, Space, Table, Tooltip} from "antd";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import {searchVariantsRequestAction} from "../../../../domain/actions/product/products.action";
import {useDispatch} from "react-redux";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {VariantResponse} from "../../../../model/product/product.model";
import ProductItem from "../../../purchase-order/component/product-item";
import NumberInput from "../../../../component/custom/number-input.custom";
import CurrencyInput from "../../../loyalty/component/currency-input";
import {RiDeleteBin7Line, RiInformationLine} from "react-icons/ri";
import imgDefIcon from "../../../../assets/img/img-def.svg";
import {Link} from "react-router-dom";
import UrlConfig from "../../../../config/url.config";
import {Products} from "../../../../utils/AppUtils";
import {AiOutlineClose, AiOutlineDelete} from "react-icons/ai";
import {DeleteOutlined} from "@ant-design/icons";

const FixedPriceGroup = (props: any) => {
  const {
    key,
    name,
    fieldKey,
    form,
    remove,
    discountType,
    isFirst,
    allProducts
  } = props;
  const dispatch = useDispatch();

  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<VariantResponse>>([])
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const productSearchRef = createRef<CustomAutoComplete>();
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
              limit: 200,
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



  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id,
      });
    });
    return options;
  }, [data]);

  const onSelectProduct = useCallback(
    (value) => {
      const selectedItem = data.find(e => e.id === Number(value));
      if (selectedItem) {
        setSelectedProduct([...selectedProduct, selectedItem])
      }
      setData([]);
    },
    [data, selectedProduct]
  )

  const onPickManyProduct = useCallback(
    (items: Array<VariantResponse>) => {
      if (items.length) {
        setSelectedProduct([...selectedProduct, ...items])
      }
      setVisibleManyProduct(false);
    },
    [selectedProduct]
  );

  const onDeleteItem = useCallback(
    (index: number) => {
      selectedProduct.splice(index, 1)
    },
    [selectedProduct]
  );

  return (
    <div key={name} style={{border: "1px solid rgb(229, 229, 229)", padding: "20px", marginBottom: "20px", borderRadius: "5px"}}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[name, "min"]}
            label={<Space>
              <span>SL tối thiểu</span>
              <Tooltip title={"Số lượng tối thiểu cho sản phẩm để được áp dụng khuyến mại"}>
                <RiInformationLine />
              </Tooltip>
            </Space>}
          >
            <NumberInput key={`${key}-min`} min={0} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            name={[name, "usage"]}
            label={<Space>
              <span>Giới hạn</span>
              <Tooltip title={"Tổng số lượng sản phẩm áp dụng khuyến mại. Mặc định không điền là không giới hạn." +
              "VD: Chỉ áp dụng cho 100 sản phẩm, hết 100 sản phẩm này thì không có khuyến mại nữa."}>
                <RiInformationLine />
              </Tooltip>
            </Space>}
          >
            <NumberInput key={`${key}-usage`} min={0} />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item
            name={[name, "value"]}
            label="Giá cố định: "
          >
            <CurrencyInput
              key={`${key}-value`}
              position="after"
              currency={["đ"]}
              // value={rule.limit_order_percent}
              // onChangeCurrencyType={(value) => handleChangePointUseType(value, index)}
              // onChange={(value) => handleChangePointUse(value, index)}
            />
          </Form.Item>
        </Col>
      </Row>
      {allProducts ? "" : <div>
        <Form.Item >
          <Input.Group className="display-flex">
            <CustomAutoComplete
              key={`${key}-product_search`}
              id="#product_search"
              dropdownClassName="product"
              placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
              onSearch={onSearch}
              dropdownMatchSelectWidth={456}
              style={{ width: "100%" }}
              onSelect={onSelectProduct}
              options={renderResult}
              ref={productSearchRef}
            />
            <Button
              onClick={() => setVisibleManyProduct(true)}
              style={{ width: 132, marginLeft: 10 }}
            >
              Chọn nhiều
            </Button>
          </Input.Group>
        </Form.Item>
        <Form.Item name={[name, "entitlements"]}>
          <Table
            className="product-table"
            rowKey={(record) => record.id}
            rowClassName="product-table-row"
            columns={[
              {
                title: "Ảnh",
                width: "7%",
                dataIndex: "variant_images",
                render: (value) => {
                  const image = Products.findAvatar(value);
                  return (<div className="product-item-image">
                    <img
                      src={image ? image.url : imgDefIcon}
                      alt={JSON.stringify(value)}
                      className=""
                    />
                  </div>)
                },
              },
              {
                title: "Sản phẩm",
                className: "ant-col-info",
                dataIndex: "variant",
                align: 'left',
                render: (
                  value: string,
                  item,
                  index: number
                ) => {
                  return (
                    <div>
                      <div>
                        <div className="product-item-sku">
                          <Link
                            target="_blank"
                            to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.id}`}
                          >
                            {item.sku}
                          </Link>
                        </div>
                        <div className="product-item-name">
                                  <span className="product-item-name-detail">
                                    {item.name}
                                  </span>
                        </div>
                      </div>
                    </div>
                  );
                },
              },
              {
                title: "Tồn đầu kỳ",
                className: "ant-col-info",
                align: 'center',
                width: '15%',
                render: (value, item, index) => item.available
              },
              {
                title: "Giá vốn",
                className: "ant-col-info",
                align: 'center',
                width: '15%',
                render: (value, item, index) => item.variant_prices[0]?.import_price || ''
              },
              {
                className: "ant-col-info",
                align: 'right',
                width: "8%",
                render: (value: string, item, index: number) => (
                  <Button
                    onClick={() => onDeleteItem(index)}
                    className="product-item-delete"
                    icon={<AiOutlineClose />}
                  />
                ),
              }
            ]}
            dataSource={selectedProduct}
            tableLayout="fixed"
            pagination={false}
          />
        </Form.Item>
        {isFirst ? "" : <Row gutter={16} style={{paddingTop: "16px"}}>
          <Col span={24}>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => remove(name)}
            >
              Xoá nhóm chiết khấu
            </Button>
          </Col>
        </Row>}

        <PickManyProductModal
          onSave={onPickManyProduct}
          selected={data}
          onCancel={() => setVisibleManyProduct(false)}
          visible={visibleManyProduct}
        />
      </div>}
    </div>
  )


}

export default FixedPriceGroup;
