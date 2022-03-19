import { Form, Input, Modal, Select } from 'antd'
import { FormInstance } from 'antd/es/form/Form';
import { CUSTOMIZE_TEMPLATE, REPORT_NAMES } from 'config/report-templates';
import UrlConfig from 'config/url.config';
import _ from 'lodash';
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
    const onFinish = async (values: any) => {

        const { name, templateIndex } = values;
        const template = CUSTOMIZE_TEMPLATE[matchPath].find((item, index) => templateIndex === index);

        console.log(values)
        if (template?.cube && template?.query) {
            const response = await callApiNative({ notifyAction: "SHOW_ALL" }, dispatch, saveAnalyticsCustomService, {
                query: template?.query, cube: template?.cube, name,
            });
            if (response) {
                showSuccess("Tạo báo cáo thành công");
                history.push(UrlConfig.ANALYTICS+'/'+response.id);
            } else {
                showError("Tạo báo cáo không thành công ")
            }
        }
    }
    return (
        <Modal title="Cài đặt báo cáo" visible={isVisiable} onOk={handleOk} onCancel={handleCancel} okText="Tạo báo cáo">
            <Form name="analytic-info" form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Tên báo cáo" name="name" rules={[{ required: true, message: "Vui lòng nhập tên báo cáo" }]}>
                    <Input type="text" placeholder='Nhập tên báo cáo' />
                </Form.Item>
                <Form.Item label="Mẫu báo cáo" name="templateIndex" rules={[{ required: true, message: "Vui lòng chọn mẫu báo cáo" }]}>
                    <Select placeholder={_.capitalize(`Chọn mẫu ${REPORT_NAMES[matchPath]}`)}
                    >
                        {CUSTOMIZE_TEMPLATE[matchPath].map((template, index) => (
                            <Select.Option key={index} value={index}
                            >{_.capitalize( template.name)}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ModalCreateReport