package main

import (
	"log"
	"os"
	"path/filepath"

	"lesiw.io/cmdio"
	"lesiw.io/cmdio/sys"
)

func (o Ops) Deploy() {
	sshKey, hostname, user := getEnvVariables()
	rnr := sys.Runner().WithEnv(map[string]string{
		"PKGNAME":  "cmdio",
		"HOSTNAME": hostname,
		"USER":     user,
	})

	defer rnr.Close()

	if err := runInitialCommand(rnr); err != nil {
		log.Fatal(err)
	}

	if err := setupSSHKey(sshKey); err != nil {
		log.Fatal(err)
	}

	if err := connectViaSSH(rnr, user, hostname); err != nil {
		log.Fatal(err)
	}

	if err := runFinalCommand(rnr); err != nil {
		log.Fatal(err)
	}
}

func getEnvVariables() (string, string, string) {
	sshKey := os.Getenv("SSH_PRIVATE_KEY")
	if sshKey == "" {
		log.Fatal("SSH_PRIVATE_KEY environment variable is not set")
	}

	hostname := os.Getenv("PROD_SSH_HOST")
	if hostname == "" {
		log.Fatal("PROD_SSH_HOST environment variable is not set")
	}

	user := os.Getenv("PROD_SSH_USER")
	if user == "" {
		log.Fatal("PROD_SSH_USER environment variable is not set")
	}

	return sshKey, hostname, user
}

func runInitialCommand(rnr *cmdio.Runner) error {
	return rnr.Run("echo", "hello from", rnr.Env("PKGNAME"))
}

func setupSSHKey(sshKey string) error {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	sshDir := filepath.Join(homeDir, ".ssh")
	if err := os.MkdirAll(sshDir, 0700); err != nil {
		return err
	}

	sshKeyWithNewline := sshKey + "\n" // Add a newline at the end
	return os.WriteFile(filepath.Join(sshDir, "id_ed25519"), []byte(sshKeyWithNewline), 0600)
}

func connectViaSSH(rnr *cmdio.Runner, user, hostname string) error {
	return rnr.Run("ssh", "-tt", "-o", "StrictHostKeyChecking=no", user+"@"+hostname)
}

func runFinalCommand(rnr *cmdio.Runner) error {
	return rnr.Run("echo", "goodbye from", rnr.Env("PKGNAME"))
}
