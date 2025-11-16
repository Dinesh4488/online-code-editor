import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [username, setUsername] = useState(localStorage.getItem("username"));
    const [email, setEmail] = useState(localStorage.getItem("email"));
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const nav = useNavigate();
    const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const [tab, setTab] = useState("shared");
    const [sharedCodes, setSharedCodes] = useState([]);
    const [receivedCodes, setReceivedCodes] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState({
        newUsername: username,
        newEmail: email,
        newPassword: "",
        oldPassword: ""
    });
    const [editMsg, setEditMsg] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            nav("/login");
            return;
        }

        fetch(`${API}/shared?email=${email}`)
            .then(res => res.json())
            .then(data => setSharedCodes(data));

        fetch(`${API}/received?email=${email}`)
            .then(res => res.json())
            .then(data => setReceivedCodes(data));
    }, [isLoggedIn, nav, email,API]);

    // Delete shared code
    const handleDeleteShared = async (id) => {
        await fetch(`${API}/shared/${id}`, { method: 'DELETE' });
        setSharedCodes(sharedCodes.filter(item => item._id !== id));
    };
    // Delete received code
    const handleDeleteReceived = async (id) => {
        await fetch(`${API}/received/${id}`, { method: 'DELETE' });
        setReceivedCodes(receivedCodes.filter(item => item._id !== id));
    };

    // Edit profile
    const handleEditProfile = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditMsg("");
        const res = await fetch(`${API}/edit-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                oldPassword: form.oldPassword,
                newUsername: form.newUsername !== username ? form.newUsername : undefined,
                newEmail: form.newEmail !== email ? form.newEmail : undefined,
                newPassword: form.newPassword ? form.newPassword : undefined
            })
        });
        const data = await res.json();
        setEditLoading(false);
        if (data.success) {
            setUsername(data.username);
            setEmail(data.email);
            localStorage.setItem("username", data.username);
            localStorage.setItem("email", data.email);
            setShowEdit(false);
            setEditMsg("");
            setForm({
                newUsername: data.username,
                newEmail: data.email,
                newPassword: "",
                oldPassword: ""
            })
        } else {
            setEditMsg(data.message || "Update failed");
        }
    };

    return (
        <>
            <div className="navbar" style={{ display: 'flex', height: "8vh", justifyContent: 'space-between', alignItems: 'center', border: "2px solid black" }}>
                <div id="logo" onClick={() => { nav('/') }} style={{ cursor: "pointer" }}>Online code editor</div>
            </div>
            <div className="main-content" style={{ display: "flex", margin: "0px 10px" }}>
                <div className="profile-content" style={{ flex: "1" }}>
                    <h2>User Profile</h2>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <div style={{ display: "flex" }}></div>
                    <button onClick={() => setShowEdit(true)}>Edit Profile</button>
                    <button onClick={() => { localStorage.clear(); nav("/") }}>Logout</button>
                    {showEdit && (
                        <div className="edit-profile-modal-bg">
                            <div className="edit-profile-modal">
                                <h3>Edit Profile</h3>
                                <form onSubmit={handleEditProfile}>
                                    <label>Username:
                                        <input type="text" value={form.newUsername} onChange={e => setForm(f => ({ ...f, newUsername: e.target.value }))} />
                                    </label>
                                    <label>Email:
                                        <input type="email" value={form.newEmail} onChange={e => setForm(f => ({ ...f, newEmail: e.target.value }))} />
                                    </label>
                                    <label>Old Password (required):
                                        <input type="password" value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))} required />
                                    </label>
                                    <label>New Password:
                                        <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Leave blank to keep current" />
                                    </label>
                                    {editMsg && <div className="edit-error">{editMsg}</div>}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                        <button type="submit" disabled={editLoading}>Save</button>
                                        <button type="button" onClick={() => { setShowEdit(false); setEditMsg(""); }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
                <div className="files-content" style={{ flex: "3" }}>
                    <div className="profile-tabs">
                        <button className={`profile-tab${tab === "shared" ? " active" : ""}`} onClick={() => setTab("shared")}>Shared</button>
                        <button className={`profile-tab${tab === "received" ? " active" : ""}`} onClick={() => setTab("received")}>Received</button>
                    </div>
                    {tab === "shared" ? (
                        <div>
                            <h3>Shared Files</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>File Name</th>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>Shared To</th>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sharedCodes.length === 0 ? (
                                        <tr><td colSpan="3" style={{ textAlign: "center" }}>No shared files yet.</td></tr>
                                    ) : (
                                        sharedCodes.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: "1px solid #ccc", padding: "6px", display: 'flex', alignItems: 'center' }}>
                                                    <a className="profile-table-link" href={`/snippet/${item._id}`} target="_blank" rel="noreferrer">{item.fileName}</a>
                                                    <button className="profile-delete-btn" onClick={() => handleDeleteShared(item._id)}>Delete</button>
                                                </td>
                                                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.receiverEmail}</td>
                                                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{new Date(item.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>
                            <h3>Received Files</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>File Name</th>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>Sent By</th>
                                        <th style={{ border: "1px solid #ccc", padding: "6px" }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receivedCodes.length === 0 ? (
                                        <tr><td colSpan="3" style={{ textAlign: "center" }}>No received files yet.</td></tr>
                                    ) : (
                                        receivedCodes.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ border: "1px solid #ccc", padding: "6px", display: 'flex', alignItems: 'center' }}>
                                                    <a className="profile-table-link" href={`/snippet/${item._id}`}>{item.fileName}</a>
                                                    <button className="profile-delete-btn" onClick={() => handleDeleteReceived(item._id)}>Delete</button>
                                                </td>
                                                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{item.senderEmail}</td>
                                                <td style={{ border: "1px solid #ccc", padding: "6px" }}>{new Date(item.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Profile;