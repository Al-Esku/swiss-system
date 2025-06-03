import React, {FormEvent} from 'react';
import './App.css';
import Event from "./components/Event";
import * as Dialog from "@radix-ui/react-dialog";

function App() {
    const [competition, setCompetition] = React.useState<competition|null>(null)

    function createCompetition(event: FormEvent) {
        event.preventDefault()
        const name = document.getElementById("name") as HTMLInputElement
        if (name) {
            setCompetition({name: name.value})
        }
    }

    return (
        <div>
            {competition === null && <div>
                <div className={"flex w-full justify-center mt-4"}>
                    <div>
                        <p className={"font-bold text-4xl"}>Swiss Tournament System</p>
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
                                <Dialog.Title className={"font-bold text-xl"}>Start competition</Dialog.Title>
                                <form className={"m-2"} onSubmit={(event) => createCompetition(event)}>
                                    <label htmlFor={"name"}>Name</label>
                                    <div>
                                        <input
                                            type={"text"}
                                            className={"border rounded w-96 p-1"}
                                            id={"name"}
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
                <div className={"w-full border-t"}>
                    <Event></Event>
                </div>
            </div>}
        </div>
    );
}

export default App;
