import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import PageNotFound from './components/PageNotFound';
import HomePage from './components/HomePage';
import Schedules from './components/Schedules';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<PageNotFound />} />
          <Route path='/' element={<HomePage />} />
          <Route path="/schedules" element={<Schedules />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
