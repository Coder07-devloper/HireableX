import axios from "axios"
// axios is used for api-caling

const api = axios.create({
    baseURL: "https://hireablex.onrender.com", 
    withCredentials: true
})

export async function register({username, email, password}){
    const response = await api.post('/api/auth/register',{
        username, email, password
    
        // jab hum axios ka use karte hain api ko call karne ke liye, toh by-default woh cookies ka access nhi deta server ko, isliye humein ek flag ke saath ise bhejna padta hai jiska naam "withCredentials" hota h

         // isse kya hoga, ki ab jab hum axiso ka use karke backend pe koi request bhejenge, toh ismein jo humara server hai, uske paas access hoga ki woh cookies mein kuch bhi data ko read kar sake, and kuch bhi data ko woh set kar sake
    })

    return response.data
}

//------------------------------------------------------------------------------------------------------//

export async function login({email, password}){
    const response = await api.post('/api/auth/login',{
        email, password
    })
    
    return response.data
}

//-----------------------------------------------------------------------------------------------------//

export async function logout(){
    const response = await api.get("/api/auth/logout",{
    })

    return response.data
}

//------------------------------------------------------------------------------------------------------//

export async function getMe(){
    const response = await api.get("/api/auth/get-me",{
    })

    return response.data 
}

//------------------------------------------------------------------------------------------------------//

