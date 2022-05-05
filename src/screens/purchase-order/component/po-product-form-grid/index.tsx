import { Col, Divider, FormInstance, Input, InputNumber, Row, Skeleton, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { flatMapDeep, uniq } from "lodash";
import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import { PODataSourceGrid, PODataSourceVariantItemGrid, POLineItemColor, POLineItemGridSchema, POLineItemGridValue, POPairSizeQuantity } from "model/purchase-order/purchase-order.model";
import React, { createRef, useContext, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import { getTotalPriceOfAllLineItem, initSchemaLineItem, initValueLineItem } from "utils/POUtils";
import { sortSizeProduct } from "utils/ProductUtils";
import { showError } from "utils/ToastUtils";
import BaseButton from "../../../../component/base/BaseButton";
import CustomAutoComplete from "../../../../component/custom/autocomplete.cusom";
import NumberInput from "../../../../component/custom/number-input.custom";
import { IconAddMultiple } from "../../../../component/icon/IconAddMultiple";
import { AppConfig } from "../../../../config/app.config";
import UrlConfig, { BASE_NAME_ROUTER } from "../../../../config/url.config";
import {
  productGetDetail,
  searchProductWrapperRequestAction
} from "../../../../domain/actions/product/products.action";
import { PageResponse } from "../../../../model/base/base-metadata.response";
import {
  ProductResponse,
  ProductWrapperSearchQuery
} from "../../../../model/product/product.model";
import { POField } from "../../../../model/purchase-order/po-field";
import { formatCurrency, replaceFormatString } from "../../../../utils/AppUtils";
import ProductItem from "./product-item";
import { PoProductFormContainer } from "./styles";

type POProductFormProps = {
  isEditMode: boolean;
  formMain: FormInstance;
};
const POProductForm = ({

  formMain,
  isEditMode,
}: POProductFormProps) => {
  const dispatch = useDispatch();
  const [isSelecttingProduct, setIsSelecttingProduct] = useState(false);
  const productSearchRef = createRef<CustomAutoComplete>();

  //context 
  const { setPoLineItemGridChema, setPoLineItemGridValue,
    poLineItemGridChema,
    poLineItemGridValue,
    taxRate,
    setTaxRate
  } = useContext(PurchaseOrderCreateContext);

  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [productList, setProductList] = useState<PageResponse<ProductResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const renderResult = useMemo(() => {
    return productList.items.map((item: ProductResponse) => {
      return {
        label: <ProductItem item={item} key={item.id.toString()} />,
        value: item.id.toString(),
      };
    });
  }, [productList]);

  const fetchProducts = (params: ProductWrapperSearchQuery) => {
    dispatch(
      searchProductWrapperRequestAction(params, (data) => {
        if (data) {
          setProductList(data);
        }
        setIsLoadingProduct(false);
      })
    );
  };

  const onSearchProduct = (value: string) => {
    setIsLoadingProduct(true);
    fetchProducts({ info: value.trim() });
  };

  const onSelectProduct = (value: any) => {
    setIsSelecttingProduct(true);

    dispatch(
      productGetDetail(value, (data: ProductResponse) => {
        if(data.status === 'inactive'){
          showError('Sản phẩm đã ngừng hoạt động')
          setIsSelecttingProduct(false);
          return
        }

        if (data.variants) {

          const procurements = formMain.getFieldValue(POField.procurements);
          formMain.setFieldsValue({
            [POField.line_items]: data.variants,
          });

          /**
           * Tạo mới giá trị mặc định các procurement item
           * Cần init sku, size, id để mapping khi thay đổi nhanh số lượng/ đoán thế chứ chưa đọc lại code của ĐoanHV
          */
          procurements.forEach((procurement: any, index: number) => {
            procurement.procurement_items = data.variants.map((variant) => {
              return { sku: variant.sku, quantity: 0, size: variant.size, id: variant.id };
            });
          });


          formMain.setFieldsValue({
            [POField.procurements]: [...procurements],
          });

          /**
           * Tạo schema cấu trúc bảng cho sp
           */
          const newpoLineItemGridChema = [];
          newpoLineItemGridChema.push(initSchemaLineItem(data, "CREATE"));
          setPoLineItemGridChema(newpoLineItemGridChema);

          /**
           * Tạo giá trị mặc định cho bảng
           * Hiện tại đang chỉ cho chọn 1
          */
          const newpoLineItemGridValue: Map<string, POLineItemGridValue>[] = [];
          newpoLineItemGridChema.forEach(schema => {
            newpoLineItemGridValue.push(initValueLineItem(schema));
          })
          setPoLineItemGridValue(newpoLineItemGridValue);
        }
        setIsSelecttingProduct(false);
      })
    );

  };

  const transformDataSource = (isEditMode: boolean): Array<PODataSourceGrid> => {

    const dataSrc: Array<PODataSourceGrid> = [];
    poLineItemGridChema.forEach((schema: POLineItemGridSchema, schemaIndex: number) => {
      schema.baseColor.forEach((c) => {
        const { clothCode, color } = c;
        /**
          * Check nếu dòng không có variant nào được nhập quantity thì ẩn
          *DK : view mode           
           */
        if (!isEditMode && poLineItemGridValue[schemaIndex].get(color)?.sizeValues.every(sizeValue => !sizeValue.quantity)) {
          return;
        }

        const row: any = {
          schemaIndex,
          productId: schema.productId,
          productCode: schema.productCode,
          productName: schema.productName,
          clothCode,
          color,
          ...schema.baseSize.reduce((previousValue: any, currentValue: any) => {
            const mapping = schema.mappingColorAndSize.find(variant => variant.color === color && variant.size === currentValue);
            const variantId = mapping ? mapping.variantId : null;
            return {
              ...previousValue,
              [currentValue]: {
                variantId: variantId,
                disabled: !variantId,
                productId: schema.productId,
                productCode: schema.productCode,
                productName: schema.productName,
                schemaIndex,
              }
            }
          }, {
            /**{
               * M : {
               * variantId,
               * disabled,
               * ...
               * }
              *}
             */
          }),
        }

        dataSrc.push(row);
      })
    })
    return dataSrc;
  }

  /**
   * Thay thay đổi số lượng ô nhập số lượng sản phẩm
   * @param value 
   * @param color 
   * @param variantId 
   * @param schemaIndex 
   */
  const onChangeQuantity = (value: number, color: string, variantId: number, schemaIndex: number) => {
    const newpoLineItemGridValue = [...poLineItemGridValue];
    newpoLineItemGridValue[schemaIndex].get(color)?.sizeValues.forEach((sizeValue: POPairSizeQuantity) => {
      if (sizeValue.variantId === variantId) {
        sizeValue.quantity = value;
      }
    }
    )
    setPoLineItemGridValue(newpoLineItemGridValue);
  }

  /**
   * Thay đổi số lượng ô nhập số lượng sản phẩm theo size (cột)
   * @param inputValue 
   * @param size 
   */
  const onChangeQuantityHeader = (inputValue: number | null, size: string) => {
    if (typeof inputValue === 'number') {
      const newpoLineItemGridValue = [...poLineItemGridValue];
      newpoLineItemGridValue.forEach((schema: Map<string, POLineItemGridValue>) => {
        const mapIterator = schema.values();
        const mapLength = schema.size;
        for (let i = 0; i < mapLength; i++) {
          const { sizeValues } = mapIterator.next().value;
          sizeValues.forEach((sizeValue: POPairSizeQuantity) => {
            if (sizeValue.size === size) {
              sizeValue.quantity = inputValue;
            }
          }
          )
        }
      })

      setPoLineItemGridValue(newpoLineItemGridValue);
    }
  }
  /**
   * thay đổi số lượng ô nhập đơn giá từng màu
   * @param value 
   * @param color 
   * @param schemaIndex 
   */
  const onChangePrice = (value: number, color: string, schemaIndex: number) => {
    const newpoLineItemGridValue = [...poLineItemGridValue];
    const colorValue = newpoLineItemGridValue[schemaIndex].get(color);
    if (colorValue) {
      colorValue.price = value;
      setPoLineItemGridValue(newpoLineItemGridValue);
    }
  }

  /**
   * Thay đổi số lượng ô nhập đơn giá cho tất cả các màu
   * @param value 
   */
  const onChangePriceHeader = (value: number) => {
    const newpoLineItemGridValue = [...poLineItemGridValue];
    newpoLineItemGridValue.forEach((valueLine: Map<string, POLineItemGridValue>) => {
      const mapIterator = valueLine.values();
      const mapLength = valueLine.size;
      for (let i = 0; i < mapLength; i++) {
        mapIterator.next().value.price = value;
      }
    })

    setPoLineItemGridValue(newpoLineItemGridValue);

  }

  const sumOfQty = useMemo((): number => {
    let sum = 0;
    poLineItemGridValue.forEach((valueLine: Map<string, POLineItemGridValue>) => {
      const mapIterator = valueLine.values();
      const mapLength = valueLine.size;
      for (let i = 0; i < mapLength; i++) {
        const { sizeValues } = mapIterator.next().value;
        if (sizeValues.length > 0) {
          for (let index = 0; index < sizeValues.length; index++) {
            const element = sizeValues[index];
            sum += element.quantity || 0;
          }
        }
      }
    })
    return Number(sum);
  }, [poLineItemGridValue])

  const sizeRenderTable = useMemo((): Array<string> => {
    if (isEditMode) {
      return uniq(flatMapDeep(poLineItemGridChema?.map(schema => schema.baseSize))).sort((a, b) => sortSizeProduct(a, b, "asc"));
    } else if (poLineItemGridValue.length > 0) {
      const availableSize: string[] = [];
      poLineItemGridValue.forEach((valueLine: Map<string, POLineItemGridValue>) => {
        const mapIterator = valueLine.values();
        const mapLength = valueLine.size;
        for (let i = 0; i < mapLength; i++) {
          const { sizeValues }: POLineItemGridValue = mapIterator.next().value;
          if (sizeValues.length > 0) {
            for (let index = 0; index < sizeValues.length; index++) {
              const element = sizeValues[index];
              if (element.quantity > 0) {
                availableSize.push(element.size);
              }
            }

          }
        }
      })
      return uniq(availableSize).sort((a, b) => sortSizeProduct(a, b, "asc"));
    } else {
      return [];
    }

  }, [poLineItemGridChema, poLineItemGridValue, isEditMode])

  const columns: ColumnsType<any> = [
    {
      title: "Mã SP",
      dataIndex: "productCode",
      width: 100,
      render: (text: string, row: PODataSourceGrid, index: number) => {
        const obj: any = {
          children: text,
          props: {},
        };
        const { schemaIndex } = row;
        const baseColor = poLineItemGridChema[schemaIndex].baseColor;

        baseColor.forEach((c: POLineItemColor, i: number) => {
          if (baseColor.length > 1) {
            if (index % baseColor.length === 0) {
              obj.props.rowSpan = baseColor.length;
            }
            if (index % baseColor.length === i) {
              obj.props.rowSpan = 0;
            }
          }
        });
        return obj;
      },
    },
    {
      title: "Tên SP",
      dataIndex: "productName",
      rowSpan: 3, width: 150,
      render: (text: string, row: PODataSourceGrid, index: number) => {
        const obj: any = {
          children: text,
          props: {},
        };
        const { schemaIndex } = row;
        const baseColor = poLineItemGridChema[schemaIndex].baseColor;

        baseColor.forEach((c: POLineItemColor, i: number) => {
          if (baseColor.length > 1) {
            if (index % baseColor.length === 0) {
              obj.props.rowSpan = baseColor.length;
            }
            if (index % baseColor.length === i) {
              obj.props.rowSpan = 0;
            }
          }
        });
        return obj;
      },
    },
    {
      title: "Mã màu", width: 80,
      dataIndex: "clothCode",
    },
    {
      title: "Màu",
      dataIndex: "color",
      width: 80,
    }, {
      title: "Size",
      /**
       * Handle case nhiều mã 7
       * nếu có nhiều mã 7 nhưng số lượng màu trùng nhau thì chỉ hiển thị unique màu
       */
      children: sizeRenderTable.map((size: string) => {

        return {
          title: <div>
            <p>{size}</p>
            {isEditMode && <NumberInput min={0} onChange={(value) => onChangeQuantityHeader(value, size)} />}
          </div>,
          dataIndex: size,
          key: size,
          align: "center",
          width: 80,
          render: (v: PODataSourceVariantItemGrid, record: PODataSourceGrid) => {
            let quantityOfSize = undefined;
            let variantId: number | null = null;
            const { schemaIndex } = record;
            // check product thứ mấy và get ra số lượng của từng màu
            const sizeOfColor = poLineItemGridValue[schemaIndex].get(record.color)
            if (sizeOfColor) {
              const valueOfSize = sizeOfColor.sizeValues.find(variant => variant.size === size);
              quantityOfSize = valueOfSize?.quantity;
              variantId = valueOfSize?.variantId || null;
            }
            /**
             * Nếu là trường hợp sửa thì sẽ hiển thị ô nhập số lượng
             * Nếu là trường hợp xem thì sẽ hiển thị số lượng
             * Nếu ô bị disable thì ở màn hình read hiển thị null
             */
            return isEditMode ? (
              <InputNumber
                className="size-input"
                size="small"
                min={0}
                maxLength={10}
                value={quantityOfSize}
                disabled={!!record.disabled || !variantId}
                onChange={(value: number) => {
                  if (variantId) {
                    onChangeQuantity(value, record.color, variantId, schemaIndex);
                  } else {
                    showError("Ô nhập số lượng không hợp lệ")
                  }
                }
                }
              />
            ) : (!record.disabled && quantityOfSize && formatCurrency(quantityOfSize))
          }
        }
      })
    },
    {
      title: <div>Tổng SL
        <br />
        ({formatCurrency(sumOfQty)})
      </div>,
      align: "center",
      dataIndex: "color",
      width: 100,
      render: (color: string, row: PODataSourceGrid) => {
        let total = 0;
        const { schemaIndex } = row;
        const sizeQtyOfColorObject = poLineItemGridValue[schemaIndex].get(color);

        if (sizeQtyOfColorObject) {
          sizeQtyOfColorObject.sizeValues.forEach((variant: POPairSizeQuantity) => {
            total += variant.quantity || 0;
          }
          )
        }
        return formatCurrency(total);
      }

    },
    {
      title: <div style={{
        position: "absolute",
        bottom: "10px",
        left: '4px',
        right: '4px'
      }}>
        <p>Giá nhập</p>
        {isEditMode &&
          <NumberInput min={0}
            onChange={(value) => onChangePriceHeader(value || 0)}
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
          />
        }
      </div>,
      dataIndex: "color",
      width: 120,
      align: "center",
      render: (color: string, row: PODataSourceGrid) => {
        const { schemaIndex } = row;
        const sizeQtyOfColorObject = poLineItemGridValue[schemaIndex].get(color);
        return isEditMode ? <NumberInput min={0}
          value={sizeQtyOfColorObject?.price ?? 0}
          onChange={(value) => onChangePrice(value ?? 0, color, schemaIndex)}
          format={(a: string) => formatCurrency(a)}
          replace={(a: string) => replaceFormatString(a)}
        /> : formatCurrency(sizeQtyOfColorObject?.price ?? 0);
      }
    },
    {
      title: "Thành tiền",
      dataIndex: "color",
      align: "right",
      width: 100,
      render: (color: string, row: PODataSourceGrid) => {
        let total = 0;
        const { schemaIndex } = row;
        const sizeQtyOfColorObject = poLineItemGridValue[schemaIndex].get(color);
        const price = sizeQtyOfColorObject?.price ?? 0;
        sizeQtyOfColorObject?.sizeValues.forEach((variant: POPairSizeQuantity) => {
          total += (variant.quantity || 0) * price;
        })
        return formatCurrency(total) + " đ";
      },
    },
  ]

  return (
    <PoProductFormContainer>
      {isEditMode && (
        <Input.Group className="input-group">
          <CustomAutoComplete
            loading={isLoadingProduct}
            id="#product_search"
            dropdownClassName="product"
            placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F3)"
            onSearch={debounce(onSearchProduct, AppConfig.TYPING_TIME_REQUEST)}
            dropdownMatchSelectWidth={456}
            style={{ width: "100%" }}
            showAdd={true}
            textAdd="Thêm mới sản phẩm"
            onSelect={onSelectProduct}
            options={renderResult}
            ref={productSearchRef}
            onClickAddNew={() => {
              window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
            }}
          />
          <BaseButton
            style={{ marginLeft: 10 }}
            disabled={true}
            icon={<IconAddMultiple width={12} height={12} />}>
            Chọn nhiều mã cha
          </BaseButton>
        </Input.Group>
      )}
      {!isEmpty(poLineItemGridChema) && !isEmpty(poLineItemGridValue) ? (
        <Table
          loading={isSelecttingProduct}
          className="product-table-new"
          rowClassName="product-table-row"
          tableLayout="fixed"
          bordered
          pagination={false}
          scroll={{ y: 515, x: 950 }}
          dataSource={transformDataSource(isEditMode)}
          columns={columns}
          rowKey={(record: PODataSourceGrid) => record.color}
          footer={() => {
            const amount: number = getTotalPriceOfAllLineItem(poLineItemGridValue);
            formMain.setFieldsValue({ [POField.total]: Math.round(amount + (amount * (taxRate / 100))) });
            return (
              <Row className="footer">
                <Col span={14} />
                <Col span={10}>
                  <div className="po-payment-row">
                    <div>Tổng tiền</div>
                    <div className="po-payment-row-result">
                      {formatCurrency(Math.round(amount))}
                    </div>
                  </div>
                  <div className="po-payment-row">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>VAT</span>
                      {(
                        isEditMode ? <NumberInput
                          value={taxRate}
                          min={0}
                          max={100}
                          suffix={<div className="vat-suffix">%</div>}
                          style={{ width: "80px" }}
                          className="product-item-vat margin-left-40"
                          onChange={(value: number | null) => {
                            setTaxRate(value || 0);
                          }}
                        /> : `(${taxRate})%`
                      )}
                    </div>
                    <div className="po-payment-row-result">
                      {formatCurrency(Math.round((amount * taxRate) / 100))}
                    </div>
                  </div>
                  <Divider />
                  <div className="po-payment-row">
                    <strong className="po-payment-row-title">Tiền cần trả</strong>
                    <strong className="po-payment-row-success">
                      {formatCurrency(
                        amount + (amount * taxRate) / 100
                      )}
                    </strong>
                  </div>
                </Col>
              </Row>
            )
          }}

        />
      ) : (
        isSelecttingProduct && <Skeleton active />
      )}
    </PoProductFormContainer>
  );
};

export default POProductForm;
