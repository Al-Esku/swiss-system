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
      let winners: number[] = []
      bouts.forEach((bout) => {
          winners.push(bout.winner)
      })
      let updatedFencers = fencers.map(fencer => {
          if (winners.includes(fencer.id)) {
              return {
                  ...fencer,
                  points: fencer.points + 1
              }
          } else {
              return fencer
          }
      })
      updatedFencers.sort(function (a, b) {
          return b.points - a.points
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
    <>
        <form onSubmit={(event) => {
            event.preventDefault();
            if (name != "") {
                setFencers(
                    [
                        ...fencers,
                        {id: nextFencerId++, name: name, seed: 0, points: 0, rank:nextFencerId}
                    ]
                );
                setName("");
            }
        }}>
            <input
                type={"text"}
                className={"border border-1 rounded m-4"}
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
              </tr>
          </thead>
        {fencers.map(fencer => (
            <tbody>
                <tr>
                    <td>{fencer.rank}.</td>
                    <td>{fencer.name}</td>
                    <td>{fencer.points}</td>
                </tr>
            </tbody>
        ))}
      </table>
      {started ? "" : <button onClick={randomSeed}>Start Round</button>}
        <form id={"roundForm"} onSubmit={endRound}>
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
    </>
  );
}

export default App;
