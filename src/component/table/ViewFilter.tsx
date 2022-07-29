import { Button } from "antd";
import React, { useCallback, useMemo } from "react";
import { isUndefinedOrNull } from "utils/AppUtils";
import { CloseOutlined } from "@ant-design/icons";

type ViewFilterProps = {
  filter: any;
  deleteAll?: () => void;
  delete?: (key: string) => void;
};

const ViewFilter: React.FC<ViewFilterProps> = (props: ViewFilterProps) => {
  const { filter } = props;
  let filterArr = useMemo(() => {
    let temp = Object.keys(filter);
    temp = temp.filter((a) => a !== "page" && a !== "limit");
    return temp;
  }, [filter]);
  const onDelete = useCallback(
    (key) => {
      props.delete && props.delete(key);
    },
    [props],
  );

  return (
    <div className="row-filter">
      {filterArr.length > 0 && (
        <React.Fragment>
          {filterArr.map((item, index) => {
            if (!isUndefinedOrNull(filter[item] && filter[item] !== "")) {
              return (
                <div className="key-filter" key={index}>
                  <span>{filter[item]}</span>
                  <Button
                    onClick={() => onDelete(item)}
                    className="btn-del"
                    icon={<CloseOutlined size={6} />}
                  />
                </div>
              );
            }
            return null;
          })}
          <Button onClick={props.deleteAll} className="del-all">
            Xóa kết quả lọc
          </Button>
        </React.Fragment>
      )}
    </div>
  );
};

export default ViewFilter;
