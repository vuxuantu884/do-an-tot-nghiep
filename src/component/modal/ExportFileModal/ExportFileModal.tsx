import { Button, Modal, Progress, Radio, Row, Space } from "antd";
import { useEffect, useState } from "react";
import { ExportFileStatus, ExportFileType } from "utils/ExportFileConstants";
export type ExportModalProps = {
    visible: boolean;
    onCancel: (e: React.MouseEvent<HTMLElement>) => void;
    onOk: (optionExport: string) => void;
    textOK?: string;
    results: ResultLimitModel[];
    type?: string;
    total?: number;
    title?: string;
    exportProgress: number;
    status: number;
    selected?: boolean;
    isExportList?: boolean;
};
export type ResultLimitModel = {
    name: string;
    value: string;
    isHidden: boolean | undefined;
    title: string;
    isChecked?: boolean;
}

const ExportFileModal: React.FC<ExportModalProps> = (props: ExportModalProps) => {
    const { visible, onCancel, onOk, results, exportProgress, status,textOK ,isExportList,title } = props;
    
    const [exportType,setExportTye] = useState(ExportFileType.INPAGE);
    const [isLoading,setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(status === ExportFileStatus.Exporting ? true : false)
    },[status])

    const handleOk = () => {
        setIsLoading(true);
        onOk && onOk(exportType);
    }

    return (
        <Modal
            onCancel={onCancel}
            visible={visible}
            centered
            title={`Xuất file ${isExportList ? "danh sách":""} ${title}`}
            footer={[
                <Button
                  className="create-button-custom ant-btn-outline fixed-button"
                  onClick={onCancel}
                  danger={status === ExportFileStatus.Exporting ? true : false}
                  >
                  {status === ExportFileStatus.Exporting ? "Huỷ" : "Thoát"}
                </Button>,
                <Button key="ok"
                  type="primary"
                  onClick={handleOk}
                  disabled={status !== ExportFileStatus.Export}
                  loading={isLoading}
                >
                  {textOK ? textOK : "Xuất file"}
                </Button>,
              ]}
              width={600}
        >
            {status === ExportFileStatus.Export && (
                <div>
                   <p style={{ fontWeight: 500}}>Giới hạn kết quả xuất</p> 
                   <Radio.Group name="radiogroup" defaultValue={ExportFileType.INPAGE} onChange={(e) => setExportTye(e.target.value)}>
                        <Space direction="vertical">
                            {results && results.map((result) => {
                                return <Radio value={result.value} checked={result.isChecked} disabled={result.isHidden}>{result.title}</Radio>
                            })}
                        </Space>
                    </Radio.Group>
                </div>
            )}
            {status !== ExportFileStatus.Export && (
                <Row style={{ justifyContent: 'center'}}>
                    {status === ExportFileStatus.Exporting && <p>Đang tạo file, vui lòng đợi trong giây lát</p>}
                    {status === ExportFileStatus.ExportSuccess && <p>Đã tạo file thành công</p>}
                    {status === ExportFileStatus.ExportError && <p style={{ color: "#e24343"}}>Đã có lỗi xảy ra!!!</p>}
                    <Row style={{ justifyContent: 'center', width: '100%'}}>
                        <Progress
                            type="circle"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            percent={exportProgress}
                        />
                    </Row>
              </Row>
            )}
        </Modal>
    )
}
export default ExportFileModal;