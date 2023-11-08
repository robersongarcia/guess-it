import {useState, useEffect, useRef } from 'react';


export const useWs = (url:string) => {
    const [isReady, setIsReady] = useState(false)
    const [val, setVal] = useState<string | null>(null)
  
    const ws = useRef<WebSocket | null>(null)
  
    useEffect(() => {
        const socket = new WebSocket(url)
  
        socket.onopen = () => setIsReady(true)
        socket.onclose = () => setIsReady(false)
        socket.onmessage = (event) => setVal(event.data)
  
        ws.current = socket
  
        return () => {
            if (ws.current) {
                ws.current.close()
            }
        }
    }, [url]) // Only re-run the effect if url changes

    const send = function (message: string) {
        if (ws.current) {
            ws.current.send(message);
        }
    }
  
    return {isReady, val, send}
}