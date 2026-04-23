import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";
import UnverifiedFactories from "../../pages/LeadFactory";
import OrderItemDetail from "../../pages/OfferItemdetail/OfferItemdetail";
import OfferItemsPage from "../../pages/OfferItemsPage/OfferItemsPage";
import SPLRhome from "../../pages/SPLRhome/SPLRhome";

const supplierRoutes = [
    {
        name: 'splr home',
        path: '',
        element: <SPLRhome />,
    },
    {
        name:'splr gsc',
        path:'products',
        element:<CLOffersCreate role="supplier"/>
    },
    {
        path: 'factories',
        name: "factories splr",
        element: <ADfactories role="supplier"/>
    },
    {
        path: "factories/categories",
        name: "location categoires splr",
        element: <ADcategories role='supplier'/>
    },
    {
        path: "factories/categories/:id",
        name: "factories by category",
        element: <ADfactoriesBycategory role='supplier'/>
    },
    {
        path: "lead-factory",
        name: "lead factory",
        element: <UnverifiedFactories role='supplier'/>
    },
    {
        path: "orders",
        name: "orders",
        element: <OfferItemsPage/>
    },
    {
        path: "orders/:id",
        name: "order details",
        element: <OrderItemDetail/>
    }
];
export default supplierRoutes