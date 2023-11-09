package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

// var addr = flag.String("addr", "localhost:8080", "http service address")
//get PORT

func main() {
	go h.run()

	// r := mux.NewRouter()

	// r.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintf(rw, "Hello World")
	// }).Methods(http.MethodGet)

	// r.HandleFunc("/ws/room/{roomId}/user/{userId}/{userName}", func(rw http.ResponseWriter, r *http.Request) {
	// 	fmt.Println("ws/room/{roomId}/user/{userId}/{userName}")
	// 	vars := mux.Vars(r)
	// 	roomId := vars["roomId"]
	// 	userId := vars["userId"]
	// 	userName := vars["userName"]
	// 	serveWs(rw, r, roomId, userId, userName)

	// }).Methods(http.MethodGet)

	// http.Handle("/", r)

	// //GET PORT FROM .env
	// port := os.Getenv("PORT")
	// if port == "" {
	// 	port = "8080"
	// }

	// log.Println("Listening...")
	// log.Fatal(http.ListenAndServe(":"+port, r))

	//Standar

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := flag.String("addr", ":"+port, "http service address")

	http.HandleFunc("/room/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		_, userName, userId, roomId := Split(r.URL.Path)
		serveWs(w, r, roomId, userId, userName)
	})

	http.HandleFunc("/lobby/", func(w http.ResponseWriter, r *http.Request) {
		serveLobby(w, r)
	})

	server := &http.Server{
		Addr:              *addr,
		ReadHeaderTimeout: 3 * time.Second,
	}
	err := server.ListenAndServe()
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}

	//GIN

	// router := gin.Default()
	// router.Use(CORSMiddleware())
	// router.GET("/hello-world", myGetFunction)

	// router.GET("/ws/room/:roomId/user/:userId/:userName", func(c *gin.Context) {
	// 	roomId := c.Param("roomId")
	// 	userId := c.Param("userId")
	// 	userName := c.Param("userName")
	// 	serveWs(c.Writer, c.Request, roomId, userId, userName)
	// })

	// router.GET("/lobby", func(c *gin.Context) {
	// 	serveLobby(c.Writer, c.Request)
	// })

	// port := os.Getenv("PORT")
	// if port == "" {
	// 	port = "8080"
	// }
	// if err := router.Run(":" + port); err != nil {
	// 	log.Panicf("error: %s", err)
	// }
}

// func CORSMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
// 		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}

// 		c.Next()
// 	}
// }

// type simpleMessage struct {
// 	Hello   string `json:"hello"`
// 	Message string `json:"message"`
// }

// func myGetFunction(c *gin.Context) {
// 	simpleMessage := simpleMessage{
// 		Hello:   "World!",
// 		Message: "Subscribe to my channel!",
// 	}

// 	c.IndentedJSON(http.StatusOK, simpleMessage)
// }

func Split(path string) (string, string, string, string) {
	splitPath := strings.Split(path, "/")
	return splitPath[1], splitPath[2], splitPath[3], splitPath[4]
}
