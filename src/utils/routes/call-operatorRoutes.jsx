import Clcompany from "../../pages/CLcompany/Clcompany";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";
import CallOperatorLots from "../../pages/CallOperatorLots/CallOperatorLots";
import LotDetailPage from "../../pages/LotDetail/LotDetailPage";
import Offers from "../../pages/Offers/Offers";
import OffersDetail from "../../pages/OffersDetail/OffersDetail";
import OPOfferCreate from "../../pages/OPOfferCreate/OPOfferCreate";



const CallOperRoutes = [
    {
        name: "company",
        path: "company",
        element: <Clcompany />
    },
    {
        name: "company detail",
        path: "company/:id",
        element: <ClcompanyDetail />
    },
    {
        name: "pending offers",
        path: "orders",
        element: <Offers link="/call-operator/orders/detail/" status={`pending_confirmation`} />
    },
    {
        name: "Offers-detail",
        path: "orders/detail/:id",
        element: <OffersDetail status={'contract_ready'} />
    },
    {
        name: "Create",
        path: "offer/create/:id",
        element: <OPOfferCreate />
    },
    {
        name: "lots",
        path: "lots",
        element: <CallOperatorLots />
    },
    {
        name: "lot detail",
        path: "lots/:id",
        element: <LotDetailPage />
    },

];
export default CallOperRoutes