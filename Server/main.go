package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"os"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func ginserver() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		// if c.Request.Method == "OPTIONS" {
		// 	c.AbortWithStatus(204) // No content
		// 	return
		// }

		c.Next()
	})

	r.GET("/wslist", func(c *gin.Context) {
		roomsList := make(map[string]int)
		for roomId, room := range h.rooms {
			counter := 0
			for _, p := range room {
				counter++
				roomsList[roomId] = counter
				fmt.Println(p)
			}
		}

		// Access-Control-Allow-Origin : http://localhost:5173
		// Access-Control-Allow-Credentials : true
		// Access-Control-Allow-Methods : GET, POST, OPTIONS
		// Access-Control-Allow-Headers : Origin, Content-Type, Accept

		c.JSON(200, roomsList)
	})
	r.Use(static.Serve("/", static.LocalFile("../Client/dist", true)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
        log.Panicf("error: %s", err)
	}


}

func main() {
	go h.run()

	http.HandleFunc("/room/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		_, userName, userId, roomId := Split(r.URL.Path)
		serveWs(w, r, roomId, userId, userName)
	})

	// http.HandleFunc("/wsList/", func(w http.ResponseWriter, r *http.Request) {
	// 	// return list of rooms and number of players
	// 	fmt.Println("wsList")

	// 	roomsList := make(map[string]int)
	// 	for roomId, room := range h.rooms {
	// 		counter := 0
	// 		for _, p := range room {
	// 			counter++
	// 			roomsList[roomId] = counter
	// 			fmt.Println(p)
	// 		}
	// 	}

	// 	w.Header().Set("Content-Type", "application/json")
	// 	//
	// 	// json.NewEncoder(w).Encode(roomsList)

	// 	sonMsg, err := json.Marshal(roomsList)

	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}

	// 	w.Write(sonMsg)

	// 	fmt.Println("wsList end")

	// })
	go ginserver()

	log.Fatal(http.ListenAndServe(":8080", nil))

}

func Split(path string) (string, string, string, string) {
	splitPath := strings.Split(path, "/")
	return splitPath[1], splitPath[2], splitPath[3], splitPath[4]
}
