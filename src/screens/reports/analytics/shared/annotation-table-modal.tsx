import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Table } from "antd";
import { AnnotationColumns } from "config/report";
import { AnnotationItem } from "model/report/analytics.model";

type Props = {
    isVisiable: boolean;
    annotationData: AnnotationItem[];
    handleCancel: () => void;
    documentLink: string;
}

function AnnotationTableModal({
    isVisiable,
    annotationData,
    documentLink,
    handleCancel,
}: Props) {
    return (
        <Modal title="Bảng giải thích thuật ngữ" visible={isVisiable} onCancel={handleCancel} footer={[
            <Button type="primary" ghost key="1">
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                    href={documentLink}>
                    <QuestionCircleOutlined />
                    <span className='margin-left-10'>Xem thêm tài liệu hướng dẫn</span>
                </a>
            </Button>
        ]} width={800}>
            <Table columns={AnnotationColumns} dataSource={annotationData} pagination={false} scroll={{ y: 500 }} key="annotation"/>
        </Modal>
    )
}

export default AnnotationTableModal