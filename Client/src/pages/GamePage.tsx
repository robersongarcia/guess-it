import { useEffect, useState } from 'react';
import CanvasPaint from '../components/canvasComp';
import { useParams } from 'react-router-dom';
import { useWs } from '@/hooks/useWs';

interface wordsPlaceholderProps {
  word: string[];  
}

// ws://localhost:8080/ws/roberson/571782/1

const SERVER = 'localhost:8080'

const WordsPlaceholder = ({word}:wordsPlaceholderProps) => {
  
  return (
    <div className="flex flex-row justify-center h-full items-center px-8">
      {word.map((letter, i) => (
        <div className='border-b-2 mx-3 pb-3 border-neutral-950' key={i}>
          <p className="bg-white text-4xl font-bold font-mono text-center w-5 h-5 rounded-full flex items-center justify-center">
            {letter}
          </p>
        </div>
      ))}
    </div>
  )
}


enum MessageKind {
  MESSAGE_TYPE_CHAT = 1,
  MESSAGE_TYPE_START_GAME
}


export const GamePage = () => {

  //get params from react router dom
  //generate a random number
  const userId = '571782'  

  const {roomId, username} = useParams()
  const {isReady, val, send} = useWs(`ws://${SERVER}/ws/${username}/${userId}/${roomId}/`)


  useEffect(() => {
    if (isReady) {
      console.log('ready')
    }
  }, [isReady, send])

  const [word, setWord] = useState(['a','p',' ','l','e'])

  useEffect(() => {
    function messageHandler() {
      if (!val) return
      // const data = JSON.parse(val)
      console.log(val)

      // switch (data.kind) {
      //   case MessageKind.MESSAGE_TYPE_CHAT:
      //     console.log('chat')
      //     break
      //   case MessageKind.MESSAGE_TYPE_START_GAME:
      //     console.log('start game')
      //     break
      //   default:
      //     break
      // }
    }

    messageHandler()
  }, [val])

  

  return (
    <div className="w-screen h-screen flex flex-row">
        <div className="bg-white w-4/6 h-full">
          <div className='h-16 w-4/6 absolute'>
            <WordsPlaceholder word={word}/>
          </div>
          <CanvasPaint />
        </div>
        <div className="bg-blue-500 w-2/6">
            <div className="w-full h-[10%] bg-slate-900 text-white flex flex-row items-center px-8">
              <p className="text-xl">Room ID: 156448</p>
            </div>
            {/* Chat part */}
            <div className="bg-slate-800 h-[90%] flex flex-col w-full mx-auto">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col space-y-2">
                    {/* Messages here */}                    
                    <div className="flex">
                      <div className="bg-slate-950 text-white p-2 rounded-lg max-w-xs">
                        Roberson: You too, take care!
                      </div>
                    </div>               
                </div>
            </div>

            <div className="bg-slate-900 p-4 flex items-center">
                <input type="text" placeholder="Type your guess..." className="flex-1 border rounded-full px-4 py-2 focus:outline-none bg-slate-900 text-white" />
                <button className="bg-blue-500 text-white rounded-full p-2 ml-2 hover:bg-blue-600 focus:outline-none">
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </button>
            </div>
            </div>
        </div>
    </div>
  )
}
