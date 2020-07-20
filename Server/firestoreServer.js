const admin = require('firebase-admin');
let serviceAccount = require('../keys/rabbit-rambo-f2b9de93ee6e.json');

// contains all the interaction with the firebase server, that stores the results of the games played
class FirestoreServer {
  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    this.db = admin.firestore();
    this.teamCollection = this.db.collection('team');
    this.time = admin.firestore.Timestamp;
    this.topTen = [];
  }

  // adds a given score to firebase, contains all the relevant info to rank different games
  addScore = (namePlayerOne, namePlayerTwo, score, killedEnemies, round, level, id) => {
    this.teamCollection.add({
      playerOneName: namePlayerOne,
      playerTwoName: namePlayerTwo,
      score: score,
      killedEnemies: killedEnemies,
      round: round,
      level: level,
      id: id,
      time: this.time.now()
    }).then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
  }

  // returnes the top x games as a promise, when x is provided 
  getTopX = (x) => {
    let query = this.teamCollection.orderBy('score', 'desc').limit(x).get()
    return query;
  }
}

module.exports = FirestoreServer;