<template>
    <b-col v-if="card.locationType === 'player-hand'" class="mx-2 mb-2">
        <b-card :bg-variant="areCompatible(card, lastCard) ? 'success' : 'secondary'" style="height: 120px;"
            @click="selectCard(card.id)">
            {{card.suit + ' ' + card.rank}}
        </b-card>
    </b-col>
    <b-col v-else-if="card.locationType === 'last-card-played'" class="mx-2 mb-2">
        <b-card style="height: 120px;" bg-variant="danger" @click="selectCard(card.id)">
            {{card.suit + ' ' + card.rank}}
        </b-card>
    </b-col>
</template>

<script setup lang = "ts">
import { Card, CardId, areCompatible, getLastPlayedCard } from "../../../server/model"

// props
interface Props {
    card?: Card
    lastCard?: Card
    myTurn: boolean
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
    card: undefined,
    lastCard: undefined,
    myTurn: true
})

// events: check whether this card can be played
const emit = defineEmits<{
    (e: 'select', cardId: CardId): void
}>()

function selectCard(cardId: CardId) {
    emit('select', cardId)
}
</script>