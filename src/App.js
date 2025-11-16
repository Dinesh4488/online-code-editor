import './App.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
  const nav = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");


  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [htmlCode, setHtml] = useState(localStorage.getItem("htmlCode") || '');
  const [cssCode, setCss] = useState(localStorage.getItem("cssCode") || '');
  const [jsCode, setJs] = useState(localStorage.getItem("jsCode") || '');
  const [consoleoutput, setConsoleOutput] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [shareFileName, setShareFileName] = useState(() => {
    const username = localStorage.getItem('username') || 'user';
    const now = new Date();
    return `${username}-code-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  });
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  function runJs() {
    let output='';
    try {
      const log=(...args)=>{output += args.join(' ') + '\n';};
      const func=new Function('console', jsCode);
      func({log});
      setConsoleOutput(output || 'No output');
    } catch (error) {
     setConsoleOutput("error: " + error.message);
    }
  }
  function resetcode() {
    setHtml('');
    setCss('');
    setJs('');
    setConsoleOutput('');
  }
  function livepreview(){
    const newtab= window.open('', '_blank');
    const page=`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <style>${cssCode}</style>
        </head>
        <body>
        ${htmlCode}
        <script>${jsCode}</script>
        </body>
        </html>`;
        newtab.document.write(page);
        newtab.document.close();
  }
  function save() {
    if(!isLoggedIn){
      alert("Please login to save your code.");
      return;
    }
    const zip=new JSZip();
    if(!htmlCode && !cssCode && !jsCode){
      alert("Please write some code before saving.");
      return;
    }
    zip.file("index.html", htmlCode);
    zip.file("style.css", cssCode);
    zip.file("script.js", jsCode);
    zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, "my-code.zip");
    });

  }
  function openSharePopup() {
    if(!isLoggedIn){
      alert("Please login to share your code.");
      return;
    }
    setShareFileName(() => {
      const username = localStorage.getItem('username') || 'user';
      const now = new Date();
      return `${username}'s-code`;
    });
    setShareEmail('');
    setShareError('');
    setShowShare(true);

    const codeObj = { html: htmlCode, css: cssCode, js: jsCode };
    const encoded = btoa(encodeURIComponent(JSON.stringify(codeObj)));
    setShareLink(`${window.location.origin}${window.location.pathname}?code=${encoded}`);
  }
  function closeSharePopup() {
    setShowShare(false);
  }
  async function handleShareSend() {
    setShareError('');
    setShareLoading(true);
    try {
      const senderEmail = localStorage.getItem('email');
      const res = await fetch(`${API}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: shareFileName,
          codeContent: { html: htmlCode, css: cssCode, js: jsCode },
          senderEmail,
          receiverEmail: shareEmail,
          link: shareLink
        })
      });
      const data = await res.json();
      if (!data.success) {
        setShareError(data.message || 'Failed to share.');
      } else {
        setShowShare(false);
        alert('Code shared successfully!');
      }
    } catch (e) {
      setShareError('Error sharing code.');
    }
    setShareLoading(false);
  }
  function handleCopyLink() {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  }
  return (
    <>
      <div className="navbar">
        <div id="logo" >Online code editor</div>
        <div className='nav-links' style={{ display: "flex", gap: "20px" }}>
          {isLoggedIn ? (<>
            <button onClick={() => nav("/profile")} style={{ marginRight: "20px", padding: "5px" }}>Profile</button>
          </>) : (
            <>
              <button onClick={() => nav('/login')}>Login</button>
              <button onClick={() => nav('/register')}>Register</button>
            </>
          )}
        </div>
      </div>
      <div className="code-editor" style={{ display: "flex", flexDirection: "row",flexWrap:"wrap", height: "60vh", gap: "10px", margin: "10px" }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width:"100%",flexWrap:"wrap"}}>
          <label>HTML</label>
          <CodeMirror
            value={htmlCode}
            height="60vh"
            extensions={[html()]}
            onChange={value=>{setHtml(value);
              localStorage.setItem("htmlCode", value);
            }}
            placeholder="Write HTML Body here..."
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label>CSS</label>
          <CodeMirror
            value={cssCode}
            height="60vh"
            extensions={[css()]}
            onChange={value=>{setCss(value);
              localStorage.setItem("cssCode", value);
            }}
            placeholder="Write CSS here..."
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: "0px 10px" }}>
            <label>JS</label>
            <button onClick={runJs}>Run JS</button>
          </div>
          <CodeMirror
            value={jsCode}
            height="60vh"
            extensions={[javascript()]}
            onChange={value=>{setJs(value);
              localStorage.setItem("jsCode", value);
            }}
            placeholder="Write JS here..."
          />
        </div>
      </div>
    <div className="buttons" style={{
      marginTop: "30px",
      display: "flex",
      justifyContent: "right",
      padding: "0px 10px",
      gap: "15px"
    }}>
      <button onClick={save}>save</button>
      <button onClick={openSharePopup}>share</button>
      <button onClick={resetcode}>reset</button>
    </div>
    <div className="console">
      {consoleoutput}
    <div style={{position: "fixed", bottom: 15, right: 15,}}>
      <button onClick={livepreview}>Live preview</button>
    </div>
    </div>
    {showShare && (
        <div className="share-popup-bg">
          <div className="share-popup">
            <label>File Name</label>
            <input type="text" value={shareFileName} onChange={e => setShareFileName(e.target.value)} />
            <label>Shareable Link</label>
            <div className="share-link-row">
              <input type="text" value={shareLink} readOnly style={{flex:1}} />
              <button onClick={handleCopyLink} type="button">Copy</button>
            </div>
            <label>Share to (Registered Email)</label>
            <input type="email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} placeholder="Enter recipient's registered email" />
            {shareError && <div className="error">{shareError}</div>}
            <div className="share-btn-row">
              <button onClick={closeSharePopup} type="button">Cancel</button>
              <button onClick={handleShareSend} type="button" disabled={shareLoading}>{shareLoading ? 'Sharing...' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
