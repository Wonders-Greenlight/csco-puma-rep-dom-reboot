
// import { useContext, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Context as AppBridgeContext, RoutePropagator as ShopifyRoutePropagator } from "@shopify/app-bridge-react";
// import { Redirect } from "@shopify/app-bridge/actions";


// const RoutePropagator: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const appBridge = useContext(AppBridgeContext);

//   useEffect(() => {
//     if (appBridge) {
//       // Subscribe to the App Bridge redirect action
//       const unsubscribe = appBridge.subscribe(Redirect.Action.APP, (payload: any) => {
//         navigate(payload.path, { replace: true });
//       });

//       // Cleanup subscription on unmount
//       return () => unsubscribe();
//     }
//   }, [appBridge, navigate]);

//   return <ShopifyRoutePropagator  />;
// };

// export default RoutePropagator;