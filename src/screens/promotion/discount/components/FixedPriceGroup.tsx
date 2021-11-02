import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Col, Form, Input, Row, Select, Space, Table, Tooltip} from "antd";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import PickManyProductModal from "../../../purchase-order/modal/pick-many-product.modal";
import {searchVariantsRequestAction} from "../../../../domain/actions/product/products.action";
import {useDispatch} from "react-redux";
import {PageResponse} from "../../../../model/base/base-metadata.response";
import {VariantResponse} from "../../../../model/product/product.model";
import ProductItem from "../../../purchase-order/component/product-item";
import NumberInput from "../../../../component/custom/number-input.custom";
import {RiInformationLine} from "react-icons/ri";
import {Link} from "react-router-dom";
import UrlConfig from "../../../../config/url.config";
import {AiOutlineClose} from "react-icons/ai";
import {DeleteOutlined} from "@ant-design/icons";

const Option = Select.Option;
const discountTypes = [
  {
    value: "FIXED_AMOUNT",
    name: "đ"
  },
  {
    value: "PERCENTAGE",
    name: "%"
  }
]

const FixedPriceGroup = (props: any) => {
  const {
    key,
    name,
    fieldKey,
    form,
    remove,
    isFirst,
    allProducts,
    discountMethod
  } = props;
  const dispatch = useDispatch();

  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<VariantResponse>>([])
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [discountType, setDiscountType] = useState("FIXED_AMOUNT")
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

  useEffect(() => {
    let entitlementFields = form.getFieldValue('entitlements')
    entitlementFields[name] = Object.assign({}, entitlementFields[name], {entitled_variant_ids: selectedProduct.map(p => p.id)})
    form.setFieldsValue({entitlements: entitlementFields})
  }, [selectedProduct])

  useEffect(() => {
    let entitlementFields = form.getFieldValue('entitlements')
    entitlementFields[name] = Object.assign({}, entitlementFields[name], {"prerequisite_quantity_ranges.value_type": discountType})
    console.log('discountType: ', discountType)
    form.setFieldsValue({entitlements: entitlementFields})
  }, [discountType])

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()}/>,
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
        form.setFieldsValue({[`${name}.entitled_variant_ids`]: selectedProduct.map(p => p.id)})
      }
      setVisibleManyProduct(false);
    },
    [selectedProduct]
  );

  const onDeleteItem = useCallback(
    (index: number) => {
      selectedProduct.splice(index, 1)
      setSelectedProduct([...selectedProduct])
    },
    [selectedProduct]
  );

  return (
    <div key={name}
         style={{border: "1px solid rgb(229, 229, 229)", padding: "20px", marginBottom: "20px", borderRadius: "5px"}}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges.greater_than_or_equal_to"]}
            label={<Space>
              <span>SL tối thiểu</span>
              <Tooltip title={"Số lượng tối thiểu cho sản phẩm để được áp dụng khuyến mại"}>
                <RiInformationLine/>
              </Tooltip>
            </Space>}
          >
            <NumberInput key={`${key}-min`} min={0}/>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges.allocation_limit"]}
            label={<Space>
              <span>Giới hạn</span>
              <Tooltip title={"Tổng số lượng sản phẩm áp dụng khuyến mại. Mặc định không điền là không giới hạn." +
              "VD: Chỉ áp dụng cho 100 sản phẩm, hết 100 sản phẩm này thì không có khuyến mại nữa."}>
                <RiInformationLine/>
              </Tooltip>
            </Space>}
          >
            <NumberInput key={`${key}-usage`} min={0}/>
          </Form.Item>
        </Col>
        <Col span={9}>
          <Input.Group compact>
            <Form.Item
              name={[name, "prerequisite_quantity_ranges.value"]}
              label={discountMethod === "FIXED_PRICE" ? "Giá cố định: " : "Chiết khấu"}
            >
              <NumberInput
                style={{textAlign: 'end', borderRadius: '0px', width: "300px"}}
                min={0}
                maxLength={discountType === 'PERCENTAGE' ? 2 : 9}
              />
            </Form.Item>
            <Form.Item
              name={[name, "prerequisite_quantity_ranges.value_type"]}
              label=" "
            >
              <Select style={{borderRadius: '0px'}} onSelect={(value: string) => {
                setDiscountType(value)
              }}>
                <Option key={"FIXED_AMOUNT"} value={"FIXED_AMOUNT"}>đ</Option>
                {discountMethod !== 'FIXED_PRICE' ? <Option key={"PERCENTAGE"} value={"PERCENTAGE"}>%</Option> : null}
              </Select>
            </Form.Item>
          </Input.Group>
        </Col>
      </Row>
      {allProducts ? "" : <div>
        <Form.Item>
          <Input.Group className="display-flex">
            <CustomAutoComplete
              key={`${key}-product_search`}
              id="#product_search"
              dropdownClassName="product"
              placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch, ..."
              onSearch={onSearch}
              dropdownMatchSelectWidth={456}
              style={{width: "100%"}}
              onSelect={onSelectProduct}
              options={renderResult}
              ref={productSearchRef}
            />
            <Button
              onClick={() => setVisibleManyProduct(true)}
              style={{width: 132, marginLeft: 10}}
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
                    icon={<AiOutlineClose/>}
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
              icon={<DeleteOutlined/>}
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
