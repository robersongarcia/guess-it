import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore } from '@/store';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface a{
  id: number,
  players: number
}

export const LobbyPage = () => {

  const userId = useUserStore(state => state.userId)
  const username = useUserStore(state => state.username)
  const logOut = useUserStore(state => state.logOut)
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<a[]>([
    ]); 

  const createARoom = () => {
    //create a room
    const randomRoomId = Math.floor(Math.random() * 1000000)
    //navigate to the room
    navigate(`/game/room/${randomRoomId}/user/${username}/${userId}`)    
  }  

  const help = (nu: number) => {
    navigate(`/game/room/${nu}/user/${username}/${userId}`)  
  }

  function getRooms(){
      const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://localhost:8081/wslist/',
        headers: { }
      };

      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        // setRooms(response.data)
        for (const key of Object.keys(response.data)) {
          setRooms([
            ...rooms,
            {
              id: parseInt(key),
              players: response.data[key]
            }
          ])
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    const intervalId = setInterval(getRooms, 2000); // Run getRooms every 2 seconds

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount


  // const help = (nu: number) => {
  //   navigate(`/game/room/${nu}/user/${username}/${userId}`)  
  // }

  // function getRooms(){
  //     const config = {
  //       method: 'get',
  //       maxBodyLength: Infinity,
  //       url: 'http://localhost:8081/wslist/',
  //       headers: { }
  //     };

  //     axios.request(config)
  //     .then((response) => {
  //       console.log(JSON.stringify(response.data));
  //       // setRooms(response.data)
  //       for (const key of Object.keys(response.data)) {
  //         setRooms([
  //           ...rooms,
  //           {
  //             id: parseInt(key),
  //             players: response.data[key]
  //           }
  //         ])
  //       }
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  // useEffect(() => {
  //   const intervalId = setInterval(getRooms, 2000); // Run getRooms every 2 seconds

  //   return () => clearInterval(intervalId); // Clean up on component unmount
  // }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount


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
                      <div className="w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5 hover:bg-slate-800 hover:text-white transition-all hover:cursor-pointer" key={data.id} onClick={() => help(data.id)  }>
                      <div className="py-4 px-8 flex flex-row items-center justify-between">
                          <div className="pr-4">
                            <p className="text-xl font-bold">Room ID: {data.id}</p>
                          </div>
                          <div>
                            <p className="text-xl">players: 2</p>
                          </div>
                      </div>
                      </div>
                  ))}
                </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
