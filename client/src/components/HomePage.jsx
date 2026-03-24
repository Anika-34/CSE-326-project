import React, { Fragment, useEffect, useState, useCallback } from "react";
import ResultSearchBar from "./ResultSearchBar";
import Navbar from "./Navbar";


const HomePage = () => {
    const [users, setUsers] = useState([]);
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';
    console.log('API Base URL:', apiBaseUrl);

    const getUsers = useCallback(async () => {
        try {
            const response = await fetch(`${apiBaseUrl}/v1/dummy`);
            const data = await response.json();
            console.log(data);
            setUsers(data);
        } catch (err) {
            console.error(err.message);
        }
    }, [apiBaseUrl]);

    useEffect(() => {
        getUsers();
    }, [getUsers]);


    return <Fragment>
        <Navbar/>
        <div className="container-fluid px-4"
            style={{ alignItems: 'center', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <ResultSearchBar />
            <div>
                <h1>homepage</h1>
                <h3>dummy data shown, remove these</h3>
                {users.map(user => (
                    <div key={user.user_id}>
                        <p>Name: {user.name}</p>
                        <p>Email: {user.email}</p>
                    </div>
                ))}
                <button onClick={() => window.location.href = '/hotels/search/?location=New%20York&checkIn=2026-02-15&checkOut=2026-02-18&room=1&adults=0&children=1'}>Go to Hotel Search</button>
            </div>
        </div>

    </Fragment>
}

export default HomePage;