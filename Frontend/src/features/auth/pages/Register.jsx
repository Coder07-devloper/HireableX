import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth' 
import "../authForm.scss"

const Register = () => {

    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const {loading, handleRegister} = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const data = await handleRegister({username, email, password})

        if (data?.user) {
            navigate("/home")
        }
    }

    if(loading){
        return (<main><h1>Loading......</h1></main>)
    }

  return (
    <main>
        <div className="brand-block brand-block--auth">
            <h1>HireableX</h1>
            <p>Turn every opportunity into a focused interview win.</p>
        </div>
        <div className="form-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>

                <div className='input-group'>
                    <label htmlFor="username">Username</label>
                    <input 
                    onChange={(e)=>{setUsername(e.target.value)}}  // two-way binding
                    type="text" id="username" name="username" placeholder='Enter username' />
                </div>
                
                <div className='input-group'>
                    <label htmlFor="email">Email</label>
                    <input 
                    onChange={(e)=>{setEmail(e.target.value)}} 
                    type="email" id="email" name="email" placeholder='Enter email address' />
                </div>

                <div className='input-group'>
                    <label htmlFor="password">Password</label>
                    <input 
                    onChange={(e)=>{setPassword(e.target.value)}} 
                    type="password" id="password" name="password" placeholder='Enter password' />
                </div>

                <button className='button primary-button'>Register</button>

            </form>

        <p>Already have an account? <Link to={"/login"}>Login</Link></p>
        </div>
    </main>
  )
}

export default Register
