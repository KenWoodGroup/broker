import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import ADcompany from "../../pages/BRcompany/BRcompany";
import ADOperators from "../../pages/ADOperators/ADOperators";
import ADLotCreators from "../../pages/ADLotCreators/ADLotCreators";
import Clcompany from "../../pages/CLcompany/Clcompany";
import ADbaseCategory from "../../pages/ADbaseCategory/ADbaseCategory";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";
import SPoperators from "../../pages/SPoperators/SPoperators";
import ADhome from "../../pages/ADhome/ADhome";
import RolesPage from "../../pages/ADworkers/ADworkers";
import ADsuppliers from "../../pages/ADsuplliers/ADsuppliers";
import LeadFactory from "../../pages/LeadFactory";
import ADtasks from "../../pages/ADtasks/ADtasks";
import ADCustomers from "../../pages/ADCustomers/ADCustomers.jsx";
import ADCustomerDetail from "../../pages/ADCustomerDetail/ADCustomerDetail.jsx";
import LotCreatorLots from "../../pages/LotCreatorLots/LotCreatorLots";
import LotDetailPage from "../../pages/LotDetail/LotDetailPage";
import AllOffers from "../../pages/AllOffers/index.jsx";
import BROffersDetail from "../../pages/BROffersDetail/index.jsx";
import OPOfferCreate from "../../pages/OPOfferCreate/OPOfferCreate.jsx";

const adminRoutes = [
    {
        path: "",
        name: "ok",
        element: <ADhome />
    },
    {
        path: 'factories',
        name: "factories manager",
        element: <ADfactories />
    },
    {
        path: "factories/categories",
        name: "location categoires",
        element: <ADcategories />
    },
    {
        path: "factories/categories/:id",
        name: "factories by category",
        element: <ADfactoriesBycategory />
    },
    {
        path: "roles/call-operators",
        name: "operators",
        element: <ADOperators />
    },
    {
        path: 'companies',
        name: 'companies',
        element: <Clcompany role={'Admin'} />
    },
    {
        path: "customers",
        name: "customers",
        element: <ADCustomers />,
    },
    {
        path: "customers/:id",
        name: "customer detail",
        element: <ADCustomerDetail />,
    },
    {
        path: "lots",
        name: "admin lots",
        element: <LotCreatorLots />,
    },
    {
        path: "lots/:id",
        name: "admin lot detail",
        element: <LotDetailPage />,
    },
    {
        path: '/company-detail/:id',
        name: 'companies detail',
        element: <ClcompanyDetail role={'Admin'} />
    },
    {
        path: '/create-offer/:id',
        name: 'companies detail',
        element: <OPOfferCreate role={'Admin'} />
    },
    {
        path: 'options',
        name: 'options',
        element: <ADbaseCategory />
    },
    {
        name: "sp operators",
        path: "roles/brokers",
        element: <SPoperators />
    },
    {
        name: 'ad suppliers',
        path: 'roles/suppliers',
        element: <ADsuppliers />
    },
    {
        name: "lot creators",
        path: "roles/lot_creator",
        element: <ADLotCreators />,
    },
    {
        name: 'roles',
        path: 'roles',
        element: <RolesPage />
    },
    {
        name: 'tasks',
        path: 'tasks',
        element: <ADtasks />
    },
    {
        name: 'lead-factory',
        path: 'lead-factory',
        element: <LeadFactory />
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


];

export default adminRoutes