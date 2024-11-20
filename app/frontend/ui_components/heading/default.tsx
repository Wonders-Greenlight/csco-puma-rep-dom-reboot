import { useLocation } from "react-router-dom";
import "./default.css";

export default function Heading() {
  const location = useLocation();
  
  return (
    <div className="default-heading container">
      <div className="header-container"></div>
      <div className="body-container">
        <div className="row">
          <div className="title">PUMA ERP</div>
          <div style={{display:'flex', flexDirection: 'column', color: "rgb(160.65, 130.05, 73.95)"}}>
          <div className="">Navegando: <b>{location.pathname}</b></div>
          <div className="">Powered by Greenlight</div>
          </div>
        </div>
      </div>
    </div>
  );
}
{
  /* <span>&nbsp;<b>Puma</b></span> */
}
