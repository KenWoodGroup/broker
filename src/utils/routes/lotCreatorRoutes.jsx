import LotCreatorHome from "../../pages/LotCreatorHome/LotCreatorHome";
import LotCreatorLots from "../../pages/LotCreatorLots/LotCreatorLots";

const lotCreatorRoutes = [
    {
        name: "lot creator home",
        path: "",
        element: <LotCreatorHome />,
    },
    {
        name: "lots",
        path: "lots",
        element: <LotCreatorLots />,
    },
];

export default lotCreatorRoutes;

