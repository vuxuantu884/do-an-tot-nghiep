import { QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Form } from 'antd'
import exportIcon from "assets/icon/export.svg"
import BottomBarContainer from 'component/container/bottom-bar.container'
import ContentContainer from 'component/container/content.container'
import { AnnotationDataList } from 'config/report/annotation-data'
import REPORT_TEMPLATES, { REPORT_NAMES, TIME_GROUP_BY } from "config/report/report-templates"
import UrlConfig from 'config/url.config'
import _ from 'lodash'
import { AnalyticChartInfo, AnalyticConditions, AnalyticCube, AnalyticDataQuery, AnalyticQuery, AnalyticTemplateData, AnnotationData, FIELD_FORMAT, SUBMIT_MODE } from 'model/report/analytics.model'
import moment from 'moment'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { executeAnalyticsQueryService, getAnalyticsMetadataService, saveAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { checkArrayHasAnyValue, exportReportToExcel, formatReportTime, getChartQuery, getTranslatePropertyKey } from 'utils/ReportUtils'
import { showError, showSuccess } from 'utils/ToastUtils'
import AnalyticsForm, { ReportifyFormFields } from '../shared/analytics-form'
import AnalyticsProvider, { AnalyticsContext } from '../shared/analytics-provider'
import AnnotationTableModal from '../shared/annotation-table-modal'
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
    const [isVisibleAnnotation, setIsVisibleAnnotation] = React.useState(false);
    const [mode, setMode] = React.useState<SUBMIT_MODE>(SUBMIT_MODE.GET_DATA);
    const [isLoadingExport, setIsLoadingExport] = React.useState<boolean>(false);
    const [chartInfo, setChartInfo] = React.useState<AnalyticChartInfo>({ showChart: true, message: '' });



    const { cubeRef, metadata, setMetadata, setDataQuery, dataQuery, chartColumnSelected, setChartDataQuery, setChartColumnSelected, setActiveFilters, setRowsInQuery } = useContext(AnalyticsContext)

    const CURRENT_REPORT_TEMPLATE: AnalyticTemplateData = useMemo(() => {
        return REPORT_TEMPLATES.find((item) => item.id === templateId) || {} as AnalyticTemplateData;
    }, [templateId])

    const currentAnnotation: AnnotationData | undefined = AnnotationDataList.find((item) => item.cube === CURRENT_REPORT_TEMPLATE.cube);

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

    const handleQueryAfterSubmitForm = useCallback(async (rQuery: string, params: AnalyticQuery) => {
        switch (mode) {
            case SUBMIT_MODE.EXPORT_EXCEL:
                exportReportToExcel(dispatch, rQuery, `${CURRENT_REPORT_TEMPLATE.type} ${CURRENT_REPORT_TEMPLATE.name}`)
                setIsLoadingExport(false);
                setMode(SUBMIT_MODE.GET_DATA);
                break;
            case SUBMIT_MODE.SAVE_QUERY:
                const chartQuery = getChartQuery(params, chartColumnSelected || []);
                const timeOptionAt = form.getFieldValue(ReportifyFormFields.timeAtOption)
                const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, saveAnalyticsCustomService, {
                    query: rQuery,
                    group: cubeRef.current,
                    name: formSaveInfo.getFieldValue("name"),
                    chart_query: chartQuery,
                    options: timeOptionAt
                });
                if (response) {
                    showSuccess("Nhân bản thành công");
                    history.push(`${UrlConfig.ANALYTICS}/${response.id}`);
                } else {
                    showError("Nhân bản báo cáo không thành công ");
                }
                break;
        }
    }, [mode, chartColumnSelected, history, dispatch, form, cubeRef, formSaveInfo, CURRENT_REPORT_TEMPLATE]);

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
            const response = await callApiNative({ isShowLoading: true }, dispatch, getAnalyticsMetadataService, { q: CURRENT_REPORT_TEMPLATE.query });
            if (response) {
                setMetadata(response);
            }
        }
        fetchMetadata();
    }, [dispatch, CURRENT_REPORT_TEMPLATE.query, setMetadata, setChartColumnSelected, form])


    /**
      * lưu data vào form
      */
    useEffect(() => {
        const fetchTemplateQuery = async () => {
            // update after BE deploy prod - htm
            // const fullParams = [AnalyticCube.Sales, AnalyticCube.Costs].includes(CURRENT_REPORT_TEMPLATE.cube as AnalyticCube) ? { q: CURRENT_REPORT_TEMPLATE.query, options: CURRENT_REPORT_TEMPLATE.timeAtOption } : { q: CURRENT_REPORT_TEMPLATE.query };
            const fullParams = { q: CURRENT_REPORT_TEMPLATE.query };
            const response: AnalyticDataQuery = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, executeAnalyticsQueryService, fullParams);
            if (response) {
                const { columns, rows, cube, conditions, from, to, order_by: orderBy } = response.query;
                setDataQuery(response);
                setChartColumnSelected(CURRENT_REPORT_TEMPLATE.chartColumnSelected);
                //queryObject: data lấy từ api

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
                    [ReportifyFormFields.chartFilter]: CURRENT_REPORT_TEMPLATE.chartColumnSelected,
                    [ReportifyFormFields.orderBy]: orderBy,
                    // [ReportifyFormFields.timeAtOption]: CURRENT_REPORT_TEMPLATE.timeAtOption,
                })

                if (rows && rows.length) {
                    setRowsInQuery((prev: string[]) => [...prev, ...rows]);
                }

                const fieldWhereValue = form.getFieldValue(ReportifyFormFields.where);
                if (Object.keys(fieldWhereValue).length) {
                    Object.keys(fieldWhereValue).forEach((key: string) => {
                        const value = fieldWhereValue[key];
                        if (value && Array.isArray(value)) {
                            if (value.length === 1 && value[0] === '') {
                                setActiveFilters((prev: any) => new Map(prev.set(key, { value: ['Tất cả'], title: metadata ? getTranslatePropertyKey(metadata, key) : key })));
                            } else {
                                setActiveFilters((prev: any) => new Map(prev.set(key, { value: fieldWhereValue[key], title: metadata ? getTranslatePropertyKey(metadata, key) : key })));
                            }
                        } else {
                            setActiveFilters((prev: any) => new Map(prev.delete(key)));
                        }
                    })
                }
                setDataQuery(response);
                setChartColumnSelected(CURRENT_REPORT_TEMPLATE.chartColumnSelected);
                //queryObject: data lấy từ api
            }
        }
        if (CURRENT_REPORT_TEMPLATE.query && metadata) {
            fetchTemplateQuery();
        }


    }, [form, getPropertiesValue, getConditionsFormServerToForm, CURRENT_REPORT_TEMPLATE, metadata, dispatch, setDataQuery, setMetadata, setChartColumnSelected, setActiveFilters, setRowsInQuery])

    // Load chart data
    useEffect(() => {
        const fetchChartData = async () => {
            if (!chartColumnSelected?.length) {
                setChartInfo({
                    showChart: false,
                    message: 'Vui lòng chọn Tên cột hiển thị trong Tuỳ chọn hiển thị để vẽ biểu đồ.'
                })
                return;
            }
            if (dataQuery && !dataQuery.query.rows?.length) {
                setChartInfo({
                    showChart: false,
                    message: 'Vui lòng chọn Thuộc tính hiển thị trong Tuỳ chọn hiển thị để vẽ biểu đồ.'
                })
                return;
            }
            setChartInfo({
                showChart: true,
                message: ''
            })
            if (dataQuery && chartColumnSelected?.length) {
                const query = getChartQuery(dataQuery.query, chartColumnSelected);
                const fullParams = [AnalyticCube.Sales, AnalyticCube.Costs].includes(dataQuery.query.cube as AnalyticCube) ? { q: query, options: form.getFieldValue(ReportifyFormFields.timeAtOption) } : { q: query };
                const response: any = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, fullParams);
                if (response) {
                    const { columns, data } = response.result;
                    if (!data.length) {
                        setChartInfo({
                            showChart: false,
                            message: 'Dữ liệu báo cáo trống nên không thể vẽ biểu đồ. Vui lòng chọn điều kiện lọc khác.'
                        })
                        return;
                    }
                    const timestampIdx = columns.findIndex((item: any) => item.format === FIELD_FORMAT.Timestamp);
                    if (timestampIdx !== -1) {
                        response.result.data.forEach((item: any) => item[timestampIdx] = formatReportTime(item[timestampIdx], columns[timestampIdx].field))
                    }
                    setChartDataQuery(response);
                    form.setFieldsValue({ chartFilter: chartColumnSelected })
                }
            }
        }
        fetchChartData();
    }, [chartColumnSelected, dataQuery, dispatch, form, setChartDataQuery])

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
                    name: `Danh sách ${REPORT_NAMES[matchPath.replace("/:id", "")].toLocaleLowerCase()}`,
                    path: matchPath.replace("/:id", ""),
                },
                {
                    name: `${CURRENT_REPORT_TEMPLATE.type} ${CURRENT_REPORT_TEMPLATE.name}`,

                }

            ]}
        >
            <AnalyticsForm form={form} handleRQuery={handleQueryAfterSubmitForm} mode={mode} chartInfo={chartInfo} />
            <BottomBarContainer
                back="Quay lại trang danh sách"
                backAction={() => history.push(matchPath.replace("/:id", ""))}
                rightComponent={
                    <div style={{ display: "inline-flex", columnGap: "10px" }}>
                        {
                            currentAnnotation && (
                                <Button type="primary" ghost onClick={() => setIsVisibleAnnotation(true)}>
                                    <QuestionCircleOutlined />
                                    <span className='margin-left-10'>Giải thích thuật ngữ</span>
                                </Button>
                            )
                        }
                        <Button icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />} loading={isLoadingExport} onClick={handleExportReport}>
                            Xuất báo cáo
                        </Button>
                        <Button type="primary" onClick={() => setIsVisibleFormName(true)}>
                            Nhân bản báo cáo
                        </Button>
                    </div>
                }
            />
            <ModalFormAnalyticsInfo form={formSaveInfo} title="Nhân bản báo cáo" isVisiable={isVisibleFormName} handleOk={handleSaveReport} handleCancel={handleCancel} />
            <AnnotationTableModal isVisiable={isVisibleAnnotation} handleCancel={() => setIsVisibleAnnotation(false)} annotationData={currentAnnotation?.data || []} documentLink={currentAnnotation?.documentLink || ''} />

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