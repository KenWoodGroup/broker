import LotCreatorHome from "../../pages/LotCreatorHome/LotCreatorHome";
import LotCreatorLots from "../../pages/LotCreatorLots/LotCreatorLots";
import LotCreatorLotDetail from "../../pages/LotCreatorLots/LotCreatorLotDetail";

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
    {
        name: "lot detail",
        path: "lots/:id",
        element: <LotCreatorLotDetail />,
    },
];

export default lotCreatorRoutes;

