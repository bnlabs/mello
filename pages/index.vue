<script lang="ts">
import InputText from "primevue/inputtext"
import { foodList } from "~/lib/foodList"
import { useToast } from "primevue/usetoast"

export default {
	components: {
		InputText
	},
	data() {
		return {
			username: "",
			room: "",
			touched: {
				username: false,
				room: false
			},
			serverSideStreaming: false,
			toast: useToast()
		}
	},
	computed: {
		isUsernameValid() {
			return (
				this.username.trim().length > 0 && this.username.trim().length <= 30
			)
		},
		isRoomValid() {
			return this.room.trim().length > 0 && this.room.trim().length <= 30
		},
		showUsernameValidation() {
			return this.touched.username && !this.isUsernameValid
		},
		showRoomValidation() {
			return this.touched.room && !this.isRoomValid
		}
	},
	methods: {
		async showError(summary: string, detail: string) {
			this.toast.add({
				severity: "error",
				summary: summary,
				detail: detail,
				life: 3000
			})
		},
		async joinRoom() {
			if (!this.isUsernameValid || !this.isRoomValid) {
				return
			}

			const room = this.room.trim()
			const username = this.username.trim()

			const res = await fetch(
				`/api/livekit/roomCheck?roomName=${room}&username=${username}`,
				{
					method: "GET"
				}
			)

			if (!res.ok) {
				await this.showError(
					"Network Error",
					"Error occured while checking if server exist."
				)
				return
			}

			const data = await res.json()

			if (!data.roomExist) {
				await this.showError("Error joining room", "Room does not exist")
				return
			}

			if (!data.usernameAvailable) {
				await this.showError("Error joining room", "Username Taken")
				return
			}

			this.$router.push({
				path: "/room",
				query: {
					username: this.username.trim(),
					room: room,
					isHost: "false"
				}
			})
		},
		async hostRoom() {
			if (!this.room) {
				this.room = foodList[Math.floor(Math.random() * foodList.length)]
			} else {
				// Check if room already exist
				const res = await fetch(
					`/api/livekit/roomCheck?roomName=${this.room.trim()}&username=${this.username.trim()}`,
					{
						method: "GET"
					}
				)

				if (!res.ok) {
					await this.showError(
						"Network Error",
						"Error occured while checking if server exist."
					)
					return
				}

				const data = await res.json()

				if (data.roomExist) {
					await this.showError("Error Creating Room", "Room Already Exist")
					return
				}
			}

			if (!this.username) {
				this.username = foodList[Math.floor(Math.random() * foodList.length)]
			}

			if (!this.isUsernameValid || !this.isRoomValid) {
				return
			}

			this.$router.push({
				path: "/room",
				query: {
					username: this.username.trim(),
					room: this.room.trim(),
					isHost: "true",
					serverSideStreaming: this.serverSideStreaming.toString()
				}
			})
		},
		setUsernameTouched() {
			this.touched.username = true
		},
		setRoomTouched() {
			this.touched.room = true
		}
	}
}
</script>

<template>
	<Toast />
	<Navbar class="absolute left-0 top-0" />
	<div class="flex h-screen items-center justify-center bg-[#82d2e8]">
		<TabView class="shadow-2xl">
			<TabPanel header="Join Room">
				<div
					class="flex h-[350px] w-[500px] flex-col items-center justify-center"
				>
					<form
						v-focustrap
						@submit.prevent="joinRoom"
						class="flex w-3/6 flex-col items-center gap-8 text-white"
					>
						<div class="flex flex-col gap-2">
							<div class="w-full">
								<label for="username">Username</label>
								<InputText
									autofocus
									class="w-full"
									id="joinroom-username"
									v-model="username"
									@focus="setUsernameTouched"
									aria-describedby="username-help"
								/>
								<!-- Validation message for username -->
								<p v-if="showUsernameValidation" class="text-sm text-red-500">
									Username must be between 1 and 30 characters.
								</p>
							</div>
							<div class="w-full">
								<label for="room">Room</label>
								<InputText
									class="w-full"
									id="joinroom-room"
									v-model="room"
									@focus="setRoomTouched"
									aria-describedby="room-help"
								/>
								<!-- Validation message for room -->
								<p v-if="showRoomValidation" class="text-sm text-red-500">
									Room name must be between 1 and 30 characters.
								</p>
							</div>
						</div>
						<!-- Submit button -->
						<Button
							label="Join Room"
							type="submit"
							:disabled="!isUsernameValid || !isRoomValid"
							class="h-12 w-32 cursor-pointer rounded-md bg-[rgb(99,160,177)] text-black"
						/>
					</form>
				</div>
			</TabPanel>
			<TabPanel header="Host Room">
				<div
					class="flex h-[350px] w-[500px] flex-col items-center justify-center"
				>
					<form
						v-focustrap
						@submit.prevent="hostRoom"
						class="flex w-3/6 flex-col items-center gap-4 text-white"
					>
						<div class="flex items-center justify-end gap-2">
							<div>
								Server Side Streaming
								<input type="checkbox" v-model="serverSideStreaming" />
							</div>
						</div>
						<div class="flex flex-col gap-2">
							<div class="w-full">
								<label for="username">Username</label>
								<InputText
									autofocus
									class="w-full"
									id="hostroom-username"
									v-model="username"
									@focus="setUsernameTouched"
									aria-describedby="username-help"
								/>
								<!-- Validation message for username -->
								<p v-if="showUsernameValidation" class="text-sm text-red-500">
									Username must be between 1 and 30 characters.
								</p>
							</div>
							<div class="w-full">
								<label for="room">Room</label>
								<InputText
									class="w-full"
									id="hostroom-room"
									v-model="room"
									@focus="setRoomTouched"
									aria-describedby="room-help"
								/>
								<!-- Validation message for room -->
								<p v-if="showRoomValidation" class="text-sm text-red-500">
									Room name must be between 1 and 30 characters.
								</p>
							</div>
						</div>
						<Button
							label="Host Room"
							type="submit"
							class="h-12 w-32 cursor-pointer rounded-md bg-[rgb(99,160,177)] text-black"
						/>
					</form>
				</div>
			</TabPanel>
		</TabView>
	</div>
</template>

<style>
/* Ensures the tab headers fill the entire width of the tab panel container */
.p-tabview-nav li {
	width: 100%;
}

.p-tabview-nav li a span {
	width: 100%;
	text-align: center;
}

.p-tabview-nav-content {
	border-top-right-radius: 6px;
	border-top-left-radius: 6px;
	background-color: #1f2937;
}

.p-button-label {
	font-weight: 400;
}
</style>
