package main

import (
	"log"

	"lesiw.io/cmdio/sys"
	"lesiw.io/ops"
)

type Ops struct{}

func main() {
	ops.Handle(Ops{})
}

func (Ops) Hello() {
	println("Hello world!")
}
