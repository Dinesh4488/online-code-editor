import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SnippetDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/snippet/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data._id) setSnippet(data);
        else setError("Snippet not found");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load snippet");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color:"red"}}>{error}</div>;
  if (!snippet) return null;

  return (
    <div style={{maxWidth:800,margin:"40px auto",padding:24,background:"#fff",borderRadius:8,boxShadow:"0 2px 16px rgba(0,0,0,0.1)"}}>
      <h2>File: {snippet.fileName}</h2>
      <div><strong>Shared By:</strong> {snippet.senderEmail}</div>
      <div><strong>Shared To:</strong> {snippet.receiverEmail}</div>
      <div><strong>Date:</strong> {new Date(snippet.date).toLocaleDateString()}</div>
      <div style={{marginTop:24}}>
        <strong>HTML:</strong>
        <pre style={{background:'#f4f4f4',padding:'8px',overflowX:'auto'}}>{snippet.codeContent?.html || ''}</pre>
      </div>
      <div>
        <strong>CSS:</strong>
        <pre style={{background:'#f4f4f4',padding:'8px',overflowX:'auto'}}>{snippet.codeContent?.css || ''}</pre>
      </div>
      <div>
        <strong>JS:</strong>
        <pre style={{background:'#f4f4f4',padding:'8px',overflowX:'auto'}}>{snippet.codeContent?.js || ''}</pre>
      </div>
    </div>
  );
}

export default SnippetDetail;
