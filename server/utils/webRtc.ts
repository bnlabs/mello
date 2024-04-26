import { Socket } from "socket.io"

type ConnectedUser = {
    Id : string
    Peerconnection : RTCPeerConnection
    Room : string
}

const connectedUsers : ConnectedUser[] = []

const servers = {
    iceServers: [
        {
            urls: [
                "stun:global.stun.twilio.com:3478",
                "stun:stun4.l.google.com:19302",
                "stun:stun3.l.google.com:19302",
                "stun:stun.l.google.com:19302",
            ],
        },
    ],
}

// method to answer broadcaster
const createPeerConnectionAnswer = async (
    uid: string,
    socket: Socket
) => {
    console.log("creating peer connecion answer")
    // host's peer connection
    const newPeerConnection = new RTCPeerConnection(servers)
    let remoteStream: MediaStream | null
    remoteStream = new MediaStream()

    newPeerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream?.addTrack(track)
            track.onended = function () {
                remoteStream = null
            }
        })
    }

    newPeerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            const payload = JSON.stringify({
                type: "candidate",
                candidate: event.candidate,
            })
            socket.emit("receiveWebRtcMessageSFU", payload)
        }
    }

    // add host peer connection to lobby into
    const newUser: ConnectedUser = {
        Id: uid,
        Room: "room",
        Peerconnection: newPeerConnection
    }
    connectedUsers.push(newUser)
    
    return newPeerConnection
}

export const createAnswer = async (
    uid: string,
    offer: RTCSessionDescriptionInit,
    socket: Socket
) => {
    console.log("creating answer")
    const pCon = await createPeerConnectionAnswer(uid, socket)
    await pCon.setRemoteDescription(offer)
    const answer = await pCon.createAnswer()
    await pCon.setLocalDescription(answer)
    const payload = JSON.stringify({ type: "answer", answer: answer })
    socket.emit("receiveWebRtcMessageSFU", payload)
}

export const getPeerConnection = async (
    uid: string
) => {
    return connectedUsers.find(u => u.Id === uid)?.Peerconnection
}
