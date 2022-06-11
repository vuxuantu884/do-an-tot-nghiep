import { FilterOutlined } from "@ant-design/icons";
import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";
import search from "assets/img/search.svg";
import BaseSelectMerchans from "component/base/BaseSelect/BaseSelectMerchans";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import BaseFilter from "component/filter/base.filter";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import CustomFilter from "component/table/custom.filter";
import { useFetchMerchans } from "hook/useFetchMerchans";
import { CountryResponse } from "model/content/country.model";
import {
    keysDateFilter,
    SearchBarcodePrintHistoriesMapping,
    SearchBarcodePrintHistoryField,
} from "model/product/barcode-print-histories.mdole";
import { VariantSearchQuery } from "model/product/product.model";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConvertDatesLabel, isExistInArr } from "utils/ConvertDatesLabel";
import {
    DATE_FORMAT,
    formatDateFilter,
    getEndOfDayCommon,
    getStartOfDayCommon,
} from "utils/DateUtils";
import { StyledComponent } from "./style";

type ProductFilterProps = {
    params: any;
    listCountries?: Array<CountryResponse>;
    actions: Array<MenuAction>;
    onMenuClick?: (index: number) => void;
    onFilter?: (values: VariantSearchQuery) => void;
    onClickOpen?: () => void;
};

const { Item } = Form;

