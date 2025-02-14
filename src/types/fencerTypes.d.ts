type fencer = {
    id: number,
    firstName: string,
    lastName: string,
    gender: string,
    seed: number,
    points: number,
    rank: number,
    results: result[],
    hitsScored: number,
    hitsRecieved: number,
    strengthOfSchedule: number,
    strengthOfVictory: number,
    byes: number,
    removed: boolean
}

type bout = {
    id: number,
    fencer1: fencer,
    fencer2: fencer,
    score1: number|undefined,
    score2: number|undefined,
    winner: number,
    cost: number
}

type result = {
    opponent: number,
    score: number,
    oppScore: number,
    victory: boolean
}

type individual = {
    bouts: bout[],
    bye: undefined|fencer,
    cost: number
}

type fencerForm = {
    firstName: string,
    lastName: string,
    gender: string
}