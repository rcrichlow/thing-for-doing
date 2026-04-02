import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import BoardsIndex from './pages/boards/BoardsIndex';
import ArchivedBoardsIndex from './pages/boards/ArchivedBoardsIndex';
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
            <Route path="/working-memory" element={<ErrorBoundary><WorkingMemoryView /></ErrorBoundary>} />
            <Route path="/boards" element={<ErrorBoundary><BoardsIndex /></ErrorBoundary>} />
            <Route path="/boards/archived" element={<ErrorBoundary><ArchivedBoardsIndex /></ErrorBoundary>} />
            <Route path="boards/:id" element={<ErrorBoundary><BoardView /></ErrorBoundary>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
