import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Table } from "antd";
import { AnnotationData } from "./key-driver-annotation";

type Props = {
  isVisiable: boolean;
  annotationData: AnnotationData;
  handleCancel: () => void;
};

function KeyDriverAnnotationModal({ isVisiable, annotationData, handleCancel }: Props) {
  const columns = [
    {
      title: "Chỉ số",
      key: "1",
      dataIndex: "name",
    },
    {
      title: "Định nghĩa",
      key: "2",
      dataIndex: "description",
    },
    {
      title: "Công thức",
      key: "3",
      dataIndex: "formula",
    },
  ];
  return (
    <Modal
      title="Bảng giải thích thuật ngữ"
      visible={isVisiable}
      onCancel={handleCancel}
      footer={[
        <Button type="primary" ghost key="1">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="link"
            href={annotationData.documentLink}
          >
            <QuestionCircleOutlined />
            <span className="margin-left-10">Xem thêm tài liệu hướng dẫn</span>
          </a>
        </Button>,
      ]}
      width={800}
    >
      <Input
        size="middle"
        placeholder="Tìm kiếm chỉ số"
        prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
        onChange={() => {}}
      />
      {annotationData.data.length > 0 &&
        annotationData.data.map((items) => {
          return (
            items.data.length > 0 && (
              <>
                <p>
                  <b>{items.name}</b>
                </p>
                <Table
                  columns={columns}
                  dataSource={items.data}
                  pagination={false}
                  scroll={{ y: 500 }}
                />
              </>
            )
          );
        })}
    </Modal>
  );
}

export default KeyDriverAnnotationModal;
