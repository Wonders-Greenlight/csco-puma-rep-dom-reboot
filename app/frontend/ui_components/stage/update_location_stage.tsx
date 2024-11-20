import { useEffect } from "react";
import LocationForm from "../forms/location_form";
import gsap from "gsap";

export default function UpdateLocationStage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    gsap.set(".body", {
      opacity: 0,
    });
    setTimeout(() => {
      gsap.killTweensOf(".body");
      gsap.set(".body", {
        opacity: 0.1,
      });
      gsap.set(".body", {
        transform: "translateY(5px)",
      });
      gsap.to(".body", {
        duration: 0.2, // Duration of the animation
        opacity: 1, // Final opacity
        y: 0, // Final position (move up to its original position)
        ease: "power4.out", // Natural easing function
      });
    }, 200);
  }, []);

  return (
    <>
      <div className="child-a-detail-task container">
        <div className="title">Actualizar sucursal</div>
      </div>
      <LocationForm exist={true}/>
    </>
  );
}
