import { Center } from "@chakra-ui/react";
import ADcategories from "../../pages/ADcategories/ADcategories";
import ADfactories from "../../pages/ADfactories/ADfactories";
import ADfactoriesBycategory from "../../pages/ADfactoriesBycategory/ADfactoriesBycategory";
import ADcompany from "../../pages/BRcompany/BRcompany";
import ADOperators from "../../pages/ADOperators/ADOperators";
import Clcompany from "../../pages/CLcompany/Clcompany";

const adminRoutes = [
    {
        path: "",
        name: "ok",
        element: <div><Center>Shakillantirish bosqichida</Center></div>
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
        path: "operators",
        name: "operators",
        element: <ADOperators />
    },
    {
        path:'companies',
        name:'companies',
        element:<Clcompany role={'Admin'}/>
    }

];

export default adminRoutes