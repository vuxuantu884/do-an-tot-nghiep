import { Button, Form } from 'antd'
import exportIcon from "assets/icon/export.svg"
import BottomBarContainer from 'component/container/bottom-bar.container'
import ContentContainer from 'component/container/content.container'
import REPORT_TEMPLATES from "config/report-templates"
import UrlConfig from 'config/url.config'
import _ from 'lodash'
import { AnalyticConditions, AnalyticDataQuery, AnalyticTemplateData, SUBMIT_MODE } from 'model/report/analytics.model'
import moment from 'moment'
import React, { useCallback, useContext, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { executeAnalyticsQueryService, getAnalyticsMetadataService, saveAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { checkArrayHasAnyValue, exportReportToExcel } from 'utils/ReportUtils'
import { showError, showSuccess } from 'utils/ToastUtils'
import AnalyticsForm, { ReportifyFormFields, TIME_GROUP_BY } from '../shared/analytics-form'
import AnalyticsProvider, { AnalyticsContext } from '../shared/analytics-provider'
import ModalFormAnalyticsInfo from '../shared/form-analytics-info-modal'
function UpdateAnalytics() {
    const [form] = Form.useForm();
    const [formSaveInfo] = Form.useForm();
    const history = useHistory<AnalyticTemplateData>();
    const { path: matchPath } = useRouteMatch();


    const dispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const templateId = Number(id);
    const [isVisibleFormName, setIsVisibleFormName] = React.useState(false);
    const [mode, setMode] = React.useState<SUBMIT_MODE>(SUBMIT_MODE.GET_DATA);
    const [isLoadingExport, setIsLoadingExport] = React.useState<boolean>(false);



    const { cubeRef, metadata, setMetadata, setDataQuery } = useContext(AnalyticsContext)
    const CURRENT_REPORT_TEMPLATE: AnalyticTemplateData = REPORT_TEMPLATES.find((item) => item.id === templateId) || {} as AnalyticTemplateData;

    cubeRef.current = CURRENT_REPORT_TEMPLATE.cube;

    const handleExportReport = () => {
        setIsLoadingExport(true);
        setMode(SUBMIT_MODE.EXPORT_EXCEL);
        form.submit();
    }

    const handleSaveReport = async () => {
        try {
            await formSaveInfo.validateFields()
            setMode(SUBMIT_MODE.SAVE_QUERY);
            form.submit();
        } catch {

        }
    }

    const handleCancel = () => {
        setIsVisibleFormName(false)
    }

    const handleQueryAfterSubmitForm = async (rQuery: string) => {
        switch (mode) {
            case SUBMIT_MODE.EXPORT_EXCEL:
                exportReportToExcel(dispatch, rQuery, `${CURRENT_REPORT_TEMPLATE.type} ${CURRENT_REPORT_TEMPLATE.name}`)
                setIsLoadingExport(false);
                setMode(SUBMIT_MODE.GET_DATA);
                break;
            case SUBMIT_MODE.SAVE_QUERY:
                const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, saveAnalyticsCustomService, {
                    query: rQuery,
                    cube: cubeRef.current,
                    name: formSaveInfo.getFieldValue("name"),
                });
                if (response) {
                    showSuccess("Nhân bản thành công");
                    history.push(`${UrlConfig.ANALYTICS}/${response.id}`);
                } else {
                    showError("Nhân bản báo cáo không thành công ");
                }
                break;
        }

    }

    const getConditionsFormServerToForm = useCallback((conditions: AnalyticConditions) => {
        const conditionsValue: any = {};
        conditions.forEach((item: Array<string>) => {
            if (item.length > 0) {
                // convert  [ "customer_name", "in", "Nguyen", "," , "Nam" ] to { customer_name: ["Nguyen", "Nam"] }
                conditionsValue[item[0]] = item.slice(2).filter(item => item !== ",");
            }
        })
        return conditionsValue;
    }, [])

    const getPropertiesKey = useCallback((childrenKey: string) => {
        if (metadata) {
            return Object.keys(metadata.properties).find((perentKey) => {
                // get perent value
                const perentValue = Object.keys(Object.values(metadata.properties)[Object.keys(metadata.properties).indexOf(perentKey)])
                return perentValue.includes(childrenKey)
            })
        } else {
            return null;
        }
    }, [metadata]);

    const getPropertiesValue = useCallback((childrenKey: string[]) => {
        const propertiesValue: any = {};
        childrenKey.forEach((key) => {
            const perentKey = getPropertiesKey(key)
            if (perentKey && propertiesValue[perentKey]) {
                propertiesValue[perentKey] = [...propertiesValue[perentKey], key]
            } else if (perentKey && !propertiesValue[perentKey]) {
                propertiesValue[perentKey] = [key]
            }
        })
        return propertiesValue
    }, [getPropertiesKey]);

    /**
     * Load metadata from server
     */
    useEffect(() => {
        const fetchMetadata = async () => {
            const response = await callApiNative({ isShowError: true }, dispatch, getAnalyticsMetadataService, { q: CURRENT_REPORT_TEMPLATE.query });
            if (response) {
                setMetadata(response);
            }
        }
        fetchMetadata();
    }, [dispatch, CURRENT_REPORT_TEMPLATE.query, setMetadata])


    /**
      * lưu data vào form
      */
    useEffect(() => {
        const fetchTemplateQuery = async () => {
            const response: AnalyticDataQuery = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q: CURRENT_REPORT_TEMPLATE.query });
            if (response) {
                setDataQuery(response);


                //queryObject: data lấy từ api

                const { columns, rows, cube, conditions, from, to } = response.query;
                const timeGroup = checkArrayHasAnyValue(rows || [], TIME_GROUP_BY.map(item => item.value));

                const propertiesValue = getPropertiesValue(rows || []);
                const whereValue = getConditionsFormServerToForm(conditions || []);

                // case: view and update report : load data vào form
                form.setFieldsValue({
                    [ReportifyFormFields.column]: columns.map((item: any) => item.field),
                    [ReportifyFormFields.properties]: propertiesValue,
                    [ReportifyFormFields.timeRange]: [moment(from), moment(to)],
                    [ReportifyFormFields.reportType]: cube,
                    [ReportifyFormFields.timeGroupBy]: timeGroup,
                    [ReportifyFormFields.where]: whereValue,
                })
            }
        }
        if (CURRENT_REPORT_TEMPLATE.query && metadata) {
            fetchTemplateQuery();
        }


    }, [form, getPropertiesValue, getConditionsFormServerToForm, CURRENT_REPORT_TEMPLATE.query, metadata, dispatch, setDataQuery, setMetadata])

    // lấy tên mặc định cho form nhân bản báo cáo
    useEffect(() => {
        formSaveInfo.setFieldsValue({ name: `${CURRENT_REPORT_TEMPLATE.type} ${CURRENT_REPORT_TEMPLATE.name} nhân bản` })
    }, [CURRENT_REPORT_TEMPLATE.name, CURRENT_REPORT_TEMPLATE.type, formSaveInfo])

    return (
        <ContentContainer
            title={CURRENT_REPORT_TEMPLATE.type + " " + CURRENT_REPORT_TEMPLATE.name}
            isError={_.isEmpty(CURRENT_REPORT_TEMPLATE)}
            breadcrumb={[
                {
                    name: "Danh sách báo cáo",
                    path: matchPath.replace("/:id", ""),
                },
                {
                    name: "Báo cáo mẫu",

                }

            ]}
        >
            <AnalyticsForm form={form} handleRQuery={handleQueryAfterSubmitForm} mode={mode} />
            <BottomBarContainer
                back="Quay lại trang danh sách"
                backAction={() => history.push(matchPath.replace("/:id", ""))}
                rightComponent={
                    <>
                        <Button icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />} loading={isLoadingExport} onClick={handleExportReport}>
                            Xuất báo cáo
                        </Button>
                        <Button type="primary" className='margin-left-20' onClick={() => setIsVisibleFormName(true)}>
                            Nhân bản báo cáo
                        </Button>
                    </>
                }
            />
            <ModalFormAnalyticsInfo form={formSaveInfo} isVisiable={isVisibleFormName} handleOk={handleSaveReport} handleCancel={handleCancel} />

        </ContentContainer>
    )
}

const UpdateAnalyticsWithProvider = () => {
    return (
        <AnalyticsProvider >
            <UpdateAnalytics />
        </AnalyticsProvider>
    )
}
export default UpdateAnalyticsWithProvider;