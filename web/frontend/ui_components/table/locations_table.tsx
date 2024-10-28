import './locations_table.css';

const LocationsTable = () => {
  return (
    <div className="main-container locations-table">
      {/* <div className="header-container">
        <div className="selection-box">
          <div className="icon-container">
            <div className="icon-box"></div>
            <div className="spacer"></div>
          </div>
          <div className="text-container">
            <div className="selected-text">3+ selected</div>
          </div>
        </div>
      </div> */}
      <div className="button-container">
        <div className="edit-button">
          <div className="button-text">Seleccione la sucursal para editar</div>
        </div>
        {/* <div className="actions-button">
          <div className="button-text white-text">Mas acciones</div>
        </div> */}
      </div>
      {/* <div className="content-container">
        <div className="icon-column">
          <div className="empty-icon"></div>
        </div>
        <div className="info-column">
          <div className="branch-text">Puma Calle El Conde 31</div>
          <div className="status-text">Activo</div>
          <div className="created-text">Created at: 9/13/2024, 3:30:39 PM</div>
        </div>
      </div> */}
      {/* Repeat other content rows as needed */}
    </div>
  );
};

export default LocationsTable;
