import { useDispatch } from "react-redux";
import { useParams } from "react-router";

type PackParam = {
    id: string;
  };

const PackDetail:React.FC=()=>{
    const dispatch = useDispatch();
    let {id} = useParams<PackParam>();
    let PackId = parseInt(id);

    console.log(PackId)

    return <></>
}

export default PackDetail;