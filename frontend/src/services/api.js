import axios from 'axios'
// import { useContext } from 'react'
// import { AuthContext} from '../context/AuthContext'
// import { isTokenExpired } from '../utils/auth'
const api = axios.create({
    baseURL:'http://localhost:1000/api',
})

api.interceptors.request.use((config)=>{
    // const {logout} = useContext(AuthContext);
    const token = localStorage.getItem('token');
// if(config.url === '/login' || 
//     config.url === '/register') 
//     return config


    if(token) 
    {
        // if(isTokenExpired(token)){
        //     logout();
        //     window.location.href = '/login';
        //     return Promise.reject(new Error('Token expired'));
        // }
         config.headers.Authorization = `Bearer ${token}`
    }
       
    return config
})


export default api;