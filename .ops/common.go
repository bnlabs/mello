package main

import (
	"lesiw.io/cmdio"
)


func useNpmOrPnpm(rnr *cmdio.Runner) string {
	// GH actions runner come with npm pre installed, but pnpm is used for local development
	if err := rnr.Run("which", "pnpm"); err == nil {
		return "pnpm"
	} 
	
	return "npm"
}