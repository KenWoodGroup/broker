import { Center } from "@chakra-ui/react";
import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import ADcompany from "../../pages/BRcompany/BRcompany";
import ADOperators from "../../pages/ADOperators/ADOperators";
import Clcompany from "../../pages/CLcompany/Clcompany";
import OptionsPage from "../../pages/ADoptions/ADoptions";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";
import SPoperators from "../../pages/SPoperators/SPoperators";
import ADhome from "../../pages/ADhome/ADhome";
import RolesPage from "../../pages/ADworkers/ADworkers";
import ADsuppliers from "../../pages/ADsuplliers/ADsuppliers";

const adminRoutes = [
    {
        path: "",
        name: "ok",
        element: <ADhome/>
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
        path: '/company-detail/:id',
        name: 'companies detail',
        element: <ClcompanyDetail role={'Admin'} />
    },
    {
        path: '/create-offer/:id',
        name: 'companies detail',
        element: <CLOffersCreate role={'Admin'} />
    },
    {
        path: 'options',
        name: 'options',
        element: <OptionsPage />
    },
    {
        name: "sp operators",
        path: "roles/brokers",
        element: <SPoperators />
    },
    {
        name:'ad suppliers',
        path:'roles/suppliers',
        element:<ADsuppliers/>
    },
    {
        name:'roles',
        path:'roles',
        element:<RolesPage/>
    }

];

export default adminRoutes