import { Button, Card, Form, List, Table } from 'antd'
import Color from "assets/css/export-variable.module.scss"
import ContentContainer from 'component/container/content.container'
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm'
import REPORT_TEMPLATES, { REPORT_NAMES } from 'config/report-templates'
import { REPORT_CUBES } from 'config/report-templates'
import UrlConfig from 'config/url.config'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'
import React, { useCallback, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { FaTrashAlt } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { Link, useRouteMatch } from 'react-router-dom'
import { deleteAnalyticsCustomService, getAnalyticsCustomByService, updateAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { showError, showSuccess } from 'utils/ToastUtils'
import { ListAnalyticsStyle } from './index.style'
import ModalCreateReport from './shared/create-report-modal'
import ModalFormAnalyticsInfo from './shared/form-analytics-info-modal'

function Analytics() {
    const [form] = Form.useForm()
    const [formCreateReport] = Form.useForm()
    const dispatch = useDispatch()
    const { path: matchPath } = useRouteMatch();

    const [analyticList, setAnalyticList] = React.useState<Array<any>>()
    const [isModalEditNameVisible, setIsModalEditNameVisible] = React.useState<boolean>(false)
    const [isModalCreateVisible, setIsModalCreateVisible] = React.useState<boolean>(false)
    const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = React.useState<boolean>(false)
    const [handlingReportId, setHanlingReportId] = React.useState<number>()



    const fetchCustomAnalytics = useCallback(async () => {
         const cubes = REPORT_CUBES[matchPath]
        const response = await callApiNative({ notifyAction: 'SHOW_ALL' }, dispatch, getAnalyticsCustomByService, {"cube.in": cubes});
        if (response) {
            setAnalyticList(response.analytics)
        }
    }, [dispatch, matchPath])


    const handleFormFinish = async (name: string, values: FormFinishInfo) => {
        setIsModalEditNameVisible(false)
        console.log(handlingReportId, values)
        if (handlingReportId && values.values.name) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, updateAnalyticsCustomService, handlingReportId, { name: values.values.name });
            if (response) {
                fetchCustomAnalytics();
            } else {
                showError("Cập nhật tên báo cáo không thành công")
            }
        }
    }

    const handleOkModalEditName = () => {
        form.submit();
    }

    const handleCancel = () => {
        setIsModalEditNameVisible(false)
    }
    const handleEditName = (e: React.MouseEvent<HTMLElement>, id: number, name: string) => {
        setHanlingReportId(id);
        form.setFieldsValue({ name: name })
        setIsModalEditNameVisible(true)
    }


    const handleDelete = (id: number) => {
        setIsConfirmDeleteVisible(true)
        setHanlingReportId(id)
    }

    const confirmDelete = async () => {
        if (Number(handlingReportId)) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, deleteAnalyticsCustomService, Number(handlingReportId));
            if (response !== null) {
                showSuccess("Xóa báo cáo thành công");
                fetchCustomAnalytics();
            } else {
                showError("Xóa báo cáo không thành công")
            }

        }
        setIsConfirmDeleteVisible(false)
    }

    const handleOkModalCreate = () => {
        formCreateReport.submit();
    }

    useEffect(() => {
        fetchCustomAnalytics();
    }, [dispatch, fetchCustomAnalytics]);
    
    return (
        <ContentContainer
            title={REPORT_NAMES[matchPath]}
            breadcrumb={[{ name: 'Báo cáo' }, { name: 'Báo cáo mẫu' }]}

        >
            <Form.Provider onFormFinish={handleFormFinish}>
                <ListAnalyticsStyle>


                    <Card title="Danh sách báo cáo mẫu" className='template-report'>
                        <List grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 5 }}

                            dataSource={REPORT_TEMPLATES.filter(item => {
                                return item.alias.includes(matchPath)
                            })}

                            renderItem={(item, index) => {
                                return (
                                    <Link to={`${matchPath}/${item.id}`} key={index}>
                                    <List.Item className="pointer">
                                        <div className={`template-report__card `}>
                                            <div className='template-report__icon '>
                                                <img src={require(`assets/icon/analytic/${item.iconImg}`).default} alt={item.name} /></div>
                                            <div className='template-report__type'> {item.type} </div>
                                            <div className='template-report__name'> {item.name.toUpperCase()} </div>
                                        </div>
                                    </List.Item>
                                    </Link>
                                )
                            }}
                        />
                    </Card>

                    <Card title="Danh sách báo cáo tuỳ chỉnh" className='card-custom-report'
                        extra={<Button type='primary' onClick={() => setIsModalCreateVisible(true)}>
                            Tạo báo cáo tuỳ chỉnh
                        </Button>
                        }
                    >
                        <Table dataSource={analyticList}
                            rowKey={(record: any) => record.id}
                            rowClassName="ana-list__item"
                            loading={!analyticList}
                            columns={[
                                {
                                    title: 'Tên báo cáo',
                                    dataIndex: 'name',
                                    key: 'name',
                                    className: 'ana-list__item--name',
                                    render: (text: string, record: any) => (
                                        <Link to={`${UrlConfig.ANALYTICS}/${record.id}`} className="ana-list__link">
                                            {text}
                                        </Link>
                                    )
                                },
                                {
                                    title: 'Thao tác',
                                    key: 'action',
                                    dataIndex: 'id',
                                    align: 'center',
                                    width: 200,
                                    render: (id, item) => (
                                        <div className='ana-list__action'>
                                            <Button icon={<AiOutlineEdit />} onClick={(e: React.MouseEvent<HTMLElement>) => handleEditName(e, item.id, item.name)}></Button>
                                            <Button icon={<FaTrashAlt color={Color.red} />} onClick={() => handleDelete(item.id)}></Button>
                                        </div>
                                    )
                                }
                            ]}
                        />


                    </Card>
                </ListAnalyticsStyle>

                <ModalFormAnalyticsInfo form={form} isVisiable={isModalEditNameVisible} handleOk={handleOkModalEditName} handleCancel={handleCancel} />
                <ModalCreateReport form={formCreateReport} isVisiable={isModalCreateVisible} handleOk={handleOkModalCreate} handleCancel={() => setIsModalCreateVisible(false)} />
                <ModalDeleteConfirm onOk={confirmDelete} onCancel={() => setIsConfirmDeleteVisible(false)}
                    visible={isConfirmDeleteVisible}
                    title="Xóa báo cáo"
                    subTitle="Bạn có chắc chắn muốn xóa báo cáo này?"
                />
            </Form.Provider>
        </ContentContainer >
    )
}

export default Analytics