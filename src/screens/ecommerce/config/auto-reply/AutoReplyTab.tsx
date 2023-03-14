import { Button, Table } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSettingAutoReplyApi,
  deleteSettingAutoReplyApi,
  editSettingAutoReplyApi,
  getSettingAutoReplyApi,
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
  // type: create, edit, delete
  const [configType, setConfigType] = useState("");

  const [page, setPage] = useState(1);

  const onPageChange = useCallback((page, size) => {
    setPage(page);
  }, []);

  const handleEdit = useCallback((value) => {
    setVisible(true);
    setAutoReplyData(value);
    setConfigType("edit");
  }, []);
  const handleDelete = useCallback((value) => {
    setVisible(true);
    setAutoReplyData(value);
    setConfigType("delete");
  }, []);

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
    [autoReplyData.id, configType, shopID, shopName, star],
  );

  const renderActionColumn = useCallback(
    (value: any) => {
      return (
        <>
          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={editIcon} />}
            type="text"
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
            }}
            onClick={() => handleEdit(value)}
          />

          <Button
            icon={<img style={{ marginRight: 12 }} alt="" src={deleteIcon} />}
            type="text"
            style={{
              paddingLeft: 24,
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
        width: 120,
        className: "auto-reply-action ",
        render: (value: any) => renderActionColumn(value),
      },
    ];
  }, [renderActionColumn]);

  useEffect(() => {
    if (shopID && reload) {
      setIsLoading(true);
      (async () => {
        try {
          const result = await getSettingAutoReplyApi(`shop_id=${shopID}&star=${star}`);
          if (!result.errors) {
            setData(
              result.data.map((i: any, index: number) => {
                return {
                  ...i,
                  index: index + 1,
                };
              }),
            );
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
  }, [activeTab, isAddAutoReply, setIsAddAutoReply, star, visible]);

  return (
    <StyledAutoReply>
      {!shopID && (
        <p>
          <b>Lưu ý:</b> Vui lòng chọn gian hàng để cấu hình
        </p>
      )}
      {shopID && (
        <Table
          loading={isLoading}
          scroll={{ x: 1200 }}
          sticky={{ offsetScroll: 10, offsetHeader: 50 }}
          pagination={{
            pageSize: 10,
            total: data.length,
            current: page,
            showSizeChanger: false,
            onChange: onPageChange,
          }}
          dataSource={data}
          columns={columns}
          rowKey={(item: any) => item.id}
          bordered
        />
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
