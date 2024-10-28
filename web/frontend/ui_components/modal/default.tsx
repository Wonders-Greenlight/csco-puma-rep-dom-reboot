import { useLocation } from "react-router-dom";
import "./default.css";

interface defaultModalParams {
  name?: String;
  children?: any;
  type?: string;
}

interface modalData {
  title: string;
  msg: string;
  action: string;
}

export default function DefaultModal(params: defaultModalParams) {
  const { name = "default-modal-app", children, type } = params;
  const location = useLocation();
  const data = ((location.state && location.state.data) || {}) as modalData;
  const {
    title = "Atencion",
    msg = `Este sistema de alerta debe ser configurado por un
                  administrador. No modifique esta configuracion si no esta
                  seguro de como hacerlo.`,
    action = "Entendido",
  } = (window as any)._dialog_opts || data;

  return (
    <>
      <div className="default-modal">
        <div>
          <div>
            <a
              id={name.toString() + "-ref"}
              className="btn"
              href={`#${name}`}
            ></a>
          </div>
        </div>
        <div id={`${name}`} className={"modal-window default-inner type_"+type}>
          <div className="modal-content">
            {children || (
              <>
                <div className="modal-text">
                  <div className="modal-header">
                    <div className="modal-title">{title}</div>
                  </div>
                  <div className="modal-body">
                    <div className="modal-message">{msg}</div>
                  </div>
                </div>
                <a href="#" className="modal-button">
                  <div className="button-content">
                    <div className="button-text">{action}</div>
                  </div>
                </a>
                <div></div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
