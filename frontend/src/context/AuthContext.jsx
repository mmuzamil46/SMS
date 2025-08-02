import {createContext, useState, useEffect} from 'react'
import { isTokenExpired } from '../utils/auth';
export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const userFromStorage = localStorage.getItem('user');
        return userFromStorage ? JSON.parse(userFromStorage) : null;
    });



// useEffect(() => {
//  const checkToken = () => {
//     const token = localStorage.getItem('token');
//     if(isTokenExpired(token)){
//         logout();
//     }
//  };

//  checkToken();

// const interval = setInterval(checkToken, 60000);

// const handleVisilityChange = () => {
//     if(document.visibilityState === 'visible'){
//         checkToken();
//     }
// }

// window.addEventListener('visibilitychange', handleVisilityChange);

// return () => {
//     clearInterval(interval);
//     window.removeEventListener('visibilitychange', handleVisilityChange);
// }


// },[]);


    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
    
}