package main

import (
	"log"

	"lesiw.io/cmdio/sys"
)

func (Ops) Deploy() {
	var rnr = sys.Runner().WithEnv(map[string]string{
		"PKGNAME": "cmdio",
	})
	defer rnr.Close()

	err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

	// assign ssh key to env var
	err = rnr.Run("echo", "\"$SSH_PRIVATE_KEY\"", "/tmp/id_rsa")
	if err != nil{
		log.Fatal(err)
	}

	err = rnr.Run("ssh","-o","StrictHostKeyChecking=no", "-i", "/tmp/id_rsa", "root@149.28.234.53")
	if err != nil{
		log.Fatal(err)
	}

	err = rnr.Run("ls")
	if err != nil{
		log.Fatal(err)
	}

	err = rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}
}