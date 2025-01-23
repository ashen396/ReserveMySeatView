import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import PageNotFound from './components/PageNotFound';
import HomePage from './components/HomePage';
import Schedules from './components/Schedules';
import Reservation from './components/Reservation';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<PageNotFound />} />
          <Route path='/' element={<HomePage />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/reservation/:scheduleID" element={<Reservation />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
