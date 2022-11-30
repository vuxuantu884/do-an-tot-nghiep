import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Table } from "antd";
import { useCallback, useState } from "react";
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
  const [annotationNewData, setAnnotationNewData] = useState(annotationData.data);

  const search = useCallback(
    (value) => {
      console.log("value", value);
      const newValue = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
      const newData = annotationData.data.map((item) => {
        return {
          ...item,
          data: item.data.filter(
            (keyDriver: any) =>
              keyDriver.name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/Đ/g, "D")
                .toLowerCase()
                .indexOf(newValue) > -1,
          ),
        };
      });
      setAnnotationNewData(newData);
    },
    [annotationData.data],
  );

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
        onChange={(input) => search(input.target.value)}
        allowClear
      />
      {annotationNewData.length > 0 &&
        annotationNewData.map((items) => {
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
