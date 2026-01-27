import { useContext, useState, useCallback, createContext, useEffect } from "react";
// import authHook from "../hooks/auth-hook";

let logoutTimer;

 const AuthContext = createContext()

 export const AuthProvider = (props) =>{
    const [token, setToken] = useState(null)
    const [tokenExpirationDate, setTokenExpirationDate] = useState()
    const [userId, setUserId] = useState(null)
    const [role, setRole] = useState(null)


    const login = useCallback((uid, token, userRole, expirationDate)=>{
        setToken(token)
        setUserId(uid)
        setRole(userRole)
        const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60)

        setTokenExpirationDate(tokenExpirationDate)
        localStorage.setItem(
            "userData", 
            JSON.stringify({
                // userId: uid, 
                // token: token,
                role: userRole, 
                // expiration: tokenExpirationDate.toISOString()
            }))

    },[])

    const logout = useCallback(()=>{
        setToken(null)
        setTokenExpirationDate(null)
        setUserId(null)
        setRole(null)
        localStorage.removeItem("userData")
    },[])

    useEffect(()=>{
        if(token && tokenExpirationDate){
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime()
            logoutTimer = setTimeout(logout, remainingTime)
        }
        else{
            clearTimeout(logoutTimer)
        }

    }, [token, logout, tokenExpirationDate])

    useEffect(()=>{
        const storedData = JSON.parse(localStorage.getItem("userData"))
        if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
            login(storedData.userId, storedData.token, storedData.role, new Date(storedData.expiration))
        }
    }, [login])


    

    return(
        <AuthContext.Provider 
            value={{
                isLoggedIn: !!token,
                token, 
                login, 
                logout, 
                userId,
                role
            }}
            >
            {props.children}
        </AuthContext.Provider>
    )
 }

 export const useLogin = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
