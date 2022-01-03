import { Card, Col, Form, FormInstance, Input, InputNumber, Row, Select, Space, Switch } from 'antd';
import _ from 'lodash';
import { DiscountFormModel, DiscountMethod } from 'model/promotion/discount.create.model';
import React, { ReactElement, useContext, useLayoutEffect, useState } from 'react';
import { DiscountUnitType, priorityOptions } from '../constants';
import { DiscountContext } from './discount-provider';
import GroupDiscountList from './group-discount-list';
import OrderThreshold from './order-threshold';
const { Option } = Select;
interface Props {
    form: FormInstance;
    unlimitedUsageProps: boolean;
}

function DiscountUpdateForm({
    form,
    unlimitedUsageProps,
}: Props): ReactElement {
    const discountUpdateContext = useContext(DiscountContext);

    const { discountMethod, setDiscountMethod } = discountUpdateContext;

    const [unlimitedQuantity, setUnlimitedQuantity] = useState<boolean>(false);

    const handleChangeDiscountMethod = (value: string) => {
        if (value) {
            setDiscountMethod(value);
            const formData = form.getFieldsValue(true);
            const isFixedPriceMethod = value === DiscountMethod.FIXED_PRICE;
            const isQuantityMethod = value === DiscountMethod.QUANTITY;

            const valueType = isFixedPriceMethod ? DiscountUnitType.FIXED_PRICE.value : DiscountUnitType.PERCENTAGE.value
            if ((isFixedPriceMethod || isQuantityMethod) &&
                Array.isArray(formData?.entitlements) && formData?.entitlements.length > 0) {
                formData?.entitlements?.forEach((item: DiscountFormModel) => {
                    const temp = {
                        prerequisite_quantity_ranges: [{
                            value_type: valueType,
                            greater_than_or_equal_to: 1,
                            value: 0,
                        }]
                    };
                    _.merge(item, temp);
                });
            } else if ((isFixedPriceMethod || isQuantityMethod)) {
                formData.entitlements = [{
                    entitled_category_ids: [],
                    entitled_product_ids: [],
                    entitled_variant_ids: [],
                    prerequisite_variant_ids: [],
                    selectedProducts: [],
                    prerequisite_quantity_ranges: [{
                        value_type: valueType,
                        greater_than_or_equal_to: 1,
                        value: 0,
                    }]
                }];
            }
            form.setFieldsValue({
                entitlements: _.cloneDeep(formData?.entitlements)
            })
        }
    }

    useLayoutEffect(() => {
        setUnlimitedQuantity(unlimitedUsageProps);
    }, [unlimitedUsageProps]);

    return (
        <div >
            <Card
                title={
                    <div className="d-flex">
                        <span className="title-card">THÔNG TIN CHUNG</span>
                    </div>
                }
            >
                <Row gutter={30}>
                    <Col span={12}>
                        <Form.Item name="title" label={"Tên khuyến mại"} rules={[{
                            required: true,
                            message: 'Cần nhập tên khuyến mại',
                        }, {
                            max: 255,
                            message: 'Tên khuyến mại không được vượt quá 255 ký tự',
                        }]}>
                            <Input placeholder='Nhập tên khuyến mại' />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="discount_code" label={"Mã khuyến mại"}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Row gutter={30}>
                            <Col span={12}>
                                <Form.Item
                                    label={<b>Số lượng áp dụng:</b>}
                                    name="quantity_limit"
                                    rules={[
                                        {
                                            required: !unlimitedQuantity,
                                            message: "Vui lòng nhập số lượng áp dụng",
                                        },
                                        {
                                            type: "integer",
                                            message: "Số lượng áp dụng phải là số nguyên",
                                        }
                                    ]}
                                >
                                    <InputNumber
                                        disabled={unlimitedQuantity}
                                        style={{ borderRadius: "5px", width: "100%" }}
                                        placeholder="Nhập số lượng khuyến mại"
                                        min={1}
                                        max={999999}
                                        step={1}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label=" ">
                                    <Space>
                                        <Switch
                                            checked={unlimitedQuantity}
                                            onChange={(value) => {
                                                form.setFieldsValue({
                                                    quantity_limit: null,
                                                });
                                                setUnlimitedQuantity(value);
                                            }}
                                        />
                                        {"Không giới hạn"}
                                    </Space>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={30}>
                            <Col span={24}>
                                <Form.Item label={<b>Mức độ ưu tiên:</b>} name="priority">
                                    <Select placeholder="Chọn mức độ ưu tiên">
                                        {priorityOptions.map((item) => (
                                            <Select.Option key={item.value} value={item.value}>
                                                {item.label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="description" label='Mô tả' rules={[{
                            max: 500,
                            message: 'Mô tả không được vượt quá 500 ký tự',
                        }]}>
                            <Input.TextArea
                                placeholder="Nhập mô tả cho khuyến mại"
                                autoSize={{ minRows: 5 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
            <Card>
                <Row gutter={30}>
                    <Col span={24}>
                        <Form.Item name="entitled_method" label={<b>Phương thức chiết khấu</b>}>
                            <Select
                                onChange={(value: string) => {
                                    handleChangeDiscountMethod(value)
                                }}
                            >
                                <Option value={DiscountMethod.FIXED_PRICE.toString()}>Đồng giá</Option>
                                <Option value={DiscountMethod.QUANTITY.toString()}>
                                    Chiết khấu theo từng sản phẩm
                                </Option>
                                <Option value={DiscountMethod.ORDER_THRESHOLD.toString()}>
                                    Chiết khấu theo đơn hàng
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    {/* Phương thức chiết khấu */}
                    {discountMethod === DiscountMethod.ORDER_THRESHOLD ? (
                        <OrderThreshold form={form} />
                    ) : (
                        <GroupDiscountList form={form} />
                    )}
                </Row>
            </Card>
        </div>
    )
}

export default DiscountUpdateForm
