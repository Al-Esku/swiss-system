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
                <input
                    type={"text"}
                    className={"border border-1 rounded"}
                    value={name}
                    onChange={e => {
                        setName(e.target.value)}
                    }
                />
                <button type={"submit"}>Add</button>
            </form>
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Points</th>
                    <th>SoO</th>
                </tr>
                </thead>
                {fencers.map(fencer => (
                    <tbody>
                    <tr>
                        <td>{fencer.rank}.</td>
                        <td>{fencer.name}</td>
                        <td>{fencer.points}</td>
                        <td>{fencer.strength}</td>
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
                    <div>
                        <input type='radio' value={bout.fencer1.id} id={bout.fencer1.id.toString()} name={bout.id.toString()} required onClick={() => updateBout(bout.id, bout.fencer1.id)}></input>
                        <label htmlFor={bout.fencer1.id.toString()}>{bout.fencer1.name + " "}</label>
                        vs
                        <label htmlFor={bout.fencer2.id.toString()}>{" " + bout.fencer2.name}</label>
                        <input type='radio' value={bout.fencer2.id} id={bout.fencer2.id.toString()} name={bout.id.toString()} onClick={() => updateBout(bout.id, bout.fencer2.id)}></input>
                    </div>
                ))}
                {started ? <button type={"submit"}>End Round</button> : ""}
            </form>
        </div>
    </div>
  );
}

export default App;
