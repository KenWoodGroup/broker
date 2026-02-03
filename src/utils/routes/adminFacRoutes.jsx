import ADcategoriesByFactory from "../../pages/ADfacLoactionCats/ADcategoriesByFactory";
import ADfacLocalCats from "../../pages/ADfacLocalCats/ADfacLocalCats";
import ADfacProducts from "../../pages/ADfacProducts/ADfacProducts";
import ADfacProductsByCategory from "../../pages/ADfacProductsByCategory/ADfacProductsByCategory";

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
    }
];
export default adminFacRoutes