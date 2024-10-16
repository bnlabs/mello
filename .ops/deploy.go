package main

import (
	"log"
	"os"

	"lesiw.io/cmdio/sys"
)

func (Ops) Deploy() {
	sshKey := os.Getenv("SSH_PRIVATE_KEY")
	var rnr = sys.Runner().WithEnv(map[string]string{
		"PKGNAME": "cmdio",
		"HOSTNAME": os.Getenv("PROD_SSH_HOST"),
		"sshKey" : os.Getenv("SSH_PRIVATE_KEY"),
		"USER" : os.Getenv("PROD_SSH_USER"),
	})

	defer rnr.Close()

	err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

	// assign ssh key to env var
	err = os.WriteFile("key", []byte(sshKey), 0644)
	if err != nil {
		log.Fatal(err)
	}

	// "-o","StrictHostKeyChecking=no"
	err = rnr.Run("ssh", "-t", "-i", "./key", rnr.Env("USER") + rnr.Env("HOSTNAME"))
	if err != nil {
		log.Fatal(err)
	}

	err = rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}
}
