import { ExportOutlined } from "@ant-design/icons";
import { Button, Card, Rate, Row, Space } from "antd";
import exportIcon from "assets/icon/export.svg";
import ContentContainer from "component/container/content.container";
import { MenuAction } from "component/table/ActionButton";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { FeedbackQuery } from "model/ecommerce/feedback.model";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import moment from "moment";
import queryString from "query-string";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  ecommerceGetApi,
  exitProgressDownloadEcommerceApi,
  getFeedbacksApi,
  getProgressDownloadEcommerceApi,
  gettingReplyFeedbacksApi,
  replyFeedbackApi,
  replyFeedbacksApi,
} from "service/ecommerce/ecommerce.service";
import { generateQuery } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { ACCOUNT_CODE_LOCAL_STORAGE } from "utils/LocalStorageUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParams, getQueryParamsFromQueryString, useQuery } from "utils/useQuery";
import { Player } from "video-react";
import "video-react/dist/video-react.css";

import FeedbackFilter from "./filter";
import GetReplyModal from "./get-reply.modal";
import Reply from "./reply";
import ReplyModal from "./reply.modal";
import { StyledComponent } from "./styled";

const initQuery: FeedbackQuery = {
  page: 1,
  limit: 30,
  is_replied: undefined,
  product_ids: [],
  shop_ids: [],
  stars: [],
  created_date_from: null,
  created_date_to: null,
};

