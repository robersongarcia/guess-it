
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"

import { useState } from "react"

export const LoginPage = () => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="h-screen flex">
          <div className="hidden lg:flex w-full lg:w-1/2 login_img_section h-full
          justify-around items-center">
            <div 
                  className=" 
                  bg-black 
                  opacity-20 
                  inset-0 
                  z-0"
                  >
                  </div>
            <div className="w-full mx-auto px-20 flex-col items-center space-y-6">
              <div className="text-white text-center flex flex-col items-center">
                <h1 className="text-4xl">Welcome to Guess-It!</h1>
                <p className="text-lg">Unleash your creativity and have fun drawing.</p>
                <img
                  src="/brushes.png"
                  alt="Pinceles y colores"
                  className={`w-80 h-80 mt-4 ${isHovered ? 'glow' : ''}`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                 />
              </div>
            </div>
          </div>
          <div className="flex w-full lg:w-1/2 justify-center items-center bg-slate-950 space-y-8">
            <div className="w-full px-8 md:px-32 lg:px-24">

            <Card>
                <CardHeader>
                  <CardTitle className="text-center">Enter your username to access the game.</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username"></Label>
                      <Input id="username" placeholder="Your creative alias" />
                    </div>
                    <div>
                      <Button className="w-full">Start playing</Button>
                    </div>
                    <p className="text-center text-sm text-gray-400">
                      Be ready to draw, guess, and have a blast with your imagination!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
      </div>
  )
}
