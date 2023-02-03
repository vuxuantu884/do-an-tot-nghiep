import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Table, Tooltip } from "antd";
import BaseButton from "component/base/BaseButton";
import BottomBarContainer from "component/container/bottom-bar.container";
import { BreadcrumbProps } from "component/container/breadcrumb.container";
import ContentContainer from "component/container/content.container";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import NumberInput from "component/custom/number-input.custom";
import { IconAddMultiple } from "component/icon/IconAddMultiple";
import PickManyModal from "component/modal/PickManyModal";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER, ProductTabUrl } from "config/url.config";
import { PoDetailAction } from "domain/actions/po/po.action";
import { cloneDeep } from "lodash";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  POStampPrinting,
  ProductStampPrinting,
  PurchaseOrder,
} from "model/purchase-order/purchase-order.model";
import React, { useCallback, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useHistory, useRouteMatch } from "react-router-dom";
import { printVariantBarcodeByPOApi } from "service/purchase-order/purchase-order.service";
import { callApiNative } from "utils/ApiUtils";
import { formatCurrency } from "utils/AppUtils";
import { formatCurrencyForProduct } from "screens/products/helper";
import { DownloadFile } from "utils/DownloadFile";
import { fullTextSearch } from "utils/StringUtils";
import {
  defaultBreadcrumbStampPrinting,
  FormFiledStampPrinting,
  handleChangeQtyPrintByVariantId,
  handleSupplementalStamp,
  initFormValueStampPrinting,
} from "./helper";
import ProductPOItem from "./ProductPOItem";
import { StampPrintingStyle } from "./style";
const { Item } = Form;
type DataSourceProductTable = {
  currentPage: number;
  list: PurchaseOrderLineItem[];
  total: number;
  limit: number;
};

