import { useContext } from "react";
import { AuthContext } from "../authContext";
import {login, register, logout} from "../services/authApi"

export const useAuth = () => {
    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context 


    const handleLogin = async({email, password}) => {
        setLoading(true)
        try{
             const data = await login({email, password})
             setUser(data.user)
             return data
        } catch(err){
            console.log(err)
            return null
        } finally{
            setLoading(false)
        }

        // *** FLOW OF HANDLING USER LOGIN ***//
        /**
         * Sabse pehle setLoading ko true set karenge, phir hum ek Api call karenge, phir api ka jo response aayega, uske ander jo bhi user rhega usko set karenge yahan wale "user" ke ander, and wapas se setLoading ko false pe set kar denge
         */
    }
//------------------------------------------------------------------------------------------------------//

        // similar thing we'll do for register 

        const handleRegister = async({username, email, password}) => {
            setLoading(true)
            try{
                 const data = await register({username, email, password})
                 setUser(data.user)
                 return data
            } catch(err){
                console.log(err)
                return null
            } finally{
                setLoading(false)
            }
        }

//------------------------------------------------------------------------------------------------------//

       const handleLogout = async() => {
        setLoading(true)
        try{
            await logout()
            setUser(null)
            return true
        } catch(err){
            console.log(err)
            return false
        } finally{
            setLoading(false)
        }
       }
       return {user, loading, handleRegister, handleLogin, handleLogout}

}
