import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import BaseButton from "component/base/BaseButton";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { IconAddMultiple } from "component/icon/IconAddMultiple";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { debounce, isEmpty } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import ProductItem from "screens/purchase-order/component/product-item";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { Link } from "react-router-dom";
import { formatCurrency, isNullOrUndefined, replaceFormatString } from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";
import { AiOutlineClose } from "react-icons/ai";
import {
  StockOutPolicyPriceField,
  StockOutPolicyPriceMapping,
  StockInPolicyPrice,
  StockInOutPolicyPriceField,
  StockInOutPolicyPriceMapping,
  StockInOutField,
  EnumStockInOutType,
} from "../constant";
import StockInOutProductUtils from "../util/StockInOutProductUtils";
import { StockInOutItemsOther } from "model/stock-in-out-other";
import { showError } from "utils/ToastUtils";

interface IEProductFormProps {
  formMain: FormInstance;
  inventoryType: string;
  title: string;
  typePrice: string;
  setTypePrice: (value: string) => void;
  allowReadImportPrice: boolean;
  allowReadCostPrice: boolean;
  readPricePermissions: string[];
  variantsResult: Array<VariantResponse>;
  setVariantsResult: React.Dispatch<React.SetStateAction<Array<VariantResponse>>>;
}
const IEProductForm: React.FC<IEProductFormProps> = (props: IEProductFormProps) => {
  const {
    formMain,
    inventoryType,
    title,
    typePrice,
    setTypePrice,
    allowReadImportPrice,
    allowReadCostPrice,
    variantsResult,
    setVariantsResult,
  } = props;
  const [loadingSearch, setLoadingSearch] = useState(false);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [isPressed] = useKeyboardJs("f3");
  const dispatch = useDispatch();
  const renderResult = useMemo(() => {
    let options: any[] = [];
    variantsResult.forEach((item: VariantResponse) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [variantsResult]);

  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      setLoadingSearch(false);
      if (!result) {
        setVariantsResult([]);
      } else {
        setVariantsResult(result.items);
      }
    },
    [setVariantsResult],
  );

  const onSearch = useCallback(
    (value: string) => {
      const storeId = formMain.getFieldValue(StockInOutField.store_id);
      if (value.trim() !== "") {
        setLoadingSearch(true);
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
              store_ids: storeId,
            },
            onResultSearch,
          ),
        );
      } else {
        setVariantsResult([]);
      }
    },
    [dispatch, formMain, onResultSearch, setVariantsResult],
  );

  const handleSelectProduct = (variantId: string) => {
    const storeId = formMain.getFieldValue(StockInOutField.store_id);
    if (!storeId) {
      showError("Bạn chưa chọn kho hàng");
      setVariantsResult([]);
      return;
    }
    const stockInOutOtherItems: Array<StockInOutItemsOther> =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];

    const index = variantsResult.findIndex((item) => item.id.toString() === variantId);
    if (index !== -1) {
      if (variantsResult[index].status === "inactive") {
        showError("Sản phẩm đã ngừng hoạt động");
        return;
      }
      if (!variantsResult[index].on_hand && inventoryType === EnumStockInOutType.StockOut) {
        showError("Sản phẩm không đủ tồn kho");
        return;
      }
      const variants: Array<VariantResponse> = [variantsResult[index]];
      const newItems: Array<StockInOutItemsOther> = [
        ...StockInOutProductUtils.convertVariantToStockInOutItem(variants, typePrice),
      ];
      const newStockInOutOtherItems = StockInOutProductUtils.addProduct(
        stockInOutOtherItems,
        newItems,
        typePrice,
        "SELECT",
      );
      formMain.setFieldsValue({
        stock_in_out_other_items: newStockInOutOtherItems,
      });
    }
  };

  const handlePickManyProduct = (items: Array<VariantResponse>) => {
    const variantsSelected = [...items];
    const stockInOutOtherItems: Array<StockInOutItemsOther> =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];

    setVisibleManyProduct(false);
    const newItems: Array<StockInOutItemsOther> = [
      ...StockInOutProductUtils.convertVariantToStockInOutItem(variantsSelected, typePrice),
    ];
    let newStockInOutOtherItems = StockInOutProductUtils.addProduct(
      stockInOutOtherItems,
      newItems,
      typePrice,
      "SELECT",
    );
    formMain.setFieldsValue({
      stock_in_out_other_items: newStockInOutOtherItems,
    });
  };

  const handleChangeQuantityStockInOutItem = (
    quantity: number,
    item: StockInOutItemsOther,
    typePrice: string,
  ) => {
    const stockInOutOtherItems: Array<StockInOutItemsOther> = formMain.getFieldValue(
      StockInOutField.stock_in_out_other_items,
    );
    const indexOfItem = stockInOutOtherItems.findIndex((a) => a.sku === item.sku);

    if (stockInOutOtherItems[indexOfItem]) {
      stockInOutOtherItems[indexOfItem] = StockInOutProductUtils.updateStockInOutItemByQuantity(
        stockInOutOtherItems[indexOfItem],
        quantity,
        typePrice,
      );
      formMain.setFieldsValue({
        stock_in_out_other_items: [...stockInOutOtherItems],
      });
    }
  };

  const handleDeleteLineItem = (index: number) => {
    let stockInOutOtherItems: Array<StockInOutItemsOther> = formMain.getFieldValue(
      StockInOutField.stock_in_out_other_items,
    );
    stockInOutOtherItems.splice(index, 1);
    formMain.setFieldsValue({
      stock_in_out_other_items: [...stockInOutOtherItems],
    });
  };

  const onSearchProduct = () => {
    let element: any = document.getElementById("#product_search");
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset - 250;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (isPressed) {
      onSearchProduct();
    }
  }, [isPressed]);

  const onChangePolicyPrice = (value: string) => {
    setTypePrice(value);
    const procurementItemsOther: StockInOutItemsOther[] =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];
    const newProcurementItemsOther: StockInOutItemsOther[] = procurementItemsOther?.map(
      (item: StockInOutItemsOther) => {
        let amount: any = item.quantity * item[value];
        if (isNullOrUndefined(item[value])) amount = null;
        return { ...item, policy_price: value, amount };
      },
    );
    formMain.setFieldsValue({
      [StockInOutField.stock_in_out_other_items]: newProcurementItemsOther,
    });
  };

  const renderFormatValue = (value: string) => {
    let text = "";
    if (value) {
      text = formatCurrency(value);
    } else if (
      !value &&
      allowReadCostPrice &&
      typePrice === StockInOutPolicyPriceField.cost_price
    ) {
      text = "Chưa có giá vốn";
    } else if (
      !value &&
      allowReadImportPrice &&
      typePrice === StockInOutPolicyPriceField.import_price
    ) {
      text = "Chưa có giá nhập";
    }
    return text;
  };

  return (
    <Card
      title={title}
      extra={
        <>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.policy_price !== current.policy_price}
          >
            {({ getFieldValue }) => {
              const policy_price = getFieldValue(StockInOutField.policy_price);
              if (!policy_price) {
                if (inventoryType === EnumStockInOutType.StockIn) {
                  formMain.setFieldsValue({
                    [StockInOutField.policy_price]: StockInOutPolicyPriceField.import_price,
                  });
                } else {
                  formMain.setFieldsValue({
                    [StockInOutField.policy_price]: StockOutPolicyPriceField.cost_price,
                  });
                  setTypePrice(StockOutPolicyPriceField.cost_price);
                }
              }
              return (
                <Space size={20}>
                  <span>Chính sách giá:</span>
                  {inventoryType === EnumStockInOutType.StockIn ? (
                    <Form.Item name={[StockInOutField.policy_price]} style={{ margin: "0px" }}>
                      <Select
                        style={{ minWidth: 145, height: 38 }}
                        placeholder="Chính sách giá"
                        onChange={onChangePolicyPrice}
                      >
                        {StockInPolicyPrice.map((item) => {
                          return (
                            <Select.Option value={item.key} color="#222222">
                              {StockInOutPolicyPriceMapping[item.key]}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item name={StockInOutField.policy_price} style={{ margin: "0px" }}>
                      <Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
                        <Select.Option value={StockOutPolicyPriceField.cost_price} color="#222222">
                          {StockOutPolicyPriceMapping[StockOutPolicyPriceField.cost_price]}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Space>
              );
            }}
          </Form.Item>
        </>
      }
    >
      <Form.Item noStyle>
        <Input.Group className="multiple-select">
          <CustomAutoComplete
            loading={loadingSearch}
            id="#product_search"
            dropdownClassName="product"
            placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F3)"
            onSearch={debounce(onSearch, AppConfig.TYPING_TIME_REQUEST)}
            dropdownMatchSelectWidth={456}
            style={{ width: "100%" }}
            showAdd={true}
            textAdd="Thêm mới sản phẩm"
            onSelect={handleSelectProduct}
            options={renderResult}
            ref={productSearchRef}
            onClickAddNew={() => {
              window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
            }}
          />
          <BaseButton
            style={{ marginLeft: 10 }}
            onClick={() => {
              const storeID = formMain.getFieldValue(StockInOutField.store_id);
              if (!storeID) {
                showError("Bạn chưa chọn kho hàng");
                return;
              }
              setVisibleManyProduct(true);
            }}
            icon={<IconAddMultiple width={12} height={12} />}
          >
            Chọn nhiều
          </BaseButton>
        </Input.Group>
      </Form.Item>
      <Form.Item
        style={{ padding: 0 }}
        shouldUpdate={(prevValues, curValues) =>
          prevValues[StockInOutField.stock_in_out_other_items] !==
            curValues[StockInOutField.stock_in_out_other_items] ||
          prevValues[StockInOutField.policy_price] !== curValues[StockInOutField.policy_price]
        }
      >
        {({ getFieldValue }) => {
          const procurementItemsOther: Array<StockInOutItemsOther> =
            getFieldValue(StockInOutField.stock_in_out_other_items) || [];
          return (
            <Table
              className="product-table"
              locale={{
                emptyText: (
                  <Empty
                    description="Đơn hàng của bạn chưa có sản phẩm"
                    image={<img src={emptyProduct} alt="" />}
                  >
                    <Button
                      type="text"
                      className="font-weight-500"
                      style={{
                        background: "rgba(42,42,134,0.05)",
                      }}
                      onClick={onSearchProduct}
                    >
                      Thêm sản phẩm ngay (F3)
                    </Button>
                  </Empty>
                ),
              }}
              rowKey={(record: StockInOutItemsOther) => record.sku}
              rowClassName="product-table-row"
              columns={[
                {
                  title: "STT",
                  align: "center",
                  width: "5%",
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  width: "7%",
                  dataIndex: "variant_image",
                  render: (value) => (
                    <div className="product-item-image">
                      <img src={value === null ? imgDefIcon : value} alt="" className="" />
                    </div>
                  ),
                },
                {
                  title: "Sản phẩm",
                  width: "30%",
                  className: "ant-col-info",
                  dataIndex: "variant_name",
                  render: (value: string, item: StockInOutItemsOther) => {
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
                            <span>{value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  title: (
                    <div
                      style={{
                        textAlign: "right",
                        padding: "7px 14px",
                      }}
                    >
                      <span>Số Lượng</span>
                      <span
                        style={{
                          color: "#2A2A86",
                          fontWeight: "normal",
                          marginLeft: 5,
                        }}
                      >
                        (
                        {formatCurrency(
                          StockInOutProductUtils.totalQuantity(procurementItemsOther),
                          ".",
                        )}
                        )
                      </span>
                    </div>
                  ),
                  width: "15%",
                  dataIndex: "quantity",
                  render: (value, item: StockInOutItemsOther) => {
                    return (
                      <NumberInput
                        isFloat={false}
                        value={value}
                        min={1}
                        default={1}
                        maxLength={9}
                        onChange={(quantity) => {
                          handleChangeQuantityStockInOutItem(quantity || 0, item, typePrice);
                        }}
                      />
                    );
                  },
                },
                {
                  title: (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        Giá
                        <span
                          style={{
                            color: "#737373",
                            fontSize: "12px",
                            fontWeight: "normal",
                          }}
                        >
                          {" "}
                          ₫
                        </span>
                      </div>
                    </div>
                  ),
                  width: "20%",
                  dataIndex: typePrice,
                  render: (value) => {
                    return (
                      <NumberInput
                        className="hide-number-handle"
                        format={(a: string) => {
                          return renderFormatValue(a);
                        }}
                        replace={(a: string) => {
                          return replaceFormatString(a);
                        }}
                        value={value}
                        disabled={true}
                      />
                    );
                  },
                },
                {
                  dataIndex: "amount",
                  title: (
                    <Tooltip title="Thành tiền không bao gồm thuế VAT">
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        Thành tiền
                        <span
                          style={{
                            color: "#737373",
                            fontSize: "12px",
                            fontWeight: "normal",
                          }}
                        >
                          {" "}
                          ₫
                        </span>
                      </div>
                    </Tooltip>
                  ),
                  align: "center",
                  width: "20%",
                  render: (value) => {
                    return (
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        {isNullOrUndefined(value) ? "" : formatCurrency(Math.round(value))}
                      </div>
                    );
                  },
                },
                {
                  title: "",
                  fixed: procurementItemsOther.length !== 0 && "right",
                  width: 60,
                  render: (value: string, item, index: number) => {
                    return (
                      <Button
                        onClick={() => handleDeleteLineItem(index)}
                        className="product-item-delete"
                        style={{ marginLeft: 10 }}
                        icon={<AiOutlineClose />}
                      />
                    );
                  },
                },
              ]}
              dataSource={procurementItemsOther}
              tableLayout="fixed"
              pagination={false}
            />
          );
        }}
      </Form.Item>
      <Row gutter={24}>
        <Col span={12} />
        <Col span={12}>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues[StockInOutField.stock_in_out_other_items] !==
              curValues[StockInOutField.stock_in_out_other_items]
            }
            noStyle
          >
            {({ getFieldValue }) => {
              const stock_in_out_other_items =
                getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];
              const totalAmount =
                StockInOutProductUtils.getTotalAmountByStockInOutItems(stock_in_out_other_items);
              return (
                !isEmpty(stock_in_out_other_items) && (
                  <div>
                    <div className="ie-payment-row ">
                      <div>
                        <b>Tổng tiền:</b>
                      </div>
                      <div className="ie-payment-row-result">
                        {StockInOutProductUtils.checkAllAmountIsNull(stock_in_out_other_items)
                          ? ""
                          : formatCurrency(Math.round(totalAmount || 0))}
                      </div>
                    </div>
                  </div>
                )
              );
            }}
          </Form.Item>
        </Col>
      </Row>
      <Form.Item noStyle name={StockInOutField.stock_in_out_other_items} hidden>
        <Input />
      </Form.Item>
      <PickManyProductModal
        onSave={handlePickManyProduct}
        selected={[]}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
        storeID={formMain.getFieldValue(StockInOutField.store_id)}
      />
    </Card>
  );
};

export default IEProductForm;
