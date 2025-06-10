import React, {FormEvent} from 'react';
import './App.css';
import Event from "./components/Event";
import * as Dialog from "@radix-ui/react-dialog";

function App() {
    const [competition, setCompetition] = React.useState<competition|null>(null)
    const [activeEvent, setActiveEvent] = React.useState(0)
    const [addEventDialogOpen, setAddEventDialogOpen] = React.useState(false)

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
            setCompetition((current) => ({
                name: current?.name ?? "",
                events: [...current?.events ?? [], {name: name.value}]
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
                        <p className={"w-full flex justify-center italic"}>v{require("../package.json").version}</p>
                    </div>
                </div>
                <div className={"flex w-full justify-center"}>
                    <Dialog.Root>
                        <Dialog.Trigger>
                            <button type={"button"}
                                    className={"border rounded px-2 mt-6 ml-2 print:hidden"}>Start competition
                            </button>
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
                    </Dialog.Root>
                </div>
            </div>}
            {competition !== null && <div>
                <div className={"flex w-full justify-center mt-4 print:hidden"}>
                    <p className={"font-bold text-4xl"}>{competition.name}</p>
                </div>
                <div className={"flex w-full overflow-x-scroll mt-4"}>
                    {competition?.events.map(((event, index) => {
                        return <button className={"border px-2 pb-1 print:hidden min-w-fit " + (index === activeEvent ? "bg-gray-300 border-gray-300" : "")} onClick={() => setActiveEvent(index)}>{event.name}</button>
                    }))}
                    <Dialog.Root open={addEventDialogOpen} onOpenChange={open => setAddEventDialogOpen(open)}>
                        <Dialog.Trigger>
                            <button className={"border rounded-tr px-2 pb-1 print:hidden"}>+</button>
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
                    </Dialog.Root>
                </div>
                <div className={"w-full border-t"}>
                    {competition?.events.map((event, index) => {
                        return <div className={activeEvent !== index ? "hidden" : ""}>
                            <Event competition={competition} setCompetition={setCompetition} eventIndex={index}></Event>
                        </div>
                    })}
                </div>
            </div>}
        </div>
    );
}

export default App;
