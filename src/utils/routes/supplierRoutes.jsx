import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import CLOffersCreate from "../../pages/CLOffersCreate/CLOffersCreate";
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
        name: "factories splr",
        path: 'factories',
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


];
export default supplierRoutes