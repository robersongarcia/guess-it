import { Navigate, Route, Routes } from "react-router-dom"
import { GamePage, LobbyPage, LoginPage } from "./pages"
import { useUserStore } from "./store"

export const Router = () => {  

  const userId = useUserStore(state => state.userId)
  const username = useUserStore(state => state.username)

  // if(userId && username) 
  //   return (<Navigate to="lobby" />)
  // else
  //   return (<Navigate to="login" />)


  return (    
    <Routes>            
            <Route path="game/room/:roomId/user/:username/:userId" element={<GamePage/>}/>

            {
              userId && username && (
                <>
                  <Route path="lobby" element={<LobbyPage/>}/>
                  <Route path="/*" element={ <Navigate to="lobby" />}/>
                </>
              )
            }

            <Route path="login" element={<LoginPage/>}/>
            <Route path="lobby" element={<LobbyPage/>}/>

      
            <Route path="/*" element={ <Navigate to="login" />}/>

    </Routes>
  )
}
