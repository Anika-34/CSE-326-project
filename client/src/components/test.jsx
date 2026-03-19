import React, { Fragment, useEffect, useState } from "react";


const Test = () => {
    const [users, setUsers] = useState([]);
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';
    console.log('API Base URL:', apiBaseUrl);

    const getUsers = async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/v1/dummy`);
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
        <button onClick={()=>window.location.href = '/hotels/search/?location=New%20York&checkIn=2026-02-15&checkOut=2026-02-18&room=1&adults=0&children=1'}>Go to Hotel Search</button>
    </Fragment>
}

export default Test;