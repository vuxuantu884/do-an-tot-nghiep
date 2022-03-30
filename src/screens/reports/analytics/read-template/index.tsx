import { QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Form } from 'antd'
import exportIcon from "assets/icon/export.svg"
import BottomBarContainer from 'component/container/bottom-bar.container'
import ContentContainer from 'component/container/content.container'
import REPORT_TEMPLATES, { REPORT_NAMES, TIME_GROUP_BY } from "config/report/report-templates"
import { AnnotationDataList } from 'config/report/annotation-data'
import UrlConfig from 'config/url.config'
import _ from 'lodash'
import { AnalyticConditions, AnalyticDataQuery, AnalyticQuery, AnalyticTemplateData, AnalyticChartInfo, SUBMIT_MODE, FIELD_FORMAT, AnnotationData } from 'model/report/analytics.model'
import moment from 'moment'
import React, { useCallback, useContext, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { executeAnalyticsQueryService, getAnalyticsMetadataService, saveAnalyticsCustomService } from 'service/report/analytics.service'
import { callApiNative } from 'utils/ApiUtils'
import { checkArrayHasAnyValue, exportReportToExcel, formatReportTime, generateRQuery, getTranslatePropertyKey } from 'utils/ReportUtils'
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



    const { cubeRef, metadata, setMetadata, setDataQuery, dataQuery, chartColumnSelected, setChartDataQuery, setChartColumnSelected, activeFilters, setActiveFilters, setRowsInQuery } = useContext(AnalyticsContext)
    const CURRENT_REPORT_TEMPLATE: AnalyticTemplateData = REPORT_TEMPLATES.find((item) => item.id === templateId) || {} as AnalyticTemplateData;
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
            const response: AnalyticDataQuery = await callApiNative({ notifyAction:"SHOW_ALL" }, dispatch, executeAnalyticsQueryService, { q: CURRENT_REPORT_TEMPLATE.query });
            if (response) {
                setDataQuery(response);
                setChartColumnSelected(CURRENT_REPORT_TEMPLATE.chartColumnSelected);
                //queryObject: data lấy từ api

                const { columns, rows, cube, conditions, from, to, order_by: orderBy } = response.query;
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
                                setActiveFilters(activeFilters.set(key, { value: ['Tất cả'], title: metadata ? getTranslatePropertyKey(metadata, key) : key }));
                            } else {
                                setActiveFilters(activeFilters.set(key, { value: fieldWhereValue[key], title: metadata ? getTranslatePropertyKey(metadata, key) : key }));
                            }
                        } else {
                            activeFilters.delete(key);
                            setActiveFilters(activeFilters);
                        }
                    })
                }
            }
        }
        if (CURRENT_REPORT_TEMPLATE.query && metadata) {
            fetchTemplateQuery();
        }


    }, [form, getPropertiesValue, getConditionsFormServerToForm, CURRENT_REPORT_TEMPLATE.query, metadata, dispatch, setDataQuery, setMetadata, CURRENT_REPORT_TEMPLATE.chartColumnSelected, setChartColumnSelected, setActiveFilters, activeFilters, setRowsInQuery])

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
                const { conditions } = dataQuery.query;
                let mapperConditions;
                if (conditions?.length) {
                    mapperConditions = conditions.map(condition => {
                        if (condition.findIndex(item => item === 'IN') !== -1) {
                            condition = [...condition.slice(0, 2), ...condition.slice(2).join("").split(",").map((item: string) => `'${item}'`).join(",")]
                        }
                        return condition;
                    })
                }
                const params: AnalyticQuery = {
                    ...dataQuery.query,
                    columns: chartColumnSelected.map(item => {
                        return { field: item }
                    }),
                    conditions: mapperConditions ? mapperConditions : conditions
                } as AnalyticQuery;
                const query = generateRQuery(params, "chart");
                const response: any = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q: query });
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
                    <>
                        <Button icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />} loading={isLoadingExport} onClick={handleExportReport}>
                            Xuất báo cáo
                        </Button>
                        <Button type="primary" className='margin-left-20' onClick={() => setIsVisibleFormName(true)}>
                            Nhân bản báo cáo
                        </Button>
                        {
                            currentAnnotation && (
                                <Button type="primary" ghost className='margin-left-20' onClick={() => setIsVisibleAnnotation(true)}>
                                    <QuestionCircleOutlined />
                                    <span className='margin-left-10'>Giải thích thuật ngữ</span>
                                </Button>
                            )
                        }
                    </>
                }
            />
            <ModalFormAnalyticsInfo form={formSaveInfo} isVisiable={isVisibleFormName} handleOk={handleSaveReport} handleCancel={handleCancel} />
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