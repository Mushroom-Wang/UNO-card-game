# Assignment 3: multiplayer card game

## Notes to TA and grader
Please **grade my main branch**. Please ignore the master branch I accidentally created. I'm not authorized to delete a branch in Hanze's repo. Thank you!

## Explanation of my UI
### Badges at the top of page
1. Left: indicates which player is playing
2. Middle: show a list of players have 1 card or less
3. Right: indicates the phase of game
### Card with different colors
1. Gray card: not a legal play
2. Green card: players can play
3. Red card: last played card

### Buttons
1. New Game: start a new game
2. Draw Card: player can draw card
3. Config: adjust the config settings to change the total number of card decks and rank limit
## Original Assignment Instruction
Remember: your app will not run if you do not have two terminals open, one for running the API server (`server/`) and one for the Vue UI (`ui/`).

1. Pull the latest examples repo and copy all the files in the `lecture11-card-game/` directory into your assignment directory. DO NOT COPY OVER THE `.git` DIRECTORY.
2. Create a `ui/src/components/AnimatedCard.vue` component to replace the `<pre>`-based rendering of individual cards. The component needs to use at least one prop and emit at least one event. The component needs to visually differentiate between the last played card vs. player cards, as well as show when a card is not legal to play *without* the user needing to click on it to try playing it. HINT: `import` a helper function from the `server/` directory to do this. 
3. Add an array parameter to the `game-state` event emitted by `server.ts` that includes a list of the players who have only 1 card left in their hand or fewer.
4. Update `Game.vue` to use the information from step 3 to show which players have only 1 or fewer cards left in their hands. You are free to present this in any way you want.
5. Change the game logic on the server side to make aces "wild". In other words, you can always play an ace regardless of the last card played. In addition to providing flexibility to the player playing the ace, it also gives flexibility to the player that plays after the ace, because any card of theirs will also match the ace. 
6. Add 2 new socket.io event handlers to `server.ts` called `get-config` and `update-config` and add a new `interface Config` to `model.ts`. The purpose of this is so that the number of decks of cards and rank limit can be dynamically configured while the server is running. `update-config` should take a single `Config` parameter. In response to the two events, the server should send out two events, `get-config-reply` and `update-config-reply`, respectively. For `update-config-reply`, it should return a single `boolean` parameter that should be `false` if, by using `typeof`-based checks, the supplied `config` does not conform to the needed type or has extra fields. Finally, `update-config-reply` needs to be sent out after waiting 2 seconds after receiving `update-config`. Configuration changes only need to impact new games, not a game already in progress. There is also no need to load/save this configuration on disk. 
7. Add an additional Vue route, `/config`, that shows a page with a form for configuring the number of decks of cards and the rank limit. Create a form similar to that seen in Lecture 9's example, including the labels set up in a way to support accessibility. You'll need to add a `<b-overlay>` component around the form that depends on a reactive variable called `busy` that you set to `true` when the UI is waiting on a `-reply` event to come in via socket.io. (See https://bootstrap-vue.org/docs/components/overlay, though remember that the example code in the `<script>` section is not using `<script setup>` composition API style; define reactive variables using `ref()` as we have discussed in class.) Finally, use the `number` attribute on the `<b-form-input>` to automatically parse the string input into a `number`. Finally, load the configuration from the server when the page loads using `onMounted(() => { /* call to emit get-config goes here */ })`.
8. Record a video demo to share with the instructor/TAs/grader on Panopto. The video needs to include 2 complete games played end to end (have two web browsers positioned side by side), demonstrating the visual features from steps 2, 4, 5, and 7. In between the two games, use the configuration form to change the parameters to something obviously different, so that we can easily see that the configuration setting feature works.
