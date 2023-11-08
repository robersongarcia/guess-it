import { Navigate, Route, Routes } from "react-router-dom"
import { GamePage, LobbyPage, LoginPage } from "./pages"

export const Router = () => {
  return (
    <Routes>            
            <Route path="login" element={<LoginPage/>}/>
            <Route path="lobby" element={<LobbyPage/>}/>
            <Route path="game/room/:roomId/user/:username" element={<GamePage/>}/>

            <Route path="/*" element={ <Navigate to="login" />}/>

    </Routes>
  )
}
