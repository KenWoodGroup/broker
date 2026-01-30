import SPhome from "../../pages/SPhome/SPhome";
import SPmanagers from "../../pages/SPmanagers/SPmanagers";
import SPoperators from "../../pages/SPoperators/SPoperators";
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
    {
        name:"sp operators",
        path:"operators",
        element:<SPoperators/>
    }
];

export default superAdminRoutes;