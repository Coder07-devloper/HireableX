import { useState } from "react"
import "../authForm.scss"
import { Link } from 'react-router'
import {useAuth} from "../hooks/useAuth"
import { useNavigate } from "react-router"

const Login = () => {

    const {loading, handleLogin} = useAuth()
    const navigate = useNavigate()

    // for two-way binding
    const [email, setEmail] = useState("")
    const [password, setpassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = await handleLogin({email,password})

        if (data?.user) {
            navigate('/home')
        }
    }

    if(loading){
        return (<main><h1>Loading.....</h1></main>)
    }



  return (
    <main>
        <div className="brand-block brand-block--auth">
            <h1>HireableX</h1>
            <p>Turn every opportunity into a focused interview win.</p>
        </div>
        <div className="form-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className='input-group'>
                    <label htmlFor="email">Email</label>
                    <input
                    onChange={(e)=>{setEmail(e.target.value)}} // two-way binding
                     type="email" id="email" name="email" placeholder='Enter email address' />
                </div>

                <div className='input-group'>
                    <label htmlFor="password">Password</label>
                    <input 
                    onChange={(e)=>{setpassword(e.target.value)}} // two-way binding
                    type="password" id="password" name="password" placeholder='Enter password' />
                </div>

                <button className='button primary-button'>Login</button>

            </form>
          <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
        </div>
    </main>
  
    

  )
}

export default Login
