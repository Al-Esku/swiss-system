type fencer = {
    id: number,
    firstName: string,
    lastName: string,
    gender: string,
    club: string,
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

type round = {
    bouts: bout[],
    bye: undefined|fencer
}

type fencerForm = {
    firstName: string,
    lastName: string,
    gender: string,
    club: string
}

type competition = {
    name: string,
    events: event[]
}

type event = {
    name: string,
    table: fencer[],
    rounds: round[],
    roundNum: number
}

type fileForm = {
    file: File | null,
    hasHeader: boolean
}