package main

import (
	"log"
	"os"

	"lesiw.io/cmdio/sys"
)



func (Ops) Deploy() {
	vpsusr := os.Getenv("PROD_SSH_USER")
	hostname := os.Getenv("PROD_SSH_HOST")
	sshKey := os.Getenv("SSH_PRIVATE_KEY")
	
	var rnr = sys.Runner().WithEnv(map[string]string{
		"PKGNAME": "cmdio",
	})
	defer rnr.Close()

	err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
	if err != nil {
		log.Fatal(err)
	}

	// assign ssh key to env var
	err = rnr.Run("echo", sshKey, "./key")
	if err != nil{
		log.Fatal(err)
	}

	err = rnr.Run("ssh","-o","StrictHostKeyChecking=no", "-i", "./key", vpsusr + "@" + hostname)
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