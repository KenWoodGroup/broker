import Clcompany from "../../pages/CLcompany/Clcompany";
import ClcompanyDetail from "../../pages/ClcompanyDetail/ClcompanyDetail";



const CallOperRoutes = [
    {
        name: "company",
        path: "company",
        element: <Clcompany />
    },
    {
        name: "company detail",
        path: "company/:id",
        element: <ClcompanyDetail />
    },

];
export default CallOperRoutes