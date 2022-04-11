import { Card, Col, Row } from 'antd'
import ContentContainer from 'component/container/content.container'
import TagStatus from 'component/tag/tag-status'
import UrlConfig from 'config/url.config'
import React from 'react'

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
            <Row gutter={20}>
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
                        <table >
                            <tbody>
                                <tr>
                                    <td>Cửa hàng</td>
                                    <td><b>Cửa hàng 1</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </Card>
                </Col>
                <Col span={12}>

                </Col>

            </Row>
        </ContentContainer>
    )
}

export default ReadWarranty