import BRhome from "../../pages/BRhome/BRhome";
import Offers from "../../pages/Offers/Offers";
import OffersDetail from "../../pages/OffersDetail/OffersDetail";


const brokerRoutes = [
    {
        name: "broker home",
        path: "",
        element: <BRhome />
    },
    {
        name: "br offers",
        path: "offers",
        element: <Offers link="/operator/offers/" status={`price_review`} />
    },
    {
        name: "br offer detail",
        path: "offers/:id",
        element: <OffersDetail status={'pending_confirmation'} />
    },

];
export default brokerRoutes