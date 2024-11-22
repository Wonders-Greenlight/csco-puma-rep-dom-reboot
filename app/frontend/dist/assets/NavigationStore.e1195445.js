const state = {
  page: 1,
  lastPath: "/",
  activePath: "/",
  backPath: "/"
};
const methods = {
  navigateTo(params) {
  }
};
const queryParams = () => {
  return "?tldr=1";
};
const computeds = {
  queryParams
};
export { computeds, methods, state };
