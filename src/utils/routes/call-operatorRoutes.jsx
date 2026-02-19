import BRoffers from "../../pages/BRoffers/BRoffers";
import Clcompany from "../../pages/CLcompany/Clcompany";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";
import CLHome from "../../pages/CLHome/CLHome";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";


const CallOperRoutes = [
    {
        name: "broker home",
        path: "dashboard",
        element: <CLHome />
    },
    {
        name: "br offers",
        path: "offers",
        element: <BRoffers />
    },
    {
        name: "offers create",
        path: "company",
        element: <Clcompany />
    },
    {
        name: "company detail",
        path: "company/:id",
        element: <ClcompanyDetail />
    },
    {
        name: "company detail",
        path: "offer/create/:id",
        element: <CLOffersCreate />
    },
];
export default CallOperRoutes