const HistoryInStampFilter: React.FC<ProductFilterProps> = (props: ProductFilterProps) => {
    const [formAvd] = Form.useForm();
    const [form] = Form.useForm();
    const formRef = createRef<FormInstance>();
    const { params, onFilter, onClickOpen, actions, onMenuClick } = props;

    const [visible, setVisible] = useState(false);
    const [dateClick, setDateClick] = useState("");
    let [advanceFilters, setAdvanceFilters] = useState<any>({});
    const { fetchMerchans, merchans, isLoadingMerchans } = useFetchMerchans();

    const { note } = params;
    useEffect(() => {
        const filter = {
            from_create_date: formatDateFilter(params.from_create_date),
            to_create_date: formatDateFilter(params.to_create_date),
            note: note || "",
        };

        formAvd.setFieldsValue(filter);
        setAdvanceFilters(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formAvd, params]);

    const onFinish = useCallback(
        (values: any) => {
            const valuesForm = {
                ...values,
                info: values?.info?.trim() || ""
            }
            onFilter && onFilter(valuesForm);
        },
        [onFilter]
    );

    const onFinishAvd = useCallback(
        (values: any) => {
            form.setFieldsValue(values);
            values.from_create_date = getStartOfDayCommon(values.from_create_date)?.format();
            values.to_create_date = getEndOfDayCommon(values.to_create_date)?.format();
            values.note = values.note?.trim();
            setAdvanceFilters({ ...advanceFilters, ...values });
            onFilter && onFilter(values);
        },
        [form, onFilter, setAdvanceFilters, advanceFilters]
    );

    const onFilterClick = useCallback(() => {
        setVisible(false);
        formAvd.submit();
    }, [formAvd]);

    const openFilter = useCallback(() => {
        setVisible(true);
    }, []);

    const onCancelFilter = useCallback(() => {
        setVisible(false);
    }, []);

    const onClearFilterClick = useCallback(() => {
        formAvd.resetFields();
        formAvd.submit();
        setVisible(false);
    }, [formAvd]);

    const resetField = useCallback(
        (field: string) => {
            if (field === SearchBarcodePrintHistoryField.created_bys) {
                form.setFieldsValue({
                    ...form.getFieldsValue(),
                    [field]: [],
                });
                form.submit();
            } else {
                formAvd.resetFields([field]);
            }
            formAvd.submit();
        },
        [formAvd, form]
    );

    return (
        <StyledComponent>
            <div className="product-filter">
                <Form onFinish={onFinish} form={form} initialValues={params} layout="inline">
                    <CustomFilter onMenuClick={onMenuClick} menu={actions}>
                        <Item name="info" className="search">
                            <Input
                                onChange={(e) =>
                                    formAvd.setFieldsValue({
                                        info: e.target.value,
                                    })
                                }
                                prefix={<img src={search} alt="" />}
                                placeholder="Tìm kiếm theo Tên/ Mã sản phẩm/ Mã tham chiếu/ Mã đơn đặt hàng/ Tên, SĐT nhà cung cấp"
                            />
                        </Item>
                        <Item name={SearchBarcodePrintHistoryField.created_bys} style={{ width: 250 }}>
                            <BaseSelectMerchans
                                merchans={merchans}
                                fetchMerchans={fetchMerchans}
                                isLoadingMerchans={isLoadingMerchans}
                                mode={"tags"}
                                tagRender={tagRender}
                                placeholder="Chọn người thao tác"
                            />
                        </Item>
                        <Item>
                            <Button type="primary" htmlType="submit">
                                Lọc
                            </Button>
                        </Item>
                        <Item>
                            <Button onClick={openFilter} icon={<FilterOutlined />}>
                                Thêm bộ lọc
                            </Button>
                        </Item>
                        <Item>
                            <ButtonSetting onClick={onClickOpen} />
                        </Item>
                    </CustomFilter>
                </Form>
                <FilterItemMerchandisers
                    values={form.getFieldValue("created_bys")}
                    resetField={resetField}
                    wins={merchans}
                />
                <FilterList filters={advanceFilters} resetField={resetField} />
                <BaseFilter
                    onClearFilter={onClearFilterClick}
                    onFilter={onFilterClick}
                    onCancel={onCancelFilter}
                    visible={visible}
                    width={700}>
                    <Form onFinish={onFinishAvd} form={formAvd} ref={formRef} layout="vertical">
                        <Item name="info" className="search" style={{ display: "none" }}>
                            <Input className="w-100" />
                        </Item>
                        <Row gutter={20}>
                            {Object.keys(SearchBarcodePrintHistoriesMapping).map((key) => {
                                let component: any = null;
                                switch (key) {
                                    case SearchBarcodePrintHistoryField.create_date:
                                        component = (
                                            <CustomFilterDatePicker
                                                fieldNameFrom="from_create_date"
                                                fieldNameTo="to_create_date"
                                                activeButton={dateClick}
                                                setActiveButton={setDateClick}
                                                formRef={formRef}
                                            />
                                        );
                                        break;

                                    case SearchBarcodePrintHistoryField.note:
                                        component = <Input.TextArea placeholder="Tìm kiếm theo nội dung ghi chú" />;
                                        break;
                                }

                                return (
                                    <React.Fragment key={key}>
                                        {component ? (
                                            <Col span={12}>
                                                <div className="font-weight-500">
                                                    {SearchBarcodePrintHistoriesMapping[key]}
                                                </div>
                                                <Item name={key}>{component}</Item>
                                            </Col>
                                        ) : (
                                            <React.Fragment />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </Row>
                    </Form>
                </BaseFilter>
            </div>
        </StyledComponent>
    );
};

const FilterItemMerchandisers = ({ values, resetField, wins }: any) => {
    let merchandiserTag = useRef("");
    const data = useMemo(() => Array.isArray(values) ? values : [values] || [], [values]);
    useEffect(() => {
        merchandiserTag.current = ""
        data?.forEach((item: string) => {
            const win = wins.items?.find((e: any) => e.code === item);
            merchandiserTag.current = win ? merchandiserTag.current + win.full_name + "; " : merchandiserTag.current;
        });

    }, [data, merchandiserTag, wins.items])
    return (
        <>
            {merchandiserTag.current && (
                <Tag
                    onClose={() => {
                        resetField("created_bys");
                        merchandiserTag.current = ""
                    }}
                    className="fade margin-bottom-20"
                    closable> Người thao tác : {merchandiserTag.current}</Tag>
            )}
        </>
    );
};

const FilterList = ({ filters, resetField }: any) => {
    const newFilters = { ...filters };
    let filtersKeys = Object.keys(newFilters);
    let renderTxt: any = null;
    const newKeys = ConvertDatesLabel(newFilters, keysDateFilter);
    filtersKeys = filtersKeys.filter((i) => !isExistInArr(keysDateFilter, i));
    const dataList = [...newKeys, ...filtersKeys];

    return (
        <React.Fragment>
            {dataList.map((filterKey: any) => {
                let value = filters[filterKey];
                if (!value && !filters[`from_${filterKey}`] && !filters[`to_${filterKey}`]) return null;
                if (value && Array.isArray(value) && value.length === 0) return null;
                if (!SearchBarcodePrintHistoriesMapping[filterKey]) return null;
                let newValues = Array.isArray(value) ? value : [value];
                switch (filterKey) {
                    case SearchBarcodePrintHistoryField.create_date:
                        renderTxt = `${SearchBarcodePrintHistoriesMapping[filterKey]} 
            : ${filters[`from_${filterKey}`]
                                ? moment(filters[`from_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY)
                                : "??"
                            } 
            ~ ${filters[`to_${filterKey}`]
                                ? moment(filters[`to_${filterKey}`]).utc(false).format(DATE_FORMAT.DDMMYYY)
                                : "??"
                            }`;

                        break;
                    case SearchBarcodePrintHistoryField.note:
                        console.log(newValues, filters, dataList, "da an", filterKey);
                        renderTxt = `${SearchBarcodePrintHistoriesMapping[filterKey]} : ${value}`;
                        break;
                }

                return (
                    <Tag
                        onClose={() => {
                            if (filterKey === "create_date") {
                                resetField("from_create_date");
                                resetField("to_create_date");
                                return;
                            }
                            resetField(filterKey);
                        }}
                        key={filterKey}
                        className="fade margin-bottom-20"
                        closable>{`${renderTxt}`}</Tag>
                );
            })}
        </React.Fragment>
    );
};

export default HistoryInStampFilter;

function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
        event.preventDefault();
        event.stopPropagation();
    };
    return (
        <Tag
            className="primary-bg"
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}>
            {label}
        </Tag>
    );
}
