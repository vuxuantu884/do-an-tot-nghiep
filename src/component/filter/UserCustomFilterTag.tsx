import { CloseOutlined, StarOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { StyledComponent } from "./UserCustomFilterTag.styles";

type PropTypes = {
  tagActive: number | null | undefined;
  tagId: number;
  onSelectFilterConfig: (tagId: number) => void;
  setConfigId: (value: number | undefined) => void;
  setIsShowConfirmDelete: (value: boolean) => void;
  name: string;
};

function UserCustomFilterTag(props: PropTypes): JSX.Element {
  const {
    tagId,
    onSelectFilterConfig,
    name,
    setConfigId,
    setIsShowConfirmDelete,
    tagActive,
  } = props;
  return (
    <StyledComponent>
      <Tag
        onClick={(e) => {
          onSelectFilterConfig(tagId);
        }}
        className={tagActive === tagId ? "active" : undefined}
        key={tagId}
        icon={<StarOutlined />}
        closeIcon={<CloseOutlined title="Xóa" />}
        closable={true}
        onClose={(e) => {
          e.preventDefault();
          setConfigId(tagId);
          setIsShowConfirmDelete(true);
        }}
      >
        {name}
      </Tag>
    </StyledComponent>
  );
}
export default UserCustomFilterTag;
