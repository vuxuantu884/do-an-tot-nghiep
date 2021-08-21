import { Button, Col, Modal, Row } from "antd";
import { EditorModalType } from "model/editor/editor.model";
import React from "react";
import { StyledComponent } from "./styles";

const EditorModal: React.FC<EditorModalType> = (props: EditorModalType) => {
  const { isModalVisible, handleCancel, listKeywords, insertKeyword } = props;

  const renderModalFooter = () => {
    return <Button onClick={handleCancel}>Đóng</Button>;
  };

  const handleInsertKeyword = (text: string) => {
    handleCancel();
    insertKeyword(text);
  };

  return (
    <StyledComponent>
      <Modal
        title="Danh sách từ khóa"
        width="80%"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={renderModalFooter()}
      >
        <Row>
          {listKeywords &&
            listKeywords.length > 0 &&
            listKeywords.map((singleKeyWord, index) => {
              return (
                <Col span={12} key={index}>
                  <Row>
                    <Col span={8}>{singleKeyWord.title}</Col>
                    <Col span={12}>{singleKeyWord.key}</Col>
                    <Col span={4}>
                      <Button
                        onClick={() => handleInsertKeyword(singleKeyWord.key)}
                      >
                        Chọn
                      </Button>
                    </Col>
                  </Row>
                </Col>
              );
            })}
        </Row>
      </Modal>
    </StyledComponent>
  );
};

export default EditorModal;
