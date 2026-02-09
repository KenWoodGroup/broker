import ADcategoriesByFactory from "../../pages/ADfacLoactionCats/ADcategoriesByFactory";
import ADfacLocalCats from "../../pages/ADfacLocalCats/ADfacLocalCats";
import ADfacProducts from "../../pages/ADfacProducts/ADfacProducts";
import ADfacProductsByCategory from "../../pages/ADfacProductsByCategory/ADfacProductsByCategory";
import FactoryOptionsPage from "../../pages/ADfactoryOptions/ADfactoryOptions";

const adminFacRoutes = [
    {
        name: "ad fac products",
        path: 'products',
        element: <ADfacProducts />
    },
    {
        name: "ad fac categories",
        path: "",
        element: <ADfacLocalCats />
    },
    {
        name: "ad fac products by category",
        path: 'category/:categoryId',
        element: <ADfacProductsByCategory />
    },
    {
        name:"ad categories bs factory",
        path:"categories",
        element:<ADcategoriesByFactory/>
    },
    {
        name:"ad factory options",
        path:'options',
        element:<FactoryOptionsPage/>
    }
];
export default adminFacRoutes