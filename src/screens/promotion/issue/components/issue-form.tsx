import { Card, Col, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { PriceRuleMethod } from 'model/promotion/price-rules.model';
import React, { ReactElement, useContext } from 'react';
import { PRICE_RULE_FIELDS } from 'screens/promotion/constants';
import GeneralOrderThreshold from 'screens/promotion/shared/general-order-threshold';
import { nonAccentVietnamese } from 'utils/PromotionUtils';
import { IssueContext } from './issue-provider';
import OrderThresholdIssueTypeForm from './issue-type-order-threshold-form';
const { Option } = Select;
interface Props {
    form: FormInstance;
}

function IssueForm(props: Props): ReactElement {
    const { form } = props
    const { priceRuleData } = useContext(IssueContext);
    return (
        <div>
            <Card
                title={"THÔNG TIN CHUNG"}
            >
                <Row gutter={30}  >
                    <Col span={12}>
                        <Form.Item
                            name="title"
                            label={"Tên đợt phát hành"}
                            rules={[
                                {
                                    required: true,
                                    message: "Cần nhập tên khuyến mại",
                                },
                                {
                                    max: 255,
                                    message: "Tên khuyến mại không vượt quá 255 ký tự",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập tên đợt phát hành" />
                        </Form.Item>
                        <Form.Item
                            name="code"
                            label="Mã đợt phát hành:"
                            normalize={(value) => nonAccentVietnamese(value)}
                        >
                            <Input maxLength={20} disabled={true} placeholder='Mã hệ thống tạo tự động'/>
                        </Form.Item>
                    </Col>

                    <Col span={12} >
                        <Form.Item name="description" label='Mô tả' rules={[{
                            max: 500,
                            message: 'Mô tả không được vượt quá 500 ký tự',
                        }]}>
                            <Input.TextArea
                                placeholder="Nhập mô tả cho đợt phát hành"
                                autoSize={{ minRows: 5, maxRows: 5 }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>
            <Card title="Loại khuyến mãi">
                <Row gutter={30}  >
                    {/* Loại khuyến mãi */}
                    <Col span={24}>
                        <Form.Item label="Chọn loại" name={PRICE_RULE_FIELDS.entitled_method}>
                            <Select
                                showArrow
                                placeholder="Chọn loại mã khuyến mãi"
                            >
                                <Option key={PriceRuleMethod.ORDER_THRESHOLD} value={PriceRuleMethod.ORDER_THRESHOLD}>
                                    Khuyến mãi theo đơn hàng
                                </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <OrderThresholdIssueTypeForm form={form} />
                    </Col>
                    <Col span={24}>
                    </Col>
                </Row>
            </Card>

            <Card title="Điều kiện áp dụng">
                <GeneralOrderThreshold form={form} priceRuleData={priceRuleData} />
            </Card>
        </div>
    )
}

export default IssueForm
