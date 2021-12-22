import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import { searchProductWrapperRequestAction } from "domain/actions/product/products.action";
import { getVariants, promoGetDetail, updatePriceRuleByIdAction } from "domain/actions/promotion/discount/discount.action";
import { PageResponse } from "model/base/base-metadata.response";
import { ProductResponse, ProductWrapperSearchQuery } from "model/product/product.model";
import { EntilementFormModel, ProductEntitlements } from "model/promotion/discount.create.model";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { parseDurationToMoment, transformData } from "utils/PromotionUtils";
import ContentContainer from "../../../../component/container/content.container";
import UrlConfig from "../../../../config/url.config";
import { showError, showSuccess } from "../../../../utils/ToastUtils";
import GeneralConditionForm from "../../shared/general-condition.form";
import "../discount.scss";
import DiscountUpdateForm from "./discount-update-form";
import DiscountUpdateProvider, { DiscountUpdateContext } from "./discount-update-provider";
const DiscountUpdate = () => {

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const history = useHistory();

    const { id } = useParams<{ id: string }>();
    const idNumber = parseInt(id);

    const [dataVariants, setDataVariants] = useState<ProductEntitlements[]>([]);
    const [dataProducts, setDataProducts] = useState<ProductResponse[]>([]);

    const [isAllStore, setIsAllStore] = useState(true);
    const [isAllCustomer, setIsAllCustomer] = useState(true);
    const [isAllChannel, setIsAllChannel] = useState(true);
    const [isAllSource, setIsAllSource] = useState(true);
    const [isUnlimitQuantity, setIsUnlimitQuantity] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const discountUpdateContext = useContext(DiscountUpdateContext);
    const { setDiscountMethod, setDiscountData, discountData } = discountUpdateContext;

    const parseDataToForm = useCallback(
        (result: DiscountResponse) => {
            const formValue: any = {
                title: result.title,
                discount_code: result.code,
                description: result.description,
                quantity_limit: result.quantity_limit,
                priority: result.priority,
                product_type: "PRODUCT",
                starts_date: moment(result.starts_date),
                ends_date: result.ends_date ? moment(result.ends_date) : undefined,
                prerequisite_store_ids: result.prerequisite_store_ids,

                prerequisite_sales_channel_names: result.prerequisite_sales_channel_names,

                prerequisite_order_source_ids: result.prerequisite_order_source_ids,

                value:
                    result.entitlements.length > 0
                        ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value
                        : null,
                value_type:
                    result.entitlements.length > 0
                        ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type
                        : null,
                usage_limit: result.usage_limit,

                usage_limit_per_customer: result.usage_limit_per_customer,
                prerequisite_subtotal_range: result.prerequisite_subtotal_range,

                entitlements: result.entitlements,

                entitled_method: result.entitled_method,
                rule: result.rule,
                prerequisite_genders: result.prerequisite_genders?.map((item) =>
                    item.toLocaleUpperCase()
                ),
                prerequisite_customer_group_ids: result.prerequisite_customer_group_ids,
                prerequisite_customer_loyalty_level_ids: result.prerequisite_customer_loyalty_level_ids,
                prerequisite_assignee_codes: result.prerequisite_assignee_codes,

                starts_birthday: parseDurationToMoment(result.prerequisite_birthday_duration?.starts_mmdd_key),
                ends_birthday: parseDurationToMoment(result.prerequisite_birthday_duration?.ends_mmdd_key),

                starts_wedding_day: parseDurationToMoment(result.prerequisite_wedding_duration?.starts_mmdd_key),
                ends_wedding_day: parseDurationToMoment(result.prerequisite_wedding_duration?.ends_mmdd_key)

            };

            setDiscountMethod(result.entitled_method)
            //set default checked Loại khuyến mãi
            setIsUnlimitQuantity(typeof result.quantity_limit !== "number");

            //   //set default checked Bộ lọc
            setIsAllStore(result.prerequisite_store_ids?.length === 0);
            setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
            setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

            setIsAllCustomer(result.customer_selection.toLocaleUpperCase() === "ALL");
            setDiscountData(formValue);
            form.setFieldsValue(formValue);

        },
        [form, setDiscountMethod, setDiscountData]
    );




    /**
     * Update discount
     */
    const updateCallback = (data: DiscountResponse) => {
        if (data) {
            showSuccess("Cập nhật chiết khấu thành công");
            setIsSubmitting(false)
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${idNumber}`);
        } else {
            setIsSubmitting(false)
        }
    };

    const handleSubmit = (values: any) => {
        try {
            setIsSubmitting(true)
            const body = transformData(values);
            body.id = idNumber;
            dispatch(updatePriceRuleByIdAction(body, updateCallback));
        } catch (error: any) {
            setIsSubmitting(false)
            showError(error.message);
        }
    };

    /**
     * 
     */
    const onResult = useCallback(
        (result: DiscountResponse | false) => {
            if (result) {
                // search data of parent product for entitled_product_ids
                let product_ids: Array<number> = []
                result.entitlements.forEach((item: EntilementFormModel) => {
                    return item.entitled_product_ids.forEach((id: number) => {
                        product_ids.push(id)
                    })
                })

                const query: ProductWrapperSearchQuery = {
                    product_ids
                }
                dispatch(searchProductWrapperRequestAction(query, (data: false | PageResponse<ProductResponse>) => {
                    if (data)
                        setDataProducts(data.items)
                }));

                parseDataToForm(result);

            }
        },
        [dispatch, parseDataToForm]
    );




    /**
     * Dùng entitled_product_ids và entitled_variant_ids để lấy data product
     */
    const mergeVariantsData = useCallback(
        (entitled_variant_ids: Array<number>, entitled_product_ids: Array<number>) => {
            const listProduct: Array<ProductEntitlements> = []
            entitled_product_ids.forEach((id: number) => {
                const product = dataProducts.find((item: ProductResponse) => item.id === id)
                if (product) {
                    listProduct.push({
                        isParentProduct: true,
                        variant_title: product.name,
                        variant_id: undefined,
                        product_id: product.id,
                        sku: product.code,
                        cost: 0,
                        open_quantity: product.on_hand,
                    })
                }
            }
            )

            const listProductFormVariant = entitled_variant_ids.map((id) => {
                return dataVariants.find((v) => v.variant_id === id) || {} as ProductEntitlements;
            });
            return [...listProduct, ...listProductFormVariant];
        },
        [dataVariants, dataProducts]
    );

    /**
     * Lấy thông tin [tên sản phẩm, tồn đầu kỳ, giá vốn] sản phẩm khuyến mãi
     */
    useEffect(() => {
        const entilelementValue: Array<EntilementFormModel> = discountData.entitlements;
        if (entilelementValue) {
            entilelementValue.forEach((item: EntilementFormModel) => {
                item.selectedProducts = mergeVariantsData(item.entitled_variant_ids, item.entitled_product_ids) || [];

            })

            form.setFieldsValue({ entitlements: entilelementValue });
        }

    }, [discountData, form, mergeVariantsData]);

    useEffect(() => {
        dispatch(getVariants(idNumber, setDataVariants));
        dispatch(promoGetDetail(idNumber, onResult));
    }, [dispatch, idNumber, onResult]);

    return (
        <ContentContainer
            title={discountData.title}
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: "Chiết khấu",
                    path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
                },
                {
                    name: "Sửa Chiết khấu",
                    path: `#`,
                },
            ]}
        >
            <Form
                form={form}
                name="discount_update"
                onFinish={(values: any) => handleSubmit(values)}
                layout="vertical"
                scrollToFirstError
                initialValues={discountData}
            >
                <Row gutter={24}>

                    <Col span={18}>
                        <DiscountUpdateForm
                            unlimitedUsageProps={isUnlimitQuantity}
                            form={form}

                        />
                    </Col>
                    <Col span={6}>
                        <GeneralConditionForm
                            form={form}
                            isAllChannel={isAllChannel}
                            isAllCustomer={isAllCustomer}
                            isAllSource={isAllSource}
                            isAllStore={isAllStore}
                        />
                    </Col>
                </Row>

                <BottomBarContainer
                    back="Quay lại danh sách chiết khấu"
                    backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`)}
                    rightComponent={<Button type="primary" htmlType="submit" loading={isSubmitting}>
                        Lưu
                    </Button>}
                />
            </Form>
        </ContentContainer>
    );
};

const DiscountUpdateWithProvider = () => (<DiscountUpdateProvider>
    <DiscountUpdate />
</DiscountUpdateProvider>)
export default DiscountUpdateWithProvider;
