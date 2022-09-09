import { ArrowLeftOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import { FilterModel } from "./model";

type Props = {
  data: FilterModel[];
  isExpand?: boolean;
};
const FilterArrayToString: React.FC<Props> = (props: Props) => {
  const { data, isExpand = false } = props;
  const [visible, setVisible] = useState<boolean>(false);

  console.log("visibleisExpand", visible);
  const shortenData: JSX.Element | null = useMemo(() => {
    let str: JSX.Element | null = null;
    if (data.length >= 2) {
      str = (
        <>
          {` `}
          {data[0].value}
          {`, `} {data[1].value}
        </>
      );
    } else {
      data.forEach((p, i) => {
        str = (
          <>
            {` `}
            {str}
            {str && `,`}
            {p.value}
          </>
        );
      });
    }
    return str;
  }, [data]);

  const expansionData: JSX.Element | null = useMemo(() => {
    let str: JSX.Element | null = null;
    data.forEach((p, i) => {
      str = (
        <>
          {` `}
          {str}
          {str && `, `}
          {p.value}
          {` `}
        </>
      );
    });

    return str;
  }, [data]);

  return (
    <React.Fragment>
      {!visible ? <>{shortenData}</> : <>{expansionData}</>}

      <span
        onClick={() => setVisible(!visible)}
        title={visible ? `Thu gọn` : `Mở rộng`}
        className="cursor-pointer"
      >
        {!visible && data.length > 2 && ` +(${data.length - 2})`}

        {visible && <ArrowLeftOutlined />}
      </span>
    </React.Fragment>
  );
};

export default FilterArrayToString;
