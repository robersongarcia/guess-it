import { useEffect, useRef, useState } from 'react';
import CanvasPaint, { Point } from '../components/canvasComp';
import { useParams } from 'react-router-dom';
import { useWs } from '@/hooks/useWs';
import { useSnackbar } from 'notistack';
import { MessageKind } from '@/constants';
import { Button } from '@/components/ui/button';

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

interface Message { 
  kind: MessageKind,
  data: unknown,
  userName?: string,
  userId?: string,
}

export const GamePage = () => {

  //get params from react router dom
  //generate a random number
  const [isPainter, setIsPainter] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isRoundStarted, setIsRoundStarted] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const logRef = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState('')
  // const [messages, setMessages] = useState<string[]>([])
  const [otherStrokes, setOtherStrokes] = useState<Point[][]>([]);
  const [clearFlag, setClearFlag] = useState(false)

  const {roomId, username, userId} = useParams()
  const {isReady, val, send} = useWs(`ws://${SERVER}/ws/${username}/${userId}/${roomId}/`)
  const [trueWord, setTrueWord] = useState('')

  const [word, setWord] = useState(['','','','',''])

  useEffect(() => {
    if (isReady) {
      console.log('ready')
    }
  }, [isReady, send])

  function appendLog(log: HTMLDivElement, item: HTMLDivElement) {
    log.appendChild(item);
    item.scrollIntoView({ behavior: 'smooth' });
  }

  function messageTypeChatHandler(data: Message) {
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-slate-950 text-white p-2 rounded-lg max-w-xs">
        ${data.userName}: ${data.data}
      </div>
    `          
    appendLog(log!, item)
  }

  function messageTypeUserJoinHandler(data: Message) {
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-lime-700 text-white p-2 rounded-lg max-w-xs">
        ${data.data}
      </div>
    `          
    appendLog(log!, item)

    enqueueSnackbar(`${data.data}`, {variant: 'success', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
  }

  function messageTypeDrawHandler(data: Message) {
    console.log('draw')
    console.log(data.data)
    const {finish, points} = data.data as {finish: boolean, points: Point[]}

    if (finish) {
      setOtherStrokes((prev) => {
        const newStrokes = [...prev]
        newStrokes.push(points)
        return newStrokes
      })
    } else {
      setOtherStrokes((prev) => {
        const newStrokes = [...prev]
        newStrokes[newStrokes.length - 1] = newStrokes[newStrokes.length - 1].concat(points)
        return newStrokes
      })
    }
  }

  function sendChatMessage() {
    if (message.trim() === '') return
    const data: Message = {
      kind: MessageKind.MESSAGE_TYPE_CHAT,
      data: message
    }

    send(JSON.stringify(data))

    setMessage('')
  }

  function startMessageHandler() {
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-yellow-700 text-white p-2 rounded-lg max-w-xs">
        Game started
      </div>
    `          
    appendLog(log!, item)

    enqueueSnackbar(`Game started`, {variant: 'warning', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
    setGameStarted(true)
  }

  function userLeaveMessageHandler(data: Message) {
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-red-700 text-white p-2 rounded-lg max-w-xs">
        ${data.data}
      </div>
    `          
    appendLog(log!, item)

    enqueueSnackbar(`${data.data}`, {variant: 'error', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
  }

  function sayPainterHandler(data: Message) {
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-cyan-900 text-white p-2 rounded-lg max-w-xs">
        ${data.data}
      </div>
    `          
    appendLog(log!, item)

    enqueueSnackbar(`${data.data}`, {variant: 'info', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
    setGameStarted(true)
  }

  function startRoundMessageHandler (message: string, word: string){ 
    const log = logRef.current
    const item = document.createElement('div')
    item.classList.add('flex')
    item.innerHTML = `
      <div class="bg-cyan-900 text-white p-2 rounded-lg max-w-xs">
        ${message}
      </div>
    `          
    appendLog(log!, item)

    enqueueSnackbar(`${message}`, {variant: 'info', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})

    const str = word as string
    setIsRoundStarted(true)

    if( isPainter)
      return
    // add withe spaces to set word of the length of the string
    setWord([])

    new Array(str.length).fill(' ').forEach((letter) => {
      setWord((prev) => {
        const newWord = [...prev]
        newWord.push(letter)
        return newWord
      })
    })


  } 

  useEffect(() => {
    function messageHandler() {
      if (!val) return
      const data = JSON.parse(val) as Message
      console.log(val)

      switch (data.kind) {
        case MessageKind.MESSAGE_TYPE_CHAT:
          messageTypeChatHandler(data)
          break
        case MessageKind.MESSAGE_TYPE_START_GAME:
          console.log('start game')
          startMessageHandler()

          break
        case MessageKind.MESSAGE_TYPE_END_GAME:
          console.log('end game')
          break
        case MessageKind.MESSAGE_TYPE_USER_JOIN:
          console.log('user join')
          messageTypeUserJoinHandler(data)
          break
        case MessageKind.MESSAGE_TYPE_USER_LEAVE:
          console.log('user leave')
          userLeaveMessageHandler(data)
          break
        case MessageKind.MESSAGE_TYPE_DRAW:
          messageTypeDrawHandler(data)

          break
        case MessageKind.MESSAGE_TYPE_GUESS:
          {
            console.log('Type guess')
            const log = logRef.current
            const item = document.createElement('div')
            item.classList.add('flex')
            item.innerHTML = `
              <div class="bg-lime-700 text-white p-2 rounded-lg max-w-xs">
                ${data.data}
              </div>
            `
            appendLog(log!, item)
            enqueueSnackbar(`${data.data}`, {variant: 'success', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
            break
          }

        case MessageKind.MESSAGE_TYPE_CLEAR:
          console.log('clear')
          setClearFlag(true)
          setOtherStrokes([])
          setTimeout(() => {
            setClearFlag(false)
          }, 100)
          break

        case MessageKind.MESSAGE_TYPE_IS_OWNER:
          console.log('is owner')
          setIsOwner(true)
          break

        case MessageKind.MESSAGE_TYPE_IS_PAINTER:
        {          
          console.log('is painter')
          console.log(data)
          setIsPainter(true)
          const str = data.data as string
          const arr = str.split('')          
          setWord(arr)
          enqueueSnackbar(`You are the painter`, {variant: 'info', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
          const log = logRef.current
          const item = document.createElement('div')
          item.classList.add('flex')
          item.innerHTML = `
            <div class="bg-cyan-900 text-white p-2 rounded-lg max-w-xs">
              You are the painter
            </div>
          `          
          appendLog(log!, item)
        }
          break

        case MessageKind.MESSAGE_TYPE_START_ROUND:{
        
          console.log('start round')
          console.log(data)
          
          const {message, word} = data.data
          startRoundMessageHandler(message, word)
          setTrueWord(word)
          break
        }
        case MessageKind.MESSAGE_TYPE_SAY_PAINTER:
          console.log('say painter')
          sayPainterHandler(data)
          break

        case MessageKind.MESSAGE_TYPE_END_ROUND:
          {
            console.log('end round')
            setIsRoundStarted(false)
            setClearFlag(true)
            setOtherStrokes([])
            setIsPainter(false)
            const log = logRef.current
            const item = document.createElement('div')
            item.classList.add('flex')
            item.innerHTML = `
              <div class="bg-cyan-900 text-white p-2 rounded-lg max-w-xs">
                Round ended
              </div>
            `
            appendLog(log!, item)
            enqueueSnackbar(`Round ended`, {variant: 'info', autoHideDuration: 2000, anchorOrigin: {horizontal: 'left', vertical: 'top'}})
          }
          break

        case MessageKind.MESSAGE_TYPE_WHO_GUESS:
          {
            const arr = trueWord.split('')
            setWord(arr)
            break
          }

        default:
          break
      }
    }

    messageHandler()
  }, [val])

  function startGameHandler() {
    const data: Message = {
      kind: MessageKind.MESSAGE_TYPE_START_GAME,
      data: 'Game started'
    }

    send(JSON.stringify(data))
  }

  function startRoundHandler() {
    const data: Message = {
      kind: MessageKind.MESSAGE_TYPE_START_ROUND,
      data: 'Round started'
    }

    send(JSON.stringify(data))
  }

  function endRoundHandler() {
    const data: Message = {
      kind: MessageKind.MESSAGE_TYPE_END_ROUND,
      data: 'Round ended'
    }

    send(JSON.stringify(data))
  }

  return (
    <div className="w-screen h-screen flex flex-row">
        <div className="bg-white w-4/6 h-full">
          <div className='h-16 w-4/6 absolute'>
            <WordsPlaceholder word={word}/>
          </div>
          <CanvasPaint send={send} otherStrokes={otherStrokes} clearFlag={clearFlag} isPainter={isPainter}/>
        </div>
        <div className="bg-blue-500 w-2/6">
            <div className="w-full h-[10%] bg-slate-900 text-white flex flex-row items-center px-8">
              <p className="text-xl pr-3">Room ID: {roomId}</p>
              {
                isOwner && (<>
                  <Button disabled={gameStarted} className="bg-slate-700 hover:bg-slate-950 px-2 mx-2" onClick={startGameHandler}>Start Game</Button>  
                  <Button disabled={isRoundStarted} className="bg-slate-700 hover:bg-slate-950 px-2 mx-2" onClick={() => startRoundHandler()}>Start Round</Button>  
                  <Button disabled={!isRoundStarted} className="bg-slate-700 hover:bg-slate-950 px-2 mx-2" onClick={() => endRoundHandler()}>End Round</Button>  
                </>)
              }
              
            </div>
            {/* Chat part */}
            <div className="bg-slate-800 h-[90%] flex flex-col w-full mx-auto">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col space-y-2" id='log' ref={logRef}>
                    {/* Messages here */}                    
                    {/* <div className="flex">
                      <div className="bg-slate-950 text-white p-2 rounded-lg max-w-xs">
                        Roberson: You too, take care!
                      </div>
                    </div>                */}
                </div>
            </div>

            <div className="bg-slate-900 p-4 flex items-center">
                <input type="text" placeholder="Type your guess..." className="flex-1 border rounded-full px-4 py-2 focus:outline-none bg-slate-900 text-white" value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        sendChatMessage();
                    }
                  }}
                />
                <button className="bg-blue-500 text-white rounded-full p-2 ml-2 hover:bg-blue-600 focus:outline-none" onClick={sendChatMessage}>
                  <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                </button>
            </div>
            </div>
        </div>
    </div>
  )
}
