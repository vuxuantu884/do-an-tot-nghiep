import { Col, Row, Space, Typography } from 'antd'
import { ProcurementCreate } from 'model/procurement'
import React from 'react'


interface IProcurementScanResult {
	dataResult: ProcurementCreate | undefined;
}

const ProcurementScanResult: React.FC<IProcurementScanResult> = ({ dataResult }: IProcurementScanResult) => {
	return (
		<Row>
			<Col span={3}>
				<Space style={{ display: 'flex' }} align='center' direction='vertical'>
					<Typography.Text >
						Sản phẩm
					</Typography.Text>
					<Typography.Title level={5}>
						{dataResult?.total_process}
					</Typography.Title>
				</Space>
			</Col>
			<Col span={3}>
				<Space style={{ display: 'flex' }} align='center' direction='vertical'>
					<Typography.Text>
						Số PO
					</Typography.Text>
					<Typography.Title level={5}>
					{dataResult?.message[0]?.total_po}
					</Typography.Title>
				</Space>
			</Col>
			<Col span={3}>
				<Space style={{ display: 'flex' }} align='center' direction='vertical'>
					<Typography.Text>
						Đã xử lý
					</Typography.Text>
					<Typography.Title level={5}>
					{dataResult?.processed}
					</Typography.Title>
				</Space>
			</Col>
			<Col span={3}>
				<Space style={{ display: 'flex' }} align='center' direction='vertical'>
					<Typography.Text >
						Thành công
					</Typography.Text>
					<Typography.Title type='success' level={5}>
					{dataResult?.success}
					</Typography.Title>
				</Space>
			</Col>
			<Col span={3}>
				<Space style={{ display: 'flex' }} align='center' direction='vertical'>
					<Typography.Text>
						Lỗi
					</Typography.Text>
					<Typography.Title type='danger' level={5}>
					{dataResult?.error}
					</Typography.Title>
				</Space>
			</Col>
		</Row>
	)
}

export default ProcurementScanResult
