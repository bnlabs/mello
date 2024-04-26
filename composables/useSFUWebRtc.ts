import { useSocketIo } from "@/composables/useSocketIo"


export function useSFUWebRtc() {
    let localStream : MediaStream | null
    let peerConnection : RTCPeerConnection

    const { socket } = useSocketIo()
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
    const streamSetting = {
		video: {
			width: { ideal: 2560, max: 2560 },
			height: { ideal: 1440, max: 1440 },
			frameRate: { ideal: 60, max: 60 },
		},
		audio: {
			autoGainControl: false,
			channelCount: 2,
			echoCancellation: false,
			noiseSuppression: false,
			sampleRate: 48000,
			sampleSize: 16,
		},
	}

    const createPeerConnectionSFU = async (
        videoPlayer : HTMLMediaElement
	) => {
        console.log("creating peer connection")
		peerConnection = new RTCPeerConnection(servers)

		if (!localStream) {
			localStream = await navigator.mediaDevices.getDisplayMedia(streamSetting)
		}

        if (videoPlayer) {
			videoPlayer.srcObject = localStream
		}

		localStream.getTracks().forEach((track: MediaStreamTrack) => {
			peerConnection.addTrack(track, localStream as MediaStream)
			track.onended = function () {
				localStream = null
			}
		})

		peerConnection.onicecandidate = async (event) => {
			if (event.candidate) {
				const payload = JSON.stringify({
					type: "candidate",
					candidate: event.candidate,
				})
                // change end point
				socket.emit("sendWebRTCMessage", payload)
			}
		}
	}


    const createOfferSFU = async (
        videoPlayer: HTMLMediaElement
    ) => {
        console.log("creating offer")
        if(!peerConnection)
        {
            await createPeerConnectionSFU(videoPlayer)
        }

        const offer = await peerConnection.createOffer()
        peerConnection.setLocalDescription(offer)
        const payload = JSON.stringify({ type: "offer", offer: offer })
        // change end point
        socket.emit("sendWebRTCMessageSFU", payload)
	}

    const addAnswerSFU = async (answer: RTCSessionDescriptionInit) => {
        console.log("adding answer")
        if(peerConnection)
        {
            peerConnection.setRemoteDescription(answer)
        }
    }

    const addIceCandidateSFU = async (iceCandidate : any) => {
        
        peerConnection?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    }

    const endStream = async () => {
		const videoTrack = localStream && localStream.getVideoTracks()[0]
		if (videoTrack && videoTrack.readyState !== "ended") {
			localStream?.getTracks().forEach((track) => track.stop())
			localStream = null
		}
	}

    const toggleStreamSFU = async (
        videoPlayer: HTMLMediaElement
    ) => {
		// Check if localStream exists and if it has video tracks
		const videoTrack = localStream && localStream.getVideoTracks()[0]

		// If videoTrack exists and is still active, stop the stream.
		if (videoTrack && videoTrack.readyState !== "ended") {
			await endStream()
		} else {
			// If videoTrack is ended or doesn't exist, try to acquire the stream
			try {
				await createOfferSFU(videoPlayer)
			} catch (err) {
				console.error("Error acquiring stream: ", err)
			}
		}
	}

    const isStreamingSFU = () => {
		const videoTrack = localStream && localStream.getVideoTracks()[0]
		if (!videoTrack) {
			return false
		}
		return videoTrack && videoTrack.readyState !== "ended"
	}

	return {
		createOfferSFU,
        addAnswerSFU,
        addIceCandidateSFU,
        toggleStreamSFU,
        isStreamingSFU
	}
    
}