// App.js

import { useEffect, useRef, useState } from "react"; 

import './canvas.css';
import { Button } from '@/components/ui/button';
import { MessageKind } from "@/constants";

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

export interface Point {
    x: number;
    y: number;
    lineWidth?: number;
    lineColor?: string;
}
    
interface CanvasProps {
    send: (message: string) => void;
    otherStrokes: Point[][];
    clearFlag: boolean;
    isPainter: boolean;
}

function CanvasPaint({send, otherStrokes, clearFlag, isPainter}:CanvasProps) { 
    const canvasRef = useRef<HTMLCanvasElement | null>(null); 
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null); 
    const [isDrawing, setIsDrawing] = useState(false); 
    const [lineWidth, setLineWidth] = useState(5); 
    const [lineColor, setLineColor] = useState("#000000"); 
    const [strokes, setStrokes] = useState<Point[][]>([]);

    // Resize canvas to fit the screen
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

    useEffect(() => {
        update(otherStrokes);
    }, [otherStrokes])

    useEffect(() => {
        if (clearFlag) {
            clearCanvas(true);            
        }
    }, [clearFlag])
  
    function drawStrokes(strokes: Point[][], ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let i = 0; i < strokes.length; i++) {
            ctx.beginPath();
            ctx.strokeStyle = strokes[i][0].lineColor || lineColor;
            ctx.lineWidth = strokes[i][0].lineWidth || lineWidth;
            ctx.moveTo(strokes[i][0].x, strokes[i][0].y);
            for (let j = 1; j < strokes[i].length; j++) {
                const current = strokes[i][j];
                ctx.lineTo(current.x, current.y);
            }
            ctx.stroke();
        }
    }

    function update(strokes: Point[][]) {
        const ctx = ctxRef.current;
        if (ctx) {
            drawStrokes(strokes, ctx);
        }
    }


    function addPoint(x: number, y: number, lineWidth: number, lineColor: string, newStroke: boolean = false) {
        const p = { x: x, y: y, lineWidth: lineWidth, lineColor: lineColor };
        if (newStroke) {
            setStrokes([...strokes, [p]]);
        } else {
            if (strokes.length > 0) {
                setStrokes(strokes.slice(0, strokes.length - 1).concat([strokes[strokes.length - 1].concat([p])]));
              }
        }
        send(JSON.stringify({
            kind: MessageKind.MESSAGE_TYPE_DRAW,
            data: {
                points: [p],
                finish: newStroke
            }
        }));
    }


    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => { 
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if(ctx) {
            const rect = canvas.getBoundingClientRect();
            addPoint(e.clientX - rect.left, e.clientY - rect.top, ctx.lineWidth, ctx.strokeStyle.toString() ,true);
            setIsDrawing(true); 
            }
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
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                return;
            }            
            const rect = canvas.getBoundingClientRect();
            addPoint(e.clientX - rect.left, e.clientY - rect.top, ctx.lineWidth, ctx.strokeStyle.toString());
            update(strokes);
        }
    };
    
    const clearCanvas = (full: boolean = false) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        setLineColor("#000000");
        setLineWidth(5);

        if (full) {
            setStrokes([]);
            if(isPainter) {
                send(JSON.stringify({
                    kind: MessageKind.MESSAGE_TYPE_CLEAR
                }));
            }
        }
    }
  
    return ( 
        <div className="h-full"> 
            <div className="h-full static"> 
                {
                    isPainter ? (
                    <canvas 
                        onMouseDown={startDrawing} 
                        onMouseUp={endDrawing} 
                        onMouseMove={draw} 
                        ref={canvasRef} 
                        width={`100%`} 
                        height={`100%`} 
                    /> 
                    ):
                    (
                    <canvas          
                        ref={canvasRef} 
                        width={`100%`} 
                        height={`100%`} 
                    />    
                    )                    
                }
                
                {
                    isPainter && (
                    <Menu 
                    setLineColor={setLineColor} 
                    setLineWidth={setLineWidth}
                    clearCanvas={clearCanvas}
                    /> 
                    )
                }
                
            </div> 
        </div> 
    ); 
} 
  
export default CanvasPaint;