import LotCreatorHome from "../../pages/LotCreatorHome/LotCreatorHome";
import LotCreatorLots from "../../pages/LotCreatorLots/LotCreatorLots";
import LotDetailPage from "../../pages/LotDetail/LotDetailPage";

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
        element: <LotDetailPage />,
    },
];

export default lotCreatorRoutes;

