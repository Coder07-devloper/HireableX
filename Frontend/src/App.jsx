import { RouterProvider } from "react-router"
import {router} from "./appRoute.jsx"
import { AuthProvider } from "./features/auth/authContext.jsx"
import {InterviewProvider} from "./features/interview/interviewContext.jsx"

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
          <RouterProvider router = {router} />
      </InterviewProvider>
    </AuthProvider>

  )
}

export default App
