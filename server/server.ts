import http from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card, haveOneOrLessCard, Config } from "./model"

const server = http.createServer()
const io = new Server(server)
const port = 8091

let config: Config = {
  deckNumber: 2,
  rankLimit: 13
}

let gameState = createEmptyGame(["player1", "player2"], config.deckNumber, config.rankLimit)

function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter(card => card.locationType !== "unused")
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards",
      updatedCardsFromPlayerPerspective,
    )
  })
}

io.on('connection', client => {
  function emitGameState() {
    client.emit(
      "game-state",
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      haveOneOrLessCard(gameState)
    )
  }

  console.log("New client")
  let playerIndex: number | null | "all" = null
  client.on('player-index', n => {
    playerIndex = n
    console.log("playerIndex set", n)
    client.join(String(n))
    if (typeof playerIndex === "number") {
      client.emit(
        "all-cards",
        filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
      )
    } else {
      client.emit(
        "all-cards",
        Object.values(gameState.cardsById),
      )
    }
    emitGameState()
  })

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards",
      Object.values(gameState.cardsById),
    )
    io.emit(
      "game-state",
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      haveOneOrLessCard(gameState)
    )
  })

  client.on("new-game", () => {
    gameState = createEmptyGame(gameState.playerNames, config.deckNumber, config.rankLimit)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards",
      updatedCards,
    )
    emitGameState()
  })

  // Step7
  client.on('get-config', () => {
    io.emit(
      'get-config-reply',
      config
    )
  })

  client.on("update-config", (customizeConfig: Config) => {
    let deckNum = customizeConfig?.deckNumber
    let rankLim = customizeConfig?.rankLimit
    let customization = Object.keys(customizeConfig)

    if (typeof deckNum !== 'number' || typeof rankLim !== 'number' || customization.length !== 2) {
      client.emit(
        'update-config-reply', false
      )
    }
    else {
      config.deckNumber = deckNum
      config.rankLimit = rankLim
      setTimeout(() => io.emit(
        'update-config-reply', true
      ), 2000)
    }
  })
})

server.listen(port)
console.log(`Game server listening on port ${port}`)
