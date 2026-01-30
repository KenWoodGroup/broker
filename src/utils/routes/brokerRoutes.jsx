import BRhome from "../../pages/BRhome/BRhome";
import OfferDetailPage from "../../pages/BROfferDetail/OfferDetailPage";
import BRoffers from "../../pages/BRoffers/BRoffers";

const brokerRoutes = [
    {
        name:"broker home",
        path:"",
        element:<BRhome/>
    },
    {
        name:"br offers",
        path:"offers",
        element:<BRoffers/>
    },
    {
        name:"br offer detail",
        path:"offer/:id",
        element:<OfferDetailPage/>
    }
];
export default brokerRoutes