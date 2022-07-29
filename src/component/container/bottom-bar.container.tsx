import arrowLeft from "assets/icon/arrow-back.svg";
import classNames from "classnames";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ReactElement, ReactNode } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";

interface BottomBarProps {
  back?: string | false;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode | ReactElement;
  height?: number;
  backAction?: () => void;
  classNameContainer?: string;
}

const BottomBarContainer: React.FC<BottomBarProps> = (props: BottomBarProps) => {
  const history = useHistory();
  const collapse = useSelector((state: RootReducerType) => state.appSettingReducer.collapse);
  const { back, leftComponent, rightComponent, height, backAction, classNameContainer } = props;

  function handleBack() {
    if (backAction) {
      backAction();
    } else {
      history.goBack();
    }
  }

  return (
    <div
      style={{ height: height ? height : 55 }}
      className={classNames("bottom", collapse && "collapse", classNameContainer)}
    >
      <div className="bottom__left">
        {back && (
          <div onClick={handleBack} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {back}
          </div>
        )}
        {leftComponent}
      </div>
      <div className="bottom__right">{rightComponent}</div>
    </div>
  );
};

export default BottomBarContainer;
