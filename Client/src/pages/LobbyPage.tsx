import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWs } from '@/hooks/useWs';
import { useUserStore } from '@/store';
import {  useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
// import axios from 'axios';

interface Room{
  id: number,
  players: number
}

const SERVER = 'localhost:8080'

export const LobbyPage = () => {

  const userId = useUserStore(state => state.userId)
  const username = useUserStore(state => state.username)
  const logOut = useUserStore(state => state.logOut)
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([
    ]); 
  
  const {isReady, val, send} = useWs(`wss://${SERVER}/lobby/`)

  useEffect(() => {
    if (isReady) {
      console.log('ready')
    }
  }, [isReady, send])

  useEffect(() => {
    if (val) {
      console.log(val)
      const respData = JSON.parse(val)

      const {data} = respData
      
      const {rooms} = data

      const objectRoom : Room[] = []

      for (const room of Object.keys(rooms)) {
        objectRoom.push({id: parseInt(room), players: rooms[room]})
      }

      setRooms(objectRoom)
    }
  }, [val])
  
  const goToRoom = (roomId: number) => {
    //navigate to the room
    navigate(`/game/room/${roomId}/user/${username}/${userId}`)
  }

  const createARoom = () => {
    //create a room
    const randomRoomId = Math.floor(Math.random() * 1000000)
    //navigate to the room
    navigate(`/game/room/${randomRoomId}/user/${username}/${userId}`)    
  }  

  if(!userId || !username) return (<Navigate to="login" />)

  return (
    <div className="bg-slate-950 w-screen min-h-screen h-full px-40 pt-6" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/background.jpg")', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-between text-white text-xl font-medium pb-8">
          <p>{username}  ID: {userId}</p>
          <p className='text-3xl font-bold'>Guess It!</p>
          <div>
            <Button className="bg-gray-700 hover:bg-gray-800 px-2 mx-2" onClick={createARoom}>Create Room</Button>         
            <Button className="bg-red-600 hover:bg-red-700 px-2 mx-2" onClick={logOut}>Logout</Button>
          </div>
        </div>
        <div className="w-full">
          <p className="text-white text-center text-lg font-bold">List of game rooms</p>
        </div>

        <div className="h-full pb-8 flex justify-center">
          <div style={{ border: '1px solid #ffffff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', display: 'inline-block', width: '80%' }}>
            <div>
              <ScrollArea>
                  {rooms.map((data) => (
                      <div className="w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5 hover:bg-slate-800 hover:text-white transition-all hover:cursor-pointer" key={data.id} onClick={() => goToRoom(data.id)} >
                      <div className="py-4 px-8 flex flex-row items-center justify-between">
                          <div className="pr-4">
                            <p className="text-xl font-bold">Room ID: {data.id}</p>
                          </div>
                          <div>
                            <p className="text-xl">players: {data.players}</p>
                          </div>
                      </div>
                      </div>
                  ))}

                  {
                    rooms.length === 0 && (
                      <div className="w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5 hover:bg-slate-800 hover:text-white transition-all hover:cursor-pointer">
                      <div className="py-4 px-8 flex flex-row items-center justify-between">
                          <div className="pr-4">
                            <p className="text-xl font-bold">No rooms available</p>
                          </div>
                      </div>
                      </div>
                    )
                  }
                </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
