package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

const (
	// Message types
	MESSAGE_TYPE_CHAT = iota + 1
	MESSAGE_TYPE_START_GAME
	MESSAGE_TYPE_END_GAME
	MESSAGE_TYPE_USER_JOIN
	MESSAGE_TYPE_USER_LEAVE
	MESSAGE_TYPE_DRAW
	MESSAGE_TYPE_GUESS
	MESSAGE_TYPE_CLEAR
	MESSAGE_TYPE_IS_OWNER
	MESSAGE_TYPE_START_ROUND
	MESSAGE_TYPE_IS_PAINTER
	MESSAGE_TYPE_SAY_PAINTER
	MESSAGE_TYPE_END_ROUND
	MESSAGE_TYPE_WHO_GUESS
	MESSAGE_TYPE_SHOW_POINTS

	//Lobby message types
	LOBBY_CHANGE
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// connection is an middleman between the websocket connection and the hub.
type connection struct {
	// The websocket connection.
	ws *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

// readPump pumps messages from the websocket connection to the hub.
func (s subscription) readPump() {
	c := s.conn
	defer func() {
		h.unregister <- s
		c.ws.Close()
	}()
	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error { c.ws.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, msg, err := c.ws.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}
		var msgJson map[string]interface{}
		err = json.Unmarshal(msg, &msgJson)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}

		//check if msgJson has type value // TODO a real check, failure point
		if msgJson["kind"] == nil {
			continue
		}

		msgJson["userId"] = s.userId
		msgJson["userName"] = s.userName

		msg, err = json.Marshal(msgJson)

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("error: %v", err)
			}
			break
		}

		m := message{msg, s.room, int(msgJson["kind"].(float64)), s.userId, s.userName, s.conn}

		fmt.Print("message: ")
		fmt.Println(m)
		fmt.Println("message end")

		h.games[s.room].message <- m
	}
}

// write writes a message with the given message type and payload.
func (c *connection) write(mt int, payload []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, payload)
}

// writePump pumps messages from the hub to the websocket connection.
func (s *subscription) writePump() {
	c := s.conn
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.write(websocket.TextMessage, message); err != nil {
				return
			}
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(w http.ResponseWriter, r *http.Request, roomId string, userId string, userName string) {
	fmt.Println("serveWs")
	fmt.Println(roomId)
	fmt.Println(userId)
	fmt.Println(userName)
	fmt.Println("serveWs end")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("serveWs error")
		log.Println(err.Error())
		fmt.Println(err.Error())
		return
	}
	fmt.Println("serveWs after upgrade")
	fmt.Println(ws.RemoteAddr())
	fmt.Println("serveWs after upgrade end")
	c := &connection{send: make(chan []byte, 256), ws: ws}
	s := subscription{c, roomId, userId, userName}
	h.register <- s
	fmt.Println("serveWs after register")
	go s.writePump()
	fmt.Println("serveWs after writePump")
	go s.readPump()
	fmt.Println("serveWs after readPump")
}

func serveLobby(w http.ResponseWriter, r *http.Request) {
	fmt.Println("serveLobby")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err.Error())
		return
	}
	c := &connection{send: make(chan []byte, 256), ws: ws}
	s := subscription{c, "", "", ""}
	h.registerLobby <- s
	go s.writePump()
	go s.readPump()
}
