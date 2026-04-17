import ClientsPage from "../../pages/ADfacClients/ADfacClients";
import ADcategoriesByFactory from "../../pages/ADfacLoactionCats/ADcategoriesByFactory";
import ADfacLocalCats from "../../pages/ADfacLocalCats/ADfacLocalCats";
import ADfacProducts from "../../pages/ADfacProducts/ADfacProducts";
import ADfacProductsByCategory from "../../pages/ADfacProductsByCategory/ADfacProductsByCategory";
import FactoryOptionsPage from "../../pages/ADfactoryOptions/ADfactoryOptions";
import UsersPage from "../../pages/ADfacUsers/ADfacUsers";
import WarehousesPage from "../../pages/ADfacWarehouses/ADfacWarehouses";
import WarehouseStockPage from "../../pages/ADfacWarehouseStock/ADfacWarehouseStock";
import FactoryInfo from "../../pages/FactoryInfo";

const supplierFacRoutes = [
    {
        name: "ad fac products",
        path: 'products',
        element: <ADfacProducts role={'supplier'} />
    },
    {
        name: "ad fac categories",
        path: "",
        element: <ADfacLocalCats role={'supplier'} />
    },
    {
        name: "ad fac products by category",
        path: 'category/:categoryId',
        element: <ADfacProductsByCategory role="supplier" />
    },
    {
        name: "ad categories bs factory",
        path: "categories",
        element: <ADcategoriesByFactory />
    },
    // {
    //     name:"ad factory options",
    //     path:'options',
    //     element:<FactoryOptionsPage/>
    // },
    {
        name: 'ad factory warehouses',
        path: 'warehouses',
        element: <WarehousesPage role={'supplier'} />
    },
    {
        name: 'ad factory warehouse stock',
        path: 'warehouses/:warehouseId',
        element: <WarehouseStockPage />
    },
    // {
    //     name:'ad factory clients',
    //     path:'clients',
    //     element:<ClientsPage/>
    // },
    {
        name: 'ad factory users',
        path: 'users',
        element: <UsersPage role={'supplier'} />
    },
    {
        name: 'factory info',
        path: 'info',
        element: <FactoryInfo role={'supplier'} />
    }
];
export default supplierFacRoutes