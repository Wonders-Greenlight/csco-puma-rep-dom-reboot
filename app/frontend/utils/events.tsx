import gsap from "gsap";

export const mouseOverButton = (button: HTMLElement) => {
  if (button.classList.contains("app-button")) {
    gsap.to(button, {
      duration: 0.4,
      cursor: "pointer",
      boxShadow:
        "0 0px 0px 0 ,0 3px 1px -2px rgba(0,0,0,0.12),0 1px 5px 0 rgba(42, 43, 41, 0.2)", // Unfade shadow
      ease: "power2.out", // Natural easing function
    });
  }
};

export const mouseOutButton = (button: HTMLElement) => {
  if (button.classList.contains("app-button")) {
    gsap.to(button, {
      duration: 0.4,
      ease: "power2.out", // Natural easing function
      cursor: "pointer",
      boxShadow:
        "0 0px 0px 0 rgba(13, 15, 11, 0),0 3px 1px -2px rgba(0,0,0,0.0),0 1px 5px 0 rgba(42, 43, 41, 0.0)", // Fade shadow
    });
  }
};

export const mouseOverCard = (
  cardTitle: HTMLElement,
  cardParent: HTMLElement,
) => {
  if (cardTitle.classList.contains("app-card-title")) {
    gsap.to(cardTitle, {
      duration: 0.4, // Duration of the animation
      color: "rgb(28.05, 22.95, 12.75)",
      ease: "power2.out", // Natural easing function
    });
  }

  gsap.set(cardParent, {
    cursor: "pointer",
  });
};

export const mouseOutCard = (
  cardTitle: HTMLElement,
  cardParent: HTMLElement,
) => {
  if (cardTitle.classList.contains("app-card-title")) {
    gsap.to(cardTitle, {
      duration: 0.4, // Duration of the animation
      color: "rgb(160.65, 130.05, 73.95)",
      ease: "power2.out", // Natural easing function
    });
  }

  gsap.set(cardParent, {
    cursor: "pointer",
  });
};
