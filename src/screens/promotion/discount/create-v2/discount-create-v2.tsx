import { Button, Col, Form, Row } from 'antd';
import BottomBarContainer from 'component/container/bottom-bar.container';
import ContentContainer from 'component/container/content.container';
import { HttpStatus } from 'config/http-status.config';
import { PromoPermistion } from 'config/permissions/promotion.permisssion';
import UrlConfig from 'config/url.config';
import { unauthorizedAction } from 'domain/actions/auth/auth.action';
import useAuthorization from 'hook/useAuthorization';
import React, { ReactElement, useContext, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import GeneralConditionForm from 'screens/promotion/shared/general-condition.form';
import { createPriceRule } from 'service/promotion/discount/discount.service';
import { transformData } from 'utils/PromotionUtils';
import { showError, showSuccess } from 'utils/ToastUtils';
import DiscountUpdateForm from '../update/discount-update-form';
import DiscountUpdateProvider, { DiscountUpdateContext } from '../update/discount-update-provider';
import { DiscountMethod } from 'model/promotion/discount.create.model';
import { newEntitlements } from '../constants';

function DiscountCreateV2(): ReactElement {
    const history = useHistory();
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAllProduct } = useContext(DiscountUpdateContext);
    let activeDiscout = true;

    //phân quyền
    const [allowCreatePromoCode] = useAuthorization({
        acceptPermissions: [PromoPermistion.CREATE],
    });

    const handleCreateSuccess = (response: any) => {
        switch (response.code) {
            case HttpStatus.SUCCESS:
                showSuccess("Lưu thành công");
                setIsSubmitting(false)

                history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${response.data.id}`);
                break;
            case HttpStatus.UNAUTHORIZED:
                dispatch(unauthorizedAction);
                break;
            default:
                response.errors.forEach((e: string) => showError(e));
                break;
        }
    };

    async function handleSubmit(values: any): Promise<void> {
        try {
            setIsSubmitting(true)
            const body = transformData(values, isAllProduct);
            body.activated = activeDiscout;
            // need move to saga
            const createResponse = await createPriceRule(body);
            handleCreateSuccess(createResponse);

        } catch (error: any) {
            setIsSubmitting(false)
            error.response.data?.errors?.forEach((e: string) => showError(e));
        }
    }

    const handleSaveAndActive = () => {
        activeDiscout = true;
        form.submit();
    };

    const save = () => {
        activeDiscout = false;
        form.submit();
    };
    const initialValues = {
        entitled_method: DiscountMethod.FIXED_PRICE.toString(),
        priority: 1,
        entitlements: [newEntitlements]
    }

    return (
        <ContentContainer
            title="Tạo chiết khấu"
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
                initialValues={initialValues}
            >
                <Row gutter={24}>

                    <Col span={18}>
                        <DiscountUpdateForm
                            unlimitedUsageProps={true}
                            form={form}

                        />
                    </Col>
                    <Col span={6}>
                        <GeneralConditionForm
                            form={form}
                            isAllChannel={true}
                            isAllCustomer={true}
                            isAllSource={true}
                            isAllStore={true}
                        />
                    </Col>
                </Row>

                <BottomBarContainer
                    back="Quay lại danh sách chiết khấu"
                    rightComponent={
                        allowCreatePromoCode && (
                            <>
                                <Button
                                    onClick={() => save()}
                                    style={{
                                        marginLeft: ".75rem",
                                        marginRight: ".75rem",
                                        borderColor: "#2a2a86",
                                    }}
                                    type="ghost"
                                    loading={isSubmitting}
                                >
                                    Lưu
                                </Button>
                                <Button type="primary" onClick={() => handleSaveAndActive()} loading={isSubmitting} >
                                    Lưu và kích hoạt
                                </Button>
                            </>
                        )
                    }
                />
            </Form>
        </ContentContainer>
    )
}


const DiscountCreateWithProvider = () => (<DiscountUpdateProvider>
    <DiscountCreateV2 />
</DiscountUpdateProvider>)
export default DiscountCreateWithProvider;



