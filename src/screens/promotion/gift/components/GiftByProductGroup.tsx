import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Card,
  Col, Divider,
  Form,
  FormInstance,
  Input,
  InputNumber, Radio,
  Row,
  Space,
  Tooltip,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import ParentProductItem from "component/item-select/parent-product-item";
import ModalConfirm from "component/modal/ModalConfirm";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import _ from "lodash";
import { GiftProductEntitlements } from "model/promotion/gift.model";
import { GiftEntitlementForm } from "model/promotion/gift.model";
import { AiOutlineClose } from "react-icons/ai";
import { RiInformationLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  handleDenyParentProduct,
  onSelectVariantOfGift,
  parseSelectProductToTableData,
} from "utils/PromotionUtils";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import UrlConfig from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { formatCurrency } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import ProductItem from "screens/purchase-order/component/product-item";
import { MAX_FIXED_DISCOUNT_VALUE } from "screens/promotion/constants";
import GiftProduct from "screens/promotion/gift/components/GiftProduct";
import DuplicatePlus from "assets/icon/DuplicatePlus.svg";


interface Props {
  form: FormInstance;
  remove: (index: number) => void;
  name: number;
  key: number;
  fieldKey: number;
  handleVisibleManyProduct: (indexOfEntilement: number) => void;
}
const GiftByProductGroup = (props: Props) => {
  const { key, name, form, remove, handleVisibleManyProduct } = props;
  const dispatch = useDispatch();

  const [dataSearchVariant, setDataSearchVariant] = useState<Array<VariantResponse>>([]);
  const productSearchRef = createRef<CustomAutoComplete>();
  
  const selectedProductParentRef = useRef<ProductResponse | null>(null);
  const variantsOfSelectedProductRef = useRef<Array<VariantResponse>>([]);
  const [isVisibleConfirmReplaceProductModal, setIsVisibleConfirmReplaceProductModal] =
    useState<boolean>(false);
  
  const [dataProductForPagging, setDataProductForPagging] = useState<
    PageResponse<GiftProductEntitlements>
  >({
    items: [],
    metadata: {
      total: 0,
      limit: 10,
      page: 1,
    },
  });

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const dataSourceForm: Array<GiftProductEntitlements> =
    form.getFieldValue("entitlements")[name]?.selectedProducts;

  const handlePageChange = (page: number, pageSize?: number) => {
    if (!pageSize) {
      pageSize = dataProductForPagging.metadata.limit;
    }
    const product = dataSourceForm.slice((page - 1) * pageSize, page * pageSize);
    setDataProductForPagging({
      items: product,
      metadata: {
        total: dataSourceForm.length,
        limit: pageSize,
        page: page,
      },
    });
  };

  const handleSizeChange = (current: number, size: number) => {
    setDataProductForPagging({
      items: dataSourceForm.slice((current - 1) * size, current * size),
      metadata: {
        total: dataSourceForm.length,
        limit: size,
        page: current,
      },
    });
  };
  const onResultSearchVariant = useCallback((result: any) => {
    if (result.items.length <= 0) {
      showError("Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng bán");
    }

    if (!result) {
      setDataSearchVariant([]);
    } else {
      setDataSearchVariant(result.items);
    }
  }, []);

  const onSearchVariant = useCallback(
    (value: string) => {
      dispatch(
        searchVariantsRequestAction(
          {
            status: "active",
            limit: 200,
            page: 1,
            info: value.trim(),
            saleable: true,
          },
          onResultSearchVariant,
        ),
      );
    },
    [dispatch, onResultSearchVariant],
  );

  const renderResult = useMemo(() => {
    let variantOptions: any[] = [];
    let productOptions: any[] = [];
    let productDataSearch: any[] = [];

    dataSearchVariant.forEach((item: VariantResponse) => {
      if (item.product) {
        productDataSearch.push(item.product);
      }
      variantOptions.push({
        label: <ProductItem isTransfer data={item} key={item.id.toString()} />,
        value: JSON.stringify(item),
      });
    });

    _.unionBy(productDataSearch, "id").forEach((item: ProductResponse) => {
      productOptions.push({
        value: JSON.stringify(item),
        label: <ParentProductItem data={item} key={item.code} />,
      });
    });

    return [...productOptions, ...variantOptions];
  }, [dataSearchVariant]);

  /**
   *
   * @param index number index of product in page
   * @param item : GiftProductEntitlements
   */
  const onDeleteItem = (index: number, item: GiftProductEntitlements) => {
    const { limit, page } = dataProductForPagging.metadata;
    console.log("onDeleteItem", index, limit, page);
    // get index in table
    index = (page - 1) * limit + index;
    const entitlementFormValue: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");
    // delete variant from display
    entitlementFormValue[name]?.selectedProducts?.splice(index, 1);

    // delete product from entitled_product_ids
    entitlementFormValue[name].entitled_product_ids = entitlementFormValue[
      name
    ].entitled_product_ids.filter((e: number) => e !== item.product_id);

    // delete product from entitled_variant_ids
    if (item.product_id && item.variant_id) {
      // delete variant id
      entitlementFormValue[name].entitled_variant_ids = entitlementFormValue[
        name
      ].entitled_variant_ids.filter((id: number) => id !== item.variant_id);
    }

    // change reference for re-render form
    form.setFieldsValue({ entitlements: _.cloneDeep(entitlementFormValue) });
  };

  /**
   * Xoá sản phẩm con thuộc sản phẩm cha mới và thêm sản phẩm cha mới.
   */
  const handleAcceptParentProduct = () => {
    if (selectedProductParentRef.current) {
      const entitlementForm: Array<GiftEntitlementForm> = form.getFieldValue("entitlements");

      // delete variant from table
      const filteredVariant = entitlementForm[name].selectedProducts?.filter((product) => {
        return variantsOfSelectedProductRef.current?.every((variant) => {
          return variant.sku !== product.sku;
        });
      });

      // delete variant id
      const filteredVariantId = entitlementForm[name].entitled_variant_ids?.filter((variantId) => {
        return variantsOfSelectedProductRef.current?.every((variant) => {
          return variant.id !== variantId;
        });
      });

      // set form value to display
      filteredVariant?.unshift(parseSelectProductToTableData(selectedProductParentRef.current));
      entitlementForm[name].selectedProducts = filteredVariant;
      entitlementForm[name].entitled_variant_ids = filteredVariantId;
      entitlementForm[name].entitled_product_ids.unshift(selectedProductParentRef.current?.id);

      form.setFieldsValue({ entitlements: _.cloneDeep(entitlementForm) });
    }
    selectedProductParentRef.current = null;
    setIsVisibleConfirmReplaceProductModal(false);
  };

  /**
   * cập nhật phân trang sản phẩm
   */
  useEffect(() => {
    if (Array.isArray(dataSourceForm)) {
      setDataProductForPagging((prev: any) => {
        const { limit, page } = prev.metadata;
        return {
          items: dataSourceForm.slice((page - 1) * limit, page * limit),
          metadata: {
            ...prev.metadata,
            total: dataSourceForm.length,
          },
        };
      });
    }
  }, [dataSourceForm]);

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: any, item: any, index: number) => (
        <div>
          {(dataProductForPagging.metadata.page - 1) * dataProductForPagging.metadata.limit + (index + 1)}
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      className: "ant-col-info",
      dataIndex: "title",
      align: "left",
      render: (title: string, item) => {
        const productDetailLink = item?.variant_id ?
          `${UrlConfig.PRODUCT}/${item?.product_id}/variants/${item?.variant_id}`
          :
          `${UrlConfig.PRODUCT}/${item?.product_id}`
        return (
          <div>
            <Link
              target="_blank"
              to={productDetailLink}
            >
              {item?.variant_title || item?.sku}
            </Link>
            <div className="product-item-name">
              <span className="product-item-name-detail">SKU: {item?.sku}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá vốn",
      className: "ant-col-info",
      align: "center",
      width: "200px",
      dataIndex: "cost",
      render: (value) => {
        if (typeof value === "number") {
          // price at create time
          return formatCurrency(value);
        } else {
          return "-";
        }
      },
    },
    {
      title: "Giá bán",
      className: "ant-col-info",
      align: "center",
      width: "200px",
      dataIndex: "retail_price",
      render: (value) => {
        if (typeof value === "number") {
          // price at create time
          return formatCurrency(value);
        } else {
          return "-";
        }
      },
    },
    {
      className: "ant-col-info",
      align: "right",
      width: "70px",
      render: (value: string, item, index: number) => (
        <Button
          style={{ margin: "0 auto" }}
          onClick={() => onDeleteItem(index, item)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      ),
    },
  ];
  

  return (
    <Card key={name} style={{ boxShadow: "none" }}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name={[name, "prerequisite_quantity_ranges", 0, "greater_than_or_equal_to"]}
            label={
              <Space>
                <span>Số lượng tối thiểu</span>
                <Tooltip title={"Số lượng tối thiểu cho sản phẩm để được áp dụng khuyến mại"}>
                  <RiInformationLine />
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: "Cần nhập số lượng tối thiểu" },
              () => ({
                validator(_, value) {
                  if (typeof value === "number" && value <= 0) {
                    return Promise.reject(new Error("Số lượng tối thiểu phải lớn hơn 0"));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} max={MAX_FIXED_DISCOUNT_VALUE} style={{ width: "100%" }} />
          </Form.Item>
        </Col>

        <Col span={9} style={{ margin: "auto" }}>
          <Form.Item
            name={""}
            style={{ marginBottom: "0" }}
          >
            <Radio.Group defaultValue={true}>
              <Radio value={true}>Trên cùng 1 sản phẩm</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>

      <div>
        <Input.Group className="display-flex" style={{ marginBottom: "20px" }}>
          <CustomAutoComplete
            key={`${key}-product_search`}
            id="#product_search"
            dropdownClassName="product"
            placeholder="Thêm sản phẩm theo tên, mã SKU, mã vạch..."
            onSearch={_.debounce(onSearchVariant, 300)}
            dropdownMatchSelectWidth={456}
            style={{ width: "100%" }}
            onSelect={(value) =>
              onSelectVariantOfGift(
                value,
                selectedProductParentRef,
                variantsOfSelectedProductRef,
                setIsVisibleConfirmReplaceProductModal,
                form,
                name,
                dispatch,
              )
            }
            options={renderResult}
            ref={productSearchRef}
            textEmpty={"Không tìm thấy sản phẩm"}
          />

          {/*Tạm ẩn chọn nhiều*/}
          <Button
            icon={<img src={DuplicatePlus} style={{ marginRight: 8 }} alt="" />}
            onClick={() => handleVisibleManyProduct(name)}
            style={{ display: "none", width: 132, marginLeft: 10 }}
          >
            Chọn nhiều
          </Button>
        </Input.Group>

        <CustomTable
          className="product-table"
          bordered
          rowKey={(record) => record?.sku}
          rowClassName="product-table-row"
          columns={columns}
          dataSource={dataProductForPagging.items}
          tableLayout="fixed"
          pagination={{
            pageSize: dataProductForPagging.metadata.limit,
            total: dataProductForPagging.metadata.total,
            current: dataProductForPagging.metadata.page,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange,
            showSizeChanger: true,
          }}
          scroll={{ y: 300 }}
        />

        <Divider style={{ margin: "20px 0" }} />

        <GiftProduct name={name} form={form} />

        {/*Hiển thị xóa nhóm quà tặng nếu nhiều hơn 1 nhóm*/}
        {form.getFieldValue("entitlements")?.length > 1 && (
          <Row gutter={16} style={{ paddingTop: "16px" }}>
            <Col span={24}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => {
                  setIsShowConfirmDelete(true);
                }}
              >
                Xoá nhóm quà tặng
              </Button>
            </Col>
          </Row>
        )}

        <ModalConfirm
          visible={isVisibleConfirmReplaceProductModal}
          title="Xoá sản phẩm con trong danh sách"
          subTitle="Đã có sản phẩm con trong danh sách, thêm sản phẩm cha sẽ tự động xoá sản phẩm con"
          onOk={() => {
            handleAcceptParentProduct();
          }}
          onCancel={() => {
            handleDenyParentProduct(
              setIsVisibleConfirmReplaceProductModal,
              selectedProductParentRef,
            );
          }}
        />

        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          okText={"Xóa"}
          onOk={() => remove(name)}
          cancelText={"Thoát"}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Bạn có chắc chắn muốn xóa nhóm quà tặng không?"
        />
      </div>
    </Card>
  );
};

export default GiftByProductGroup;
