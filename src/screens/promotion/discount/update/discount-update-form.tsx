import { Card, Col, Form, FormInstance, InputNumber, Row, Select, Space, Switch } from 'antd';
import CustomInput from 'component/custom/custom-input';
import _ from 'lodash';
import { DiscountFormModel, DiscountMethod } from 'model/promotion/discount.create.model';
import React, { ReactElement, useContext, useLayoutEffect, useState } from 'react';
import { priorityOptions } from '../constants';
import { DiscountUpdateContext } from './discount-update-provider';
import FixedPriceSelectionUpdate from './fixed-price-selection.update';
import TotalBillDiscountUpdate from './total-bill-discount-update';
const { Option } = Select;
interface Props {
    form: FormInstance;

    unlimitedUsageProps: boolean;

}

function DiscountUpdateForm({ form,

    unlimitedUsageProps,

}: Props): ReactElement {
    const discountUpdateContext = useContext(DiscountUpdateContext);

    const { discountMethod, setDiscountMethod } = discountUpdateContext;

    const [unlimitedQuantity, setUnlimitedQuantity] = useState<boolean>(false);

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
                        <CustomInput
                            name="title"
                            label={<b>Tên khuyến mại: </b>}
                            form={form}
                            message="Cần nhập tên khuyến mại"
                            placeholder="Nhập tên khuyến mại"
                            isRequired={true}
                            maxLength={255}
                        />
                    </Col>
                    <Col span={12}>
                        <CustomInput
                            name="discount_code"
                            label={<b>Mã khuyến mại: </b>}
                            form={form}
                            placeholder="Nhập mã khuyến mại"
                            maxLength={20}
                            upperCase={true}
                            disabled={true}
                            restFormItem={{
                                rules: [
                                    // { required: true, message: 'Vui lòng nhập mã khuyến mại' },
                                    { pattern: /^DI([0-9])+$/, message: "Mã khuyến mại sai định dạng" },
                                ],
                            }}
                        />
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
                                    ]}
                                >
                                    <InputNumber
                                        disabled={unlimitedQuantity}
                                        style={{ borderRadius: "5px" }}
                                        placeholder="Nhập số lượng khuyến mại"
                                        min={0}
                                        maxLength={6}
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
                        <CustomInput
                            type="textarea"
                            name="description"
                            label={<b>Mô tả: </b>}
                            form={form}
                            placeholder="Nhập mô tả cho khuyến mại"
                            maxLength={500}
                        />
                    </Col>
                </Row>
            </Card>
            <Card>
                <Row gutter={30}>
                    <Col span={24}>
                        <Form.Item name="entitled_method" label={<b>Phương thức chiết khấu</b>}>
                            <Select
                                defaultValue={DiscountMethod.FIXED_PRICE}
                                onChange={(value) => {
                                    setDiscountMethod(value);
                                    const formData = form.getFieldsValue(true);
                                    if (value === DiscountMethod.FIXED_PRICE.toString()) {
                                        formData?.entitlements?.forEach((item: DiscountFormModel) => {
                                            const temp = {
                                                prerequisite_quantity_ranges: [{
                                                    value_type: "FIXED_AMOUNT",
                                                    greater_than_or_equal_to: 0,
                                                    value: 1
                                                }]
                                            };
                                            _.merge(item, temp);
                                        });
                                    } else if (value === DiscountMethod.QUANTITY.toString()) {
                                        formData?.entitlements?.forEach((item: DiscountFormModel) => {
                                            const temp = {
                                                prerequisite_quantity_ranges: [{
                                                    value_type: "PERCENTAGE",
                                                    greater_than_or_equal_to: 0,
                                                    value: 1
                                                }]
                                            };
                                            _.merge(item, temp);
                                        });
                                    }
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
                        <TotalBillDiscountUpdate form={form} />
                    ) : (
                        <FixedPriceSelectionUpdate form={form} />
                    )}
                </Row>
            </Card>
        </div>
    )
}

export default DiscountUpdateForm
