// App.js

import { useEffect, useRef, useState } from "react"; 

import './canvas.css';
import { Button } from '@/components/ui/button';

interface MenuProps {
    setLineColor: (color: string) => void;
    setLineWidth: (width: number) => void;    
    clearCanvas?: () => void;
}


const Menu: React.FC<MenuProps> = ({ setLineColor, setLineWidth, clearCanvas }) => { 
    return ( 
        <div className="Menu bg-slate-900 mb-1"> 
            <div className="px-4">
                <label className="text-white">Brush Color </label> 
                <input 
                    type="color"
                    onChange={(e) => { 
                        setLineColor(e.target.value); 
                    }} 
                /> 
            </div>
            <div className="px-4">
                <label className="text-white">Brush Width </label> 
                <input 
                    type="range"
                    min="3"
                    max="20"
                    defaultValue={5}
                    onChange={(e) => { 
                        setLineWidth(parseInt(e.target.value)); 
                    }} 
                /> 
            </div>
            <div className="px-4">
                <Button className="bg-red-600 hover:bg-red-700 px-2 m-2" onClick={clearCanvas}>Clear</Button>
            </div>
        </div> 
    ); 
}; 
    
function CanvasPaint() { 
    const canvasRef = useRef<HTMLCanvasElement | null>(null); 
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null); 
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lineWidth, setLineWidth] = useState(5); 
    const [lineColor, setLineColor] = useState("black"); 
    
        useEffect(() => {
            const canvas = document.querySelector('canvas');
            if (canvas !== null) {
                fitToContainer(canvas);
            }
            
            function fitToContainer(canvas: HTMLCanvasElement) {
                // Make it visually fill the positioned parent
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                // ...then set the internal size to match
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }
    
        }, [])
  
    // Initialization when the component 
    // mounts for the first time 
    useEffect(() => { 
        const canvas = canvasRef.current; 
        if (canvas) {
            const ctx = canvas.getContext("2d"); 
            if (ctx) {
                ctx.lineCap = "round"; 
                ctx.lineJoin = "round"; 
                ctx.strokeStyle = lineColor; 
                ctx.lineWidth = lineWidth; 
                ctxRef.current = ctx; 
            }
        }
    }, [lineColor, lineWidth]); 
  
    // Function for starting the drawing 
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => { 
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.beginPath(); 
            ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); 
            setIsDrawing(true); 
        }
    }; 
  
    // Function for ending the drawing 
    const endDrawing = () => { 
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.closePath(); 
            setIsDrawing(false); 
        }
    }; 
  
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => { 
        if (!isDrawing) { 
            return; 
        } 
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY); 
            ctx.stroke(); 
        }
    };
    
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }
  
    return ( 
        <div className="h-full"> 
            <div className="h-full static"> 
                <canvas 
                    onMouseDown={startDrawing} 
                    onMouseUp={endDrawing} 
                    onMouseMove={draw} 
                    ref={canvasRef} 
                    width={`100%`} 
                    height={`100%`} 
                /> 
                <Menu 
                    setLineColor={setLineColor} 
                    setLineWidth={setLineWidth}
                    clearCanvas={clearCanvas}
                /> 
            </div> 
        </div> 
    ); 
} 
  
export default CanvasPaint;