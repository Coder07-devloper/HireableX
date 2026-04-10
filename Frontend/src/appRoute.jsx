import {createBrowserRouter} from "react-router"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/protected"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/interview"







export const router = createBrowserRouter([
    {
        path : "/",
        element: <Login/>
    },
    {
        path : "/login",
        element: <Login/>
    },
    {
        path : "/register",
        element: <Register/>
    },
    {
        path : "/home",
        element: <Protected><Home/></Protected>
    },
    {
        path : "/interview/:intervieId",
        element: <Protected><Interview/></Protected>
    }

])
