import AdtaskReorder from "../../pages/ADtaskReorder/AdtaskReorder"
// hello worldwefwefwefwefwefwefwefewf
const supplierTaskReorder = [
    {
        name: "reorder-pending",
        path: "pending",
        element: <AdtaskReorder status="pending" />
    },
    {
        name: "reorder-in-progress",
        path: "in-progress",
        element: <AdtaskReorder status="in_progress" />
    },
    {
        name: "reorder-done",
        path: "done",
        element: <AdtaskReorder status="done" />
    },
    {
        name: "reorder-cancelled",
        path: "cancelled",
        element: <AdtaskReorder status="cancelled" />
    },
];
export default supplierTaskReorder;