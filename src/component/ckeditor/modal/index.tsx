import { Button, Col, Input, Modal, Row, Table } from "antd";
import {
  EditorModalType,
  keywordsModel,
  listKeywordsModel,
} from "model/editor/editor.model";
import React, { useState } from "react";
import { StyledComponent } from "./styles";

const EditorModal: React.FC<EditorModalType> = (props: EditorModalType) => {
  const { isModalVisible, handleCancel, listKeywords, insertKeyword } = props;
  const [listKeywordShow, setListKeywordShow] = useState(listKeywords);

  const renderModalTitle = () => {
    return (
      <div>
        <h3 className="modal__title--big" style={{ fontSize: 20 }}>
          Danh sách từ khóa
        </h3>
        <p
          className="modal__title--small"
          style={{
            fontSize: "0.85em",
            fontWeight: "normal",
            fontStyle: "italic",
          }}
        >
          Từ khóa sẽ được thêm tại vị trí của con trỏ chuột trong phần mẫu in.
        </p>
      </div>
    );
  };
  const renderModalFooter = () => {
    return <Button onClick={handleCancel}>Đóng</Button>;
  };

  const renderSearch = () => {
    const onSearch = (value: string) => {
      if (listKeywordShow) {
        let cloneList = [...listKeywordShow];
        cloneList.map((single) => {
          if (single.list) {
            single.list.map((single1) => {
              if (
                single1.name.toLowerCase().includes(value.toLowerCase()) ||
                single1.value.toLowerCase().includes(value.toLowerCase())
              ) {
                single1.isShow = true;
              } else {
                single1.isShow = false;
              }
              return "";
            });
          }
          return "";
        });
        setListKeywordShow(cloneList);
      }
    };
    return (
      <Input.Search
        className="sectionSearch"
        onSearch={onSearch}
        style={{ width: "100%" }}
        placeholder="Tìm kiếm từ khóa"
        onChange={(e) => onSearch(e.target.value)}
      />
    );
  };
  const handleInsertKeyword = (text: string) => {
    handleCancel();
    insertKeyword(text);
  };

  const renderSinglePart = (arr: keywordsModel[]) => {
    let cloneArr = arr.filter((single) => {
      return single.isShow !== false;
    });
    const columns = [
      {
        title: "Diễn giải",
        dataIndex: "title",
      },
      {
        title: "Mã code",
        dataIndex: "key",
      },
      {
        title: "Chọn",
        render: (row: { key: string }) => {
          return (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleInsertKeyword(row.key);
              }}
            >
              Chọn
            </Button>
          );
        },
      },
    ];
    return (
      <Table
        dataSource={cloneArr}
        columns={columns}
        pagination={false}
        onRow={(record: keywordsModel) => {
          return {
            onClick: (event) => {
              handleInsertKeyword(record.name);
            }, // click row
          };
        }}
      ></Table>
    );
  };
  const divideArrayKeywordToTwoEqualPart = (arr: keywordsModel[]) => {
    const cloneArr = [...arr];
    const middleIndex = Math.ceil(cloneArr.length / 2);
    return {
      firstPart: cloneArr.splice(0, middleIndex),
      secondPart: cloneArr.splice(-middleIndex),
    };
  };
  const renderSingleSectionListKeyword = (
    singleListKeyword: listKeywordsModel
  ) => {
    if (singleListKeyword.list) {
      let objDividedToTwo = divideArrayKeywordToTwoEqualPart(
        singleListKeyword.list
      );
      const { firstPart, secondPart } = objDividedToTwo;
      return (
        <div className="single">
          <h3 className="title">{singleListKeyword.name}</h3>
          <Row gutter={20}>
            <Col span={12}>{renderSinglePart(firstPart)}</Col>
            <Col span={12}>{renderSinglePart(secondPart)}</Col>
          </Row>
        </div>
      );
    }
  };
  return (
    <Modal
      title={renderModalTitle()}
      width="80%"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={renderModalFooter()}
    >
      <StyledComponent>
        {renderSearch()}
        {listKeywordShow &&
          listKeywordShow.length > 0 &&
          listKeywordShow.map((singleListKeyWord, index) => {
            return (
              <section key={index}>
                {renderSingleSectionListKeyword(singleListKeyWord)}
              </section>
            );
          })}
        <Row></Row>
      </StyledComponent>
    </Modal>
  );
};

export default EditorModal;
