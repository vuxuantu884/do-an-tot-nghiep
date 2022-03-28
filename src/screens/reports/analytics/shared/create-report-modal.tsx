import { Form, Input, Modal, Select } from 'antd'
import { FormInstance } from 'antd/es/form/Form';
import { ANALYTIC_TEMPLATE_GROUP, CUSTOMIZE_TEMPLATE, REPORT_NAMES } from 'config/report/report-templates';
import UrlConfig from 'config/url.config';
import _ from 'lodash';
import { AnalyticCube, AnalyticCustomizeTemplateForCreate } from 'model/report/analytics.model';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { saveAnalyticsCustomService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { showError, showSuccess } from 'utils/ToastUtils';

type Props = {
    isVisiable: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    form: FormInstance
}

function ModalCreateReport({
    form,
    isVisiable,
    handleOk,
    handleCancel,

}: Props) {
    const { path: matchPath } = useRouteMatch();
    const history = useHistory();
    const dispatch = useDispatch();
    const [templateList, setTemplateList] = useState<Array<AnalyticCustomizeTemplateForCreate>>([]);

    const onFinish = async (values: any) => {

        const { name, templateIndex } = values;
        const template = templateList.find((item, index) => templateIndex === index);

        console.log(values)
        if (template?.cube && template?.query) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, saveAnalyticsCustomService, {
                query: template?.query, cube: template?.cube, name,
            });
            if (response) {
                showSuccess("Tạo báo cáo thành công");
                history.push(UrlConfig.ANALYTICS + '/' + response.id);
            } else {
                showError("Tạo báo cáo không thành công ")
            }
        }
    }

    const onChangeGroup = () => {
        setTemplateList(CUSTOMIZE_TEMPLATE[matchPath].filter(item => form.getFieldValue('templateGroupIndex') === AnalyticCube.All || form.getFieldValue('templateGroupIndex') === item.cube));
    }

    useEffect(() => {
        setTemplateList(CUSTOMIZE_TEMPLATE[matchPath].filter(item => ANALYTIC_TEMPLATE_GROUP[matchPath][0].cube === AnalyticCube.All || ANALYTIC_TEMPLATE_GROUP[matchPath][0].cube === item.cube));
    }, [matchPath])
    return (
        <Modal title="Cài đặt báo cáo" visible={isVisiable} onOk={handleOk} onCancel={handleCancel} okText="Tạo báo cáo">
            <Form name="analytic-info" initialValues={
                {
                    templateGroupIndex: ANALYTIC_TEMPLATE_GROUP[matchPath][0].cube,
                    templateIndex: 0
                }
            } form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Tên báo cáo" name="name" rules={[{ required: true, message: "Vui lòng nhập tên báo cáo" }]}>
                    <Input type="text" placeholder='Nhập tên báo cáo' />
                </Form.Item>
                <Form.Item label="Nhóm chỉ số" name="templateGroupIndex" rules={[{ required: true, message: "Vui lòng chọn nhóm chỉ số" }]}>
                    <Select placeholder={'Chọn nhóm chỉ số'} onChange={() => onChangeGroup()}
                    >
                        {ANALYTIC_TEMPLATE_GROUP[matchPath].map((group, index) => (
                            <Select.Option key={index} value={group.cube}
                            >{_.capitalize(group.name)}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item label="Mẫu báo cáo" name="templateIndex" rules={[{ required: true, message: "Vui lòng chọn mẫu báo cáo" }]}>
                    <Select placeholder={_.capitalize(`Chọn mẫu ${REPORT_NAMES[matchPath]}`)}
                    >
                        {templateList.map((template, index) => (
                            <Select.Option key={index} value={index}
                            >{_.capitalize(template.name)}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalCreateReport