import React, {FormEvent} from 'react';
import './App.css';

let nextFencerId = 0;
let nextBoutId = 0;

function App() {
  const [name, setName] = React.useState('')
  const [table, setTable] = React.useState<fencer[]>([])
  const [fencers, setFencers] = React.useState<fencer[]>([])
  const [bye, setBye] = React.useState<fencer>()
  const [bouts, setBouts] = React.useState<bout[][]>([[]])
  const [rounds, setRounds] = React.useState(0)
  const [started, setStarted] = React.useState(false)
  const [indexOpen, setIndexOpen] = React.useState(-1)
  const [printTarget, setPrintTarget] = React.useState<string | null>(null)

  const print = (id: string) => {
      setPrintTarget(id)
      setTimeout(() => {
          window.print()
          setPrintTarget(null)
      }, 100)
  }

  const exportToXML = (filename: string) => {
      const date = new Date()
      const resultData = `
        <!-- Generated by Pīwakawaka Fencing's Swiss Tournament System v${require("../package.json").version} -->
        <CompetitionIndividuelle ID="Swiss" Date="${date.getDate().toString().padStart(2, "0")}.${(date.getMonth()+1).toString().padStart(2, "0")}.${date.getFullYear()}">
            <Tireurs>
                ${table.map(fencer => {
                    return `<Tireur ID="${fencer.id+1}" Nom="${fencer.name}" Prenom="${fencer.name}" Sexe="M" Lateralite="D" Nation="NZL" Club="Piwakawaka Fencing" Classement="${fencer.rank}" Statut="N"></Tireur>`
                }).join(" ")}
            </Tireurs>
            <Phases>
                ${bouts.map((boutArray, index) => {
                    if (boutArray.length > 0) {
                        return `
                            <TourDePoules PhaseID="TourPoules${index+1}" ID="${index+1}" NbDePoules="${boutArray.length}">
                                ${table.map(fencer => {
                                return `<Tireur REF="${fencer.id+1}" RangInitial="${fencer.id + 1}" RangFinal="${fencer.rank}" Statut="Q"></Tireur>`
                            }).join(" ")}
                                ${boutArray.map((bout, boutIndex) => {
                                return `
                                        <Poule ID="${boutIndex + 1}">
                                            <Tireur REF="${bout.fencer1.id+1}" NoDansLaPoule="1" NbVictoires="${bout.winner === bout.fencer1.id ? 1 : 0}" NbMatches="1" TD="${bout.score1}" TR="${bout.score2}"></Tireur>
                                            <Tireur REF="${bout.fencer2.id+1}" NoDansLaPoule="1" NbVictoires="${bout.winner === bout.fencer2.id ? 1 : 0}" NbMatches="1" TD="${bout.score2}" TR="${bout.score1}"></Tireur>
                                            <Match ID="1">
                                                <Tireur REF="${bout.fencer1.id+1}" Score="${bout.score1}" Statut="${bout.winner === bout.fencer1.id ? "V": "D"}"></Tireur>
                                                <Tireur REF="${bout.fencer2.id+1}" Score="${bout.score2}" Statut="${bout.winner === bout.fencer2.id ? "V": "D"}"></Tireur>
                                            </Match>
                                        </Poule>
                                    `
                            }).join(" ")}
                            </TourDePoules>
                        `
                    } else {
                        return ""
                    }
                }).join(" ")}
                
            </Phases>
        </CompetitionIndividuelle>
      `
      let element = document.createElement("a")
      element.setAttribute("href", "data:text/xml;charset=utf-8," + encodeURIComponent(resultData))
      element.setAttribute("download", filename)

      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
  }

  const randomSeed = () => {
      setBye(undefined)
      if (fencers.length >= 2) {
          let round: number
          if (!started) {
              round = rounds + 1
              setRounds(current => current+1)
          } else {
              round = rounds
          }
          let optimal: individual = {bouts: [], cost: Infinity, bye:undefined}
          for (let i = 0; i <= 10000; i++) {
              let newFencers = fencers.filter(fencer => !fencer.removed)
              newFencers = newFencers.map(fencer => {
                  return {
                      ...fencer,
                      seed: Math.random()
                  }
              });
              newFencers.sort(function (a, b) {
                  return b.seed - a.seed
              });
              let newBye
              if (newFencers.length % 2 !== 0) {
                  newBye = newFencers.pop()
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
                      score1:undefined,
                      score2:undefined,
                      winner:-1,
                      cost: newFencers[i].results.some(result => result.opponent === newFencers[i+1].id) ? Math.abs(newFencers[i].points - newFencers[i+1].points) > 1 ? Math.abs(newFencers[i].points - newFencers[i+1].points) + 0.5 : 1.5 : Math.abs(newFencers[i].points - newFencers[i+1].points)})
              }
              let cost = 0
              if (newBye && Math.floor( (rounds - 1) / fencers.length) !== newBye.byes) {
                  cost += 1000
              }
              newBouts.forEach((bout) => {
                  cost += bout.cost
              })
              if (cost < optimal.cost) {
                  optimal.bouts = newBouts
                  optimal.cost = cost
                  if (newBye) {
                      optimal.bye = newBye
                  }
              }
          }
          setBouts((current) => current.map((boutArray, index) => {
              if (index === round - 1) {
                  return optimal.bouts
              } else {
                  return boutArray
              }
          }));
          if (optimal.bye) {
              setBye(optimal.bye)
          }
          setStarted(true);
      }
  }

  const endRound = (event: FormEvent) => {
      event.preventDefault();
      console.log(bouts)
      if (bouts[rounds-1].every((bout) => {
          if (bout.score1 !== undefined && bout.score2 !== undefined) {
              if (bout.winner === bout.fencer1.id) {
                  return bout.score1 >= bout.score2
              } else {
                  return bout.score2 >= bout.score1
              }
          }
          return false
      })) {
          setStarted(false);
          let updatedFencers: fencer[] = []
          let updatedTable: fencer[] = []
          bouts[rounds-1].forEach((bout) => {
              fencers.forEach((fencer) => {
                  if (fencer.id === bout.fencer1.id || fencer.id === bout.fencer2.id) {
                      updatedFencers.push({
                          ...fencer,
                          points: fencer.points + (fencer.id === bout.winner ? 1 : 0),
                          results: [
                              ...fencer.results,
                              {opponent: (fencer.id === bout.fencer1.id ? bout.fencer2.id : bout.fencer1.id),
                                  score: (fencer.id === bout.fencer1.id ? (bout.score1 ? bout.score1 : -1) : (bout.score2 ? bout.score2 : -1)),
                                  oppScore: (fencer.id === bout.fencer1.id ? (bout.score2 ? bout.score2 : -1) : (bout.score1 ? bout.score1 : -1)),
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
                                  score: (fencer.id === bout.fencer1.id ? (bout.score1 !== undefined ? bout.score1 : -1) : (bout.score2 !== undefined ? bout.score2 : -1)),
                                  oppScore: (fencer.id === bout.fencer1.id ? (bout.score2 !== undefined ? bout.score2 : -1) : (bout.score1 !== undefined ? bout.score1 : -1)),
                                  victory: bout.winner === fencer.id}
                          ]
                      })
                  }
              })
          })
          if (bye) {
              let tableBye = table.find(fencer => {
                  return fencer.id === bye.id
              })
              bye.points += 1
              bye.byes += 1
              bye.results = [
                  ...bye.results,
                  {opponent: -1,
                      score: 0,
                      oppScore: 0,
                      victory: true}
              ]
              updatedFencers.push(bye)
              if (tableBye) {
                  tableBye.points += 1
                  tableBye.byes += 1
                  tableBye.results = [
                      ...tableBye.results,
                      {opponent: -1,
                          score: 0,
                          oppScore: 0,
                          victory: true}
                  ]
                  updatedTable.push(tableBye)
              }
          }
          setBye(undefined)
          table.forEach(fencer => {
              if (fencer.removed) {
                  updatedTable.push(fencer)
              }
          })
          updatedTable = updatedTable.map((fencer) => {
              return {
                  ...fencer,
                  hitsScored: (() => {
                      let sum = 0
                      fencer.results.forEach((result) => {
                          sum += result.score
                      })
                      return sum
                  })(),
                  hitsRecieved: (() => {
                      let sum = 0
                      fencer.results.forEach((result) => {
                          sum += result.oppScore
                      })
                      return sum
                  })(),
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
              } else if (b.hitsScored - b.hitsRecieved !== a.hitsScored - a.hitsRecieved) {
                  return (b.hitsScored - b.hitsRecieved) - (a.hitsScored - a.hitsRecieved)
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
          setBouts(current => [...current, []])
      }
  }

  const updateBout = (id: number, winner: number) => {
      const newBouts = bouts[rounds-1].map(bout => {
          if (bout.id === id) {
              return {
                  ...bout,
                  winner: winner
              }
          } else {
              return bout
          }
      })
      setBouts((current) => current.map((boutArray, index) => {
          if (index === rounds-1) {
              return newBouts
          } else {
              return boutArray
          }
      }))
  }

  const updateBoutScore = (id: number, score1: number|undefined, score2: number|undefined) => {
      const newBouts = bouts[rounds-1].map(bout => {
          console.log(0 !== undefined)
          if (bout.id === id) {
              return {
                  ...bout,
                  score1: score1 !== undefined ? score1 : bout.score1,
                  score2: score2 !== undefined ? score2 : bout.score2
              }
          } else {
              return bout
          }
      })
      setBouts((current) => current.map((boutArray, index) => {
          if (index === rounds-1) {
              return newBouts
          } else {
              return boutArray
          }
      }))
  }

  const removeFencer = (id: number) => {
      let newFencers = fencers.map(fencer => {
          if (fencer.id !== id) {
              return fencer
          } else {
              return {
                  ...fencer,
                  removed: true
              }
          }
      })
      let newTable = table.map(fencer => {
          if (fencer.id !== id) {
              return fencer
          } else {
              return {
                  ...fencer,
                  removed: true
              }
          }
      })
      /*let count = 1
      newTable = newTable.map(fencer => {
          return {
              ...fencer,
              rank: count++
          }
      })*/
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

  const getColour = (fencer: fencer) => {
      return (fencer.removed ? "opacity-60 " : "") +
          (fencer.points === 0 ? "bg-red-400" :
              fencer.points === 1 ? "bg-yellow-200" :
                  fencer.points === 2 ? "bg-green-300" :
                      fencer.points === 3 ? "bg-blue-400" :
                          fencer.points === 4 ? "bg-purple-400" : "bg-amber-300")
  }

  return (
    <div className={"grid lg:grid-cols-2"}>

        <div className={"m-8"}>
            <form onSubmit={(event) => {
                event.preventDefault();
                if (name !== "") {
                    setFencers(
                        [
                            ...fencers,
                            {
                                id: nextFencerId,
                                name: name,
                                seed: 0,
                                points: 0,
                                rank: (fencers.length + 1),
                                results: [],
                                hitsScored: 0,
                                hitsRecieved: 0,
                                strengthOfSchedule: 0,
                                strengthOfVictory: 0,
                                byes: 0,
                                removed: false
                            }
                        ]
                    );
                    setTable(
                        [
                            ...table,
                            {
                                id: nextFencerId++,
                                name: name,
                                seed: 0,
                                points: 0,
                                rank: (table.length + 1),
                                results: [],
                                hitsScored: 0,
                                hitsRecieved: 0,
                                strengthOfSchedule: 0,
                                strengthOfVictory: 0,
                                byes: 0,
                                removed: false
                            }
                        ]
                    );
                    setName("");
                }
            }}>
                <div className={"w-full print:hidden"}>
                    <input
                        type={"text"}
                        className={"border rounded w-1/2"}
                        value={name}
                        onChange={e => {
                            setName(e.target.value)}
                        }
                    />
                    <button type={"submit"} className={"border rounded px-2 ml-2 print:hidden"}>Add</button>
                </div>
            </form>
            {table.length > 0 ?
                <>
                    <table className={"mt-8" + (printTarget === "table" ? " print-visible" : " print:hidden")}
                           id={"table"}>
                        <thead>
                        <tr>
                            <th className={"w-8"}></th>
                            <th className={"w-48"}>Name</th>
                            <th className={"w-20"}>Points</th>
                            <th className={"w-20"}>HS</th>
                            <th className={"w-20"}>HR</th>
                            <th className={"w-20"}>Indicator</th>
                            <th className={"w-20"}>SoS</th>
                            <th className={"w-20"}>SoV</th>
                            <th className={""}></th>
                        </tr>
                        </thead>
                        {table.map(((fencer, index) => (
                            <tbody className={"border border-black border-solid m-0 bg-gray-500 p-0"}>
                            <tr className={"m-0"}>
                                <td className={"border-black border-r p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer) + " flex justify-center"}>{fencer.rank}.</div>
                                </td>
                                <td className={" p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer) + " pl-2 w-full"}>{fencer.name}</div>
                                </td>
                                <td className={"font-semibold text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.points}</div>
                                </td>
                                <td className={"text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.hitsScored}</div>
                                </td>
                                <td className={"text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.hitsRecieved}</div>
                                </td>
                                <td className={"text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.hitsScored - fencer.hitsRecieved}</div>
                                </td>
                                <td className={"text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.strengthOfSchedule}</div>
                                </td>
                                <td className={"text-center border-black border-l p-0"}
                                    onClick={() => setIndexOpen(index !== indexOpen ? index : -1)}>
                                    <div className={getColour(fencer)}>{fencer.strengthOfVictory}</div>
                                </td>
                                <td className={"items-center border-black border-l p-0 print:hidden print:border-0"}>
                                    <div className={getColour(fencer) + " w-6 h-6"}>
                                        {!fencer.removed &&
                                            <a className={"hover:cursor-pointer"}
                                               onClick={() => removeFencer(fencer.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                     strokeWidth={1.5} stroke="red" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M6 18L18 6M6 6l12 12"/>
                                                </svg>
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                            {index === indexOpen && fencer.results.length > 0 &&
                                <tr className={(fencer.removed ? "opacity-60 " : "") +
                                    (fencer.points === 0 ? "bg-red-400" :
                                        fencer.points === 1 ? "bg-yellow-200" :
                                            fencer.points === 2 ? "bg-green-300" :
                                                fencer.points === 3 ? "bg-blue-400" :
                                                    fencer.points === 4 ? "bg-purple-400" : "bg-amber-300")}>
                                    <td className={"pl-2 border-black border-t"}
                                        colSpan={9}>{fencer.results.map((result) => {
                                        return <div>{result.opponent !== -1 ? `vs ${
                                            (() => {
                                                const opponent = table.find(fencer => fencer.id === result.opponent)
                                                return opponent ? opponent.name : "[Removed]"
                                            })()
                                        }: ${result.victory ? "V" : "D"} ${result.score}-${result.oppScore}` : "[Bye]"}</div>
                                    })}</td>
                                </tr>}
                            </tbody>
                        )))}
                    </table>
                    <p className={"my-2 italic w-1/3 text-xs print:hidden"}>First Tiebreaker: Indicator, your hits
                        scored minus hits recieved</p>
                    <p className={"my-2 italic w-1/3 text-xs print:hidden"}>Second Tiebreaker: Strength of Schedule, the
                        sum of
                        points scored by your opponents</p>
                    <p className={"my-2 italic w-1/3 text-xs print:hidden"}>Third Tiebreaker: Strength of Victory, the
                        sum of
                        points scored by people you beat</p>
                    <div className={"flex"}>
                        <button onClick={() => print("table")} className={"border rounded px-1 mt-2 print:hidden flex"}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="size-6 w-4 h-4 mt-auto mb-auto">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z"/>
                            </svg>
                            <span className={"ml-1 mb-0.5"}>Print Table</span></button>
                        <button onClick={() => exportToXML("results.xml")}
                                className={"border rounded px-2 mt-2 ml-2 print:hidden flex"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 w-4 h-4 mt-auto mb-auto mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                            Export to XML
                        </button>
                    </div>
                    <button onClick={randomSeed}
                            className={"border rounded px-2 mt-6 print:hidden"}>{started ? "Shuffle Bouts" : "Start Round"}</button>
                    <button onClick={resetPairings}
                            className={"border rounded px-2 mt-2 ml-2 print:hidden"}>Reset Pairings
                    </button>
                </> : ""}
        </div>
        <div className={"max-lg:ml-8 " + (printTarget === "bouts" ? "print-visible" : "print:hidden")}>
            {started ? <p className={"mt-8 font-semibold "}>Round {rounds} Bouts</p> : ""}
            <form id={"roundForm"} onSubmit={endRound} className={"m-2 "}>
                {started && rounds > 0 && bouts[rounds - 1].map(bout => (
                    <div className={"p-4 print:w-full"}>
                        <div className={"inline-block w-1/3 mr-4 print:w-2/5"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer1.id}
                                   id={bout.fencer1.id.toString()} name={bout.id.toString()} required
                                   onClick={() => updateBout(bout.id, bout.fencer1.id)} checked={bout.winner === bout.fencer1.id}></input>
                            <label htmlFor={bout.fencer1.id.toString()}
                                   className={"p-8 flex w-full rounded border-2 peer-checked:border-green-600 peer-checked:border-[3px] peer-checked:font-semibold peer-checked:text-green-800 " + (bout.winner !== bout.fencer1.id && bout.winner !== -1 ? "text-red-700 border-red-600" : "")}>{bout.fencer1.name + " "}</label>
                        </div>
                        <input type={"number"} className={"w-8 p-1 justify-items-center border-2 border-black rounded " + (bout.winner !== -1 ? bout.winner === bout.fencer1.id ? "text-green-800 border-green-600 border-[3px]" : "text-red-700 border-red-600" : "")}
                               min={0} id={bout.fencer1.id.toString() + "_score"} style={{marginRight: '4px'}} required value={bout.score1} onInput={(event) => updateBoutScore(bout.id, event.currentTarget.valueAsNumber, undefined)}/>
                        vs
                        <input type={"number"} className={"w-8 p-1 justify-items-center border-2 border-black rounded ml-8 " + (bout.winner !== -1 ? bout.winner === bout.fencer2.id ? "text-green-800 border-green-600 border-[3px]" : "text-red-700 border-red-600" : "")}
                               min={0} id={bout.fencer2.id.toString() + "_score"} style={{marginLeft: '4px'}} required value={bout.score2}  onInput={(event) => updateBoutScore(bout.id, undefined, event.currentTarget.valueAsNumber)}/>
                        <div className={"inline-block w-1/3 ml-4 print:w-2/5"}>
                            <input className={"peer hidden"} type='radio' value={bout.fencer2.id}
                                   id={bout.fencer2.id.toString()} name={bout.id.toString()}
                                   onClick={() => updateBout(bout.id, bout.fencer2.id)} checked={bout.winner === bout.fencer2.id}></input>
                            <label htmlFor={bout.fencer2.id.toString()}
                                   className={"p-8 flex w-full rounded border-2 peer-checked:border-green-600 peer-checked:border-[3px] peer-checked:font-semibold peer-checked:text-green-800 " + (bout.winner !== bout.fencer2.id && bout.winner !== -1 ? "text-red-700 border-red-600" : "")}>{" " + bout.fencer2.name}</label>
                        </div>
                    </div>
                ))}
                {started && bye ? <p>Bye: {bye.name}</p> : ""}
                {started ? <button onClick={() => print("bouts")} className={"border rounded px-1 mt-2 print:hidden flex"}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 w-4 h-4 mt-auto mb-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                    <span className={"ml-1 mb-0.5"}>Print Bouts</span></button> : ""}
                {started ? <button type={"submit"} className={"border rounded px-2 mt-6 print:hidden"}>End Round</button> : ""}
            </form>
        </div>
    </div>
  );
}

export default App;
