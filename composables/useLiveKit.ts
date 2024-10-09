import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent, type RoomOptions } from 'livekit-client';


export function useLiveKit() {
    const wsUrl = "wss://mello-d6rzaz12.livekit.cloud"
    const token = ref<string>("")
    const room = ref<Room | null>(null)
    const currentUsername = ref<string>("")
    
    const fetchToken = async (roomName:string, username:string, canPublish: boolean, canSubscribe: boolean) => {
        const params = new URLSearchParams({
            room: roomName,
            username: username,
            canPublish: canPublish.toString(),
            canSubscribe: canSubscribe.toString()
        });
    
        const response = await fetch(`/api/getLiveKitToken?${params.toString()}`, {
            method: "GET"
        })
    
        if(response.ok) {
            const data = await response.json(); // Parse the response to JSON
            token.value = data.token; // Access the token from the parsed data

            return data.token;
        } else {
            console.log("error fetching token")
        }
        
    }
    
    const joinRoom = async (roomName: string, username: string, remoteVideoElement: HTMLMediaElement) => {
        const handleTrackSubscribed = async (track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant) => {

            publication.videoTrack?.attach(remoteVideoElement)
        }

        room.value?.disconnect()
        currentUsername.value = username

        const fetchedToken = await fetchToken(roomName, username, false, true)
        room.value = new Room()
        room.value?.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.value.connect(wsUrl, fetchedToken)
    }

    
    const leaveRoom = async() => {
        if(room) {
            room.value?.disconnect()
        }
    }
    
    const hostRoom = async (roomName: string, username:string) => {
        room.value?.disconnect()
    
        await fetchToken(roomName, username, true, false)
        currentUsername.value = username
    
        const options: RoomOptions = {}
    
        room.value = new Room(options)
        await room.value?.connect(wsUrl, token.value)
    }
    
    const toggleScreenshare = async (videoElement: HTMLMediaElement) => {
        const screenshareEnabled = room.value?.localParticipant.isScreenShareEnabled
        const screensharePub = await room.value?.localParticipant.setScreenShareEnabled(!screenshareEnabled);

        screensharePub?.videoTrack?.attach(videoElement)
    }
    
	return {
        toggleScreenshare,
        hostRoom,
        leaveRoom,
        joinRoom,
        fetchToken,
        token,
        currentUsername,
        room
    }
}