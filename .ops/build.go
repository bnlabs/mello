package main

import (
	"log"

	"lesiw.io/cmdio/sys"
)

func (Ops) Build() {
	var rnr = sys.Runner().WithEnv(map[string]string{
		"PKGNAME": "cmdio",
	})
	defer rnr.Close()

	npm := useNpmOrPnpm(rnr)

	err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run(npm, "install")
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run(npm, "run", "prettyCheck")
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run("npx", "vitest", "run") 
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run(npm, "run", "build")
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}
}