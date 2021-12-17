import { Space } from "antd";
import ActionButton, { MenuAction } from "./ActionButton";

type CustomFilterProps = {
  menu?: Array<MenuAction>;
  onMenuClick?: (id: number) => void;
  actionDisable?: boolean;
  children: React.ReactNode;
};

const CustomFilter: React.FC<CustomFilterProps> = (
  props: CustomFilterProps
) => {
  const { menu, onMenuClick, actionDisable, children } = props;
  return (
    <div className="page-filter">
      <div className="page-filter-heading">
        <div className="page-filter-left">
          {menu && (
            <ActionButton
              disabled={actionDisable}
              menu={menu}
              onMenuClick={onMenuClick}
            />
          )}
        </div>
        <div className="page-filter-right">
          <Space size={12}>{children}</Space>
        </div>
      </div>
    </div>
  );
};

export default CustomFilter;
