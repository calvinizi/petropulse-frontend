import { useState, useCallback, useRef, useEffect } from "react"

export const useHttpClient = ()=>{
    const [error, setError] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const activeHttpRequests = useRef([])

    const sendRequest = useCallback (async (url, method = 'GET', body = null, headers = {})=>{

        setIsLoading(true)
        const httpAbortCtrl = new AbortController()
        activeHttpRequests.current.push(httpAbortCtrl)

        try {
            const isFormData = body instanceof FormData;
            
            const response = await fetch(url, {
                method,
                body,
                headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
                signal: httpAbortCtrl.signal
            })
    
            const responseData = await response.json()
                    
            if(!response.ok){
                throw new Error(responseData.message)
            }

            // Only remove from active requests if successful
            activeHttpRequests.current = activeHttpRequests.current.filter
            (reqCtrl => reqCtrl !== httpAbortCtrl)

            setIsLoading(false)
            return responseData
        } catch (error) {
            // Remove from active requests on error too
            activeHttpRequests.current = activeHttpRequests.current.filter
            (reqCtrl => reqCtrl !== httpAbortCtrl)
            
            setError(error.message)
            setIsLoading(false)
            throw error
        }
        
    }, [])

    const clearError = ()=>{
        setError(null)
    }


    useEffect(()=>{
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort())
    }
    }, [])
    return {isLoading, error, sendRequest, clearError}
}