function PrintingStamp() {
  const dispatch = useDispatch();
  const history = useHistory();
  const match = useRouteMatch<{ id: string }>();
  const [form] = Form.useForm();
  const poId = Number(match.params.id);
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbProps[]>(defaultBreadcrumbStampPrinting);
  const [visiblePickManyModal, setVisiblePickManyModal] = useState(false);
  const [selectedIdsModal, setSelectedIdsModal] = useState<number[]>([]);
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<any[]>([]);
  const [lossRate, setLossRate] = useState(0);
  const [modalOptions, setModalOptions] = useState<DataSourceProductTable>({
    currentPage: 0,
    list: [],
    total: 0,
    limit: 10,
  });

  const notSelectedProducts = (): PurchaseOrderLineItem[] => {
    const selectedProducts: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    return (
      purchaseOrder?.line_items.filter(
        (item) =>
          item.id && !selectedProducts.some((selected) => selected.variant_id === item.variant_id),
      ) || []
    );
  };

  const handleSearchPOVariantsModal = (value: string) => {
    if (value) {
      const resultSearch =
        notSelectedProducts().filter((item) => {
          return fullTextSearch(value, `${item.sku} ${item.variant}`);
        }) || [];
      setModalOptions((prev) => {
        return { ...prev, currentPage: 0, list: resultSearch };
      });
    } else {
      setModalOptions((prev) => {
        return { ...prev, currentPage: 0, list: notSelectedProducts() };
      });
    }
  };

  const handleSearchPOVariantAutoComplete = (value: string) => {
    if (value) {
      const resultSearch =
        notSelectedProducts().filter((item) =>
          fullTextSearch(value, `${item.sku} ${item.variant}`),
        ) || [];
      setAutoCompleteOptions(
        resultSearch.map((item, index) => ({
          label: (
            <ProductPOItem
              item={item}
              index={index}
              selectedIds={[]}
              setSelectedIds={() => {}}
              showCheckBox={false}
            />
          ),
          value: item.id,
        })),
      );
    } else {
      setAutoCompleteOptions(
        notSelectedProducts().map((item, index) => ({
          label: (
            <ProductPOItem
              item={item}
              index={index}
              selectedIds={[]}
              setSelectedIds={() => {}}
              showCheckBox={false}
            />
          ),
          value: item.id,
        })),
      );
    }
  };

  const handleCheckAllProduct = (checked: boolean) => {
    if (checked) {
      const selectIds =
        modalOptions.list.reduce((acc: number[], item: PurchaseOrderLineItem) => {
          if (item.variant_id) {
            acc.push(item.variant_id);
          }
          return acc;
        }, []) || [];
      setSelectedIdsModal(selectIds);
    } else {
      setSelectedIdsModal([]);
    }
  };

  const handleEnterLostRate = (value: number) => {
    let rate: number = value ?? 0;
    rate = rate > 100 ? 100 : rate;
    rate = rate < 0 ? 0 : rate;

    handleSupplementalStamp(rate, form, purchaseOrder);
    setLossRate(rate);
  };

  const updateOptions = () => {
    const notSelected = notSelectedProducts();
    const newAutoCompleteOptions = notSelected.map((item, index) => {
      return {
        label: (
          <ProductPOItem
            item={item}
            index={index}
            selectedIds={[]}
            setSelectedIds={() => {}}
            showCheckBox={false}
          />
        ),
        value: item.id,
      };
    });
    setAutoCompleteOptions(newAutoCompleteOptions);
    setModalOptions((prev) => {
      return { ...prev, currentPage: 0, list: notSelected };
    });
  };

  const handleSelectProductAutoComplete = (value: string) => {
    const selectedProduct: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const lineItem = notSelectedProducts().find((item) => item.id === Number(value));
    if (lineItem && !selectedProduct.some((item) => item.variant_id === lineItem.product_id)) {
      const quantity = lineItem.quantity;
      const surplus = (quantity || 0) % AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE;
      const quantity_req = !surplus
        ? quantity
        : quantity + (AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE - surplus);
      selectedProduct.push({
        variant_id: lineItem.variant_id,
        quantity_req,
        name: lineItem.variant,
        sku: lineItem.sku,
        barcode: lineItem.barcode,
        price: lineItem.price,
        planQuantity: lineItem.quantity,
        product_id: lineItem.product_id,
      });
      form.setFieldsValue({
        [FormFiledStampPrinting.variants]: [...selectedProduct],
      });
      updateOptions();
    }
  };

  const handleAddProductInModal = () => {
    const selectedProduct: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    selectedIdsModal.forEach((variantId) => {
      const lineItem = notSelectedProducts().find((item) => item.variant_id === Number(variantId));
      if (lineItem && !selectedProduct.some((item) => item.variant_id === lineItem.product_id)) {
        const quantity = lineItem.quantity;
        const surplus = (quantity || 0) % AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE;
        const quantity_req = !surplus
          ? quantity
          : quantity + (AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE - surplus);
        selectedProduct.push({
          variant_id: lineItem.variant_id,
          quantity_req,
          name: lineItem.variant,
          sku: lineItem.sku,
          barcode: lineItem.barcode,
          price: lineItem.price,
          planQuantity: lineItem.quantity,
          product_id: lineItem.product_id,
        });
        form.setFieldsValue({
          [FormFiledStampPrinting.variants]: [...selectedProduct],
        });
      }
    });
    updateOptions();
    setSelectedIdsModal([]);
  };

  const handleDeleteVariant = (variantId: number) => {
    const selectedProduct: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const newProduct = selectedProduct.filter((item) => item.variant_id !== variantId);
    form.setFieldsValue({ [FormFiledStampPrinting.variants]: [...newProduct] });
    updateOptions();
  };

  const handleFinish = async (value: POStampPrinting) => {
    const res = await callApiNative(
      { notifyAction: "SHOW_ALL" },
      dispatch,
      printVariantBarcodeByPOApi,
      value,
    );
    if (res) {
      DownloadFile(res);
      history.push(ProductTabUrl.STAMP_PRINTING_HISTORY);
    }
  };
  const getTotalQuantityReq = useCallback(() => {
    const variantList: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const quantityReq = cloneDeep(variantList);
    const total = quantityReq.reduce((value, element) => {
      return value + (element.quantity_req || 0);
    }, 0);
    return formatCurrencyForProduct(total);
  }, [form.getFieldValue(FormFiledStampPrinting.variants)]);
  const getTotalSLSP = useCallback(() => {
    const variantList: ProductStampPrinting[] =
      form.getFieldValue(FormFiledStampPrinting.variants) || [];
    const quantityReq = cloneDeep(variantList);
    const total = quantityReq.reduce((value, element) => {
      return value + (element.planQuantity || 0);
    }, 0);
    return formatCurrencyForProduct(total);
  }, [form.getFieldValue(FormFiledStampPrinting.variants)]);

  useEffect(() => {
    if (poId) {
      dispatch(
        PoDetailAction(poId, (po) => {
          if (po) {
            const selectedProduct: ProductStampPrinting[] =
              po.line_items.reduce(
                (acc: ProductStampPrinting[], lineItem: PurchaseOrderLineItem) => {
                  if (lineItem.variant_id) {
                    const quantity = lineItem.quantity;
                    const surplus = (quantity || 0) % AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE;
                    const quantity_req = !surplus
                      ? quantity
                      : quantity + (AppConfig.AMOUNT_IN_STAMP_ON_ONE_LINE - surplus);
                    acc.push({
                      variant_id: lineItem.variant_id,
                      quantity_req,
                      name: lineItem.variant,
                      sku: lineItem.sku,
                      barcode: lineItem.barcode,
                      price: lineItem.price,
                      planQuantity: lineItem.quantity,
                      product_id: lineItem.product_id,
                    });
                  }
                  return acc;
                },
                [],
              ) || [];

            form.setFieldsValue({
              [FormFiledStampPrinting.supplier]: po.supplier,
              [FormFiledStampPrinting.supplier_id]: po.supplier_id,
              [FormFiledStampPrinting.order_code]: po.code,
              [FormFiledStampPrinting.order_id]: po.id,
              [FormFiledStampPrinting.variants]: [...selectedProduct],
            });

            setPurchaseOrder(po);
            setBreadcrumb([
              ...defaultBreadcrumbStampPrinting,
              { name: po.code, path: `${UrlConfig.PURCHASE_ORDERS}/${po.id}` },
              { name: "In mã vạch" },
            ]);
          }
        }),
      );
    }
  }, [poId, dispatch, form]);

  return (
    <ContentContainer breadcrumb={breadcrumb} title="Đặt lệnh in">
      <StampPrintingStyle>
        <Form form={form} initialValues={initFormValueStampPrinting} onFinish={handleFinish}>
          <Card>
            <Input.Group className="display-flex margin-bottom-20">
              <CustomAutoComplete
                loading={!purchaseOrder}
                id="#product_search"
                dropdownClassName="product"
                placeholder="Tên/Mã sản phẩm"
                textEmpty="Không có sản phẩm nào"
                onSearch={handleSearchPOVariantAutoComplete}
                dropdownMatchSelectWidth={456}
                style={{ width: "100%" }}
                textAdd="+ Thêm mới sản phẩm"
                onSelect={handleSelectProductAutoComplete}
                options={autoCompleteOptions}
                showAdd={false}
              />
              <BaseButton
                style={{ marginLeft: 10 }}
                onClick={() => setVisiblePickManyModal(true)}
                icon={<IconAddMultiple width={12} height={12} />}
              >
                Chọn nhiều
              </BaseButton>
            </Input.Group>

            <Row gutter={10} className="row-action">
              <Col md={8} lg={8} xl={8}>
                <div className="row-info margin-bottom-10">
                  <div className="col-title">Đơn mua hàng:&nbsp;</div>
                  <div className="col-value">{purchaseOrder?.code || "-"}</div>
                </div>
                <div className="row-info">
                  <div className="col-title">NCC:&nbsp;</div>
                  <div className="col-value">{purchaseOrder?.supplier || "-"}</div>
                </div>
              </Col>
              <Col md={8} lg={6} xl={4}>
                <Item label="Mức hao hụt" labelCol={{ span: 24 }} help={false}>
                  <NumberInput
                    value={lossRate}
                    min={0}
                    max={100}
                    maxLength={3}
                    suffix={<div className="vat-suffix">%</div>}
                    style={{ width: "100%" }}
                    className="product-item-vat"
                    onPressEnter={(event: any) => {
                      handleEnterLostRate(event.target.value);
                    }}
                  />
                </Item>
              </Col>
              <Col md={8} lg={10} xl={12}>
                <Item
                  label="Ghi chú"
                  labelCol={{ span: 24 }}
                  help={false}
                  name={FormFiledStampPrinting.note}
                >
                  <Input placeholder="Nhập ghi chú" max={255} />
                </Item>
              </Col>
            </Row>
            <Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues[FormFiledStampPrinting.variants] !==
                curValues[FormFiledStampPrinting.variants]
              }
            >
              {({ getFieldValue }) => {
                const variantList: ProductStampPrinting[] =
                  getFieldValue(FormFiledStampPrinting.variants) || [];
                return (
                  <Table
                    className="margin-top-20"
                    bordered
                    scroll={{ x: "max-content" }}
                    dataSource={variantList}
                    columns={[
                      {
                        title: "STT",
                        align: "center",
                        width: 70,
                        render: (text, record, index) => index + 1,
                      },
                      {
                        title: "Sản phẩm",
                        dataIndex: "sku",
                        render: (text, record) => {
                          if (record.product_id && record.variant_id) {
                            return (
                              <a
                                href={`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/${record.product_id}${UrlConfig.VARIANTS}/${record.variant_id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {text}
                              </a>
                            );
                          }
                          return text;
                        },
                      },
                      {
                        title: "Mã vạch",
                        dataIndex: "barcode",
                      },
                      {
                        title: "Tên sản phẩm",
                        dataIndex: "name",
                      },
                      {
                        title: "Giá bán",
                        align: "right",
                        dataIndex: "price",
                        render: (text, record) => formatCurrency(text),
                      },
                      {
                        title: (
                          <>
                            SLSP <div>({getTotalSLSP()})</div>
                          </>
                        ),
                        align: "center",
                        dataIndex: "planQuantity",
                        render: (text) => <strong>{text}</strong>,
                      },
                      {
                        title: (
                          <>
                            {" "}
                            Số lượng tem
                            <Tooltip title="SL tem in chia hết cho 3">
                              {" "}
                              <InfoCircleOutlined />{" "}
                            </Tooltip>
                            <div>({getTotalQuantityReq()})</div>
                          </>
                        ),
                        align: "center",
                        dataIndex: "variant_id",
                        render: (variantId, record) => {
                          return (
                            <InputNumber
                              className="input-number"
                              value={record.quantity_req}
                              onChange={(value) =>
                                handleChangeQtyPrintByVariantId(variantId, value, form)
                              }
                            />
                          );
                        },
                      },
                      {
                        title: "",
                        align: "center",
                        dataIndex: "variant_id",
                        render: (variant_id) => {
                          return (
                            <Button
                              icon={<AiOutlineClose />}
                              onClick={() => {
                                handleDeleteVariant(variant_id);
                              }}
                            />
                          );
                        },
                      },
                    ]}
                    rowKey="id"
                    pagination={false}
                  />
                );
              }}
            </Item>
            <Item
              name={FormFiledStampPrinting.variants}
              rules={[
                {
                  type: "array",
                  required: true,
                  message: "Vui lòng chọn sản phẩm để in",
                },
              ]}
            />
          </Card>

          <Item name={FormFiledStampPrinting.type_name} />
          <Item name={FormFiledStampPrinting.order_code} />
          <Item name={FormFiledStampPrinting.order_id} />
          <Item name={FormFiledStampPrinting.supplier} />
          <Item name={FormFiledStampPrinting.supplier_id} />

          <PickManyModal<PurchaseOrderLineItem>
            modalProps={{
              okText: "Thêm vào danh sách in",
              visible: visiblePickManyModal,
              onCancel: () => setVisiblePickManyModal(false),
              onOk: () => {
                handleAddProductInModal();
                setVisiblePickManyModal(false);
              },
              bodyStyle: { padding: "20px 20px 0 20px" },
            }}
            inputProps={{
              placeholder: "Tên/Mã sản phẩm",
              onChange: (e) => handleSearchPOVariantsModal(e.target.value),
            }}
            listItem={(item, index) => (
              <ProductPOItem
                item={item}
                index={index}
                selectedIds={selectedIdsModal}
                setSelectedIds={setSelectedIdsModal}
              />
            )}
            options={modalOptions.list}
            pagingProps={false}
            rowKey="variant_id"
            onSelectAll={handleCheckAllProduct}
          />
        </Form>
        <BottomBarContainer
          back={"Quay lại đơn đặt hàng"}
          backAction={() => history.push(`${UrlConfig.PURCHASE_ORDERS}/${poId}`)}
          rightComponent={
            <Button type="primary" onClick={() => form.submit()}>
              Xuất excel
            </Button>
          }
        />
      </StampPrintingStyle>
    </ContentContainer>
  );
}

export default PrintingStamp;
