type fencer = {
    id: number,
    name: string,
    seed: number,
    points: number,
    rank: number,
    results: result[],
    strengthOfSchedule: number,
    strengthOfVictory: number,
    byes: number
}

type bout = {
    id: number,
    fencer1: fencer,
    fencer2: fencer,
    winner: number,
    cost: number
}

type result = {
    opponent: number,
    victory: boolean
}

type individual = {
    bouts: bout[],
    bye: undefined|fencer,
    cost: number
}