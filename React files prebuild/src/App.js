import {useEffect, useState} from "react";
import $ from 'jquery'

export default function App() {
    let [username, setUserName] = useState('')
    let [activeScreen, setActiveScreen] = useState('Login')

    function render(screen) {
        switch (screen) {
            case 'Login':
                return <Login setScreen={setActiveScreen} username={username} setUserName={setUserName}/>;
            case 'Interface':
                return <Interface setScreen={setActiveScreen} username={username}/>;
            default:
                return null;
        }
    }

    return (
        <div className="h-100 d-flex align-items-center justify-content-center">
            {render(activeScreen)}
        </div>
    );
}

function Login({setScreen, username, setUserName}) {
    let [password, setPassword] = useState('')

    /*function getCookie() {
        let cookies = document.cookie.split(";");
        for (let cookie in cookies) {
            if (cookies[cookie].split("=")[0] === "csrftoken")
                return cookies[cookie].split("=")[1];
        }
    }*/

    const error = () => {
        $('#error').show();
        setUserName('');
        setPassword('');
    }

    const warning = () => {
        $('#warning').show();
        setUserName('');
        setPassword('');
    }

    const handleSubmit = async () => {
        await fetch('/login', {
            method: "POST",
            credentials: "include",
            headers: new Headers({'content-type': 'application/json',}),
            cache: "default",
            mode: 'cors',
            body: JSON.stringify({'username': username, 'password': password})
        })
            .then(response => response.json())
            .then(data => data['result'] === "success" ? setScreen('Interface') : warning())
            .catch(() => error());
    }

    return (
        <div className="row d-flex justify-content-center align-items-center w-50">
            <div className="col col-xl-10">
                <div className="card" style={{borderRadius: "1rem"}}>
                    <div className="row g-0">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="d-flex mb-3 pb-1 justify-content-center" style={{textAlign: "center"}}>
                                <span className="h4 fw-bold mb-0">Document Approval System</span>
                            </div>
                            <div className="form-outline mb-4">
                                <input type="username" id="username" className="form-control form-control-lg"
                                       value={username} onChange={(e) => setUserName(e.target.value)}/>
                                <label className="form-label">Username</label>
                            </div>
                            <div className="form-outline mb-2">
                                <input type="password" id="password" className="form-control form-control-lg"
                                       value={password} onChange={(e) => setPassword(e.target.value)}/>
                                <label className="form-label">Password</label>
                            </div>
                            <p id="error" style={{textAlign: "center", color: "red", display: "none"}}>Network error,
                                Try Again!!</p>
                            <p id="warning" style={{textAlign: "center", color: "red", display: "none"}}>Invalid
                                credentials entered!</p>
                            <div className="pt-1 mb-2" style={{textAlign: "center"}}>
                                <button className="btn btn-success btn-lg btn-block" type="submit"
                                        onClick={handleSubmit}>Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Interface({setScreen, username}) {
    let [activeContent, setActiveContent] = useState('notification-btn');

    let setActive = (e) => {
        setActiveContent(e.target.id);
    }

    function render(content) {
        switch (content) {
            case 'notification-btn':
                return <Notifications username={username}/>;
            case 'add':
                return <Add/>;
            case 'create':
                return <Create username={username}/>;
            case 'view':
                return <View username={username}/>;
            default:
                return null;
        }
    }

    return (
        <div className="row d-flex div-dim bg-light">
            <div className="h-100 mt-4 menu-div" style={{textAlign: "center"}}>
                <button id="notification-btn" onClick={setActive} className='w-100'>Notifications</button>
                <button id="add" onClick={setActive} className="w-100">Add Approver</button>
                <button id="create" onClick={setActive} className="w-100">Create Task</button>
                <button id="view" onClick={setActive} className="w-100">View Tasks</button>
                <div style={{marginTop: "3rem"}}></div>
                <button onClick={() => setScreen('Login')} className="btn btn-danger w-75">Logout</button>
            </div>
            <div className="content-div row">
                {render(activeContent)}
            </div>
        </div>
    );
}

function Notifications({username}) {

    let [notifications, setNotifications] = useState([]);

    let space = (x) => '\u00A0'.repeat(x);

    let toggle = (e) => {
        let el = e.target.id + '-details';
        $('#' + el).toggle();
    }
    let approved = (item) => {
        let approvers = item.split(';');
        return approvers.map((app) => (
            <p className="text-success" key={app}>{app}</p>
        ))
    }

    let awaiting = (item) => {
        let approvers = item.split(';');
        return approvers.map((app) => (
            <p className="text-danger" key={app}>{app}</p>
        ))
    }

    let get_bg = (item) => {
        switch (item) {
            case 'Pending':
                return 'bg-primary'
            case 'Complete':
                return 'bg-success'
            case 'Not Started':
                return 'bg-danger'
            default:
                return null
        }
    }

    useEffect(() => {
        const getNotifications = async () => {
            await fetch('/notifications', {
                method: "POST",
                credentials: "include",
                headers: new Headers({'content-type': 'application/json',}),
                cache: "default",
                mode: 'cors',
                body: JSON.stringify({'username': username})
            })
                .then(response => response.json())
                .then(data => setNotifications(data))
                .catch(null);
        }
        getNotifications().then(() => null)
    }, [username]);

    return (
        <div id="notifications">
            {notifications.length > 0 ? notifications.map((item) => (
                <div key={item.Id} className={`${get_bg(item.status)} text-white`} id={item.username + '-' + item.Id}
                     onClick={(e) => toggle(e)}>
                    Document: {item.doc_name} {space(15)} Approvals: {item.curr_approvals} / {item.total_approvals} {space(15)} Status: {item.status}
                    <div id={item.username + '-' + item.Id + '-details'}>
                        {approved(item.approved)}
                        {awaiting(item.awaiting_approval)}
                    </div>
                </div>
            )) : (
                <div className="h-100 d-flex align-items-center justify-content-center">
                    <p>
                        <i>Currently no notifications</i>
                    </p>
                </div>
            )}
        </div>
    );
}

function Add() {
    let [name, setName] = useState('')
    let [email, setEmail] = useState('')
    let [position, setPosition] = useState('')

    const result = (message) => {
        if (message === "success") {
            $('#success').show()
            $('#fail').hide();
        } else {
            $('#fail').show();
            $('#success').hide()
        }
        $('#error').hide();
        setName('');
        setEmail('');
        setPosition('');
    }

    const error = () => {
        $('#error').show();
    }

    const handleSubmit = async () => {
        await fetch('/approvers', {
            method: "POST",
            credentials: "include",
            headers: new Headers({'content-type': 'application/json'}),
            cache: "default",
            mode: 'cors',
            body: JSON.stringify({
                'name': name,
                'email': email,
                'position': position
            })
        })
            .then(response => response.json())
            .then(data => result(data['result']))
            .catch(() => error());
    }

    return (
        <div className="d-flex align-items-center justify-content-center">
            <div className="form-group">
                <h4>Add Document Approver</h4>
                <br/>
                <input id="name" type="text" className="form-control" placeholder="Enter name" value={name}
                       onChange={(e) => setName(e.target.value)}/>
                <br/>
                <input id="email" type="text" className="form-control" placeholder="Enter email" value={email}
                       onChange={(e) => setEmail(e.target.value)}/>
                <br/>
                <input id="position" type="text" className="form-control" placeholder="Enter position" value={position}
                       onChange={(e) => setPosition(e.target.value)}/>
                <br/>
                <p id="error" style={{textAlign: "center", color: "red", display: "none"}}>Connection error, Try
                    Again!!</p>
                <p id="fail" style={{textAlign: "center", color: "red", display: "none"}}>Approver already exists</p>
                <p id="success" style={{textAlign: "center", color: "green", display: "none"}}>Approver added
                    successfully</p>
                <button className="form-control btn btn-success" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
}

function Create({username}) {

    let [docName, setDocName] = useState("")
    let [approvers, setApprovers] = useState([]);
    let [rows, setRows] = useState([]);

    let selectApp = (e) => {
        let name = e.target.value;
        let record = approvers.filter((app) => app['name'] === name)[0];
        if (rows.filter((row) => row["name"] === name).length === 0) {
            setRows([...rows, record]);
        }
        e.target.selectedIndex = 0;
    }

    useEffect(() => {
        const getApprovers = async () => {
            await fetch('/approvers', {
                method: "GET",
                credentials: "include",
                headers: new Headers({'content-type': 'application/json',}),
                cache: "default",
                mode: 'cors',
            })
                .then(response => response.json())
                .then(data => setApprovers(data))
                .catch(null);
        }
        getApprovers().then(() => null)
    }, []);

    const submitTask = async () => {
        $('#fail').hide();
        $('#success').hide();
        $('#email_fail').hide();
        $('#email_success').hide()

        let formData = new FormData();
        formData.append('username', username);
        formData.append('docName', docName);
        formData.append('apps', JSON.stringify(rows));
        formData.append('doc', document.getElementById('doc_file').files[0]);

        await fetch('/tasks', {
            method: "POST",
            mode: 'cors',
            body: formData
        })
            .then(response => response.json())
            .then(data => result(data))
            .catch(() => error());
    }

    const result = (message) => {
        if (message['result'] === "success") {
            processEmail(message).then();
            $('#fail').hide();
            $('#success').show()
        } else {
            $('#fail').show();
            $('#success').hide()
        }
        $('#error').hide();
        setDocName('');
        setRows([]);
    }

    const processEmail = async (data) => {
        await fetch('/process', {
            method: "POST",
            mode: 'cors',
            body: JSON.stringify({
                username: data['username'],
                doc_name: data['doc_name'],
                approver: data['approver'],
                type: data['type'],
            })
        })
            .then(response => response.json())
            .then(data => result_email(data['result']))
            .catch(() => error());
    }

    const result_email = (message) => {
        if (message === "success") {
            $('#email_fail').hide();
            $('#email_success').show()
        } else {
            $('#email_fail').show();
            $('#email_success').hide()
        }
        $('#error').hide();
    }

    const error = () => {
        $('#error').show();
        $('#fail').hide();
        $('#success').hide()
    }

    return (
        <div id="createScreen" className="d-flex align-items-center justify-content-center">
            <div className="form-group">
                <h4 style={{textAlign: "center"}}>Create approval task</h4>
                <br/>
                <input id="doc_name" name="doc_name" type="text" className="form-control" value={docName}
                       placeholder="Enter task name" onChange={(e) => setDocName(e.target.value)}/>
                <br/>
                <input id="doc_file" name="doc_file" type="file" className="form-control" required/>
                <br/>
                <select id="approver" name="approver" className="form-control" onChange={(e) => (selectApp(e))}>
                    <option value="null">Select Approver</option>
                    {approvers.map((app) => (
                        <option value={app.name} key={app.Id}>{app.name} : {app.role}</option>
                    ))}
                </select>
                <br/>
                <table className="table table-striped-columns">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Email</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((row) => (
                        <tr key={row.Id}>
                            <td>{row.name}</td>
                            <td>{row.role}</td>
                            <td>{row.email}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <br/>
                <p id="error" style={{textAlign: "center", color: "red", display: "none"}}>Connection error, Try
                    Again!!</p>
                <p id="fail" style={{textAlign: "center", color: "red", display: "none"}}>Task already exists</p>
                <p id="success" style={{textAlign: "center", color: "green", display: "none"}}>Task added
                    successfully</p>
                <p id="email_fail" style={{textAlign: "center", color: "red", display: "none"}}>Error occured whilst
                    sharing email to first approver</p>
                <p id="email_success" style={{textAlign: "center", color: "green", display: "none"}}>Email send to first
                    approver successfully</p>
                <button className="form-control btn btn-success" onClick={submitTask}>Submit</button>
                <br/>
                <br/>
            </div>
        </div>
    );
}

function View({username}) {
    let [tasks, setTasks] = useState([]);
    let [criteria, setCriteria] = useState('All')

    let get_color = (item) => {
        switch (item) {
            case 'Pending':
                return 'text-primary'
            case 'Complete':
                return 'text-success'
            case 'Not Started':
                return 'text-danger'
            default:
                return null
        }
    }

    let getDateTime = (datetime) => {
        let date = datetime.split('T')[0];
        let time = datetime.split('T')[1].slice(0, 8);
        return (
            <td>{date}<br/>{time}</td>
        )
    }

    useEffect(() => {
        const getTasks = async () => {
            await fetch('/tasks', {
                method: "PUT",
                credentials: "include",
                headers: new Headers({'content-type': 'application/json',}),
                cache: "default",
                mode: 'cors',
                body: JSON.stringify({
                    username: username,
                    filter: 'All'
                })
            })
                .then(response => response.json())
                .then(data => setTasks(data))
                .catch(null);
        }
        getTasks().then(() => null)
    }, [username]);

    const filterTasks = async () => {
        await fetch('/tasks', {
            method: "PUT",
            credentials: "include",
            headers: new Headers({'content-type': 'application/json',}),
            cache: "default",
            mode: 'cors',
            body: JSON.stringify({
                username: username,
                filter: criteria
            })
        })
            .then(response => response.json())
            .then(data => setTasks(data))
            .catch(null);
    }


    return (
        <div id="view-tasks">
            <div className="search-bar row">
                <select id="criteria" className="w-30 custom-select" value={criteria}
                        onChange={(e) => setCriteria(e.target.value)}>
                    <option value="All">All</option>
                    <option value="Not Started">Tasks Not Started</option>
                    <option value="Pending">Pending Tasks</option>
                    <option value="Complete">Complete Tasks</option>
                    <option value="Monthly">Current Month's Tasks</option>
                    <option value="Today">Today's Tasks</option>
                </select>
                <button className="btn btn-primary w-15 form-control" onClick={filterTasks}>Filter</button>
            </div>
            <table id="tasks" className="table table-striped">
                <thead>
                <tr>
                    <th className="w-25">Name</th>
                    <th className="w-25">Progress</th>
                    <th className="w-25">Status</th>
                    <th className="w-25">Added</th>
                </tr>
                </thead>
                <tbody>
                {tasks.map((task) => (
                    <tr key={task.Id}>
                        <td>{task.doc_name}</td>
                        <td>{task.curr_approvals} / {task.total_approvals}</td>
                        <td className={`${get_color(task.status)}`}>{task.status}</td>
                        {getDateTime(task.timestamp)}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
