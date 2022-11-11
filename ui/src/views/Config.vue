<template>
    <div class="container" style="width: 50%">
        <b-overlay :show="busy" rounded="sm">
            <b-card class="my-5" style="max-width: 40rem;" bg-variant="light">
                <b-form-group label-cols-lg="3" label="Config Settings" label-size="lg"
                    label-class="font-weight-bold pt-0" class="mb-0">
                    <b-form>
                        <b-form-group id='input-group-number-of-deck' label='Total Number of Card Decks'
                            description='Please enter a postive integer'>
                            <b-form-input id='input-for-number-of-deck' size="lg"
                                v-model.number="deckNumber">
                            </b-form-input>
                        </b-form-group>

                        <b-form-group id='input-group-rank-limit' label='Rank Limit'
                            description='Please enter a positive integer'>
                            <b-form-input id='input-for-rank-limit' size="lg"
                                v-model.number="rankLimit">
                            </b-form-input>
                        </b-form-group>

                        <b-button variant="success" @click="updateConfig">Update</b-button>
                        <b-button class='mx-2' variant="secondary" type='reset'>Reset</b-button>
                    </b-form>
                </b-form-group>
            </b-card>
        </b-overlay>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { io } from "socket.io-client"

const socket = io()
const deckNumber = ref(-1)
const rankLimit = ref(-2)
const busy = ref(false)

onMounted(() => {
    socket.emit("get-config")
})

socket.on('get-config-reply', (config) => {
    deckNumber.value = config.deckNumber
    rankLimit.value = config.rankLimit
})

async function updateConfig() {
    socket.emit('update-config', { deckNumber: deckNumber.value, rankLimit: rankLimit.value })
    busy.value = true

    let result = await new Promise((resolve, reject) => {
        socket.on('update-config-reply', (result) => {
            resolve(result)
        })
    })
    busy.value = false
}
</script>