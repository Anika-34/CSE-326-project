import React, { Fragment, useEffect, useState } from "react";


const Test = () => {
    const [users, setUsers] = useState([]);
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';

    const getUsers = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/dummy`);
            const data = await response.json();
            console.log(data);
            setUsers(data);
        } catch (err) {
            console.error(err.message);
        }
    }
    useEffect(() => {
        getUsers();
    }, []);
    

    return <Fragment>
        <h1>Users</h1>
        {users.map (user => (
            <div key={user.user_id}>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
            </div>
        ))}
    </Fragment>
}

export default Test;