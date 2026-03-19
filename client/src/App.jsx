import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import BoardsIndex from './pages/boards/BoardsIndex';
import BoardView from './pages/boards/BoardView';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import WorkingMemoryView from './pages/working-memory/WorkingMemoryView';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/working-memory" replace />} />
            <Route path="/working-memory" element={<WorkingMemoryView />} />
            <Route path="/boards" element={<BoardsIndex />} />
            <Route path="boards/:id" element={<BoardView />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
