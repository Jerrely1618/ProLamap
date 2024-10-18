import { createBrowserRouter } from 'react-router-dom';
import Home from './routes/Home';
import TermsOfUse from './routes/TermsUse';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/terms',
    element: <TermsOfUse />,
  },
]);
