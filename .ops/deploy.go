package main

import (
	"log"
	"os"

	"lesiw.io/cmdio/sys"
)

func (o Ops) Deploy() {
	// sshKey := os.Getenv("SSH_PRIVATE_KEY")
	// if sshKey == "" {
	// 	log.Fatal("SSH_PRIVATE_KEY environment variable is not set")
	// }

	hostname := os.Getenv("PROD_SSH_HOST")
	if hostname == "" {
		log.Fatal("PROD_SSH_HOST environment variable is not set")
	}

	user := os.Getenv("PROD_SSH_USER")
	if user == "" {
		log.Fatal("PROD_SSH_USER environment variable is not set")
	}

	rnr := sys.Runner().WithEnv(map[string]string{
		"PKGNAME":  "cmdio",
		"HOSTNAME": hostname,
		"USER":     user,
	})

	defer rnr.Close()

	// Run an initial command
	if err := rnr.Run("echo", "hello from", rnr.Env("PKGNAME")); err != nil {
		log.Fatal(err)
	}

	// Write the SSH key to a file
	if err := os.WriteFile("key", []byte(""), 0600); err != nil { // Use 0600 for private key
		log.Fatal(err)
	}

	// Run the SSH command with options
	if err := rnr.Run("ssh", "-t", "-i", "key", "-o", "StrictHostKeyChecking=no", user+"@"+hostname); err != nil {
		log.Fatal(err)
	}

	// Run a final command
	if err := rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME")); err != nil {
		log.Fatal(err)
	}
}
