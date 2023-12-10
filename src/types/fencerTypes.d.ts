type fencer = {
    id: number,
    name: string,
    seed: number,
    points: number,
    rank: number,
    opponents: number[],
    strength: number,
    byes: number
}

type bout = {
    id: number,
    fencer1: fencer,
    fencer2: fencer,
    winner: number
}