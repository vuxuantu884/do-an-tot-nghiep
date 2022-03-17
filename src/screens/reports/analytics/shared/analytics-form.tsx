import { ExportOutlined } from '@ant-design/icons';
import { Card, Form, FormInstance, Select, Table, Tooltip } from 'antd';
import { TablePaginationConfig } from 'antd/es/table/interface';
import { DETAIL_LINKS } from 'config/report-templates';
import _ from 'lodash';
import { AnalyticConditions, AnalyticQuery, SUBMIT_MODE, TIME } from 'model/report/analytics.model';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { executeAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { formatCurrency } from 'utils/AppUtils';
import { OFFSET_HEADER_UNDER_NAVBAR } from 'utils/Constants';
import { DATE_FORMAT } from 'utils/DateUtils';
import { formatReportTime, generateRQuery, getTranslatePropertyKey, transformDateRangeToString } from 'utils/ReportUtils';
import { ActiveFiltersStyle, AnalyticsStyle } from '../index.style';
import ActiveFilters from './active-filters';
import AnalyticsDatePicker from './analytics-date-picker';
import { AnalyticsContext } from './analytics-provider';
import CustomPropertiesModal from './custom-properties-modal';
import FilterResults from './filter-results';

type Props = {
    form: FormInstance;
    handleRQuery: (e: any) => void;
    mode: SUBMIT_MODE;
}

export const ReportifyFormFields = {
    where: "where",
    timeGroupBy: "timeGroupBy",
    timeRange: "timeRange",
    reportType: "reportType",
    properties: "properties",
    column: "column",
}
// const MAX_CHART_COLUMS = 2 // SỐ LƯỢNG CỘT ĐƯỢC PHÉP HIỂN THỊ TRONG CHART


export const TIME_GROUP_BY = [
    {
        label: 'Giờ',
        value: 'hour'
    },
    {
        label: 'Ngày',
        value: 'day'
    },
    {
        label: 'Tháng',
        value: 'month'
    },
    {
        label: 'Năm',
        value: 'year'
    }
]

function AnalyticsForm({ form, handleRQuery, mode }: Props) {
    const { cubeRef, metadata, dataQuery, setDataQuery } = useContext(AnalyticsContext)
    const [loadingTable, setLoadingTable] = useState<boolean>(false);
    const [activeFilters, setActiveFilters] = useState<any[]>([]);

    const dispatch = useDispatch();
    const [warningChooseColumn, setWarningChooseColumn] = useState(false);
    // const [chartColumnSelected, setChartColumnSelected] = useState<string[]>([]);

    const pushSubmitAction = () => {
        form.submit()
    }

    const exportReportQuery = async (values: any) => {
        /**
         * Bỏ warning button Tuỳ chọn hiển thị
         */
        setWarningChooseColumn(false);

        const { where, timeRange, timeGroupBy, properties, orderBy } = values

        const columns = values[ReportifyFormFields.column]?.map((item: any) => ({ field: item }))

        const ranges = transformDateRangeToString(timeRange);

        // set by or over 
        let show: Array<string> = [];

        if (timeGroupBy) {
            show = [timeGroupBy]
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
                values = value.join(",").split(",").map((item: string) => `'${item}'`).join(",");
            } else {
                values = value
            }

            return [key, operator, ...values]
        })

        const parms: AnalyticQuery = {
            columns: columns,
            rows: show,
            cube: values?.reportType || cubeRef.current,
            from: ranges?.from,
            to: ranges?.to,
            conditions: whereParams,
            orderBy: orderBy,
        } as AnalyticQuery;


        const params = generateRQuery(parms)
        if (mode !== SUBMIT_MODE.GET_DATA) {
            handleRQuery(params);

        } else {
            setLoadingTable(true);
            const response = await callApiNative({ isShowError: true }, dispatch, executeAnalyticsQueryService, { q: params });
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
        const { YEAR, MONTH, DAY, HOUR } = TIME;
        let from;
        let to;
        switch (field) {
            case YEAR:
                from = moment([value]);
                to = moment([value]).endOf(YEAR);
                form.setFieldsValue({ timeRange: [from, to], timeGroupBy: MONTH});
                break;
            case MONTH:
                from = moment(value, DATE_FORMAT.MMYYYY).startOf(MONTH);
                to = moment(value, DATE_FORMAT.MMYYYY).endOf(MONTH);
                form.setFieldsValue({ timeRange: [from, to], timeGroupBy: DAY});
                break;
            case DAY:
                from = moment(value, DATE_FORMAT.DDMMYYY);
                form.setFieldsValue({ timeRange: [from, from], timeGroupBy: HOUR});
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
            form.setFieldsValue({ where: { ...fieldsValue.where, [field]: [selectedData] }});
        }
        form.submit();
        const existedFilterIdx = activeFilters.findIndex((item) => item.field === field);
        if (existedFilterIdx === -1) {
            setActiveFilters([...activeFilters, {field, value: selectedData, title: metadata ? getTranslatePropertyKey(metadata, field) : field}])
        }
    }

    const handleRemoveFilter = (filter: any) => {
        const { field: fieldFilter } = filter; 
        const { YEAR, MONTH, DAY } = TIME;
        let timeFilter = activeFilters.find(({ field }) => {
            switch (fieldFilter) {
                case MONTH:
                    const timeFilters = activeFilters.filter(({ field }) => [YEAR, DAY].includes(field));
                    if (timeFilters.length === 2) {
                        return field === YEAR;
                    }
                    if (timeFilters.length === 1) {
                        return field === timeFilters[0].field;
                    }
                    return undefined;
                case DAY:
                    const timeFilters2 = activeFilters.filter(({ field }) => [MONTH, YEAR].includes(field));
                    if (timeFilters2.length === 2) {
                        return field === MONTH;
                    }
                    if (timeFilters2.length === 1) {
                        return field === timeFilters2[0].field;
                    }
                    return undefined;
                default:
                    return undefined;
            }
        })
        if (!timeFilter && [YEAR, MONTH, DAY].includes(fieldFilter)) {
            timeFilter = activeFilters.find(({ field }) => fieldFilter === field);
        }
        if (timeFilter) {
            const { field, value } = timeFilter;
            setRelatedTimeFields(field, value);
        } else {
            const fieldsValue = form.getFieldsValue();
            form.setFieldsValue({ where: { ...fieldsValue.where, [fieldFilter]: undefined }});
        }
        form.submit();
        setActiveFilters([...activeFilters.filter(({field}) => {
            if (fieldFilter === YEAR) {
                return ![YEAR, MONTH, DAY].includes(field);
            }
            if (fieldFilter === MONTH) {
                return ![MONTH, DAY].includes(field);
            }
            return field !== fieldFilter;
        })]);
    }

    return (
        <AnalyticsStyle>
            <Form onFinish={exportReportQuery} onFinishFailed={handleFinishFailed} form={form} name="report-form-base">

                <Card bodyStyle={{ paddingBottom: 0, paddingTop: 0 }} title="Bộ lọc" >

                    <div className='group-report-type'>
                        {/* <Row> */}
                        {/* since - until */}
                        <Form.Item label="Thời gian" name={ReportifyFormFields.timeRange}
                            rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
                            labelCol={{ span: 24 }} className="input-width" help={false}
                        >
                            <AnalyticsDatePicker onChange={pushSubmitAction} />
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
                        <Form.Item label="Nhóm theo" name={ReportifyFormFields.timeGroupBy} labelCol={{ span: 24 }} help={false}>
                            <Select allowClear className='input-width' placeholder="Chọn thời gian nhóm theo" onChange={pushSubmitAction}>
                                {(TIME_GROUP_BY).map(({ label, value }) => {
                                    return <Select.Option key={value} value={value}>{label}</Select.Option>
                                })}
                            </Select>
                        </Form.Item>
                        {/* bộ lọc  */}

                        <Form.Item label=" " labelCol={{ span: 24 }} colon={false} className="filter-btn"  >
                            {metadata && <FilterResults properties={metadata.properties} form={form} />}
                        </Form.Item>
                    </div>
                </Card>
                {/* <Card title="Biểu đồ"
                    extra={
                        <Form.Item name="chart-filter" help={false} noStyle>
                            {metadata && <Select placeholder="Tuỳ chọn hiển thị" mode="multiple" className='input-width' showArrow
                                maxTagCount={"responsive"}
                                onChange={(value: [string]) => setChartColumnSelected(value)}
                            >
                                {Object.keys(metadata.aggregates).map((key: string) => {
                                    const value = Object.values(metadata.aggregates)[Object.keys(metadata.aggregates).indexOf(key)].name;
                                    return <Select.Option value={key}
                                        key={key}
                                        disabled={
                                            chartColumnSelected.length >= MAX_CHART_COLUMS
                                                ? chartColumnSelected.includes(key)
                                                    ? false
                                                    : true
                                                : false
                                        }
                                    >{value}</Select.Option>
                                }
                                )}
                            </Select>}
                        </Form.Item>

                    }>
                    {dataQuery && <ReportifyBarChart data={dataQuery.result.data} leftLegendName={dataQuery.result.columns[0].field} rightLegendName={dataQuery.result.columns[1].field} />}
                </Card> */}

                <Card title="Bảng thống kê" headStyle={{ padding: "8px 20px" }}
                    extra={<div>
                        {metadata && <CustomPropertiesModal form={form}
                            properties={metadata.properties}
                            aggregates={metadata.aggregates}
                            warningChooseColumn={warningChooseColumn}
                        />}
                    </div>}>
                    <ActiveFiltersStyle>
                        <ActiveFilters filters={activeFilters} action={handleRemoveFilter}/>
                    </ActiveFiltersStyle>

                    {dataQuery && <Table
                        dataSource={dataQuery.result.data}
                        loading={loadingTable}
                        scroll={{ x: 1000, }}
                        sticky={{ offsetScroll: 55, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
                        pagination={{
                            defaultPageSize: 50,
                            pageSizeOptions: ['10', '20', '30', '50', '100', '500'],
                        }}
                        onChange={(pagination: TablePaginationConfig, filters: any, sorter: any) => {
                            if (sorter.columnKey && Array.isArray(dataQuery.result.columns)) {
                                handleSortTable(dataQuery.result.columns[Number(sorter.columnKey)].field, sorter.order);
                            }
                        }}
                        
                        summary={(data) => {
                            return (
                                <Table.Summary >
                                    <Table.Summary.Row>
                                        {dataQuery.result.columns.map(({ format }: any, index: number) => {
                                            let value: any = "-";
                                            if (format === "number") {
                                                value = dataQuery?.result?.summary[index];
                                            } else if (format === "price") {
                                                value = formatCurrency(dataQuery?.result?.summary[index]);
                                            } else if (index === 0) {
                                                value = "Tổng"
                                            }
                                            return <Table.Summary.Cell index={index} align="center">
                                                <b>{value}</b>
                                            </Table.Summary.Cell>
                                        })}
                                    </Table.Summary.Row>
                                </Table.Summary>

                            )
                        }
                        }
                    >

                        {dataQuery.result.columns.map((item: any, index: number) => {
                            const { format, field, type } = item;
                            return <Table.Column<any>
                                ellipsis
                                width={180}
                                align="center"
                                title={<Tooltip title={metadata ? getTranslatePropertyKey(metadata, field) : field}>{metadata ? getTranslatePropertyKey(metadata, field) : field}</Tooltip>}
                                // Đoạn này dùng để request data từ server để sắp xếp cột- hiện tại đang sắp xếp trên client
                                // còn thiếu set defaultSortOrder khi load data từ server
                                                            
                                sorter={(a, b) => { return 0 }}                                
                                key={index}
                                fixed={index === 0 && format !== "price" && format !== "number" ? 'left' : undefined}
                                render={(value, record: Array<any>) => {
                                    let data = record[index];
                                    if (!data && typeof data !== "number") {
                                        return "-"
                                    }
                                    switch (format) {
                                        case "price":
                                            data = formatCurrency(data)
                                            break
                                        case "timestamp":
                                            data = formatReportTime(data, field)
                                            break
                                    }
                                    const existedFilterIdx = activeFilters.findIndex((item) => item.field === field);
                                    const detailLink = DETAIL_LINKS.find(({ field: fieldKey, link }) => fieldKey === field);
                                    if (type === 'property' && field !== TIME.HOUR && existedFilterIdx === -1) {
                                        return (
                                          <span className="link detail-link">
                                            <span onClick={() => handleQueryColumn(item, data)}>
                                              {data}
                                            </span>
                                            {detailLink ? (
                                              <Link
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                to={`${detailLink.link}/${data}`}>
                                                <ExportOutlined className="external-link" />
                                              </Link>
                                            ) : (
                                              ""
                                            )}
                                          </span>
                                        );
                                    } else {
                                        return (
                                            <span className="detail-link">
                                                {data}
                                                {detailLink ? (
                                                <Link
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    to={detailLink.link}>
                                                    <ExportOutlined className="external-link" />
                                                </Link>
                                                ) : (
                                                ""
                                                )}
                                            </span>
                                        );
                                    }
                                }
                                }
                            />
                        })}

                    </Table>}
                </Card>
                {/* Dùng để hứng form data và warning (khi các popup chưa đc render)*/}
                <Form.Item hidden name={["orderBy"]} />
                <Form.Item hidden name={["where"]} />
                <Form.Item hidden name={["properties"]} />
                <Form.Item hidden name={[ReportifyFormFields.column]} rules={[{ required: true, message: "Vui lòng chọn loại thống kê" }]} />
            </Form>
        </AnalyticsStyle>
    )
}

export default AnalyticsForm