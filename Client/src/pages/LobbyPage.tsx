import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const tags = Array.from({ length: 5 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)


export const LobbyPage = () => {
  return (
    <div className="bg-slate-950 w-screen min-h-screen h-full px-40 pt-6">
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-between text-white text-xl font-medium pb-8">
          <p>Roberson12  ID: 12348</p>
          <p className='text-3xl font-bold'>Guess It!</p>
          <div>
            <Button className="bg-slate-800 hover:bg-slate-900 px-2 mx-2">Create Room</Button>            
            <Button className="bg-red-600 hover:bg-red-700 px-2 mx-2">Logout</Button>
          </div>
        </div>
        <div className="w-full">
          <p className="text-white text-center text-lg font-bold">List of game rooms</p>
        </div>

        <div className="h-full pb-8">
          <ScrollArea>
              {tags.map((tag) => (
                  <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-5 hover:bg-slate-800 hover:text-white transition-all hover:cursor-pointer" key={tag}>
                  <div className="py-4 px-8 flex flex-row items-center justify-between">
                      <div className="pr-4">
                        <p className="text-xl font-bold">Room ID: 2</p>
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
  )
}
