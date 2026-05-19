//1

db.tracks.aggregate([
    {$unwind: '$artists'},

    {$group:{
        _id: '$artists',
        trackscount: {$sum:1},
        avgpopularity: {$avg:'$popularity'}
    }},

    {$match:{
        trackscount:{$gte:5}
    }},

    {$project:{
        _id:1,
        trackscount:1,
        avgpopularity:{$round:['$avgpopularity', 1]}
    }},

    {$sort:{avgpopularity:-1}},
    
    {$limit:10}
])

//2

db.tracks.aggregate([
    {$addFields: {
      mood: {
        $switch: {
          branches: [
            { case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, then: "happy" },
            { case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $gte: ["$audio_features.energy", 0.5] } ] }, then: "angry" },
            { case: { $and: [ { $gte: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, then: "calm" },
            { case: { $and: [ { $lt: ["$audio_features.valence", 0.5] }, { $lt: ["$audio_features.energy", 0.5] } ] }, then: "sad" }
          ],
          default: "unknown"
        }
      }
    }
  },

  {$project:{
    _id:0,
    track_name:1,
    mood:1
  }}
])

//3

db.tracks.aggregate([
    {$unwind: '$track_genre'},

    {$group:{
        _id: '$track_genre',
        trackscount:{$sum:1},
        avgdanceability: {$avg:'$audio_features.danceability'},
        avgenergy: {$avg:'$audio_features.energy'},
        avgvalence: {$avg:'$audio_features.valence'}
    }},

    {$project:{
        _id:1,
        track_genre:1,
        avgdanceability:1,
        avgenergy:1,
        avgvalence:1
    }}
])