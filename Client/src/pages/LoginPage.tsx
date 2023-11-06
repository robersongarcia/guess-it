
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"

export const LoginPage = () => {
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
                {/* AQUI VAN LAS COSAS A LA IZQUIERDA */}
            </div>
          </div>
          <div className="flex w-full lg:w-1/2 justify-center items-center bg-slate-950 space-y-8">
            <div className="w-full px-8 md:px-32 lg:px-24">

            <Card>
                <CardHeader>
                  <CardTitle className="text-center">Guess It!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Name for the game" />
                    </div>
                    <div>
                      <Button className="w-full">Start playing</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
      </div>
  )
}
