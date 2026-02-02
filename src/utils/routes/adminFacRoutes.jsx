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
        path: ':categoryId',
        element: <ADfacProductsByCategory />
    }
];
export default adminFacRoutes