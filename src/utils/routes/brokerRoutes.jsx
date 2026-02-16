import BRcompany from "../../pages/BRcompany/BRcompany";
import BRhome from "../../pages/BRhome/BRhome";
import BRMap from "../../pages/BRMap/BRMap";
import OfferDetailPage from "../../pages/BROfferDetail/OfferDetailPage";
import BRoffers from "../../pages/BRoffers/BRoffers";

const brokerRoutes = [
    {
        name: "broker home",
        path: "",
        element: <BRhome />
    },
    {
        name: "br offers",
        path: "offers",
        element: <BRoffers />
    },
    {
        name: "br offer detail",
        path: "offer/:id",
        element: <OfferDetailPage />
    },
    {
        name: "br  company",
        path: "company",
        element: <BRcompany />
    },
    {
        name: "br  Map",
        path: "map",
        element: <BRMap />
    }
];
export default brokerRoutes