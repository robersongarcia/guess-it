package main

import (
	"log"
	"net/http"
	"strings"
)

func main() {
	go h.run()

	// router := gin.New()
	// router.LoadHTMLFiles("index.html")

	// router.GET("/room/:userName/:roomId", func(c *gin.Context) {
	// 	c.HTML(200, "index.html", nil)
	// })

	// router.GET("/ws/:roomId/:userId/:userName", func(c *gin.Context) {
	// 	roomId := c.Param("roomId")
	// 	userId := c.Param("userId")
	// 	userName := c.Param("userName")
	// 	serveWs(c.Writer, c.Request, roomId, userId, userName)
	// })

	// router.Run("0.0.0.0:8080")

	http.HandleFunc("/room/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	http.HandleFunc("/ws/", func(w http.ResponseWriter, r *http.Request) {
		_, userName, userId, roomId := Split(r.URL.Path)
		serveWs(w, r, roomId, userId, userName)
	})

	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}

func Split(path string) (string, string, string, string) {
	splitPath := strings.Split(path, "/")
	return splitPath[1], splitPath[2], splitPath[3], splitPath[4]
}
