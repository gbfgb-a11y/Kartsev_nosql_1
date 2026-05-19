// 1
// 'COLLSAN'
db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats")

//IXSCAN
db.tracks.createIndex({
  track_genre: 1,
  "audio_features.danceability": 1,
  popularity: -1
})

db.tracks.find({
  track_genre: "pop",
  "audio_features.danceability": { $gte: 0.7 }
}).sort({ popularity: -1 }).explain("executionStats") 

// COLLSCAN -> full scan -> wait long
//IXSCAN -> INDEX SCAN -> wait fast
// Чим більша частина запиту покривается інедксом тим швидшим буде запит, але є обмеження так як
// Індекси знаходяться в RAM їх використання не завжди є виправданним.

// 2
db.tracks.createIndex({
    "audio_features.instrumentalness": 1,
    "audio_features.speechiness": 1,
    "explicit": 1
})

db.tracks.find({
    $and:[
    {"audio_features.instrumentalness": {$gte:0.05}},
    {"audio_features.speechiness": {$gte: 0.1}},
    {"explicit": true}
    ]
}).explain("executionStats")
 //  nReturned: 452 |  totalDocsExamined: 452