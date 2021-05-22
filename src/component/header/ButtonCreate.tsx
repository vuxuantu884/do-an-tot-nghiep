import { Link } from "react-router-dom";
import plus from 'assets/img/plus.svg';

type ButtonCreateProps = {
  path: string
}

const ButtonCreate: React.FC<ButtonCreateProps> = (props: ButtonCreateProps) => {
  return (
    <Link to={props.path} style={{backgroundColor: "#FFA600", borderRadius: 6, padding: 10, color: 'white'}}>
      <img src={plus} alt="Thêm" /> Thêm mới
    </Link>
  )
}

export default ButtonCreate;