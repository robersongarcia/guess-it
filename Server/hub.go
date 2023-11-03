package main

import (
	"fmt"

	"encoding/json"
)

type message struct {
	data       []byte
	room       string
	kind       int
	senderId   string
	senderName string
	senderConn *connection
}

type privateMessage struct {
	data       []byte
	room       string
	kind       int
	senderId   string
	senderName string
	senderConn *connection
	receiverId string
}

type subscription struct {
	conn     *connection
	room     string
	userId   string
	userName string
}

type player struct {
	id          string
	name        string
	roundScore  []int
	roundGuess  []bool
	paintRounds int
	isPainter   bool
	isOwner     bool
}

type game struct {
	words     []string
	rounds    int
	round     int
	isStarted bool
	message   chan message
}

// hub maintains the set of active connections and broadcasts messages to the
// connections.
type hub struct {
	// Registered connections.
	rooms map[string]map[*connection]player

	// Game state of the rooms
	games map[string]game

	// Inbound messages from the connections.
	broadcast chan message

	// Inbound private messages from the connections.
	private chan privateMessage

	// Register requests from the connections.
	register chan subscription

	// Unregister requests from connections.
	unregister chan subscription
}

func getWords() []string {
	return []string{"apple", "car", "laptop", "network"}
}

var h = hub{
	broadcast:  make(chan message),
	private:    make(chan privateMessage),
	register:   make(chan subscription),
	unregister: make(chan subscription),
	rooms:      make(map[string]map[*connection]player),
	games:      make(map[string]game),
}

func gameLoop(room string) {
	fmt.Println("gameLoop Start")

	game := h.games[room]

	isEnd := false

	game.words = getWords()
	game.rounds = 5

	for {
		m := <-game.message
		fmt.Println("gameLoop message")

		if m.kind == MESSAGE_TYPE_CHAT {
			fmt.Println("gameLoop message chat message")

			if game.isStarted {
				playerAct := h.rooms[room][m.senderConn]
				var msgJson map[string]interface{}
				err := json.Unmarshal(m.data, &msgJson)
				if err != nil {
					fmt.Println(err)
					continue
				}

				if msgJson["data"] == game.words[game.round-1] {
					playerAct.roundScore = append(playerAct.roundScore, 100)
					playerAct.roundGuess = append(playerAct.roundGuess, true)
					fmt.Println("gameLoop message chat message correct guess")

					guessMessage := privateMessage{[]byte(playerAct.name + " guessed the word"), room, MESSAGE_TYPE_GUESS, "server", "server", m.senderConn, playerAct.id}
					h.private <- guessMessage
					continue
				}
				h.broadcast <- m
			} else {
				h.broadcast <- m
			}
		}

		if m.kind == MESSAGE_TYPE_START_GAME {
			fmt.Println("gameLoop message start game")
			game.isStarted = true
			game.round = 1
		}

		if m.kind == MESSAGE_TYPE_END_GAME {
			fmt.Println("gameLoop message end game")
			isEnd = true
		}

		if m.kind == MESSAGE_TYPE_USER_JOIN {
			fmt.Print("gameLoop message user join: ")
			h.broadcast <- m
			fmt.Println("gameLoop message user join end")
		}

		if isEnd {
			break
		}
	}
	fmt.Println("gameLoop End")
}

func (h *hub) run() {
	for {
		select {
		case s := <-h.register:
			connections := h.rooms[s.room]
			isOwner := false
			if connections == nil {
				connections = make(map[*connection]player)
				h.rooms[s.room] = connections
				h.games[s.room] = game{words: make([]string, 0), rounds: 0, round: 0, isStarted: false, message: make(chan message)}
				isOwner = true
				go gameLoop(s.room)
			}
			h.rooms[s.room][s.conn] = player{id: s.userId, name: s.userName, roundScore: make([]int, 0), roundGuess: make([]bool, 0), paintRounds: 0, isPainter: false, isOwner: isOwner}
			joinMessage := message{[]byte(s.userName + " joined"), s.room, MESSAGE_TYPE_USER_JOIN, s.userId, s.userName, s.conn}
			h.games[s.room].message <- joinMessage

		case s := <-h.unregister:
			connections := h.rooms[s.room]
			if connections != nil {
				if _, ok := connections[s.conn]; ok {
					delete(connections, s.conn)
					close(s.conn.send)
					if len(connections) == 0 {
						delete(h.rooms, s.room)
						delete(h.games, s.room)
					}
				}
			}

		case m := <-h.broadcast:
			connections := h.rooms[m.room]
			for c := range connections {
				select {
				case c.send <- m.data:
				default:
					close(c.send)
					delete(connections, c)
					if len(connections) == 0 {
						delete(h.rooms, m.room)
						delete(h.games, m.room)
					}
				}
			}

		case m := <-h.private:
			connections := h.rooms[m.room]
			fmt.Println("private message")
			for c, p := range connections {
				if p.id == m.receiverId {
					select {
					case c.send <- m.data:
					default:
						close(c.send)
						delete(connections, c)
						if len(connections) == 0 {
							delete(h.rooms, m.room)
							delete(h.games, m.room)
						}
					}
				}
			}
		}
	}
}
