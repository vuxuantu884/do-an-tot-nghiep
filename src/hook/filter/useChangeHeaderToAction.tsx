import {MenuAction} from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import {Fragment} from "react";
import {ActionStyle} from "screens/products/product/tab/style";

function useChangeHeaderToAction(
  header: string,
  isActive: boolean,
  onMenuClick: (id: number) => void,
  menu: Array<MenuAction>
) {
  let Component = () => <span>{header}</span>;
  if (isActive) {
    Component = () => (
      <ActionStyle>
        <CustomFilter onMenuClick={onMenuClick} menu={menu}>
          <Fragment />
        </CustomFilter>
      </ActionStyle>
    );
  }
  return Component;
}

export default useChangeHeaderToAction;
