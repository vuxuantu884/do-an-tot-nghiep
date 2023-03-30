import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Table } from "antd";
import { AnnotationColumns } from "config/report";
import { AnnotationItem } from "model/report/analytics.model";
import { useCallback, useState } from "react";

type Props = {
  isVisiable: boolean;
  annotationData: AnnotationItem[];
  handleCancel: () => void;
  documentLink: string;
};

function AnnotationTableModal({ isVisiable, annotationData, documentLink, handleCancel }: Props) {
  const [annotationNewData, setAnnotationNewData] = useState(annotationData);

  const search = useCallback(
    (value) => {
      const newValue = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
      const newData = annotationData.filter((item: any) => item.normalize.indexOf(newValue) > -1);
      setAnnotationNewData(newData);
    },
    [annotationData],
  );
  return (
    <Modal
      title="Bảng giải thích thuật ngữ"
      visible={isVisiable}
      onCancel={handleCancel}
      footer={[
        <Button type="primary" ghost key="1">
          <a target="_blank" rel="noopener noreferrer" className="link" href={documentLink}>
            <QuestionCircleOutlined />
            <span className="margin-left-10">Xem thêm tài liệu hướng dẫn</span>
          </a>
        </Button>,
      ]}
      width={800}
    >
      <Input
        size="middle"
        placeholder="Tìm kiếm thuật ngữ"
        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
        onChange={(input) => search(input.target.value)}
        allowClear
        style={{ marginBottom: "1rem" }}
      />
      <Table dataSource={annotationNewData} pagination={false} scroll={{ y: 500 }} key="annotation">
        {AnnotationColumns.map((item: any, index: number) => {
          const { title, key, dataIndex, width } = item;
          return (
            <Table.Column<any>
              title={title}
              key={key}
              render={(value, record) => {
                return <div dangerouslySetInnerHTML={{ __html: record[dataIndex] }} />;
              }}
              width={width}
            />
          );
        })}
      </Table>
    </Modal>
  );
}

export default AnnotationTableModal;
