import './goback_navigation.css';
import backArroy from "../../assets/back-arrow.svg";
import { useNavigate } from 'react-router';
import gsap from 'gsap';

const GoBackNavigation = () => {

    const navigate = useNavigate();
    function handleLink(link: string) {
        // timeouts.forEach((e) => clearTimeout(e));
        // timeouts = [];
    
        gsap.set(".body", {
          opacity: 0.5,
        });
        gsap.set(".body", {
          transform: "translateY(0px)",
        });
    
        // if (timeouts) {
        //   timeouts.push(timeoutid);
        // } else {
        //   timeouts = [timeoutid];
        // }
    
        // currentWindowSetter(link);
        navigate( link + "?host="+sessionStorage.getItem('host'));
      }
    
  return (
    <div className="goback-navigation outer-container">
      <div className="inner-container">
        <div className="column-container">
          {/* <div className="colored-box"></div> */}
          {/* <div className=""></div> */}
          <img className='colored-box'  src={backArroy} onMouseUp={() => handleLink("/summary")} />
        </div>
      </div>
    </div>
  );
};

export default GoBackNavigation;