import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import { getVariants, promoGetDetail, updatePriceRuleByIdAction } from "domain/actions/promotion/discount/discount.action";
import _ from "lodash";
import { VariantPriceRule } from "model/promotion/discount.create.model";
import { CustomerSelectionOption, DiscountResponse, DiscountVariantResponse } from "model/response/promotion/discount/list-discount.response";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { PROMO_TYPE } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import ContentContainer from "../../../../component/container/content.container";
import UrlConfig from "../../../../config/url.config";
import { showError, showSuccess } from "../../../../utils/ToastUtils";
import { CustomerFilterField } from "../../shared/cusomer-condition.form";
import GeneralConditionForm from "../../shared/general-condition.form";
import "../discount.scss";
import DiscountUpdateForm from "./discount-update-form";
import DiscountUpdateProvider, { DiscountUpdateContext } from "./discount-update-provider";
import { useHistory } from "react-router-dom";
import { getDateFormDuration } from "utils/PromotionUtils";
const DiscountUpdate = () => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const history = useHistory();

    const { id } = useParams<{ id: string }>();
    const idNumber = parseInt(id);

    // const [dataDiscount, setDataDiscount] = useState<DiscountResponse>();
    const [dataVariants, setDataVariants] = useState<DiscountVariantResponse[]>([]);

    const [isAllStore, setIsAllStore] = useState(true);
    const [isAllCustomer, setIsAllCustomer] = useState(true);
    const [isAllChannel, setIsAllChannel] = useState(true);
    const [isAllSource, setIsAllSource] = useState(true);

    const [isUnlimitQuantity, setIsUnlimitQuantity] = useState(false);

    const discountUpdateContext = useContext(DiscountUpdateContext);
    const { setIsAllProduct, setSelectedVariant, setDiscountMethod, setDiscountData, discountData } = discountUpdateContext;
    
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
                starts_birthday: result.prerequisite_birthday_duration?.starts_mmdd_key ? moment(getDateFormDuration(result.prerequisite_birthday_duration?.starts_mmdd_key)) : undefined,
                ends_birthday: result.prerequisite_birthday_duration?.ends_mmdd_key ? moment(getDateFormDuration(result.prerequisite_birthday_duration?.ends_mmdd_key)) : undefined,
                starts_wedding_day: result.prerequisite_wedding_duration?.starts_mmdd_key ? moment(getDateFormDuration(result.prerequisite_wedding_duration?.starts_mmdd_key)) : undefined,
                ends_wedding_day: result.prerequisite_wedding_duration?.ends_mmdd_key ? moment(getDateFormDuration(result.prerequisite_wedding_duration?.ends_mmdd_key)) : undefined,

            };
            setDiscountMethod(result.entitled_method)
            //set default checked Loại khuyến mãi
            setIsUnlimitQuantity(typeof result.quantity_limit !== "number");

            //   //set default checked Bộ lọc
            setIsAllStore(result.prerequisite_store_ids?.length === 0);
            setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
            setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

            setIsAllCustomer(result.customer_selection.toLocaleUpperCase() === "ALL");

            form.setFieldsValue(formValue);

        },
        [form, setDiscountMethod]
    );


    const transformData = (values: any) => {
        let body: any = {};
        body.type = PROMO_TYPE.AUTOMATIC;
        body.title = values.title;
        body.priority = values.priority;
        body.description = values.description;

        body.entitled_method = values.entitled_method;
        body.quantity_limit = values.quantity_limit;
        body.prerequisite_store_ids = values.prerequisite_store_ids?.length
            ? values.prerequisite_store_ids
            : null;
        body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names
            ?.length
            ? values.prerequisite_sales_channel_names
            : null;
        body.prerequisite_order_source_ids = values.prerequisite_order_source_ids?.length
            ? values.prerequisite_order_source_ids
            : null;
        body.starts_date = values.starts_date.format();
        body.ends_date = values.ends_date?.format() || null;
        body.entitlements = values?.entitlements;

        // ==Đối tượng khách hàng==
        // Áp dụng tất cả
        body.customer_selection = values.customer_selection
            ? CustomerSelectionOption.ALL
            : CustomerSelectionOption.PREREQUISITE;

        //Giới tính khách hàng
        body.prerequisite_genders = values.prerequisite_genders;

        //Ngày sinh khách hàng
        const startsBirthday = values[CustomerFilterField.starts_birthday]
            ? moment(values[CustomerFilterField.starts_birthday])
            : null;
        const endsBirthday = values[CustomerFilterField.ends_birthday]
            ? moment(values[CustomerFilterField.ends_birthday])
            : null;
        if (startsBirthday || endsBirthday) {
            body.prerequisite_birthday_duration = {
                starts_mmdd_key: startsBirthday
                    ? Number(
                        (startsBirthday.month() + 1).toString().padStart(2, "0") +
                        startsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
                    )
                    : null,
                ends_mmdd_key: endsBirthday
                    ? Number(
                        (endsBirthday.month() + 1).toString().padStart(2, "0") +
                        endsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
                    )
                    : null,
            };
        } else {
            body.prerequisite_birthday_duration = null;
        }

        //==Ngày cưới khách hàng
        const startsWeddingDays = values[CustomerFilterField.starts_wedding_day]
            ? moment(values[CustomerFilterField.starts_wedding_day])
            : null;
        const endsWeddingDays = values[CustomerFilterField.ends_wedding_day]
            ? moment(values[CustomerFilterField.ends_wedding_day])
            : null;

        if (startsWeddingDays || endsWeddingDays) {
            body.prerequisite_wedding_duration = {
                starts_mmdd_key: startsWeddingDays
                    ? Number(
                        (startsWeddingDays.month() + 1).toString().padStart(2, "0") +
                        startsWeddingDays
                            .format(DATE_FORMAT.DDMM)
                            .substring(0, 2)
                            .padStart(2, "0")
                    )
                    : null,
                ends_mmdd_key: endsWeddingDays
                    ? Number(
                        (endsWeddingDays.month() + 1).toString().padStart(2, "0") +
                        endsWeddingDays.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
                    )
                    : null,
            };
        } else {
            body.prerequisite_wedding_duration = null;
        }

        //Nhóm khách hàng
        body.prerequisite_customer_group_ids = values.prerequisite_customer_group_ids;

        //Hạng khách hàng
        body.prerequisite_customer_loyalty_level_ids =
            values.prerequisite_customer_loyalty_level_ids;

        //Nhân viên phụ trách
        body.prerequisite_assignee_codes = values.prerequisite_assignee_codes;

        //==Chiết khấu nâng cao theo đơn hàng==
        //Điều kiện chung



        if (values?.rule && !_.isEmpty(JSON.parse(JSON.stringify(values?.rule)))) {
            body.rule = values.rule;
        }
        return body;
    };


    const updateCallback = (data: DiscountResponse) => {
        if (data) {
            showSuccess("Thêm thành công");
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${idNumber}`);
        }
    };
    const handleSubmit = async (values: any) => {
        try {
            const body = transformData(values);

            console.log(body);
            body.id = idNumber;
            dispatch(updatePriceRuleByIdAction(body, updateCallback));
        } catch (error: any) {
            showError(error.message);
        }
    };

    const onResult = useCallback(
        (result: DiscountResponse | false) => {

            if (result) {
                setDiscountData(result);
                parseDataToForm(result);
            }
        },
        [parseDataToForm, setDiscountData]
    );


    const mergeVariantsData = useCallback(
        (sourceData: Array<number>) => {
            return sourceData.map((id) => {
                const variant = dataVariants.find((v: any) => v.variant_id === id);
                const variantData: any = { id }
                if (variant) {
                    variantData.name = variant.variant_title;
                    variantData.sku = variant.sku;
                    variantData.cost = variant.cost;
                    variantData.on_hand = variant.open_quantity;
                }
                return variantData;
            });
        },
        [dataVariants]
    );

    // Action: Lấy thông tin [tên sản phẩm, tồn đầu kỳ, giá vốn] sản phẩm khuyến mãi
    useEffect(() => {
        if (Array.isArray(discountData?.entitlements)) {
            const tempMapProduct: Map<number, Array<VariantPriceRule>> = new Map();
            let allProduct = false;
            discountData.entitlements.forEach((entitlement: any, index: number) => {
                tempMapProduct.set(index, mergeVariantsData(entitlement.entitled_variant_ids));
                if (entitlement?.entitled_variant_ids?.length === 0) {
                    allProduct = true;
                }
            });
            setSelectedVariant(tempMapProduct);
            setIsAllProduct(allProduct);
        }
    }, [discountData, mergeVariantsData, setSelectedVariant, setIsAllProduct]);

    useEffect(() => {
        dispatch(getVariants(idNumber, setDataVariants));
        dispatch(promoGetDetail(idNumber, onResult));
    }, [dispatch, idNumber, onResult]);

    return (
        <ContentContainer
            title="Tạo chiết khấu"
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: "Khuyến mại",
                    path: `${UrlConfig.PROMOTION}`,
                },
                {
                    name: "Chiết khấu",
                    path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
                },
                {
                    name: "Tạo Chiết khấu",
                    path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`,
                },
            ]}
        >
            <Form
                form={form}
                name="discount_update"
                onFinish={(values: any) => handleSubmit(values)}
                layout="vertical"
                scrollToFirstError

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
                    rightComponent={<Button type="primary" htmlType="submit">
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
