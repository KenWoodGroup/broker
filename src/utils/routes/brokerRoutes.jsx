import BRhome from "../../pages/BRhome/BRhome";
import BRMap from "../../pages/BRMap/BRMap";
import OfferDetailPage from "../../pages/BROfferDetail/OfferDetailPage";
import BRoffers from "../../pages/BRoffers/BRoffers";
import Clcompany from "../../pages/CLcompany/Clcompany";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";
import OPSearch from "../../pages/OPSearch/OPSearch";

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
        path: "offers/:id",
        element: <OfferDetailPage />
    },
    {
        name: "br  Search",
        path: "/operator/search",
        element: <OPSearch />
    },
    {
        name: "br  Map",
        path: "map",
        element: <BRMap />
    },
    {
        path: 'companies',
        name: 'companies',
        element: <Clcompany role={'Broker'} />
    },
    {
        path: 'company-detail/:id',
        name: 'companies detail',
        element: <ClcompanyDetail role={'Admin'} />
    },
];
export default brokerRoutes