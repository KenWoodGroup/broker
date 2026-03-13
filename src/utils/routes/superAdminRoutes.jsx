import SPhome from "../../pages/SPhome/SPhome";
import SPmanagers from "../../pages/SPmanagers/SPmanagers";
import SPusers from "../../pages/SPusers/SPusers";

const superAdminRoutes = [
    {
        name:"sp home",
        path:"",
        element:<SPhome/>
    },
    {
        name:"sp managers",
        path:"managers",
        element:<SPmanagers/>
    },
    {
        name:"sp users",
        path:"users",
        element:<SPusers/>
    },

];

export default superAdminRoutes;