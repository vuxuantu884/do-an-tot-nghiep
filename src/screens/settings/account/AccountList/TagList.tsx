import { Tag } from "antd";
import { ReactElement } from "react";

interface Props {
  fullOptions: string[];
  typicalOptions: string[];
  otherOption: number;
}

export default function TagList({ fullOptions, typicalOptions, otherOption }: Props): ReactElement {
  return (
    <>
      {otherOption ? (
        <span>
          {typicalOptions.map((item) => (
            <Tag color="green" key={item}>
              {item}
            </Tag>
          ))}

          <Tag color="green">+{otherOption}...</Tag>
        </span>
      ) : (
        <span>
          {fullOptions.map((item) => {
            return (
              <Tag color="green" key={item}>
                {item}
              </Tag>
            );
          })}
        </span>
      )}
    </>
  );
}
