import { Button, Form } from 'antd'
import exportIcon from "assets/icon/export.svg"
import BottomBarContainer from 'component/container/bottom-bar.container'
import ContentContainer from 'component/container/content.container'
import UrlConfig from 'config/url.config'
import { AnalyticCustomize, SUBMIT_MODE } from 'model/report/analytics.model'
import moment from 'moment'
import React, { useCallback, useContext, useEffect } from 'react'
import { AiOutlineEdit } from 'react-icons/ai'
import { FaTrashAlt } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'
import { deleteAnalyticsCustomService, executeAnalyticsQueryService, getAnalyticsCustomByIdService, updateAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { checkArrayHasAnyValue, exportReportToExcel, getConditionsFormServerToForm, getPropertiesValue } from 'utils/ReportUtils'
import { showError, showSuccess } from 'utils/ToastUtils'
import AnalyticsForm, { ReportifyFormFields, TIME_GROUP_BY } from '../shared/analytics-form'
import AnalyticsProvider, { AnalyticsContext } from '../shared/analytics-provider'
import ModalFormAnalyticsInfo from '../shared/form-analytics-info-modal'
import Color from "assets/css/export-variable.module.scss"
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm'

function CreateAnalytics() {
    const [form] = Form.useForm();
    const [formEditInfo] = Form.useForm();
    const history = useHistory();
    const dispatch = useDispatch();
    let { id } = useParams<{ id: string }>();

    const [reportInfo, setReportInfo] = React.useState<AnalyticCustomize>({} as AnalyticCustomize);
    const { cubeRef, setMetadata, setDataQuery } = useContext(AnalyticsContext)
    const [mode, setMode] = React.useState<SUBMIT_MODE>(SUBMIT_MODE.GET_DATA);
    const [isLoadingExport, setIsLoadingExport] = React.useState<boolean>(false);
    const [isModalEditNameVisible, setIsModalEditNameVisible] = React.useState<boolean>(false)
    const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = React.useState<boolean>(false)

    const handleRQuery = async (rQuery: string) => {
        console.log(rQuery)
        let name = "";
        switch (mode) {
            case SUBMIT_MODE.EXPORT_EXCEL:
                exportReportToExcel(dispatch, rQuery, reportInfo?.name)
                setIsLoadingExport(false);

                break;
            case SUBMIT_MODE.SAVE_QUERY:
                name = formEditInfo.getFieldValue("name")
                if (Number(id) && name) {
                    const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch,
                        updateAnalyticsCustomService, Number(id), { query: rQuery });
                    if (response) {
                        showSuccess("Cập nhật báo cáo thành công")
                    } else {
                        showError("Cập nhật báo cáo không thành công")
                    }
                }
                break;
            case SUBMIT_MODE.SAVE_NAME:
                name = formEditInfo.getFieldValue("name")
                if (name) {
                    const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch,
                        updateAnalyticsCustomService, Number(id), { name: name });
                    if (response && response.name) {
                        setReportInfo((prev) => ({ ...prev, name: response.name }));

                        showSuccess("Cập nhật báo cáo thành công")
                    } else {
                        showError("Cập nhật báo cáo không thành công")
                    }
                }
                break;
        }

        setMode(SUBMIT_MODE.GET_DATA);
    }

    const handleSaveReport = () => {
        setMode(SUBMIT_MODE.SAVE_QUERY);
        form.submit();
    }

    const handleExportReport = () => {
        setIsLoadingExport(true);
        setMode(SUBMIT_MODE.EXPORT_EXCEL);
        form.submit();
    }

    const handleOk = async () => {
        try {
            await formEditInfo.validateFields();
            setMode(SUBMIT_MODE.SAVE_NAME);
            form.submit();
            setIsModalEditNameVisible(false);
        } catch {

        }

    }
    const handleCancel = () => {
        setIsModalEditNameVisible(false);
    }

    const confirmDelete = async () => {
        if (Number(id)) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, deleteAnalyticsCustomService, Number(id));
            if (response !== null) {
                showSuccess("Xóa báo cáo thành công");
                history.push(UrlConfig.ANALYTIC_SALES)
            } else {
                showError("Xóa báo cáo không thành công")
            }

        }
        setIsConfirmDeleteVisible(false)
    }

    const fetchQueryData = useCallback(async () => {
        const report: AnalyticCustomize = await callApiNative({ isShowError: true }, dispatch, getAnalyticsCustomByIdService, Number(id));
        setReportInfo(report);
        if (report && report.query) {
            formEditInfo.setFieldsValue({ name: report.name })
            cubeRef.current = report.cube;

            const response = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q: report.query });
            if (response) {
                setMetadata(response);
                setDataQuery(response);

                const { columns, rows, conditions, from, to } = response.query;
                const timeGroup = checkArrayHasAnyValue(rows || [], TIME_GROUP_BY.map(item => item.value));

                const propertiesValue = getPropertiesValue(rows || [], response);
                const whereValue = getConditionsFormServerToForm(conditions || []);

                // case: view and update report : load data vào form
                form.setFieldsValue({
                    [ReportifyFormFields.column]: columns.map((item: any) => item.field),
                    [ReportifyFormFields.properties]: propertiesValue,
                    [ReportifyFormFields.timeRange]: [moment(from), moment(to)],
                    [ReportifyFormFields.reportType]: cubeRef.current,
                    [ReportifyFormFields.timeGroupBy]: timeGroup,
                    [ReportifyFormFields.where]: whereValue,
                })
            }
            setDataQuery(response);

        }
    }, [dispatch, id, setMetadata, setDataQuery, cubeRef, formEditInfo, form])

    useEffect(() => {

        if (Number(id)) {
            fetchQueryData();
        }

    }, [dispatch, id, fetchQueryData])

    return (
        <ContentContainer
            title={reportInfo?.name || "Báo cáo tuỳ chỉnh"}
            breadcrumb={[
                {
                    name: "Danh sách báo cáo tuỳ chỉnh",
                    path: UrlConfig.ANALYTIC_SALES
                },
                {
                    name: reportInfo?.name || "Báo cáo tuỳ chỉnh",
                }
            ]}
        >
            <AnalyticsForm form={form} handleRQuery={handleRQuery} mode={mode} />
            <BottomBarContainer
                back="Quay lại trang danh sách"
                rightComponent={
                    <div style={{ display: "inline-flex", gap: "10px" }}>
                        <Button danger
                            onClick={() => { setIsConfirmDeleteVisible(true) }}
                        >
                            Xoá
                        </Button>

                        <Button
                            onClick={() => setIsModalEditNameVisible(true)} icon={<AiOutlineEdit />}>
                            &nbsp; Đổi tên
                        </Button>

                        <Button icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />} loading={isLoadingExport} onClick={handleExportReport}>
                            Xuất báo cáo
                        </Button>

                        <Button type="primary" onClick={handleSaveReport}>
                            Cập nhật báo cáo
                        </Button>
                    </div>
                }
            />
            <ModalFormAnalyticsInfo form={formEditInfo} isVisiable={isModalEditNameVisible} handleOk={handleOk} handleCancel={handleCancel} />
            <ModalDeleteConfirm onOk={confirmDelete} onCancel={() => setIsConfirmDeleteVisible(false)}
                visible={isConfirmDeleteVisible}
                title="Xóa báo cáo"
                subTitle="Bạn có chắc chắn muốn xóa báo cáo này?"
            />
        </ContentContainer>
    )
}

const CreateAnalyticsWithProvider = () => {
    return (
        <AnalyticsProvider >
            <CreateAnalytics />
        </AnalyticsProvider>
    )
}
export default CreateAnalyticsWithProvider

