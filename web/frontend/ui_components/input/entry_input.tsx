import { FunctionComponent } from "react";
import "./entry_input.css"
type EntryInputProps = {
  title?: string;
  placeholder?: string;
  disabled?: boolean;
  computedValue?: string;
  type?: string;
};

const EntryInput: FunctionComponent<EntryInputProps> = ({
  title = "ERP ID",
  placeholder = "Placeholder",
  disabled = false,
  computedValue = "",
  type
}) => {
  return (
    <>
      <div className="locations-stage child-d outer-container">
        <div className="content-container">
          <div className="title-container">
            <div className="title">{title}</div>
          </div>
          <input
          name={title}
          type={type}
            className={"input-container input-placeholder "+ (disabled && "disabled")}
            placeholder={placeholder}
            // {...(disabled && { disabled })}
            {...(computedValue && { value: computedValue })}
          />
          {/* <div className="input-container">
            <div className="input-placeholder">Self computed</div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default EntryInput;
