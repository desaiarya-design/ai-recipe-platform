import arcjet, {
  shield,
  detectBot,
  tokenBucket,
} from "@arcjet/next";


export const aj = arcjet({
    key : process.env.NEXT_PUBLIC_ARCJET_KEY,
    rules:[
        shield({
            mode: "LIVE",
        }),
        detectBot({
            mode:"LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW",
            ]
        })
    ],
});

// free tier pantry scan limits
export const freePantryScans = aj.withRule(
    tokenBucket({
        mode:"LIVE",
        characteristics:["pantry-scan-free"],
        refillRate:10,
        interval:"30d",
        capacity:10,
    })
)

// free trial meals recommendations
export const freeMealRecommendations = aj.withRule(
    tokenBucket({
        mode:"LIVE",
        characteristics:["userId"],
        refillRate:5,
        interval:"30d",
        capacity:5,
    })
)


//pro tier-effective unlimited

//1000 requests per day should be more thatn enough for one user
export const proTierLimit = aj.withRule(
    tokenBucket({
        mode:"LIVE",
        characteristics:["userId"],
        refillRate:1000,
        interval:"1d",
        capacity:1000,
    })
)