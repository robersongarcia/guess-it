package main

import (
	"fmt"
	"math/rand"
	"os"

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

	// Broadcast for all users except sender
	albroadcast chan message

	// Inbound private messages from the connections.
	private chan privateMessage

	// Register requests from the connections.
	register chan subscription

	// Unregister requests from connections.
	unregister chan subscription
}

func getWords(cant int) []string {
	//open the words.json file and extract cant random words from it
	file, err := os.ReadFile("./words.json")
	if err != nil {
		fmt.Println(err)
		return []string{"airplane", "car", "laptop", "network", "pie", "architecture", "apple"}
	}

	var wordsMap map[string][]string

	err = json.Unmarshal(file, &wordsMap)
	if err != nil {
		fmt.Println(err)
		return []string{"airplane", "car", "laptop", "network", "pie", "architecture", "apple"}
	}

	words := wordsMap["words"]

	var words2 []string
	var usedIndices []int

	for i := 0; i < cant; i++ {
		randomNumber := rand.Intn(len(words))
		if contains(usedIndices, randomNumber) {
			i--
		} else {
			usedIndices = append(usedIndices, randomNumber)
			words2 = append(words2, words[randomNumber])
		}
	}

	return words2
}

func contains(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// Create a function that takes as arguments an integer called kind, a value of type any and that creates a json and unmarshal it and returns it
func createJson(kind int, value any) ([]byte, error) {
	var msgJson = make(map[string]interface{})
	msgJson["kind"] = kind
	msgJson["data"] = value
	msg, err := json.Marshal(msgJson)
	if err != nil {
		fmt.Println(err)
	}
	return msg, err
}

var h = hub{
	broadcast:   make(chan message),
	albroadcast: make(chan message),
	private:     make(chan privateMessage),
	register:    make(chan subscription),
	unregister:  make(chan subscription),
	rooms:       make(map[string]map[*connection]player),
	games:       make(map[string]game),
}

func gameLoop(room string) {
	fmt.Println("gameLoop Start")
	magicNumber := 0
	gameFinished := false
	roundStarted := false

	game := h.games[room]

	isEnd := false

	for {
		m := <-game.message
		fmt.Println("gameLoop message")

		if m.kind == MESSAGE_TYPE_CHAT {
			fmt.Println("gameLoop message chat message")

			if game.isStarted && roundStarted {
				playerAct := h.rooms[room][m.senderConn]
				var msgJson map[string]interface{}
				err := json.Unmarshal(m.data, &msgJson)
				if err != nil {
					fmt.Println(err)
					continue
				}

				if msgJson["data"] == game.words[game.round-1] {
					if playerAct.isPainter || playerAct.roundGuess[game.round-1] {
						continue
					}
					playerAct.roundScore[game.round-1] = 100
					playerAct.roundGuess[game.round-1] = true

					h.rooms[room][m.senderConn] = playerAct

					fmt.Println("gameLoop message chat message correct guess")
					// create correct guess message
					var msg, err = createJson(MESSAGE_TYPE_GUESS, playerAct.name+" guessed the word")
					if err != nil {
						fmt.Println(err)
						continue
					}
					guessMessage := message{msg, room, MESSAGE_TYPE_GUESS, "server", "server", m.senderConn}
					h.broadcast <- guessMessage

					// create correct guess message
					var msg2, err2 = createJson(MESSAGE_TYPE_WHO_GUESS, "The word was guessed by "+playerAct.name)
					if err2 != nil {
						fmt.Println(err2)
						continue
					}

					whoGuess := privateMessage{msg2, room, MESSAGE_TYPE_WHO_GUESS, "server", "server", m.senderConn, m.senderId}

					h.private <- whoGuess

					// check if all players guessed
					allGuessed := true

					for _, player := range h.rooms[room] {
						if !player.isPainter && !player.roundGuess[game.round-1] {
							allGuessed = false
						}
					}

					if allGuessed {
						var msg, err = createJson(MESSAGE_TYPE_END_ROUND, "End of the round "+fmt.Sprint(game.round))
						if err != nil {
							fmt.Println(err)
							continue
						}
						roundStarted = false
						//reset player painter
						for c, player := range h.rooms[room] {
							player.isPainter = false
							h.rooms[room][c] = player
						}

						for _, player := range h.rooms[room] {
							fmt.Println(player.name, player.roundScore)
						}

						endRoundMessage := message{msg, room, MESSAGE_TYPE_END_ROUND, "server", "server", m.senderConn}
						h.broadcast <- endRoundMessage
					}

					continue
				}
				h.broadcast <- m
			} else {
				h.broadcast <- m
			}
		}

		if m.kind == MESSAGE_TYPE_START_GAME {
			fmt.Println("gameLoop message start game")
			if game.isStarted {
				continue
			}
			game.isStarted = true

			game.rounds = len(h.rooms[room]) * 2 // TODO change to 3 aqui van las rondas

			game.words = getWords(game.rounds) // TODO change to get words from database

			fmt.Println("gameLoop message start game rounds: ", game.rounds)

			for c, player := range h.rooms[room] {
				player.roundGuess = make([]bool, game.rounds)
				player.roundScore = make([]int, game.rounds)
				player.paintRounds = 0
				player.isPainter = false
				h.rooms[room][c] = player
			}

			h.broadcast <- m
		}

		if m.kind == MESSAGE_TYPE_END_GAME {
			fmt.Println("gameLoop message end game")
			isEnd = true
		}

		if m.kind == MESSAGE_TYPE_USER_JOIN {
			fmt.Print("gameLoop message user join: ")

			playerAct := h.rooms[room][m.senderConn]

			fmt.Println(playerAct.name)

			if playerAct.isOwner {
				var msg, err = createJson(MESSAGE_TYPE_IS_OWNER, playerAct.name+" is the owner")
				if err != nil {
					fmt.Println(err)
					continue
				}
				priv := privateMessage{msg, m.room, MESSAGE_TYPE_IS_OWNER, m.senderId, m.senderName, m.senderConn, m.senderId}
				fmt.Println(priv)
				h.private <- priv
				fmt.Println("gameLoop message user join owner")
			}

			h.broadcast <- m
			fmt.Println("gameLoop message user join end")
		}

		if m.kind == MESSAGE_TYPE_DRAW {
			fmt.Println("gameLoop message draw")
			h.albroadcast <- m
		}

		if m.kind == MESSAGE_TYPE_CLEAR {
			fmt.Println("gameLoop message clear")
			h.albroadcast <- m
		}

		if m.kind == MESSAGE_TYPE_USER_LEAVE {
			fmt.Println("gameLoop message user leave")
			h.broadcast <- m
		}

		if m.kind == MESSAGE_TYPE_START_ROUND {
			if !game.isStarted || roundStarted {
				continue
			}

			fmt.Println("gameLoop message start round")

			game.round++
			roundStarted = true

			if game.round == game.rounds {
				fmt.Println("gameLoop message start round end")
				gameFinished = true
			}

			// Select painter
			counter := 0

			for _, player := range h.rooms[room] {
				if player.paintRounds == magicNumber {
					counter++
				}
			}
			// generate a random number between 1 and counter
			var randomNumber int
			if counter != 1 {
				randomNumber = rand.Intn(counter-1) + 1 // TODO change to random number
			} else {
				randomNumber = 1
			}

			counter2 := 0

			for _, player := range h.rooms[room] {
				if player.paintRounds == magicNumber {
					counter2++
				}
			}

			// select the painter with the random number in a loop
			counter = 1

			for c, player := range h.rooms[room] {
				if player.paintRounds == magicNumber {
					if counter == randomNumber {
						player.isPainter = true
						player.paintRounds++

						h.rooms[room][c] = player

						// create is painter message
						if counter2 == 1 {
							magicNumber++
						}

						var msg, err = createJson(MESSAGE_TYPE_IS_PAINTER, game.words[game.round-1])
						if err != nil {
							fmt.Println(err)
							continue
						}

						priv := privateMessage{msg, m.room, MESSAGE_TYPE_IS_PAINTER, player.id, player.name, c, player.id}

						fmt.Println("gameLoop message start round is painter: ", priv)

						h.private <- priv

						// create say painter message
						var msg2, err2 = createJson(MESSAGE_TYPE_SAY_PAINTER, player.name+" is the painter")
						if err2 != nil {
							fmt.Println(err2)
							continue
						}
						sayPainterMessage := message{msg2, room, MESSAGE_TYPE_SAY_PAINTER, "server", "server", m.senderConn}
						h.broadcast <- sayPainterMessage
					}
					counter++
				}
			}
			//create a map with a message and a word
			var a = make(map[string]string)
			a["word"] = game.words[game.round-1]
			a["message"] = "Start of the round " + fmt.Sprint(game.round)

			// create start round message
			var msg, err = createJson(MESSAGE_TYPE_START_ROUND, a)
			if err != nil {
				fmt.Println(err)
				continue
			}
			startRoundMessage := message{msg, room, MESSAGE_TYPE_START_ROUND, "server", "server", m.senderConn}
			h.broadcast <- startRoundMessage
		}

		if m.kind == MESSAGE_TYPE_END_ROUND {
			var msg, err = createJson(MESSAGE_TYPE_END_ROUND, "End of the round "+fmt.Sprint(game.round))
			if err != nil {
				fmt.Println(err)
				continue
			}

			roundStarted = false

			// print scores
			for _, player := range h.rooms[room] {
				fmt.Println(player.name, player.roundScore)
				fmt.Println(player.name, player.roundGuess)
				fmt.Println(player.name, player.paintRounds)
			}

			//reset player painter
			for c, player := range h.rooms[room] {
				player.isPainter = false
				h.rooms[room][c] = player
			}

			endRoundMessage := message{msg, room, MESSAGE_TYPE_END_ROUND, "server", "server", m.senderConn}
			h.broadcast <- endRoundMessage
		}

		if isEnd {
			break
		}

		if gameFinished {
			fmt.Println("gameLoop message game finishedddddddddd")
			// create end game message
			var msg, err = createJson(MESSAGE_TYPE_END_GAME, "End of the game")
			if err != nil {
				fmt.Println(err)
				continue
			}
			endGameMessage := message{msg, room, MESSAGE_TYPE_END_GAME, "server", "server", m.senderConn}
			h.broadcast <- endGameMessage

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
			// create join message
			var msg, err = createJson(MESSAGE_TYPE_USER_JOIN, s.userName+" joined the game")
			if err != nil {
				fmt.Println(err)
				continue
			}
			joinMessage := message{msg, s.room, MESSAGE_TYPE_USER_JOIN, s.userId, s.userName, s.conn}
			h.games[s.room].message <- joinMessage

		case s := <-h.unregister:
			connections := h.rooms[s.room]
			if connections != nil {
				if _, ok := connections[s.conn]; ok {
					// create leave message
					var msg, err = createJson(MESSAGE_TYPE_USER_LEAVE, s.userName+" left the game")
					if err != nil {
						fmt.Println(err)
						continue
					}
					leaveMessage := message{msg, s.room, MESSAGE_TYPE_USER_LEAVE, s.userId, s.userName, s.conn}
					h.games[s.room].message <- leaveMessage

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

		case m := <-h.albroadcast:
			connections := h.rooms[m.room]
			for c := range connections {
				if c != m.senderConn {
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
