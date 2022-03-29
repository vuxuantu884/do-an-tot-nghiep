import { SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Collapse, Form, Modal } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import _ from 'lodash';
import { AnalyticAggregate, AnalyticProperties } from 'model/report/analytics.model';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { RoleStyled } from 'screens/settings/roles/card-authorize-detail/index.style';
import { checkArrayHasAllValue, checkArrayHasAnyValue } from 'utils/ReportUtils';
import { AddPropertiesModalStyle } from '../index.style';
import { ReportifyFormFields } from './analytics-form';
import { AnalyticsContext } from './analytics-provider';
import { IconCheckboxCollapse } from './shared';
const { Panel } = Collapse;

type Props = {
    properties: AnalyticProperties,
    aggregates: AnalyticAggregate,
    form: FormInstance,
    warningChooseColumn: boolean,
}

function CustomPropertiesModal({ properties, aggregates, form, warningChooseColumn }: Props) {
    const { metadata, dataQuery } = useContext(AnalyticsContext);

    const [activePanel, setActivePanel] = useState<string | string[]>([ReportifyFormFields.column]);
    const [visiblePropertiesModal, setVisiblePropertiesModal] = useState(false);
    // dùng để chứa data để show checked or unchecked or indeterminate nhóm check box, không dùng để gửi dữ diệu lên server
    const [chosenProperties, setChosenProperties] = useState<{ [key: string]: Array<string> }>({});

    //dùng để lưu dữ liệu gửi lên server
    const handleOk = async () => {
        try {
            await form.validateFields([ReportifyFormFields.column]);
            setVisiblePropertiesModal(false);
            form.submit();
        } catch (error) {
            console.log("aggregates is empty", error);
        }

    };
    const handleCanel = () => {
        setVisiblePropertiesModal(false);
    };

    const handleChangeGroupCheckbox = (e: CheckboxChangeEvent, name: string | string[], allGroupKeys: Array<string>) => {
        const { checked } = e.target;

        if (checked) {
            if (Array.isArray(name)) {
                form.setFieldsValue({
                    [name[0]]: {
                        [name[1]]: allGroupKeys
                    }
                });
                // set các lựa chọn vào state để hiển thị checked hoặc indeterminate
                setChosenProperties((prevState) => ({ ...prevState, [name[1]]: allGroupKeys }));
                setActivePanel((prevState) =>
                [...prevState, name[1]]
                );
            } else if (typeof name === "string") {

                form.setFieldsValue({ [name]: allGroupKeys });
                // set các lựa chọn vào state để hiển thị checked hoặc indeterminate
                setChosenProperties((prevState) => ({ ...prevState, [name]: allGroupKeys }));
            }


        } else {
            if (Array.isArray(name)) {
                form.setFieldsValue({
                    [name[0]]: {
                        [name[1]]: []
                    }
                });
                // set các lựa chọn vào state để hiển thị checked hoặc indeterminate
                setChosenProperties((prevState) => ({ ...prevState, [name[1]]: [] }));

            } else if (typeof name === "string") {

                form.setFieldsValue({ [name]: [] });
                // set các lựa chọn vào state để hiển thị checked hoặc indeterminate
                setChosenProperties((prevState) => ({ ...prevState, [name]: [] }));
            }


        }
    }

    const handleOnChangeCheckboxProperties = (e: CheckboxChangeEvent, name: string, value: string) => {
        const { checked } = e.target;
        const currentValue = chosenProperties[name]
        let newValue: string[] = [];
        if (checked) {

            // set các lựa chọn vào state để hiển thị checked hoặc indeterminate
            if (currentValue) {
                newValue = [...currentValue, value]
            } else {
                newValue = [value]
            }

        } else {

            if (currentValue) {
                newValue = currentValue.filter((item) => item !== value);
            }
        }
        setChosenProperties((prevState) => {
            return { ...prevState, [name]: newValue };
        })
    };

    const groupAggregatesKeys = aggregates ? Object.keys(aggregates) : [];
    const chosenAggregates = chosenProperties[ReportifyFormFields.column]
    // kiểm tra nhóm properties đang ở trang thái checked hay indeterminate

    const isIndeterminateAggretes = !!checkArrayHasAnyValue(chosenAggregates, groupAggregatesKeys);

    const isCheckedAggretes = checkArrayHasAllValue(groupAggregatesKeys, chosenAggregates);


    /**
     * Load default checked column
     */
    useEffect(() => {
        if (metadata && dataQuery) {
            //check aggreate column
            const aggreateKeys = Object.keys(metadata?.aggregates)
            const checkedKey = dataQuery?.query.columns.filter((item) => aggreateKeys.includes(item.field)) || [];
            setChosenProperties((prevState) => {
                return { ...prevState, [ReportifyFormFields.column]: checkedKey.map((item) => item.field) };
            });

            //check properties column
            Object.keys(metadata?.properties).forEach((propertyKey) => {
                const propertyObject = metadata?.properties[propertyKey];
                const propertyKeys = Object.keys(propertyObject);
                const checkedPropertyKey = dataQuery?.query.rows?.filter((item) => propertyKeys.includes(item));
                if (Array.isArray(checkedPropertyKey) && checkedPropertyKey.length > 0) {
                    setChosenProperties((prevState) => {
                        return { ...prevState, [propertyKey]: checkedPropertyKey.map((item) => item) };
                    }
                    );

                    setActivePanel((prevState) =>
                        [...prevState, propertyKey]
                    );
                    
                }
            })
        }
    }, [metadata, dataQuery]);
    return (
        <>
            <Button icon={<SettingOutlined />} onClick={() => setVisiblePropertiesModal(true)} danger={warningChooseColumn}>Tuỳ chọn hiển thị </Button>
            <Modal
                title="Thêm thuộc tính"
                visible={visiblePropertiesModal}
                onOk={handleOk}
                onCancel={handleCanel}
                width={800}
                footer={[
                    <Button key="submit" type="primary" onClick={handleOk}>
                        Thêm
                    </Button>,
                ]}
            >
                <AddPropertiesModalStyle>

                    <RoleStyled>
                        <Collapse
                            bordered={false}
                            expandIcon={() => <Fragment />}
                            className="site-collapse-custom-collapse"
                            onChange={(key: string | string[]) => setActivePanel(key)}
                            activeKey={activePanel}
                        >
                            {/*column - aggregates */}
                            <Panel
                                key={ReportifyFormFields.column}
                                className="site-collapse-custom-panel"
                                header={
                                    <div className="panel-header">
                                        <Checkbox
                                            onChange={(e) => handleChangeGroupCheckbox(e, ReportifyFormFields.column, Object.keys(aggregates))}
                                            indeterminate={isIndeterminateAggretes && !isCheckedAggretes}
                                            checked={isCheckedAggretes || isIndeterminateAggretes}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <b onClick={(e) => e.stopPropagation()}>{_.capitalize("Thống kê")}<span style={{ color: "red" }}> *</span></b>
                                        </Checkbox>
                                        <IconCheckboxCollapse checked={activePanel.includes(ReportifyFormFields.column)} />

                                    </div>
                                }
                            >
                                <Form.Item name={ReportifyFormFields.column} rules={[{ required: true, message: "Vui lòng chọn loại thống kê" }]} >
                                    <Checkbox.Group className='panel-content'>
                                        {Object.keys(aggregates).map((item: any) => {
                                            const value: any = Object.values(aggregates)[Object.keys(aggregates).indexOf(item)].name
                                            return <Checkbox key={item} value={item} className="panel-content-item" onChange={(e) => handleOnChangeCheckboxProperties(e, ReportifyFormFields.column, item)}>{value}</Checkbox>
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                            </Panel>

                            {/*where - properties */}
                            {


                                Object.keys(properties).map((group: any) => {
                                    const groupProperties = properties[group];
                                    const groupPropertiesKeys = Object.keys(groupProperties);

                                    // kiểm tra nhóm properties đang ở trang thái checked hay indeterminate
                                    const isIndeterminate = !!checkArrayHasAnyValue(chosenProperties[group], groupPropertiesKeys);
                                    const isChecked = checkArrayHasAllValue(groupPropertiesKeys, chosenProperties[group]);
                                    return <Panel
                                        key={group}
                                        className="site-collapse-custom-panel"
                                        header={
                                            <div className="panel-header">
                                                <Checkbox
                                                    onChange={(e) => handleChangeGroupCheckbox(e, ['properties', group], Object.keys(properties[group]))}
                                                    indeterminate={isIndeterminate && !isChecked}
                                                    checked={isChecked || isIndeterminate}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <b onClick={(e) => e.stopPropagation()}>{_.capitalize(group)}</b>
                                                </Checkbox>
                                                <IconCheckboxCollapse checked={activePanel.includes(group)} />
                                            </div>
                                        }
                                    >
                                        <Form.Item name={['properties', group]} >
                                            <Checkbox.Group className='panel-content'>
                                                {Object.keys(groupProperties).map((item: any) => {
                                                    const value: any = Object.values(groupProperties)[Object.keys(groupProperties).indexOf(item)]
                                                    return <Checkbox key={item} value={item} className="panel-content-item" onChange={(e) => handleOnChangeCheckboxProperties(e, group, item)}>{value}</Checkbox>
                                                })}
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Panel>
                                })
                            }
                        </Collapse>
                    </RoleStyled>
                </AddPropertiesModalStyle>
            </Modal>
        </>
    )
}

export default CustomPropertiesModal