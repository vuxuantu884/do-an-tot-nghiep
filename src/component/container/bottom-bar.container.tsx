import { useHistory } from "react-router";
import arrowLeft from "assets/icon/arrow-back.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useSelector } from "react-redux";
import classNames from 'classnames'

interface BottomBarProps {
  back?: string | false;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  height?: number
}

const BottomBarContainer: React.FC<BottomBarProps> = (
  props: BottomBarProps
) => {
  const history = useHistory();
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const { back, leftComponent, rightComponent, height } = props;
  return (
    <div style={{height: height ? height: 55}} className={classNames("bottom", collapse && "collapse")}>
      <div className="bottom__left">
        {back && (
          <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {back}
          </div>
        )}
        {leftComponent}
      </div>
      <div className="bottom__right">
        {rightComponent}
      </div>
    </div>
  );
};

export default BottomBarContainer;
