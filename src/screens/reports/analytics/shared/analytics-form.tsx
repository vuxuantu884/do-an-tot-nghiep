import { Card, Form, FormInstance, Select, Table, Tooltip } from 'antd';
import { TablePaginationConfig } from 'antd/es/table/interface';
import { AppConfig } from 'config/app.config';
import { chartTypes } from 'config/report/chart-types';
import { DETAIL_LINKS, TIME_AT_OPTION, TIME_GROUP_BY } from 'config/report/report-templates';
import _ from 'lodash';
import { AnalyticChartInfo, AnalyticConditions, AnalyticCube, AnalyticQuery, ChartTypeValue, ColumnType, FIELD_FORMAT, SUBMIT_MODE, TIME } from 'model/report/analytics.model';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { executeAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { formatCurrency } from 'utils/AppUtils';
import { OFFSET_HEADER_UNDER_NAVBAR } from 'utils/Constants';
import { DATE_FORMAT } from 'utils/DateUtils';
import { formatDataToSetUrl, formatReportTime, generateRQuery, getTranslatePropertyKey, transformDateRangeToString } from 'utils/ReportUtils';
import { strForSearch } from 'utils/StringUtils';
import { ActiveFiltersStyle, AnalyticsStyle } from '../index.style';
import ActiveFilters from './active-filters';
import AnalyticsDatePicker from './analytics-date-picker';
import { AnalyticsContext } from './analytics-provider';
import CustomPropertiesModal from './custom-properties-modal';
import FilterResults from './filter-results';
import ReportifyBarChart from './reportify-bar-chart';
import ReportifyPieChart from './reportify-pie-chart';

type Props = {
    form: FormInstance;
    handleRQuery: (query: string, params: AnalyticQuery) => void;
    mode: SUBMIT_MODE;
    chartInfo?: AnalyticChartInfo;
}

export const ReportifyFormFields = {
    where: "where",
    timeGroupBy: "timeGroupBy",
    timeRange: "timeRange",
    reportType: "reportType",
    properties: "properties",
    column: "column",
    chartFilter: "chart-filter",
    orderBy: "orderBy",
    timeAtOption: 'timeAtOption',
    chartType: "chartType",
};
const MAX_CHART_COLUMNS = 2 // SỐ LƯỢNG CỘT ĐƯỢC PHÉP HIỂN THỊ TRONG CHART

function AnalyticsForm({ form, handleRQuery, mode, chartInfo }: Props) {
    const { cubeRef, metadata, dataQuery, setDataQuery, chartDataQuery, chartColumnSelected, setChartColumnSelected, activeFilters, setActiveFilters, rowsInQuery, setRowsInQuery } = useContext(AnalyticsContext)
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [chartType, setChartType] = useState<ChartTypeValue>(ChartTypeValue.VerticalColumn);

    const dispatch = useDispatch();
    const [warningChooseColumn, setWarningChooseColumn] = useState(false);

    const pushSubmitAction = () => {
        form.submit()
    }

    const exportReportQuery = async (values: any) => {
        /**
         * Bỏ warning button Tuỳ chọn hiển thị
         */
        setWarningChooseColumn(false);

        const { where, timeRange, timeGroupBy, properties, orderBy, timeAtOption } = values

        const columns = values[ReportifyFormFields.column]?.map((item: any) => ({ field: item }))

        const ranges = transformDateRangeToString(timeRange);

        // set by or over 
        let show: Array<string> = [];

        if (timeGroupBy) {
            show = [timeGroupBy];
            setRowsInQuery((prev: string[]) => [timeGroupBy, ...(prev.filter((item: string) => TIME_GROUP_BY.findIndex(timeGroupItem => timeGroupItem.value === item) === -1))]);
        } else {
            setRowsInQuery((prev: string[]) => [...(prev.filter((item: string) => TIME_GROUP_BY.findIndex(timeGroupItem => timeGroupItem.value === item) === -1))]);
        }
        if (properties) {
            const propertiesList: Array<string> = [];
            Object.keys(properties)?.forEach(key => {
                if (Array.isArray(properties[key])) {
                    propertiesList.push(...properties[key])
                }
            })
            show = [...show, ...propertiesList]
        }


        /**
         * where
         * lấy các điều kiện trong filter { field: key, values: where[key] }
         */
        const whereParams: AnalyticConditions = where && Object.keys(JSON.parse(JSON.stringify(where))).map((key: string) => {
            const value: Array<string> = where[key]
            const operator = _.isEqual(value, [""]) ? "!=" : "IN";
            let values: string | Array<string> = "";
            if (operator === "IN") {
                //conver ["a", "b"] to ["a", ",", "b"]
                values = value.map(item => encodeURIComponent(item)).join(",").split(",").map((item: string) => decodeURIComponent(`'${item}'`)).join(",");
            } else {
                values = value
            }

            return [key, operator, ...values]
        })

        let isOrderBy = false;
        if (orderBy?.length) {
            const orderByArr = orderBy.reduce((res: string[], item: string[]) => {
                return [...res, item[0]];
            }, []);
            if ([...(values[ReportifyFormFields.column] || []), ...show].findIndex(item => orderByArr.includes(item)) !== -1) {
                isOrderBy = true;
            }
        }
        const rowsInQueryNoTimeGroup = rowsInQuery.filter((item: string) => TIME_GROUP_BY.findIndex(timeGroupItem => timeGroupItem.value === item) === -1);
        const params: AnalyticQuery = {
            columns: columns,
            rows: timeGroupBy ? [timeGroupBy, ...rowsInQueryNoTimeGroup] : rowsInQueryNoTimeGroup,
            cube: values?.reportType || cubeRef.current,
            from: ranges?.from,
            to: ranges?.to,
            conditions: whereParams,
            order_by: isOrderBy ? orderBy : [],
        } as AnalyticQuery;

        const query = generateRQuery(params)
        if (mode !== SUBMIT_MODE.GET_DATA) {
            handleRQuery(query, params);

        } else {
            setLoadingTable(true);
            const fullParams = timeAtOption ? { q: query, options: timeAtOption } : { q: query };
            const response = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, fullParams);
            if (response) {
                setDataQuery(response);
            }
            setLoadingTable(false);
            console.log('get data report', response)
        }
    }

    // chỉ để warning button chọn cột trong bảng
    const handleFinishFailed = (errorInfo: any) => {
        const { errorFields } = errorInfo
        if (Array.isArray(errorFields) && errorFields?.length > 0) {
            const isNotChooseColumn = errorFields.some(field => _.isEqual(field.name, [ReportifyFormFields.column]));
            setWarningChooseColumn(isNotChooseColumn);
        }
    }

    const handleSortTable = async (column: string, sortOrder?: string | null) => {

        try {
            // validate các trường bắt buộc
            await form.validateFields()

            let direction = "";
            if (sortOrder === "ascend") {
                direction = "ASC";
            } else if (sortOrder === "descend") {
                direction = "DESC";
            }

            if (column && direction) {
                form.setFieldsValue({ orderBy: [[column, direction]] });
            } else if (!direction) {
                form.setFieldsValue({ orderBy: [] });
            }
            form.submit();
        } catch (e) {
            console.log(e)
        }

    }

    const setRelatedTimeFields = (field: string, value: string) => {
        const { YEAR, MONTH, DAY, HOUR, YearNoChange } = TIME;
        let from;
        let to;
        switch (field) {
            case YearNoChange:
                from = moment([value]);
                to = moment([value]).endOf(YEAR);
                form.setFieldsValue({ timeRange: [from, to], timeGroupBy: YEAR });
                break;
            case YEAR:
                from = moment([value]);
                to = moment([value]).endOf(YEAR);
                form.setFieldsValue({ timeRange: [from, to], timeGroupBy: MONTH });
                break;
            case MONTH:
                from = moment(value, DATE_FORMAT.MMYYYY).startOf(MONTH);
                to = moment(value, DATE_FORMAT.MMYYYY).endOf(MONTH);
                form.setFieldsValue({ timeRange: [from, to], timeGroupBy: DAY });
                break;
            case DAY:
                from = moment(value, DATE_FORMAT.DDMMYYY);
                form.setFieldsValue({ timeRange: [from, from], timeGroupBy: HOUR });
                break;
            default:
                break;
        }
    }

    // Handle query khi click vào các giá trị có type=property trong column
    const handleQueryColumn = async (column: any, selectedData: any) => {
        const { field } = column;
        const fieldsValue = form.getFieldsValue();
        const { YEAR, MONTH, DAY } = TIME;
        if ([YEAR, MONTH, DAY].includes(field)) {
            setRelatedTimeFields(field, selectedData);
        } else {
            if (metadata) {
                Object.keys(metadata.properties).forEach(property => {
                    const keyIdx = Object.keys(metadata.properties[property]).findIndex(propertyKey => propertyKey === field);
                    if (keyIdx !== -1 && Object.keys(metadata.properties[property])[keyIdx + 1]) {
                        const currentRow = Object.keys(metadata.properties[property])[keyIdx];
                        const nextRow = Object.keys(metadata.properties[property])[keyIdx + 1];
                        setRowsInQuery((prev: string[]) => nextRow ? [...prev.filter(item => item !== currentRow && item !== nextRow), nextRow] : [...prev.filter(item => item !== currentRow)]);
                        fieldsValue.properties[property] = fieldsValue.properties[property].filter((item: string) => item !== currentRow && item !== nextRow);
                        form.setFieldsValue({ properties: { ...fieldsValue.properties, [property]: nextRow ? [...fieldsValue.properties[property], nextRow] : fieldsValue.properties[property] } });
                    }
                })
            }

            form.setFieldsValue({ where: { ...fieldsValue.where, [field]: [selectedData] } });
        }
        form.submit();
        if (field === YEAR) {
            [MONTH, DAY].forEach((item) => {
                activeFilters.delete(item);
            });
        }
        if (field === MONTH) {
            activeFilters.delete(DAY);
        }
        setActiveFilters(
            activeFilters.set(field, {
                value: [selectedData],
                title: metadata ? getTranslatePropertyKey(metadata, field) : field,
            })
        );
    }

    const handleRemoveFilter = (filter: any) => {
        const { field: fieldFilter, value: valueFilter, title } = filter;
        const { YEAR, MONTH, DAY, YearNoChange } = TIME;
        let timeFilter;
        switch (fieldFilter) {
            case MONTH:
                const timeFilters = Array.from(activeFilters.keys()).filter((field) => [YEAR, DAY].includes(field as TIME));
                switch (timeFilters.length) {
                    case 2:
                        timeFilter = { field: YEAR, ...activeFilters.get(YEAR) };
                        break;
                    case 1:
                        timeFilter = { field: timeFilters[0], ...activeFilters.get(timeFilters[0]) };
                        break;
                    default:
                        timeFilter = undefined;
                        break;
                }
                break;
            case DAY:
                const timeFilters2 = Array.from(activeFilters.keys()).filter((field) => [YEAR, MONTH].includes(field as TIME));
                switch (timeFilters2.length) {
                    case 2:
                        timeFilter = { field: MONTH, ...activeFilters.get(MONTH) };
                        break;
                    case 1:
                        timeFilter = { field: timeFilters2[0], ...activeFilters.get(timeFilters2[0]) };
                        break;
                    default:
                        timeFilter = undefined;
                        break;
                }
                break;
            default:
                timeFilter = undefined;
                break;
        }
        if (!timeFilter && [YEAR, MONTH, DAY].includes(fieldFilter)) {
            switch (fieldFilter) {
                case YEAR:
                    timeFilter = { field: YearNoChange, ...activeFilters.get(fieldFilter) };
                    break;
                case MONTH:
                    const currentYear = moment(activeFilters.get(fieldFilter).value[0], DATE_FORMAT.MMYYYY).year();
                    timeFilter = { field: YEAR, value: [currentYear] };
                    break;
                case DAY:
                    const currentMonth = moment(activeFilters.get(fieldFilter).value[0], DATE_FORMAT.DDMMYYY).format(DATE_FORMAT.MMYYYY);
                    timeFilter = { field: MONTH, value: [currentMonth] };
                    break;
                default:
                    break;
            }
        }

        if (timeFilter) {
            const { field, value } = timeFilter;
            setRelatedTimeFields(field, value[0]);
            if (fieldFilter === YEAR || fieldFilter === YearNoChange) {
                [YEAR, MONTH, DAY].forEach(item => {
                    activeFilters.delete(item);
                });
                setActiveFilters(activeFilters);
            }
            if (fieldFilter === MONTH) {
                [MONTH, DAY].forEach(item => {
                    activeFilters.delete(item);
                });
                setActiveFilters(activeFilters);
            }
            if (fieldFilter === DAY) {
                activeFilters.delete(DAY);
                setActiveFilters(activeFilters);
            }
        } else {
            const selectedFilterValue = activeFilters.get(fieldFilter).value;
            const fieldsValue = form.getFieldsValue();
            const newValue = selectedFilterValue.filter((item: string) => item !== valueFilter);
            form.setFieldsValue({
                where: {
                    ...fieldsValue.where,
                    [fieldFilter]: newValue,
                },
            });
            if (newValue.length) {
                setActiveFilters(activeFilters.set(fieldFilter, { value: newValue, title }));
            } else {
                activeFilters.delete(fieldFilter);
                setActiveFilters(activeFilters);
            }
            if (metadata) {
                Object.keys(metadata.properties).forEach(property => {
                    const keyIdx = Object.keys(metadata.properties[property]).findIndex(propertyKey => propertyKey === fieldFilter);
                    if (keyIdx !== -1) {
                        const currentRow = Object.keys(metadata.properties[property])[keyIdx];
                        setRowsInQuery((prev: string[]) => [...prev, currentRow]);
                        form.setFieldsValue({ properties: { ...fieldsValue.properties, [property]: [...(fieldsValue.properties[property] || []), currentRow] } });
                    }
                })
            }
        }
        form.submit();
    }

    const handleChangeTimeGroup = (timeGroup: string) => {
        // clear active filter relate time 
        TIME_GROUP_BY.forEach((item) => {
            const { value } = item;
            activeFilters.delete(value);
        })
        setActiveFilters(activeFilters);

        const where = form.getFieldValue(ReportifyFormFields.orderBy);
        if (
            Array.isArray(where) &&
            where.length &&
            TIME_GROUP_BY.some((item) => item.value === where[0][0])
        ) {
            //reset orderBy khi chuyển nhóm thời gian.
            form.setFieldsValue({ orderBy: [] });
        }
        pushSubmitAction();
    }
    return (
        <AnalyticsStyle>
            <Form
                onFinish={exportReportQuery}
                onFinishFailed={handleFinishFailed}
                form={form}
                name="report-form-base">
                <Card bodyStyle={{ paddingBottom: 0, paddingTop: 8 }} className="report-filter-wrapper">
                    <div className="group-report-type">
                        {cubeRef && [AnalyticCube.Sales, AnalyticCube.Costs].includes(cubeRef.current as AnalyticCube) && (
                            <Form.Item
                                label="Ghi nhận theo"
                                name={ReportifyFormFields.timeAtOption}
                                labelCol={{ span: 24 }}
                                help={false}
                                className="input-width report-filter-item">
                                <Select
                                    placeholder="Chọn giá trị ghi nhận theo"
                                    className="input-width-sm"
                                    onChange={handleChangeTimeGroup}>
                                    {TIME_AT_OPTION.map(({ label, value }) => {
                                        return (
                                            <Select.Option key={value} value={value}>
                                                {label}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        )}
                        {/* <Row> */}
                        {/* since - until */}
                        <Form.Item
                            label="Thời gian"
                            name={ReportifyFormFields.timeRange}
                            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                            labelCol={{ span: 24 }}
                            className="input-width report-filter-item"
                            help={false}>
                            <AnalyticsDatePicker className="input-width-sm" onChange={pushSubmitAction} />
                        </Form.Item>
                        {/* from */}
                        {/* <Form.Item label="Loại báo cáo" name={ReportifyFormFields.reportType} rules={[{ required: true, message: "Vui lòng chọn loại báo cáo" }]} labelCol={{ span: 24 }} className="input-width" help={false}>
                            <Select className='input-width' placeholder="Chọn loại báo cáo" onChange={pushSubmitAction}>
                                {REPORT_TYPE.map((item: string) => {
                                    return <Select.Option key={item} value={item}>{item}</Select.Option>
                                })}
                            </Select>
                        </Form.Item> */}
                        {/* over or by */}
                        <Form.Item
                            label="Nhóm theo"
                            name={ReportifyFormFields.timeGroupBy}
                            labelCol={{ span: 24 }}
                            help={false}
                            className="input-width report-filter-item">
                            <Select
                                allowClear
                                className="input-width-sm"
                                placeholder="Chọn thời gian nhóm theo"
                                onChange={handleChangeTimeGroup}>
                                {TIME_GROUP_BY.map(({ label, value }) => {
                                    return (
                                        <Select.Option key={value} value={value}>
                                            {label}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                        {/* bộ lọc  */}

                        <Form.Item label=" " labelCol={{ span: 24, xs: 0, sm: 0 }} colon={false} className="filter-btn report-filter-item">
                            {metadata && <FilterResults properties={metadata.properties} form={form} />}
                        </Form.Item>
                    </div>
                </Card>
                <Card
                    className="report-filter-wrapper"
                    title="Biểu đồ"
                    extra={
                        <div className="chart-filter-container">
                            <Form.Item name={ReportifyFormFields.chartType} help={false} noStyle>
                                <Select
                                    placeholder="Chọn loại biểu đồ"
                                    className="input-width mr-20 chart-filter-item"
                                    showArrow
                                    onChange={(value: ChartTypeValue) => setChartType(value)}
                                >
                                    {chartTypes.map((chartTypeItem: any) => {
                                        return (
                                            <Select.Option
                                                value={chartTypeItem.value}
                                                key={chartTypeItem.value}
                                            >
                                                {chartTypeItem.label}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                            <Form.Item name={ReportifyFormFields.chartFilter} help={false} noStyle>
                                {metadata && (
                                    <Select
                                        placeholder="Tuỳ chọn hiển thị"
                                        mode="multiple"
                                        className="input-width chart-filter-item"
                                        showArrow
                                        maxTagCount={"responsive"}
                                        onChange={_.debounce((value: [string]) => setChartColumnSelected(value), AppConfig.TYPING_TIME_REQUEST)}
                                        filterOption={(input, option) => {
                                            if (option?.props.children) {
                                                return strForSearch(option.props.children.toLowerCase()).includes(strForSearch(input.toLowerCase()))
                                            }
                                            return false
                                        }
                                        }>
                                        {Object.keys(metadata.aggregates).map((key: string) => {
                                            const value = Object.values(metadata.aggregates)[
                                                Object.keys(metadata.aggregates).indexOf(key)
                                            ].name;
                                            return (
                                                <Select.Option
                                                    value={key}
                                                    key={key}
                                                    disabled={
                                                        chartColumnSelected && chartColumnSelected.length >= MAX_CHART_COLUMNS
                                                            ? chartColumnSelected.includes(key)
                                                                ? false
                                                                : true
                                                            : false
                                                    }>
                                                    {value}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </div>
                    }>
                    {chartDataQuery && (!chartInfo || chartInfo.showChart) && chartType === ChartTypeValue.VerticalColumn && (
                        <ReportifyBarChart
                            data={chartDataQuery.result.data}
                            leftLegendName={
                                metadata && chartColumnSelected && chartColumnSelected.length > 1
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 2]
                                            .field
                                    )
                                    : undefined
                            }
                            leftTickFormat={
                                chartColumnSelected && chartColumnSelected.length > 1
                                    ? chartDataQuery.result.columns[chartDataQuery.result.columns.length - 2].format
                                    : undefined
                            }
                            rightLegendName={
                                metadata
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 1]
                                            .field
                                    )
                                    : undefined
                            }
                            rightTickFormat={
                                chartDataQuery.result.columns[chartDataQuery.result.columns.length - 1].format
                            }
                            chartColumnNumber={chartColumnSelected?.length || 0}
                        />
                    )}
                    {chartDataQuery && (!chartInfo || chartInfo.showChart) && chartType === ChartTypeValue.Pie && (
                        <ReportifyPieChart
                            data={chartDataQuery.result.data.reduce((res, chartDataItem) => {
                                const piePartName = chartDataItem.filter((item: string, index) => index < rowsInQuery.length).reduce((res: string, item: string) => {
                                    if (item) {
                                        return res ? `${res} | ${item}` : `${item}`;
                                    } else {
                                        return res ? `${res} | -` : `-`;
                                    }
                                }, '');
                                const pieLegend1 = metadata
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 1]
                                            .field
                                    ) : undefined;
                                const pieLegend2 = metadata && chartColumnSelected?.length === 2
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 2]
                                            .field
                                    )
                                    : undefined;
                                const pieUnit1 = chartDataQuery.result.columns[chartDataQuery.result.columns.length - 1].format
                                const pieUnit2 = chartColumnSelected && chartColumnSelected.length > 1
                                    ? chartDataQuery.result.columns[chartDataQuery.result.columns.length - 2].format
                                    : undefined
                                if (chartColumnSelected?.length === 1) {
                                    res.pieChart1 = [...res.pieChart1, {
                                        label: pieLegend1,
                                        name: piePartName,
                                        value: chartDataItem[chartDataItem.length - 1],
                                        unit: pieUnit1
                                    }]
                                } else if (chartColumnSelected?.length === 2) {
                                    res.pieChart1 = [...res.pieChart1, {
                                        label: pieLegend1,
                                        name: piePartName,
                                        value: chartDataItem[chartDataItem.length - 1],
                                        unit: pieUnit1
                                    }]
                                    res.pieChart2 = [...res.pieChart2, {
                                        label: pieLegend2,
                                        name: piePartName,
                                        value: chartDataItem[chartDataItem.length - 2],
                                        unit: pieUnit2
                                    }]
                                }
                                return res;

                            }, { pieChart1: [] as any[], pieChart2: [] as any[] })}
                            legends={[{
                                value: metadata
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 1]
                                            .field
                                    )
                                    : undefined, type: 'square', id: 1
                            },
                            {
                                value: metadata && chartColumnSelected?.length === 2
                                    ? getTranslatePropertyKey(
                                        metadata,
                                        chartDataQuery.result.columns[chartDataQuery.result.columns.length - 2]
                                            .field
                                    )
                                    : undefined, type: 'square', id: 2
                            }
                            ]}
                        />
                    )}
                    {
                        chartInfo && !chartInfo.showChart && (
                            <em>{chartInfo.message}</em>
                        )
                    }
                </Card>

                <Card
                    title="Bảng thống kê"
                    headStyle={{ padding: "8px 20px" }}
                    extra={
                        <div>
                            {metadata && (
                                <CustomPropertiesModal
                                    form={form}
                                    properties={metadata.properties}
                                    aggregates={metadata.aggregates}
                                    warningChooseColumn={warningChooseColumn}
                                />
                            )}
                        </div>
                    }>
                    <ActiveFiltersStyle>
                        <ActiveFilters filters={Array.from(activeFilters)} action={handleRemoveFilter} />
                    </ActiveFiltersStyle>

                    {dataQuery && (
                        <Table
                            dataSource={dataQuery.result.data}
                            loading={loadingTable}
                            scroll={{ x: 'max-content' }}
                            sticky={{ offsetScroll: 55, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
                            pagination={{
                                defaultPageSize: 50,
                                pageSizeOptions: ["10", "20", "30", "50", "100", "500"],
                            }}
                            sortDirections={["descend", "ascend", null]}
                            onChange={(pagination: TablePaginationConfig, filters: any, sorter: any) => {
                                if (sorter.columnKey && Array.isArray(dataQuery.result.columns)) {
                                    handleSortTable(
                                        dataQuery.result.columns[Number(sorter.columnKey)].field,
                                        sorter.order
                                    );
                                }
                            }}
                            summary={(data) => {
                                return (
                                    <Table.Summary>
                                        <Table.Summary.Row>
                                            {dataQuery.result.columns.map(({ format, type }: any, index: number) => {
                                                let value: any = "-";
                                                if (format === FIELD_FORMAT.NumberFormat && type !== ColumnType.Measure) {
                                                    value = dataQuery?.result?.summary[index];
                                                } else if (format === FIELD_FORMAT.Price || (format === FIELD_FORMAT.NumberFormat && type === ColumnType.Measure)) {
                                                    value = formatCurrency(dataQuery?.result?.summary[index]);
                                                } else if (index === 0) {
                                                    value = "Tổng";
                                                }
                                                return (
                                                    <Table.Summary.Cell index={index} align="center" key={index}>
                                                        <b>{value}</b>
                                                    </Table.Summary.Cell>
                                                );
                                            })}
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                );
                            }}>
                            {dataQuery.result.columns.map((item: any, index: number) => {
                                const { format, field, type } = item;
                                return (
                                    <Table.Column<any>
                                        width={180}
                                        align="center"
                                        title={
                                            <Tooltip
                                                title={metadata ? getTranslatePropertyKey(metadata, field) : field}>
                                                {metadata ? getTranslatePropertyKey(metadata, field) : field}
                                            </Tooltip>
                                        }
                                        sorter={(a, b) => {
                                            return 0;
                                        }}
                                        sortOrder={form.getFieldValue(ReportifyFormFields.orderBy) && form.getFieldValue(ReportifyFormFields.orderBy).find((item: any[]) => item[0]?.toLowerCase() === field) ? (form.getFieldValue(ReportifyFormFields.orderBy).find((item: any[]) => item[0]?.toLowerCase() === field)[1]?.toLowerCase() === 'desc' ? 'descend' : 'ascend') : undefined}
                                        key={index}
                                        fixed={
                                            index === 0 && format !== FIELD_FORMAT.Price && format !== FIELD_FORMAT.NumberFormat
                                                ? "left"
                                                : undefined
                                        }
                                        className="detail-link"
                                        render={(value, record: Array<any>) => {
                                            let data = record[index];
                                            if (!data && typeof data !== FIELD_FORMAT.NumberFormat) {
                                                return "-";
                                            }
                                            switch (format) {
                                                case FIELD_FORMAT.Price:
                                                    data = formatCurrency(data);
                                                    break;
                                                case FIELD_FORMAT.NumberFormat:
                                                    data = type === ColumnType.Measure ? formatCurrency(data) : data;
                                                    break;
                                                case FIELD_FORMAT.Timestamp:
                                                    data = formatReportTime(data, field);
                                                    break;
                                            }
                                            const existedFilter = activeFilters.get(field);
                                            const detailLink = DETAIL_LINKS.find(
                                                ({ field: fieldKey, link }) => fieldKey === field
                                            );
                                            if (type === ColumnType.Property && field !== TIME.HOUR && (!existedFilter || existedFilter.value.length > 1 || (existedFilter.value.length === 1 && existedFilter.value[0] === 'Tất cả'))) {
                                                return (
                                                    <span>
                                                        <span className="link" onClick={() => handleQueryColumn(item, format === 'price' ? record[index] : data)}>{data}</span>
                                                        {detailLink ? (
                                                            <Link
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                to={`${detailLink.link}/${formatDataToSetUrl(data, detailLink.field)}`}>
                                                                <div className='external-link'>
                                                                    <img src={require(`assets/icon/feather-arrow-down-right.svg`).default} alt={'Xem chi tiết'} /></div>
                                                            </Link>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </span>
                                                );
                                            } else {
                                                return (
                                                    <span>
                                                        {data}
                                                        {detailLink ? (
                                                            <Link
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                to={`${detailLink.link}/${formatDataToSetUrl(data, detailLink.field)}`}>
                                                                <div className='external-link'>
                                                                    <img src={require(`assets/icon/feather-arrow-down-right.svg`).default} alt={'Xem chi tiết'} /></div>
                                                            </Link>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </span>
                                                );
                                            }
                                        }}
                                    />
                                );
                            })}
                        </Table>
                    )}
                </Card>
                {/* Dùng để hứng form data và warning (khi các popup chưa đc render)*/}
                <Form.Item hidden name={["orderBy"]} />
                <Form.Item hidden name={["where"]} />
                <Form.Item hidden name={["properties"]} />
                <Form.Item
                    hidden
                    name={[ReportifyFormFields.column]}
                    rules={[{ required: true, message: "Vui lòng chọn loại thống kê" }]}
                />
            </Form>
        </AnalyticsStyle>
    );
}

export default AnalyticsForm