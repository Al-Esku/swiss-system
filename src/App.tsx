import React, {FormEvent} from 'react';
import './App.css';

let nextFencerId = 0;
let nextBoutId = 0;

function App() {
  const [name, setName] = React.useState('')
  const [table, setTable] = React.useState<fencer[]>([])
  const [fencers, setFencers] = React.useState<fencer[]>([])
  const [bye, setBye] = React.useState<fencer>()
  const [bouts, setBouts] = React.useState<bout[]>([])
  const [rounds, setRounds] = React.useState(1)
  const [started, setStarted] = React.useState(false)
  const [indexOpen, setIndexOpen] = React.useState(-1)

  const randomSeed = () => {
      if (fencers.length >= 2) {
          let optimal: individual = {bouts: [], cost: Infinity, bye:undefined}
          for (let i = 0; i <= 10000; i++) {
              let newFencers = fencers.map(fencer => {
                  return {
                      ...fencer,
                      seed: Math.random()
                  }
              });
              newFencers.sort(function (a, b) {
                  return b.seed - a.seed
              });
              let bye
              if (newFencers.length % 2 !== 0) {
                  bye = newFencers.pop()
              }
              if (i < 1000) {
                  newFencers.sort(function (a, b) {
                      return b.points - a.points
                  });
              }
              let newBouts: bout[] = [];
              for (let i = 0; i < newFencers.length; i= i+2) {
                  newBouts.push({id: nextBoutId++,
                      fencer1:newFencers[i],
                      fencer2:newFencers[i+1],
                      winner:0,
                      cost: newFencers[i].results.some(result => result.opponent === newFencers[i+1].id) ? Math.abs(newFencers[i].points - newFencers[i+1].points) > 1 ? Math.abs(newFencers[i].points - newFencers[i+1].points) + 0.5 : 1.5 : Math.abs(newFencers[i].points - newFencers[i+1].points)})
              }
              let cost = 0
              if (bye && Math.floor( (rounds - 1) / fencers.length) !== bye.byes) {
                  cost += 1000
              }
              newBouts.forEach((bout) => {
                  cost += bout.cost
              })
              if (cost < optimal.cost) {
                  optimal.bouts = newBouts
                  optimal.cost = cost
                  if (bye) {
                      optimal.bye = bye
                  }
              }
          }
          setBouts(optimal.bouts);
          if (optimal.bye) {
              setBye(optimal.bye)
          }
          setStarted(true);
      }
  }

  const endRound = (event: FormEvent) => {
      event.preventDefault();
      setRounds(rounds + 1)
      setStarted(false);
      let updatedFencers: fencer[] = []
      let updatedTable: fencer[] = []
      bouts.forEach((bout) => {
          fencers.forEach((fencer) => {
              if (fencer.id === bout.fencer1.id || fencer.id === bout.fencer2.id) {
                  updatedFencers.push({
                      ...fencer,
                      points: fencer.points + (fencer.id === bout.winner ? 1 : 0),
                      results: [
                          ...fencer.results,
                          {opponent: (fencer.id === bout.fencer1.id ? bout.fencer2.id : bout.fencer1.id),
                              victory: bout.winner === fencer.id}
                      ]
                  })
              }
          })
          table.forEach((fencer) => {
              if (fencer.id === bout.fencer1.id || fencer.id === bout.fencer2.id) {
                  updatedTable.push({
                      ...fencer,
                      points: fencer.points + (fencer.id === bout.winner ? 1 : 0),
                      results: [
                          ...fencer.results,
                          {opponent: (fencer.id === bout.fencer1.id ? bout.fencer2.id : bout.fencer1.id),
                              victory: bout.winner === fencer.id}
                      ]
                  })
              }
          })
      })
      if (bye) {
          bye.points += 1
          bye.byes += 1
          updatedFencers.push(bye)
          updatedTable.push(bye)
      }
      setBye(undefined)
      updatedTable = updatedTable.map((fencer) => {
          return {
              ...fencer,
              strengthOfSchedule: (() => {
                  let sum = 0
                  fencer.results.forEach((result) => {
                      updatedTable.forEach((opponentFencer) => {
                          if (opponentFencer.id === result.opponent) {
                              sum += opponentFencer.points
                          }
                      })
                  })
                  return sum
              })(),
              strengthOfVictory: (() => {
                  let sum = 0
                  fencer.results.forEach((result) => {
                      updatedTable.forEach((opponentFencer) => {
                          if (opponentFencer.id === result.opponent && result.victory) {
                              sum += opponentFencer.points
                          }
                      })
                  })
                  return sum
              })()
          }
      })
      updatedTable.sort(function (a, b) {
          if (b.points !== a.points){
              return b.points - a.points
          } else if (b.strengthOfSchedule !== a.strengthOfSchedule) {
              return b.strengthOfSchedule - a.strengthOfSchedule
          } else {
              return b.strengthOfVictory - a.strengthOfVictory
          }
      });
      let count = 1
      updatedTable = updatedTable.map(fencer => {
          return {
              ...fencer,
              rank: count++
          }
      })
      setFencers(updatedFencers)
      setTable(updatedTable)
      setBouts([])
  }

  const updateBout = (id: number, winner: number) => {
      const newBouts = bouts.map(bout => {
          if (bout.id === id) {
              return {
                  ...bout,
                  winner: winner
              }
          } else {
              return bout
          }
      })
      setBouts(newBouts)
  }

  const removeFencer = (id: number) => {
      let newFencers = fencers.filter(fencer => fencer.id !== id)
      let newTable = table.filter(fencer => fencer.id !== id)
      let count = 1
      newTable = newTable.map(fencer => {
          return {
              ...fencer,
              rank: count++
          }
      })
      setFencers(newFencers)
      setTable(newTable)
  }

  const resetPairings = () => {
      let newFencers = fencers.map((fencer) => {
          return {
              ...fencer,
              points: 0,
              results: []
          }
      })
      setFencers(newFencers)
  }

  return (
    <div className={"grid grid-cols-2"}>

        <div className={"m-8"}>
            <form onSubmit={(event) => {
                event.preventDefault();
                if (name !== "") {
                    setFencers(
                        [
                            ...fencers,
                            {id: nextFencerId,
                                name: name,
                                seed: 0,
                                points: 0,
                                rank: (fencers.length + 1),
                                results: [],
                                strengthOfSchedule: 0,
                                strengthOfVictory: 0,
                                byes: 0}
                        ]
                    );
                    setTable(
                        [
                            ...table,
                            {id: nextFencerId++,
                                name: name,
                                seed: 0,
                                points: 0,
                                rank: (table.length + 1),
                                results: [],
                                strengthOfSchedule: 0,
                                strengthOfVictory: 0,
                                byes: 0}
                        ]
                    );
                    setName("");
                }
            }}>
                <div className={"w-full"}>
                    <input
                        type={"text"}
                        className={"border rounded w-1/2"}
                        value={name}
                        onChange={e => {
                            setName(e.target.value)}
                        }
                    />
                    <button type={"submit"} className={"border rounded px-2 ml-2"}>Add</button>
                </div>
            </form>
            {table.length > 0 ?
                <>
                    <table className={"mt-8"}>
                        <thead>
                        <tr>
                            <th className={"w-8"}></th>
                            <th className={"w-48"}>Name</th>
                            <th className={"w-20"}>Points</th>
                            <th className={"w-20"}>SoS*</th>
                            <th className={"w-20"}>SoV**</th>
                            <th></th>
                        </tr>
                        </thead>
                        {table.map(((fencer, index) => (
                            <tbody className={"border border-black m-2"}>
                            <tr className={
                                fencer.points === 0 ? "bg-red-400" :
                                    fencer.points === 1 ? "bg-yellow-200" :
                                        fencer.points === 2 ? "bg-green-300" :
                                            fencer.points === 3 ? "bg-blue-400" :
                                                fencer.points === 4 ? "bg-purple-400" : "bg-amber-300"}>
                                <td className={"border-black border-r"} onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>{fencer.rank}.</td>
                                <td className={"pl-2"} onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>{fencer.name}</td>
                                <td className={"font-semibold text-center border-black border-l"} onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>{fencer.points}</td>
                                <td className={"text-center border-black border-l"} onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>{fencer.strengthOfSchedule}</td>
                                <td className={"text-center border-black border-l"} onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>{fencer.strengthOfVictory}</td>
                                <td className={"items-center border-black border-l"}>
                                    <a className={"hover:cursor-pointer"} onClick={() => removeFencer(fencer.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                             strokeWidth={1.5} stroke="red" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </a>
                                </td>
                            </tr>
                            {index === indexOpen && <tr className={
                                fencer.points === 0 ? "bg-red-400" :
                                    fencer.points === 1 ? "bg-yellow-200" :
                                        fencer.points === 2 ? "bg-green-300" :
                                            fencer.points === 3 ? "bg-blue-400" :
                                                fencer.points === 4 ? "bg-purple-400" : "bg-amber-300"}>
                                <td className={"pl-2 border-black border-t"} colSpan={6}>{fencer.results.map((result) => {
                                    return <div>vs {
                                        (() => {
                                            const opponent = table.find(fencer => fencer.id === result.opponent)
                                            return opponent ? opponent.name : "[Removed]"
                                        })()
                                        }: {result.victory ? "V": "D"}</div>
                                })}</td>
                            </tr>}
                            </tbody>
                        )))}
                    </table>
                    <p className={"my-2 italic w-1/3 text-xs"}>* First Tiebreaker: Strength of Schedule, the sum of
                        points scored by your opponents</p>
                    <p className={"my-2 italic w-1/3 text-xs"}>** Second Tiebreaker: Strength of Victory, the sum of
                        points scored by people you beat</p>
                    <button onClick={randomSeed}
                            className={"border rounded px-2 mt-2"}>{started ? "Shuffle Bouts" : "Start Round"}</button>
                    <button onClick={resetPairings}
                            className={"border rounded px-2 mt-2 ml-2"}>Reset Pairings
                    </button>
                </> : ""}
        </div>
        <div>
            {started ? <p className={"mt-8 font-semibold"}>Round {rounds} Bouts</p> : ""}
            <form id={"roundForm"} onSubmit={endRound} className={"m-2"}>
                {bouts.map(bout => (
                    <div className={"p-4"}>
                        <div className={"inline-block w-1/3 mr-4"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer1.id}
                                   id={bout.fencer1.id.toString()} name={bout.id.toString()} required
                                   onClick={() => updateBout(bout.id, bout.fencer1.id)}></input>
                            <label htmlFor={bout.fencer1.id.toString()}
                                   className={"p-8 flex w-full rounded border border-1 peer-checked:border-black peer-checked:font-semibold"}>{bout.fencer1.name + " "}</label>
                        </div>
                        vs
                        <div className={"inline-block w-1/3 ml-4"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer2.id} id={bout.fencer2.id.toString()} name={bout.id.toString()} onClick={() => updateBout(bout.id, bout.fencer2.id)}></input>
                            <label htmlFor={bout.fencer2.id.toString()} className={"p-8 flex w-full rounded border border-1 peer-checked:border-black peer-checked:font-semibold"}>{" " + bout.fencer2.name}</label>
                        </div>
                    </div>
                ))}
                {started && bye ? <p>Bye: {bye.name}</p>: ""}
                {started ? <button type={"submit"} className={"border rounded px-2 mt-2"}>End Round</button> : ""}
            </form>
        </div>
    </div>
  );
}

export default App;
