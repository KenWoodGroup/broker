import AdtaskPrice from "../../pages/ADtaskPrice/AdtaskPrice";

const supplierTaskPrice = [
    {
        name:"pending",
        path:"pending",
        element:<AdtaskPrice status="pending"/>
    },
    {
        name:"in-progress",
        path:"in-progress",
        element:<AdtaskPrice status="in_progress"/>
    },
    {
        name:"done",
        path:"done",
        element:<AdtaskPrice status="done"/>
    },
    {
        name:"cancelled",
        path:"cancelled",
        element:<AdtaskPrice status="cancelled"/>
    },
]
export default supplierTaskPrice