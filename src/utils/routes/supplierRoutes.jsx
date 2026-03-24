import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import SPLRhome from "../../pages/SPLRhome/SPLRhome";

const supplierRoutes = [
    {
        name: 'splr home',
        path: '',
        element: <SPLRhome />,
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
        element: <ADfactoriesBycategory />
    },
];
export default supplierRoutes