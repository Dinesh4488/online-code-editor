import ReactDOM from 'react-dom/client';
import App from './App';
import Login from './login';
import Register from './register';
import Profile from './Profile';
import SnippetDetail from './SnippetDetail';
import { BrowserRouter,Routes,Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <BrowserRouter>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/snippet/:id" element={<SnippetDetail />} />
  </Routes>
 </BrowserRouter>
);



