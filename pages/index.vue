<template>
	<div class="flex h-screen items-center justify-center bg-green-600">
		<TabView>
			<TabPanel header="Join Room">
				<div
					class="flex h-[350px] w-[500px] flex-col items-center justify-center gap-4"
				>
					<form
						v-focustrap
						@submit.prevent="joinRoom"
						class="flex w-3/6 flex-col items-center gap-2 text-white"
					>
						<div class="w-full">
							<label for="username">Username</label>
							<InputText
								autofocus
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
			</TabPanel>
			<TabPanel header="Host Room">
				<div
					class="flex h-[350px] w-[500px] flex-col items-center justify-center gap-4"
				>
					<form
						v-focustrap
						@submit.prevent="hostRoom"
						class="flex w-3/6 flex-col items-center gap-2 text-white"
					>
						<div class="w-full">
							<label for="username">Username</label>
							<InputText
								autofocus
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
							value="Host Room"
							class="h-12 w-32 cursor-pointer rounded-md bg-green-600 text-white"
						/>
					</form>
				</div>
			</TabPanel>
		</TabView>
	</div>
</template>

<script>
import InputText from "primevue/inputtext"
import TabView from "primevue/tabview"
import TabPanel from "primevue/tabpanel"

const foodList = [
	"apple",
	"mango",
	"olive",
	"lemon",
	"peach",
	"berry",
	"chard",
	"dates",
	"grape",
	"melon",
	"guava",
	"onion",
	"chili",
	"sushi",
	"bread",
	"pasta",
	"lychee",
	"bagel",
	"bacon",
	"trout",
	"steak",
	"fries",
	"herbs",
	"honey",
	"kiwi",
	"prune",
	"squid",
	"tofu",
	"wheat",
	"basil",
	"curry",
	"thyme",
	"beans",
	"cream",
	"patty",
	"jelly",
	"pizza",
	"salad",
	"rices",
	"maize",
	"pears",
	"plums",
	"cocoa",
	"limes",
	"yeast",
	"seeds",
	"chips",
	"salsa",
	"cakes",
	"mints",
	"wafer",
	"broth",
	"stews",
	"soups",
	"syrup",
	"tarts",
	"rolls",
	"romesco",
	"tapas",
	"kabob",
	"naans",
	"tacos",
	"nacho",
	"queso",
	"vegan",
	"meat",
	"fruit",
	"spice",
	"scone",
	"latte",
	"juice",
	"pepsi",
	"water",
	"wines",
	"beers",
	"toast",
	"cider",
	"pesto",
	"sauce",
	"cheese",
	"pumpkin",
	"pho",
	"pepper",
	"paprika",
	"brownie",
]

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
				query: {
					username: this.username.trim(),
					room: this.room.trim(),
					isHost: false,
				},
			})
		},
		hostRoom() {
			if (!this.room) {
				this.room = foodList[Math.floor(Math.random() * foodList.length)]
			}

			if (!this.username) {
				this.username = foodList[Math.floor(Math.random() * foodList.length)]
			}
			this.attemptedToJoin = true
			if (!this.isUsernameValid || !this.isRoomValid) {
				alert(
					"Both username and room name must be between 1 and 30 characters.",
				)
				return
			}
			this.$router.push({
				path: "/room",
				query: {
					username: this.username.trim(),
					room: this.room.trim(),
					isHost: true,
				},
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

<style>
/* Ensures the tab headers fill the entire width of the tab panel container */
.p-tabview .p-tabview-nav li {
	width: 50%; /* As you have two tabs, setting each tab's width to 50% */
	flex: 1 1 0%; /* Use flexbox to make tabs flexible and evenly distributed */
	text-align: center; /* Optional: Center the tab titles */
}
</style>
