<template>
	<div class="flex h-screen items-center justify-center bg-green-600">
		<div
			class="flex h-[500px] w-[650px] flex-col items-center justify-center gap-4 rounded-2xl bg-black shadow-2xl"
		>
			<!-- Wrap the input fields and submit button in a <form> element -->
			<form
				v-focustrap
				@submit.prevent="joinRoom"
				class="flex w-3/6 flex-col items-center gap-2 text-white"
			>
				<div class="w-full">
					<label for="username">Username</label>
					<InputText
						class="w-full"
						id="username"
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
						id="room"
						v-model="room"
						@focus="setRoomTouched"
						aria-describedby="room-help"
					/>
					<!-- Validation message for room -->
					<p v-if="showRoomValidation" class="text-sm text-red-500">
						Room name must be between 1 and 30 characters.
					</p>
				</div>

				<!-- Submit button -->
				<input
					type="submit"
					value="Join Room"
					class="h-12 w-32 cursor-pointer rounded-md bg-green-600 text-white"
				/>
			</form>
		</div>
	</div>
</template>

<script>
import InputText from "primevue/inputtext"

export default {
	components: {
		InputText,
	},
	data() {
		return {
			username: "",
			room: "",
			touched: {
				username: false,
				room: false,
			},
			attemptedToJoin: false, // Flag for tracking form submission attempt
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
			return (
				(this.touched.username || this.attemptedToJoin) && !this.isUsernameValid
			)
		},
		showRoomValidation() {
			return (this.touched.room || this.attemptedToJoin) && !this.isRoomValid
		},
	},
	methods: {
		joinRoom() {
			this.attemptedToJoin = true // Set the flag to true to indicate an attempt to submit
			if (!this.isUsernameValid || !this.isRoomValid) {
				alert(
					"Both username and room name must be between 1 and 30 characters.",
				)
				return
			}
			this.$router.push({
				path: "/room",
				query: { username: this.username.trim(), room: this.room.trim() },
			})
		},
		setUsernameTouched() {
			this.touched.username = true
		},
		setRoomTouched() {
			this.touched.room = true
		},
	},
}
</script>
