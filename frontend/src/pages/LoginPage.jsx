import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './pagesstyle.css';
//import { Link } from 'react-router-dom'
import { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();
const [Inputs, setInputs] = useState({
    username: '',
    password: '',
});

const {login} = useContext(AuthContext);
const [error, setError] = useState('');

const change = (e)=>{
const {name, value} = e.target
setInputs({...Inputs, [name]: value})}
const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
        
        const res = await api.post('/auth/login', {username: Inputs.username, password: Inputs.password});
        login(res.data.user, res.data.token);
       navigate('/');


    } catch (error) {
        setError(error.response?.data?.message || 'Login failed');
    }
}

  return (
    <div className='container w-100 vh-100 d-flex justify-content-center align-items-center ' >

    
        <form onSubmit={handleLogin} className='d-flex w-50  flex-column justify-content-center align-items-center border border-2 gap-3 '>
            <img src="/images/logo.png" alt="" width={150} height={150}/>
            <h2>LOGIN</h2>  
          <div  className='container login d-flex flex-column justify-content-center align-items-center gap-2'>
              
                <input 
                type="text"
                placeholder='Username'
                name='username'
                onChange={change}
                value={Inputs.username}
                autoComplete='off'
                required
                />
                <input 
                type="password"
                placeholder='Password'
                 name='password' 
                 onChange={change}
                 value={Inputs.password}
                 autoComplete='new-password'
                 required
                 />
                   {error && <p >{error}</p>}
            </div>
            <div className='login-btn container d-flex flex-column justify-content-center align-items-center'>
                <button>Login</button>
            
            </div>
        </form>
    

    </div>
  )
}

export default LoginPage