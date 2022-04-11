import { Button, Card, Col, Form, Input, Row } from 'antd'
import ContentContainer from 'component/container/content.container'
import TagStatus from 'component/tag/tag-status'
import UrlConfig from 'config/url.config'
import React from 'react'
import { ReadWarrantyStyle } from './index.style'
type Props = {}

function ReadWarranty(props: Props) {
    return (
        <ContentContainer
            title='Phiếu bảo hành'
            breadcrumb={[
                {
                    name: "Tổng quan",
                    path: UrlConfig.HOME,
                },
                {
                    name: 'Lịch sử bảo hành',
                    path: UrlConfig.WARRANTY,
                },
                {
                    name: 'Phiếu bảo hành',
                }
            ]}
        >
            <ReadWarrantyStyle>
                <Row gutter={20}>
                    {/* left column */}
                    <Col span={12}>
                        <Card
                            title={<div>Khách hàng</div>}
                            extra={<TagStatus type='success'>Đã nhận hàng</TagStatus>}
                        >
                            <div>Nguyễn Văn A</div>
                        </Card>
                        <Card
                            title={"Thông tin"}

                        >
                            <table className='table-info'>
                                <tbody>
                                    <tr>
                                        <td>Cửa hàng</td>
                                        <td><b>Cửa hàng 1</b></td>
                                    </tr>
                                    <tr>
                                        <td>Người tạo</td>
                                        <td><b>Nguyễn vân A</b></td>
                                    </tr>
                                    <tr>
                                        <td>Nhân viên tiếp nhận</td>
                                        <td><b>YD-12345 - Nguyễn vân A</b></td>
                                    </tr>
                                </tbody>
                            </table>
                        </Card>
                    </Col>
                    {/* right column */}
                    <Col span={12}>
                        <Card title="Phí sửa chữa"
                            extra={<Button type='primary'>
                                Lưu
                            </Button>}>
                            <Form.Item label={"Chi phí sửa chữa"} labelCol={{ span: 12 }} labelAlign={"left"}>
                                <Input placeholder='Nhập phí sửa chữa' />
                            </Form.Item>
                            <Form.Item label={"Phí sửa chữa báo khách"} labelCol={{ span: 12 }} labelAlign={"left"}>
                                <Input placeholder='Nhập phí sửa chữa báo khách' />
                            </Form.Item>
                        </Card>
                        <Card title="Sản phẩm">
                            
                        </Card>
                    </Col>

                </Row>
            </ReadWarrantyStyle>
        </ContentContainer>
    )
}

export default ReadWarranty