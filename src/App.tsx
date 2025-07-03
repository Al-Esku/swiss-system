import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Competition from "./components/Competition";

function App() {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path={"/"} element={<Competition client={false}/>}></Route>
                    <Route path={"/competitions/:uuid"} element={<Competition client={true}/>}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App