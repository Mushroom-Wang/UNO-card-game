<template>
  <div>
    <b-row>
      <div class="mx-4 mb-4 center">
        <b-badge :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex }}</b-badge>
      </div>
      <div class="mx-4 mb-4 center">
        <b-badge variant="info" size="sm">Players have 1 card or less: {{haveOneOrLessCardArrary}}</b-badge>
      </div>
      <div class="mx-4 mb-4 center">
        <b-badge>{{ phase }}</b-badge>
      </div>
    </b-row>
    <b-row>
      <div class="mx-4 mb-4 center">
        <b-badge pill variant="secondary">NOT Legal Play</b-badge>
      </div>
      <div class="mx-4 mb-4 center">
        <b-badge pill variant="success">You Can Play</b-badge>
      </div>
      <div class="mx-4 mb-4 center">
        <b-badge pill variant="danger">Last Played Card</b-badge>
      </div>
    </b-row>
    <b-row>
      <div v-for="card in unPlayedCards" :key="card.id">
        <AnimatedCard :card="card" :lastCard="lastCard" :myTurn="myTurn" @select="playCard" />
      </div>
    </b-row>
    <b-button class="mx-2 my-2" variant="primary" size="sm" @click="socket.emit('new-game')">New Game</b-button>
    <b-button class="mx-2 my-2" variant="success" size="sm" @click="drawCard" :disabled="!myTurn">Draw Card</b-button>
    <b-button class="mx-2 my-2" variant="warning" size="sm" href="/config">Config</b-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, GamePhase, Action, formatCard, CardId } from "../../../server/model"
import AnimatedCard from "../components/AnimatedCard.vue"

// props
interface Props {
  playerIndex?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  playerIndex: "all",
})

const socket = io()
let x = props.playerIndex
let playerIndex: number | "all" = parseInt(x) >= 0 ? parseInt(x) : "all"
console.log("playerIndex", JSON.stringify(playerIndex))
socket.emit("player-index", playerIndex)

const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)
const haveOneOrLessCardList: Ref<number[]> = ref([])

const unPlayedCards = computed(() => cards.value.filter(card => card.locationType != "unused"))
const myTurn = computed(() => currentTurnPlayerIndex.value === playerIndex && phase.value !== "game-over")
const lastCard = computed(() => cards.value.find(card => card.locationType === 'last-card-played'))

const haveOneOrLessCardArrary = computed(() => {
  if (playCount.value <= 5) {
    return 'initial-card-dealing'
  }
  else {
    if (haveOneOrLessCardList.value.length !== 0) {
      return haveOneOrLessCardList.value
    }
    else {
      return 'none'
    }
  }
})

socket.on("all-cards", (allCards: Card[]) => {
  cards.value = allCards
})

socket.on("updated-cards", (updatedCards: Card[]) => {
  applyUpdatedCards(updatedCards)
})

socket.on("game-state", (newCurrentTurnPlayerIndex: number, newPhase: GamePhase, newPlayCount: number, newHaveOneOrLessCardList: number[]) => {
  currentTurnPlayerIndex.value = newCurrentTurnPlayerIndex
  phase.value = newPhase
  playCount.value = newPlayCount
  haveOneOrLessCardList.value = newHaveOneOrLessCardList
  console.log(haveOneOrLessCardList.value)
})

function doAction(action: Action) {
  return new Promise<Card[]>((resolve, reject) => {
    socket.emit("action", action)
    socket.once("updated-cards", (updatedCards: Card[]) => {
      resolve(updatedCards)
    })
  })
}

async function drawCard() {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "draw-card", playerIndex })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function playCard(cardId: CardId) {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "play-card", playerIndex, cardId })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function applyUpdatedCards(updatedCards: Card[]) {
  for (const x of updatedCards) {
    const existingCard = cards.value.find(y => x.id === y.id)
    if (existingCard) {
      Object.assign(existingCard, x)
    } else {
      cards.value.push(x)
    }
  }
}
</script>