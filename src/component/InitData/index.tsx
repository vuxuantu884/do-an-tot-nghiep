import DataDog from "component/DataDog";
import useInitYup from "libs/yup/useInitYup";

export default function InitData() {
  useInitYup();
  return (
    <>
      <DataDog />
    </>
  );
}
