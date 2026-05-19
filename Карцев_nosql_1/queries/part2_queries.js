// 1
db.tracks.find({
    $and: [{'audio_features.danceability':{$gte:0.7},
    'audio_features.energy':{$gte:0.7},
    duration_ms:{$gte:180000}, 
    duration_ms:{$lte:300000}
}]})

//2
db.tracks.aggregate([
    {$unwind: '$artists'},

    {$group:{
        _id: '$artists',
        trackcount: {$sum:1},
        minpopularity:{$min:'$popularity'},
        avgpopularity:{$avg:'$popularity'}
    }},

    {$match:{
        trackcount:{$gte:3},
        minpopularity:{$gte:60}
    }},

    {$project:{
        _id: 0,
        artist: '$_id',
        trackcount: 1,
        minpopularity: 1,
        avgpopularity: {$round:['$avgpopularity', 1]}
    }},

    {$sort: {avgpopularity:-1}},
    {$limit: 20}
])

//3
db.tracks.aggregate([
  {
    $group: {
      _id: "$track_genre",
      avg_tempo: { $avg: "$audio_features.tempo" },
      stdDev_tempo: { $stdDevPop: "$audio_features.tempo" }
    }
  },
  {
    $addFields: {
      outlier_threshold: { $add: ["$avg_tempo", { $multiply: [2, "$stdDev_tempo"] }] }
    }
  },
  {
    $lookup: {
      from: "tracks",
      let: { genre: "$_id", threshold: "$outlier_threshold" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$track_genre", "$$genre"] },
                { $gt: ["$audio_features.tempo", "$$threshold"] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            track_name: 1,
            popularity: 1,
            artists: 1,
            "audio_features.tempo": 1
          }
        }
      ],
      as: "outlier_tracks"
    }
  },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      avg_tempo: { $round: ["$avg_tempo", 1] },
      outlier_threshold: { $round: ["$outlier_threshold", 1] },
      outlier_tracks: 1
    }
  }
])

//4

db.tracks.aggregate([
  {
    $match: {
      "audio_features.loudness": { $lt: -10 },
      "audio_features.speechiness": { $lt: 0.1 },
      "audio_features.instrumentalness": { $gt: 0.5 },
      explicit: false
    }
  },
  {
    $project: {
      track_name: 1,
      track_genre: 1,
      loudness: "$audio_features.loudness",
      speechiness: "$audio_features.speechiness",
      instrumentalness: "$audio_features.instrumentalness"
    }
  }
])