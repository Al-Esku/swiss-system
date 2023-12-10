import React, {FormEvent} from 'react';
import './App.css';

let nextFencerId = 0;
let nextBoutId = 0;

function App() {
  const [name, setName] = React.useState('')
  const [fencers, setFencers] = React.useState<fencer[]>([])
  const [bouts, setBouts] = React.useState<bout[]>([])
  const [started, setStarted] = React.useState(false)

  const randomSeed = () => {
      const newFencers = fencers.map(fencer => {
          return {
              ...fencer,
              seed: Math.random()
          }
      });
      newFencers.sort(function (a, b) {
          if (a.points === b.points) {
              return a.seed - b.seed
          } else {
              return a.points - b.points
          }
      });
      newFencers.reverse();
      let newBouts: bout[] = [];
      for (let i = 0; i < newFencers.length; i= i+2) {
          newBouts.push({id: nextBoutId++, fencer1:newFencers[i], fencer2:newFencers[i+1], winner:0})
      }
      setBouts(newBouts);
      setStarted(true);
  }

  const endRound = (event: FormEvent) => {
      event.preventDefault();
      setStarted(false);
      let updatedFencers: fencer[] = []
      bouts.forEach((bout) => {
          fencers.forEach((fencer) => {
              if (fencer.id === bout.fencer1.id || fencer.id === bout.fencer2.id) {
                  updatedFencers.push({
                      ...fencer,
                      points: fencer.points + (fencer.id === bout.winner ? 1 : 0),
                      opponents: [
                          ...fencer.opponents,
                          (fencer.id === bout.fencer1.id ? bout.fencer2.id : bout.fencer1.id)
                      ]
                  })
              }
          })
      })
      updatedFencers = updatedFencers.map((fencer) => {
          return {
              ...fencer,
              strength: (() => {
                  let sum = 0
                  fencer.opponents.forEach((opponent) => {
                      updatedFencers.forEach((opponentFencer) => {
                          if (opponentFencer.id === opponent) {
                              sum += opponentFencer.points
                          }
                      })
                  })
                  return sum
              })()
          }
      })
      updatedFencers.sort(function (a, b) {
          if (b.points !== a.points){
              return b.points - a.points
          } else {
              return b.strength - a.strength
          }
      });
      let count = 1
      updatedFencers = updatedFencers.map(fencer => {
          return {
              ...fencer,
              rank: count++
          }
      })
      setFencers(updatedFencers)
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

  return (
    <div className={"grid grid-cols-2"}>
        <div className={"m-8"}>
            <form onSubmit={(event) => {
                event.preventDefault();
                if (name !== "") {
                    setFencers(
                        [
                            ...fencers,
                            {id: nextFencerId++, name: name, seed: 0, points: 0, rank: nextFencerId, opponents: [], strength:0}
                        ]
                    );
                    setName("");
                }
            }}>
                <div className={"w-full"}>
                    <input
                        type={"text"}
                        className={"border border-1 rounded w-1/2"}
                        value={name}
                        onChange={e => {
                            setName(e.target.value)}
                        }
                    />
                    <button type={"submit"}>Add</button>
                </div>
            </form>
            <table className={"mt-8"}>
                <thead>
                <tr>
                    <th className={"w-8"}></th>
                    <th className={"w-48"}>Name</th>
                    <th className={"w-20"}>Points</th>
                    <th className={"w-20"}>SoO</th>
                </tr>
                </thead>
                {fencers.map(fencer => (
                    <tbody className={"border border-black border-1 m-2"}>
                        <tr className={
                            fencer.points === 0 ? "bg-red-400":
                            fencer.points === 1 ? "bg-yellow-200":
                            fencer.points === 2 ? "bg-green-300":
                            fencer.points === 3 ? "bg-blue-400":
                            fencer.points === 4 ? "bg-purple-400":
                            fencer.points === 5 ? "bg-amber-300": ""}>
                            <td className={"border border-black border-r-1"}>{fencer.rank}.</td>
                            <td className={"pl-2"}>{fencer.name}</td>
                            <td className={"font-semibold text-center border border-black border-l-1"}>{fencer.points}</td>
                            <td className={"text-center border border-black border-l-1"}>{fencer.strength}</td>
                        </tr>
                    </tbody>
                ))}
            </table>
            {started ? "" : <button onClick={randomSeed}>Start Round</button>}
        </div>
        <div>
            <p className={"mt-8 font-semibold"}>Bouts</p>
            <form id={"roundForm"} onSubmit={endRound} className={"m-2"}>
                {bouts.map(bout => (
                    <div className={"p-4"}>
                        <div className={"inline-block w-1/3 mr-4"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer1.id} id={bout.fencer1.id.toString()} name={bout.id.toString()} required onClick={() => updateBout(bout.id, bout.fencer1.id)}></input>
                            <label htmlFor={bout.fencer1.id.toString()} className={"p-8 flex w-full rounded border border-1 peer-checked:border-black peer-checked:font-semibold"}>{bout.fencer1.name + " "}</label>
                        </div>
                        vs
                        <div className={"inline-block w-1/3 ml-4"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer2.id} id={bout.fencer2.id.toString()} name={bout.id.toString()} onClick={() => updateBout(bout.id, bout.fencer2.id)}></input>
                            <label htmlFor={bout.fencer2.id.toString()} className={"p-8 flex w-full rounded border border-1 peer-checked:border-black peer-checked:font-semibold"}>{" " + bout.fencer2.name}</label>
                        </div>
                    </div>
                ))}
                {started ? <button type={"submit"}>End Round</button> : ""}
            </form>
        </div>
    </div>
  );
}

export default App;
