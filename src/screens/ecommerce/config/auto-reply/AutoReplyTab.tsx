import { Button, Switch, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSettingAutoReplyApi,
  deleteSettingAutoReplyApi,
  editSettingAutoReplyApi,
  getSettingAutoReplyApi,
  statusSettingAutoReplyApi,
} from "service/ecommerce/ecommerce.service";
import { showError } from "utils/ToastUtils";
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import { StyledAutoReply } from "./styled";
import AutoReplyModal from "./auto-reply-modal";

type Props = {
  shopID: string;
  shopName: string;
  star: number;
  activeTab: string;
  isAddAutoReply: boolean;
  setIsAddAutoReply: () => void;
};

function AutoReplyTab(props: Props) {
  const { shopID, shopName, star, activeTab, isAddAutoReply, setIsAddAutoReply } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(true);
  const [data, setData] = useState<any[]>([]);

  const [visible, setVisible] = useState(false);
  const [autoReplyData, setAutoReplyData] = useState<any>({});
  const [enabled, setEnabled] = useState(false);
  // type: create, edit, delete
  const [configType, setConfigType] = useState("");

  const [page, setPage] = useState(1);

  const onPageChange = useCallback((page, size) => {
    setPage(page);
  }, []);

  const handleEdit = useCallback(
    (value) => {
      setVisible(true);
      setAutoReplyData(value);
      setConfigType("edit");
    },
    [setVisible],
  );
  const handleDelete = useCallback(
    (value) => {
      setVisible(true);
      setAutoReplyData(value);
      setConfigType("delete");
    },
    [setVisible],
  );

  const handleOk = useCallback(
    (content) => {
      setVisible(false);
      switch (configType) {
        case "create":
          (async () => {
            try {
              const result = await createSettingAutoReplyApi({
                shop_id: shopID,
                shop: shopName,
                template: content,
                star,
              });
              if (!result.errors) {
                setReload(true);
              } else {
                result.errors.forEach((error: string) => {
                  showError(error);
                });
              }
            } catch (error) {
              showError("Tạo phản hồi tự động không thành công");
            }
          })();
          break;
        case "edit":
          (async () => {
            try {
              const result = await editSettingAutoReplyApi({
                id: autoReplyData.id,
                content: content,
              });
              if (!result.errors) {
                setReload(true);
              } else {
                result.errors.forEach((error: string) => {
                  showError(error);
                });
              }
            } catch (error) {
              showError("Chỉnh sửa phản hồi tự động không thành công");
            }
          })();
          break;
        case "delete":
          (async () => {
            try {
              const result = await deleteSettingAutoReplyApi({
                id: autoReplyData.id,
              });
              if (!result.errors) {
                setReload(true);
              } else {
                result.errors.forEach((error: string) => {
                  showError(error);
                });
              }
            } catch (error) {
              showError("Tạo phản hồi tự động không thành công");
            }
          })();
          break;
        default:
          break;
      }
    },
    [autoReplyData.id, configType, setVisible, shopID, shopName, star],
  );

  const renderActionColumn = useCallback(
    (value: any) => {
      return (
        <>
          <Button
            icon={<img alt="" src={editIcon} />}
            type="text"
            style={{
              background: "transparent",
              border: "none",
            }}
            onClick={() => handleEdit(value)}
          />

          <Button
            icon={<img alt="" src={deleteIcon} />}
            type="text"
            style={{
              marginLeft: 10,
              background: "transparent",
              border: "none",
              color: "red",
            }}
            onClick={() => handleDelete(value)}
          />
        </>
      );
    },
    [handleDelete, handleEdit],
  );

  const columns: any = useMemo(() => {
    return [
      {
        title: "STT",
        key: "index",
        dataIndex: "index",
        fixed: "left",
        align: "center",
        visible: true,
        width: 60,
      },
      {
        title: "Nội dung đánh giá",
        key: "template",
        dataIndex: "template",
        visible: true,
      },
      {
        title: "",
        visible: true,
        fixed: "right",
        align: "center",
        width: 120,
        className: "auto-reply-action ",
        render: (value: any) => renderActionColumn(value),
      },
    ];
  }, [renderActionColumn]);

  useEffect(() => {
    if (shopID) {
      setIsLoading(true);
      (async () => {
        try {
          const result = await getSettingAutoReplyApi(`shop_id=${shopID}&star=${star}`);
          if (!result.errors) {
            setData(
              result.data.configs.map((i: any, index: number) => {
                return {
                  ...i,
                  index: index + 1,
                };
              }),
            );
            setEnabled(result.data.shop_info ? result.data.shop_info.enabled : false);
          } else {
            result.errors.forEach((error: string) => {
              showError(error);
            });
          }
        } catch (error) {
          showError("Lấy cấu hình đánh giá tự động không thành công");
        }
      })();
      setIsLoading(false);
      setReload(false);
    }
  }, [reload, shopID, star]);
  useEffect(() => {
    if (activeTab === star.toString() && isAddAutoReply) {
      setVisible(true);
      setConfigType("create");
      setAutoReplyData({});
    }

    if (activeTab === star.toString() && !visible) {
      setIsAddAutoReply();
    }
  }, [activeTab, isAddAutoReply, setIsAddAutoReply, setVisible, star, visible]);

  return (
    <StyledAutoReply>
      {!shopID && (
        <p>
          <b>Lưu ý:</b> Vui lòng chọn gian hàng để cấu hình
        </p>
      )}
      {shopID && (
        <>
          <p>
            <Switch
              checked={enabled}
              onChange={(value) => {
                setEnabled(value);
                (async () => {
                  try {
                    const result = await statusSettingAutoReplyApi(
                      `shop/${shopID}/star/${star}/${value ? "enabled" : "disabled"}`,
                    );
                    if (!result.errors) {
                    } else {
                      result.errors.forEach((error: string) => {
                        showError(error);
                      });
                    }
                  } catch (error) {
                    showError("Đổi trạng thái cấu hình đánh giá tự động không thành công");
                  }
                })();
              }}
            />
            <span style={{ marginLeft: 20, fontWeight: 700 }}>Kích hoạt phản hồi tự động</span>
          </p>
          <Table
            loading={isLoading}
            scroll={{ x: 1200 }}
            sticky={{ offsetScroll: 10, offsetHeader: 50 }}
            pagination={
              data.length > 10
                ? {
                    pageSize: 10,
                    total: data.length,
                    current: page,
                    showSizeChanger: false,
                    onChange: onPageChange,
                  }
                : false
            }
            dataSource={data}
            columns={columns}
            rowKey={(item: any) => item.id}
            bordered
          />
        </>
      )}
      <AutoReplyModal
        visible={visible}
        type={configType}
        autoReplyData={autoReplyData}
        onOk={(values: any) => handleOk(values.content)}
        onCancel={() => {
          setVisible(false);
        }}
      />
    </StyledAutoReply>
  );
}

export default AutoReplyTab;
