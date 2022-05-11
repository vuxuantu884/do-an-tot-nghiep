import { Button, Col, Input, Modal, Row, Table } from "antd";
import {
  EditorModalType,
  keywordsModel,
  listKeywordsModel,
} from "model/editor/editor.model";
import React, { useEffect, useState } from "react";
import { useRef } from "react";
import { fullTextSearch } from "utils/StringUtils";
import { StyledComponent } from "./styles";

function EditorModal(props: EditorModalType) {
  const { isModalVisible, handleCancel, listKeywords, insertKeyword } = props;
  const [listKeywordShow, setListKeywordShow] = useState<listKeywordsModel[]>(
    []
  );
  const searchInputRef = useRef<Input>(null);

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
      if (value) {
        if (listKeywordShow) {
          let cloneList = [...listKeywordShow];
          cloneList.map((single) => {
            if (single.list) {
              single.list.map((single1) => {
                if (
                  fullTextSearch(value, single1.name) ||
                  fullTextSearch(value, single1.value)
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
      }
    };
    return (
      <Input.Search
        className="sectionSearch"
        onSearch={onSearch}
        style={{ width: "100%" }}
        placeholder="Tìm kiếm từ khóa"
        onChange={(e) => onSearch(e.target.value)}
        ref={searchInputRef}
      />
    );
  };
  const handleInsertKeyword = (text: string) => {
    handleCancel();
    insertKeyword(text);
  };

  const renderSinglePart = (arr: keywordsModel[]) => {
    // add thêm key:unique vào để ant table ko báo lỗi
    arr.forEach((single) => {
      single.key = single.value;
    });
    let cloneArr = arr.filter((single) => {
      return single.isShow !== false;
    });
    const columns = [
      {
        title: "Diễn giải",
        dataIndex: "name",
        key: "name",
        width: "40%",
      },
      {
        title: "Mã code",
        dataIndex: "value",
        key: "value",
        width: "40%",
      },
      {
        title: "Chọn",
        width: "20%",
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
        locale={{ emptyText: "Không có kết quả" }}
        onRow={(record: keywordsModel) => {
          return {
            onClick: (event) => {
              handleInsertKeyword(record.value);
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
      let objDividedToTwoEqualPart = divideArrayKeywordToTwoEqualPart(
        singleListKeyword.list
      );
      const { firstPart, secondPart } = objDividedToTwoEqualPart;
      return (
        <div className="singleList">
          <h3 className="title">{singleListKeyword.name}</h3>
          <Row gutter={20}>
            <Col span={12}>{renderSinglePart(firstPart)}</Col>
            <Col span={12}>{renderSinglePart(secondPart)}</Col>
          </Row>
        </div>
      );
    }
  };

  useEffect(() => {
    if (isModalVisible && listKeywords) {
      listKeywords.map((single) => {
        if (single.list) {
          single.list.map((single1) => {
            single1.isShow = true;
            return "";
          });
        }
        return "";
      });
      setListKeywordShow(listKeywords);
    }
  }, [isModalVisible, listKeywords]);

  useEffect(() => {
    if (isModalVisible && searchInputRef.current) {
      let inputElement = searchInputRef.current;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [isModalVisible, listKeywords]);
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
        <div className="boxListKeywords">
          {listKeywordShow &&
            listKeywordShow.length > 0 &&
            listKeywordShow.map((singleListKeyWord, index) => {
              return (
                <section key={index}>
                  {renderSingleSectionListKeyword(singleListKeyWord)}
                </section>
              );
            })}
        </div>
      </StyledComponent>
    </Modal>
  );
};

export default EditorModal;
