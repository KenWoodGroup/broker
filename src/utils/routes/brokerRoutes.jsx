import AllOffers from "../../pages/AllOffers";
import AllTasks from "../../pages/AllTaskByCategory/AllTasks";
import BRhome from "../../pages/BRhome/BRhome";
import BROffersDetail from "../../pages/BROffersDetail";
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
        element: <AllOffers />
    },
    {
        name: "br offer detail",
        path: "offers/:id",
        element: <BROffersDetail />
    },
     {
        name: "br offers",
        path: "tasks",
        element: <AllTasks />
        // element: <Offers link="/operator/offers/" status={`price_review`} />
    },

];
export default brokerRoutes