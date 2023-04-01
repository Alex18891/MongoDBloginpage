const mongoose = require("mongoose");

const FilmDetailsScehma = new mongoose.Schema(
    {
        status:String,
        belongs_to_collection:String,
        overview: String,
        popularity:String,
        production_companies:String,
        release_date:String,
        title: String,
        vote_average:String,
        vote_count:String,
        poster_path:String,
        genres:String,
        homepage:String,
        tagline:String,
        video:Boolean,
    },
    {
        collection: "Filminfo",
    }
);

mongoose.model("Filminfo",FilmDetailsScehma);