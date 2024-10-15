package main

import (
	"log"
	"lesiw.io/cmdio/sys"
)

var rnr = sys.Runner().WithEnv(map[string]string{
	"PKGNAME": "cmdio",
})

func main() {
	defer rnr.Close()

	err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run(useNpmOrPnpm(rnr), "install")
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run(useNpmOrPnpm(rnr), "run", "build")
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

}
