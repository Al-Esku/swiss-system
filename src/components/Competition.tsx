import React, {FormEvent} from 'react';
import '../App.css';
import Event from "./Event";
import * as Dialog from "@radix-ui/react-dialog";
import { v4 as uuidv4 } from "uuid";
import {useParams} from "react-router-dom";

type compProps = {
    client: boolean
}

function Competition(props: compProps) {
    const [competition, setCompetition] = React.useState<competition|null>(null)
    const [activeEvent, setActiveEvent] = React.useState(0)
    const [addEventDialogOpen, setAddEventDialogOpen] = React.useState(false)
    const uuid = React.useRef(useParams().uuid)
    if (!uuid.current) {
        uuid.current = uuidv4()
    }
    const socket = React.useRef<WebSocket>(new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?uuid=${uuid.current}&origin=${!props.client}`));
    socket.current.onclose = () => {
        setTimeout(connect, 1000)
    }

    React.useEffect(() => {
        if (props.client) {
            socket.current.addEventListener("message", (event) => {
                setCompetition(JSON.parse(event.data))
                console.log(event.data)
            })
        }
    }, [])

    React.useEffect(() => {
        if (socket.current.readyState === WebSocket.OPEN && !props.client) {
            console.log("Sending changed competition state")
            socket.current.send(JSON.stringify(competition))
        } else {
            console.log(socket.current.readyState)
        }
    }, [competition])

    function connect() {
        socket.current = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}?uuid=${uuid.current}&origin=${!props.client}`)

        if (props.client) {
            socket.current.addEventListener("message", (event) => {
                setCompetition(JSON.parse(event.data))
                console.log(event.data)
            })
        }

        socket.current.onclose = () => {
            setTimeout(connect, 1000)
        }
    }

    function createCompetition(event: FormEvent) {
        event.preventDefault()
        const name = document.getElementById("compName") as HTMLInputElement
        if (name) {
            setCompetition({name: name.value, events: []})
        }
    }

    function addEvent(event: FormEvent) {
        event.preventDefault()
        const name = document.getElementById("eventName") as HTMLInputElement
        if (name && name.value !== "") {
            setCompetition((current: competition | null) => ({
                name: current?.name ?? "",
                events: [...current?.events ?? [], {
                    name: name.value,
                    table: [],
                    rounds: [{bouts: [], bye: undefined}],
                    roundNum: 0
                }
                ],
            }))
            setAddEventDialogOpen(false)
        }
    }

    return (
        <div>
            {competition === null && <div>
                <div className={"flex w-full justify-center mt-4"}>
                    <div>
                        <p className={"font-bold text-4xl"}>Swiss Competition System</p>
                        <p className={"w-full flex justify-center italic"}>v{require("../../package.json").version}</p>
                    </div>
                </div>
                <div className={"flex w-full justify-center"}>
                    {!props.client && <Dialog.Root>
                        <Dialog.Trigger>
                            <a type={"button"}
                                    className={"border rounded px-2 mt-6 ml-2 print:hidden"}>Start competition
                            </a>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay
                                className={"bg-gray-600 opacity-80 fixed inset-0 z-30"}/>
                            <Dialog.Content
                                className={"fixed top-[50%] left-[50%] z-40 max-h-[100vh] max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"}>
                                <Dialog.Title className={"font-bold text-xl"}>Start Competition</Dialog.Title>
                                <form className={"m-2"} onSubmit={(event) => createCompetition(event)}>
                                    <label htmlFor={"compName"}>Name</label>
                                    <div>
                                        <input
                                            type={"text"}
                                            className={"border rounded w-96 p-1"}
                                            id={"compName"}
                                        />
                                    </div>
                                    <div className={"flex w-full justify-end"}>
                                        <button type={"submit"}
                                                className={"px-2 py-1 rounded border border-green-600 bg-green-300 hover:bg-green-600 hover:text-white mt-4 w-fit"}>Start
                                            Competition
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>}
                </div>
            </div>}
            {competition !== null && <div>
                <div className={"flex w-full justify-center mt-4 print:hidden"}>
                    <p className={"font-bold text-4xl"}>{competition.name}</p>
                </div>
                <div className={"flex w-full overflow-x-scroll mt-4"}>
                    {competition?.events.map(((event, index) => {
                        return <button key={index} className={"border px-2 pb-1 print:hidden min-w-fit " + (index === activeEvent ? "bg-gray-300 border-gray-300" : "")} onClick={() => setActiveEvent(index)}>{event.name}</button>
                    }))}
                    {!props.client && <Dialog.Root open={addEventDialogOpen} onOpenChange={open => setAddEventDialogOpen(open)}>
                        <Dialog.Trigger>
                            <a className={"border rounded-tr px-2 pb-1 print:hidden"}>+</a>
                        </Dialog.Trigger>
                        <Dialog.Portal>
                            <Dialog.Overlay
                                className={"bg-gray-600 opacity-80 fixed inset-0 z-30"}/>
                            <Dialog.Content
                                className={"fixed top-[50%] left-[50%] z-40 max-h-[100vh] max-w-5xl translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none"}>
                                <Dialog.Title className={"font-bold text-xl"}>Add Event</Dialog.Title>
                                <form className={"m-2"} onSubmit={(event) => addEvent(event)}>
                                    <label htmlFor={"eventName"}>Name</label>
                                    <div>
                                        <input
                                            type={"text"}
                                            className={"border rounded w-96 p-1"}
                                            id={"eventName"}
                                        />
                                    </div>
                                    <div className={"flex w-full justify-end"}>
                                        <button type={"submit"}
                                                className={"px-2 py-1 rounded border border-green-600 bg-green-300 hover:bg-green-600 hover:text-white mt-4 w-fit"}>Add Event
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Content>
                        </Dialog.Portal>
                    </Dialog.Root>}
                </div>
                <div className={"w-full border-t"}>
                    {competition?.events.map((event, index) => {
                        return <div className={activeEvent !== index ? "hidden" : ""} key={index}>
                            <Event competition={competition} setCompetition={setCompetition} eventIndex={index} client={props.client}></Event>
                        </div>
                    })}
                </div>
            </div>}
        </div>
    );
}

export default Competition;