const FeedbacksScreen: React.FC = (props: any) => {
  const location = useLocation();
  const history = useHistory();
  const queryParamsParsed: any = queryString.parse(location.search);
  const query = useQuery();

  let dataQuery: FeedbackQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<FeedbackQuery>(dataQuery);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState([]);
  const [shopsData, setShopsData] = useState<EcommerceResponse[]>([]);
  const [visible, setVisible] = useState(false);
  const [visibleGetReply, setVisibleGetReply] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  // used when replying to many feedbacks at once
  const [replying, setReplying] = useState(false);
  const [gettingReply, setGettingReply] = useState(false);
  const [processID, setProcessID] = useState<any>("");
  const [processGettingReplyID, setProcessGettingReplyID] = useState<any>("");
  const [isReload, setIsReload] = useState(false);
  const [dataReplying, setDataReplying] = useState<any>({
    total: 1,
    total_error: 0,
    total_success: 0,
    errors_msg: "",
    finish: false,
  });

  const [dataGettingReply, setDataGettingReply] = useState<any>({
    total: 1,
    total_error: 0,
    total_success: 0,
    errors_msg: "",
    finish: false,
  });

  const [data, setData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const sliceText = useCallback(
    (record: any, type: string) => {
      const isShowMoreComment =
        record.comment_content &&
        (record.comment_content.length > 80 ||
          (record.media && (record.media.image.length > 0 || record.media.video.length > 0)));
      const isShowMoreReply = record.reply_content && record.reply_content.length > 80;
      const showMoreComment = record.showMoreComment ? record.showMoreComment : false;
      const showMoreReply = record.showMoreReply ? record.showMoreReply : false;
      if (type === "comment") {
        if (isShowMoreComment && showMoreComment) {
          return (
            <div>
              <div>
                {record.comment_content + "   "}
                {record.media.image.length > 0 && (
                  <p>
                    <Space>
                      {record.media.image.map((image: string) => {
                        return <img src={image} style={{ height: "100px" }} alt="" />;
                      })}
                    </Space>
                  </p>
                )}
                {record.media.video.length > 0 && (
                  <p>
                    <Space className="videos-list">
                      {record.media.video.map((video: string, index: number) => {
                        return (
                          /*@ts-ignore*/
                          <Player key={index}>
                            <source src={video} type="video/mp4" />
                          </Player>
                        );
                      })}
                    </Space>
                  </p>
                )}
                <span
                  style={{ color: "#22226b", cursor: "pointer" }}
                  onClick={() => {
                    const index = data.items.findIndex(
                      (i: any) => i.comment_id === record.comment_id,
                    );
                    let newDataItems = [...data.items];
                    newDataItems.splice(index, 1, {
                      ...record,
                      showMoreComment: false,
                    });
                    setData({
                      ...data,
                      items: newDataItems,
                    });
                  }}
                >
                  Thu gọn
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <p>
                {record.comment_content && record.comment_content.slice(0, 80)}
                {isShowMoreComment ? " ... " : ""}
                {isShowMoreComment && (
                  <span
                    style={{ color: "#22226b", cursor: "pointer" }}
                    onClick={() => {
                      const index = data.items.findIndex(
                        (i: any) => i.comment_id === record.comment_id,
                      );
                      const newDataItems = [...data.items];
                      newDataItems.splice(index, 1, {
                        ...record,
                        showMoreComment: true,
                      });
                      setData({
                        ...data,
                        items: newDataItems,
                      });
                    }}
                  >
                    Xem thêm
                  </span>
                )}
              </p>
            </div>
          );
        }
      } else {
        if (record.reply_content.length > 80 && showMoreReply) {
          return (
            <div>
              <div>
                {record.reply_content + "   "}
                <span
                  style={{ color: "#22226b", cursor: "pointer" }}
                  onClick={() => {
                    const index = data.items.findIndex(
                      (i: any) => i.comment_id === record.comment_id,
                    );
                    let newDataItems = [...data.items];
                    newDataItems.splice(index, 1, {
                      ...record,
                      showMoreReply: false,
                    });
                    setData({
                      ...data,
                      items: newDataItems,
                    });
                  }}
                >
                  Thu gọn
                </span>
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <p>
                {record.reply_content.slice(0, 80)}
                {isShowMoreReply ? " ... " : ""}
                {isShowMoreReply && (
                  <span
                    style={{ color: "#22226b", cursor: "pointer" }}
                    onClick={() => {
                      const index = data.items.findIndex(
                        (i: any) => i.comment_id === record.comment_id,
                      );
                      const newDataItems = [...data.items];
                      newDataItems.splice(index, 1, {
                        ...record,
                        showMoreReply: true,
                      });
                      setData({
                        ...data,
                        items: newDataItems,
                      });
                    }}
                  >
                    Xem thêm
                  </span>
                )}
              </p>
            </div>
          );
        }
      }
    },
    [data],
  );

  const replyThisFeedBack = useCallback(
    (record, content) => {
      (async () => {
        const body = {
          comment_list: [
            {
              comment_id: record.comment_id,
              comment: content,
            },
          ],
          shop_id: record.shop_id,
        };
        try {
          const result = await replyFeedbackApi(body);
          if (
            !result.errors &&
            result.data.result_list.length &&
            !result.data.result_list[0].fail_error &&
            !result.data.result_list[0].fail_message
          ) {
            const index = data.items.findIndex((i: any) => i.comment_id === record.comment_id);
            const newDataItems = [...data.items];
            newDataItems.splice(index, 1, {
              ...record,
              reply_content: content,
              reply_by: localStorage.getItem(ACCOUNT_CODE_LOCAL_STORAGE),
              reply_at: moment(new Date(), DATE_FORMAT.HHmm_DDMMYYYY),
            });
            showSuccess("Phản hồi đánh giá thành công");
            setData({
              ...data,
              items: newDataItems,
            });
          } else if (
            result.data.result_list.length &&
            result.data.result_list[0].fail_error &&
            result.data.result_list[0].fail_message
          ) {
            showError(result.data.result_list[0].fail_message);
          } else {
            result.errors.forEach((error: string) => {
              showError(error);
            });
          }
        } catch (error) {
          showError("Phản hồi đánh giá không thành công");
        }
      })();
    },
    [data],
  );

  const checkReplyProcess = useCallback(() => {
    (async () => {
      try {
        const process = await getProgressDownloadEcommerceApi(processID);
        console.log("process", process);
        if (!process.errors) {
          setDataReplying({
            total: process.data.total,
            total_error: process.data.total_error,
            total_success: process.data.total_success,
            errors_msg: process.data.errors_msg,
            finish: process.data.finish,
          });
        } else {
          process.errors.forEach((error: string) => {
            showError(error);
          });
        }
      } catch {
        showError("Phản hồi đánh giá không thành công");
      }
    })();
  }, [processID]);

  const checkGettingReplyProcess = useCallback(() => {
    (async () => {
      try {
        const process = await getProgressDownloadEcommerceApi(processGettingReplyID);
        console.log("process", process);
        if (!process.errors) {
          setDataGettingReply({
            total: process.data.total,
            total_error: process.data.total_error,
            total_success: process.data.total_success,
            errors_msg: process.data.errors_msg,
            finish: process.data.finish,
          });
        } else {
          process.errors.forEach((error: string) => {
            showError(error);
          });
        }
      } catch {
        showError("Phản hồi đánh giá không thành công");
      }
    })();
  }, [processGettingReplyID]);

  const replyFeedbacks = useCallback(
    (values) => {
      let body = {};
      switch (values.type) {
        case "conditions":
          body = {
            conditions: {
              ...params,
              page: null,
              limit: null,
              is_replied: false,
              product_ids: Array.isArray(params.product_ids)
                ? params.product_ids
                : [params.product_ids],
              shop_ids: Array.isArray(params.shop_ids) ? params.shop_ids : [params.shop_ids],
              stars: Array.isArray(params.stars) ? params.stars : [params.stars],
            },
            comment_ids: null,
            content: values.content,
          };
          break;
        case "selected":
          body = {
            conditions: null,
            comment_ids: selectedRow.map((i: any) => i.comment_id),
            content: values.content,
          };
          break;
        default:
          break;
      }
      (async () => {
        try {
          const result = await replyFeedbacksApi(body);
          if (!result.errors) {
            console.log("result", result);
            setProcessID(result.data.process_id);
            setReplying(true);
            // checkReplyProcess();
          } else {
            setVisible(false);

            result.errors.forEach((error: string) => {
              showError(error);
            });
          }
        } catch (error) {
          setVisible(false);

          showError("Phản hồi đánh giá không thành công");
        }
      })();
    },
    [params, selectedRow],
  );

  const gettingReplyAction = useCallback((values) => {
    let body = {
      ...values,
    };
    (async () => {
      try {
        const result = await gettingReplyFeedbacksApi(body);
        if (!result.errors) {
          console.log("result", result);
          setProcessGettingReplyID(result.data.process_id);
          setGettingReply(true);
          // checkReplyProcess();
        } else {
          setVisibleGetReply(false);

          result.errors.forEach((error: string) => {
            showError(error);
          });
        }
      } catch (error) {
        setVisibleGetReply(false);

        showError("Phản hồi đánh giá không thành công");
      }
    })();
  }, []);

  useEffect(() => {
    if (!replying || (replying && dataReplying.finish)) return;
    checkReplyProcess();

    const getReplyInterval = setInterval(checkReplyProcess, 3000);
    return () => clearInterval(getReplyInterval);
  }, [checkReplyProcess, dataReplying.finish, replying]);

  useEffect(() => {
    if (!gettingReply || (gettingReply && dataGettingReply.finish)) return;
    checkGettingReplyProcess();

    const getReplyInterval = setInterval(checkGettingReplyProcess, 3000);
    return () => clearInterval(getReplyInterval);
  }, [checkGettingReplyProcess, dataGettingReply.finish, gettingReply]);

  useEffect(() => {
    if (!gettingReply) return;
    checkGettingReplyProcess();

    const getReplyInterval = setInterval(checkGettingReplyProcess, 3000);
    return () => clearInterval(getReplyInterval);
  }, [checkGettingReplyProcess, dataGettingReply.finish, gettingReply]);

  const columns: any = useMemo(() => {
    return [
      {
        title: "Ảnh",
        key: "image",
        visible: true,
        render: (record: any) => {
          return <img src={record.image} style={{ width: "80px" }} alt="" />;
        },
        fixed: "left",
        width: 100,
      },
      {
        title: "SKU",
        key: "sku",
        visible: true,
        render: (record: any) => (
          <div className="sku">
            <p>{record.sku}</p>
            <p>
              <span style={{ color: "#22226b" }}>{record.shop}</span>
            </p>
          </div>
        ),
        width: 150,
      },

      {
        title: "Sản phẩm",
        key: "productName",
        visible: true,
        render: (record: any) => <div className="product-name">{record.product_name}</div>,
        width: 150,
      },
      {
        title: "Mã đơn hàng",
        key: "orderID",
        visible: true,
        render: (record: any) => <div className="order_sn">{record.order_sn}</div>,
        width: 150,
      },
      {
        title: "Đánh giá của khách hàng",
        visible: true,
        render: (record: any) => {
          return (
            <div>
              <p>
                <Rate disabled value={record.star} />
              </p>
              {sliceText(record, "comment")}
              <p>
                Bởi: <span style={{ color: "#22226b" }}>{record.username}</span>
              </p>
              <p>
                Lúc:{" "}
                {record.comment_at
                  ? moment(record.comment_at).format(DATE_FORMAT.HHmm_DDMMYYYY)
                  : ""}
              </p>
            </div>
          );
        },
        width: 300,
      },
      {
        title: "Phản hồi đánh giá",
        visible: true,
        render: (record: any) => {
          return record.reply_content ? (
            <div>
              {sliceText(record, "reply")}

              <p>
                Bởi: <span style={{ color: "#22226b" }}>{record.reply_by}</span>
              </p>
              <p>
                Lúc:{" "}
                {record.reply_at ? moment(record.reply_at).format(DATE_FORMAT.HHmm_DDMMYYYY) : ""}
              </p>
            </div>
          ) : (
            <Reply
              type="create"
              content=""
              record={record}
              onOk={(content) => replyThisFeedBack(record, content)}
            />
          );
        },
        width: 300,
      },
    ];
  }, [replyThisFeedBack, sliceText]);

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        break;
      case 2:
        setVisible(true);
        break;

      default:
        break;
    }
  }, []);

  const actions: Array<MenuAction> = useMemo(
    () => [
      // {
      //   id: 1,
      //   name: "Xóa",
      //   icon: <DeleteOutlined />,
      //   disabled: true,
      // },
      {
        id: 2,
        name: "Phản hồi đánh giá",
        icon: <ExportOutlined />,
        // disabled: selectedRow.length ? false : true,
      },
    ],
    [],
  );

  const handleFetchData = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const res = await getFeedbacksApi(generateQuery(params));
      if (!res.errors) {
        setData(res.data);
      } else {
        res.errors.forEach((error: string) => {
          showError(error);
        });
      }
    } catch (error) {
      showError("Lỗi lấy danh sách phản hồi !!!");
    }
    setIsLoading(false);
  }, []);

  const getShopsData = useCallback(async () => {
    try {
      const res = await ecommerceGetApi(generateQuery({ ecommerce_id: 1 }));
      if (!res.errors) {
        setShopsData(res.data);
      } else {
        res.errors.forEach((error: string) => {
          showError(error);
        });
      }
    } catch (error) {
      showError("Lỗi lấy danh sách phản hồi !!!");
    }
  }, []);

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      let currentParam = generateQuery(params);
      let queryParam = generateQuery(newPrams);
      if (currentParam === queryParam) {
        handleFetchData(newPrams);
      } else {
        history.push(`${UrlConfig.ECOMMERCE}-tools/feedbacks?${queryParam}`);
      }
    },
    [handleFetchData, history, params],
  );
  const onSelectedChange = useCallback((selectedRow) => {
    const newSelected = selectedRow.map((item: any) => item.comment_id);
    setSelectedRowKeys(newSelected);
    setSelectedRow(selectedRow);
  }, []);

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(`${UrlConfig.ECOMMERCE}-tools/feedbacks?${queryParam}`);
    },
    [history, params],
  );

  useEffect(() => {
    getShopsData();
  }, [getShopsData]);
  useEffect(() => {
    let dataQuery: FeedbackQuery = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setPrams(dataQuery);
    handleFetchData(dataQuery);
    setIsReload(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFetchData, location.search, isReload]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Phản hồi đánh giá sản phẩm shopee"
        breadcrumb={[
          {
            name: "Sàn TMĐT",
          },
          {
            name: "Công cụ",
          },
          {
            name: "Phản hồi đánh giá sản phẩm Shopee",
          },
        ]}
        extra={
          <Row>
            <Space className="buttonLinks">
              <Button
                type="primary"
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => setVisibleGetReply(true)}
              >
                Cập nhật đánh giá
              </Button>
              <Button
                type="primary"
                className="ant-btn-primary"
                size={"large"}
                onClick={() => {
                  window.open(
                    `${process.env.PUBLIC_URL}${UrlConfig.ECOMMERCE}-tools/feedbacks/auto-reply`,
                    "_blank",
                  );
                }}
              >
                Cấu hình phản hồi tự động
              </Button>
            </Space>
          </Row>
        }
      >
        <Card>
          <FeedbackFilter
            onMenuClick={onMenuClick}
            actions={actions}
            onFilter={onFilter}
            isLoading={isLoading}
            params={params}
            onClearFilter={() => onFilter(initQuery)}
            shops={shopsData}
          />

          <CustomTable
            isRowSelection
            isLoading={isLoading}
            showColumnSetting={true}
            scroll={{ x: 1200 }}
            sticky={{ offsetScroll: 10, offsetHeader: 50 }}
            isShowPaginationAtHeader
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            onSelectedChange={(selectedRows: any) => onSelectedChange(selectedRows)}
            selectedRowKey={selectedRowKeys}
            dataSource={data.items}
            columns={columns}
            rowKey={(item: any) => item.comment_id}
            bordered
            className="feedback-list"
          />
        </Card>
        <ReplyModal
          visible={visible}
          replying={replying}
          dataReplying={dataReplying}
          selected={selectedRow.length ? true : false}
          onOk={(values) => {
            if (dataReplying.finish) {
              setSelectedRowKeys([]);
              setSelectedRow([]);
              setVisible(false);
              setReplying(false);
              setIsReload(true);
              setDataReplying({
                total: 1,
                total_error: 0,
                total_success: 0,
                errors_msg: "",
                finish: false,
              });
            } else {
              replyFeedbacks(values);
            }
          }}
          onCancel={() => {
            setVisible(false);
            setSelectedRowKeys([]);
            setSelectedRow([]);
            if (replying) {
              setReplying(false);
              (async () => {
                try {
                  const result = await exitProgressDownloadEcommerceApi({
                    processId: processID,
                  });
                  if (!result.errors) {
                    console.log("result", result);
                  } else {
                    result.errors.forEach((error: string) => {
                      showError(error);
                    });
                  }
                } catch (error) {
                  showError("Huỷ phản hồi đánh giá không thành công");
                }
              })();
            }
            setDataReplying({
              total: 1,
              total_error: 0,
              total_success: 0,
              errors_msg: "",
              finish: false,
            });
          }}
        />

        <GetReplyModal
          visible={visibleGetReply}
          replying={gettingReply}
          dataReplying={dataGettingReply}
          shops={shopsData}
          onOk={(values) => {
            if (dataGettingReply.finish) {
              setVisibleGetReply(false);
              setGettingReply(false);
              setIsReload(true);
              setDataGettingReply({
                total: 1,
                total_error: 0,
                total_success: 0,
                errors_msg: "",
                finish: false,
              });
            } else {
              gettingReplyAction(values);
            }
          }}
          onCancel={() => {
            setVisibleGetReply(false);
            if (gettingReply) {
              setGettingReply(false);
              (async () => {
                try {
                  const result = await exitProgressDownloadEcommerceApi({
                    processId: processGettingReplyID,
                  });
                  if (!result.errors) {
                    console.log("result", result);
                  } else {
                    result.errors.forEach((error: string) => {
                      showError(error);
                    });
                  }
                } catch (error) {
                  showError("Huỷ tải phản hồi đánh giá không thành công");
                }
              })();
            }
            setDataGettingReply({
              total: 1,
              total_error: 0,
              total_success: 0,
              errors_msg: "",
              finish: false,
            });
          }}
        />
      </ContentContainer>
    </StyledComponent>
  );
};

export default FeedbacksScreen;
