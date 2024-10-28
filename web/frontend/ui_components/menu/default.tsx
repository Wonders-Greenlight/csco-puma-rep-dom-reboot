
import "./default.css";

export default function Menu() {


  return (
    <div className="default-menu flex-row-container">
      <div className="content-row">
        <div className="button-create-event app-button">
          <div className="text-container">
            <div className="text-create-event">Create Event</div>
          </div>
        </div>
        <div className="button-schedule-event app-button">
          <div className="text-container">
            <div className="text-schedule-event">Schedule Event</div>
          </div>
        </div>
      </div>
    </div>
  );
}
