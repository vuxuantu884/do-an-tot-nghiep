import { Button, Card, Checkbox, Form, Input, Table } from 'antd'
import Color from "assets/css/export-variable.module.scss"
import search from "assets/img/search.svg"
import BottomBarContainer from 'component/container/bottom-bar.container'
import ContentContainer from 'component/container/content.container'
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm'
import REPORT_TEMPLATES, { REPORT_CUBES, REPORT_NAMES } from 'config/report/report-templates'
import UrlConfig from 'config/url.config'
import _ from 'lodash'
import { RootReducerType } from 'model/reducers/RootReducerType'
import { AnalyticCube, FormFilterCustomReport } from 'model/report/analytics.model'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'
import React, { useCallback, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { FaTrashAlt } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useRouteMatch } from 'react-router-dom'
import { deleteAnalyticsCustomService, getAnalyticsCustomByService, updateAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { strForSearch } from 'utils/StringUtils'
import { showError, showSuccess } from 'utils/ToastUtils'
import { ListAnalyticsStyle } from './index.style'
import ModalCreateReport from './shared/create-report-modal'
import ModalFormAnalyticsInfo from './shared/form-analytics-info-modal'
import ListAnalyticsBlock from './shared/list-analytics-block'

function Analytics() {
    const [form] = Form.useForm()
    const [formCreateReport] = Form.useForm()
    const [formFilterCustomReport] = Form.useForm()
    const dispatch = useDispatch()
    const { path: matchPath } = useRouteMatch();

    const [analyticList, setAnalyticList] = React.useState<Array<any>>()
    const [isLoadingAnalyticList, setIsLoadingAnalyticList] = React.useState(false)
    const [isModalEditNameVisible, setIsModalEditNameVisible] = React.useState<boolean>(false)
    const [isModalCreateVisible, setIsModalCreateVisible] = React.useState<boolean>(false)
    const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = React.useState<boolean>(false)
    const [handlingReportId, setHanlingReportId] = React.useState<number>()
    const [filteredAnalyticList, setFilteredAnalyticList] = React.useState<Array<any>>()

    const currentUsername = useSelector((state: RootReducerType) => state.userReducer.account?.user_name);

    const fetchCustomAnalytics = useCallback(async () => {
        setIsLoadingAnalyticList(true)
        const cubes = REPORT_CUBES[matchPath]
        const onlyMe = formFilterCustomReport.getFieldValue(FormFilterCustomReport.OnlyMyReport);
        if (onlyMe === undefined) {
            formFilterCustomReport.setFieldsValue({[FormFilterCustomReport.OnlyMyReport]: true})
        }
        
        const response = await callApiNative({ notifyAction: 'SHOW_ALL' }, dispatch, getAnalyticsCustomByService, { "cube.in": cubes, onlyMe: onlyMe ?? true });
        if (response) {
            setAnalyticList(response.analytics)
        }
        setIsLoadingAnalyticList(false)
    }, [dispatch, formFilterCustomReport, matchPath])


    const handleFormFinish = async (name: string, values: FormFinishInfo) => {
        setIsModalEditNameVisible(false)
        console.log(handlingReportId, values)
        if (handlingReportId && values.values.name) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, updateAnalyticsCustomService, handlingReportId, { name: values.values.name });
            if (response) {
                fetchCustomAnalytics();
            } else {
                showError("Cập nhật tên báo cáo không thành công");
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

    const onSearchCustomReport = (keySearch: string) => {
        if (!analyticList?.length) {
            return;
        }
        if (!keySearch) {
            setFilteredAnalyticList([...analyticList]);
        } else {
            const filteredData = analyticList.filter(item => {
                const { name } = item;
                return name && strForSearch(name.toLowerCase()).includes(strForSearch(keySearch.toLowerCase()));
            })
            setFilteredAnalyticList([...filteredData]);
        }
    }

    return (
        <ContentContainer
            title={`Danh sách ${REPORT_NAMES[matchPath].toLocaleLowerCase()}`}
            breadcrumb={[{ name: 'Báo cáo' }, { name: `Danh sách ${REPORT_NAMES[matchPath].toLocaleLowerCase()}` }]}

        >
            <Form.Provider onFormFinish={handleFormFinish}>
                <ListAnalyticsStyle>
                    {
                        [UrlConfig.ANALYTIC_SALES_OFFLINE].includes(matchPath) && (
                            <div>
                                <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                    return item.alias.includes(matchPath) && item.cube === AnalyticCube.OfflineSales
                                })} title="Báo cáo bán hàng"></ListAnalyticsBlock>
                                {/* <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                    return item.alias.includes(matchPath) && item.cube === 'payments'
                                })} title="Báo cáo thanh toán"></ListAnalyticsBlock> */}
                            </div>
                        )
                    }

                    {
                        [UrlConfig.ANALYTIC_SALES_ONLINE].includes(matchPath) && (
                            <div>
                                <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                    return item.alias.includes(matchPath) && item.cube === AnalyticCube.Sales
                                })} title="Báo cáo đơn hàng"></ListAnalyticsBlock>
                                {/* <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                    return item.alias.includes(matchPath) && item.cube === 'payments'
                                })} title="Báo cáo thanh toán"></ListAnalyticsBlock> */}
                            </div>
                        )
                    }

                    {
                        [UrlConfig.ANALYTIC_FINACE].includes(matchPath) && (
                            <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                return item.alias.includes(matchPath)
                            })} title="Báo cáo lợi nhuận"></ListAnalyticsBlock>
                        )
                    }

                    {
                        [UrlConfig.ANALYTIC_CUSTOMER].includes(matchPath) && (
                            <ListAnalyticsBlock matchPath={matchPath} data={REPORT_TEMPLATES.filter(item => {
                                return item.alias.includes(matchPath)
                            })} title="Báo cáo khách hàng"></ListAnalyticsBlock>
                        )
                    }

                    <Card title="Báo cáo tuỳ chỉnh" className='card-custom-report'
                        extra={
                            <div>
                                <Form className="btn-group" form={formFilterCustomReport}>
                                    <Form.Item className="m-0" name={FormFilterCustomReport.OnlyMyReport} valuePropName="checked">
                                        <Checkbox onChange={fetchCustomAnalytics}>Báo cáo của tôi</Checkbox>
                                    </Form.Item>
                                    <Form.Item className="m-0">
                                        <Input
                                            className="search"
                                            allowClear
                                            prefix={<img src={search} alt="" />}
                                            placeholder="Tìm kiếm theo Tên báo cáo tuỳ chỉnh"
                                            onChange={_.debounce((event) => onSearchCustomReport(event.target.value), 200)}
                                        />
                                    </Form.Item>
                                    <Button type='primary' onClick={() => setIsModalCreateVisible(true)}>
                                        Tạo báo cáo tuỳ chỉnh
                                    </Button>
                                </Form>
                            </div>
                        }
                    >
                        <Table dataSource={filteredAnalyticList ? filteredAnalyticList : analyticList}
                            rowKey={(record: any) => record.id}
                            rowClassName="ana-list__item"
                            loading={isLoadingAnalyticList}
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
                                    title: 'Người tạo',
                                    dataIndex: 'created_by',
                                    key: 'created_by',
                                    className: 'ana-list__item--created-by',
                                },
                                {
                                    title: 'Thao tác',
                                    key: 'action',
                                    dataIndex: 'id',
                                    align: 'center',
                                    width: 200,
                                    render: (id, item) => (
                                        <div className='ana-list__action'>
                                            {
                                                currentUsername && currentUsername.toLocaleLowerCase() === item.created_by.toLocaleLowerCase() ? (
                                                    <>
                                                        <Button icon={<AiOutlineEdit />} onClick={(e: React.MouseEvent<HTMLElement>) => handleEditName(e, item.id, item.name)}></Button>
                                                        <Button icon={<FaTrashAlt color={Color.red} />} onClick={() => handleDelete(item.id)}></Button>
                                                    </>
                                                ) : ('-')
                                            }
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
            { [UrlConfig.ANALYTIC_SALES_OFFLINE].includes(matchPath) && (
                <BottomBarContainer
                    rightComponent={
                        <>
                            <Button type="primary">
                                <Link to={`${matchPath}/customer-visitors`}>
                                    Nhập số lượng khách vào cửa hàng
                                </Link>
                            </Button>
                        </>
                    }
                />
            )}
        </ContentContainer >
    )
}

export default Analytics