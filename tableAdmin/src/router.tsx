// router.tsx
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import App from './App'
import Schedule from './components/Schedule/Schedule'
import News from './components/News/News'
import Messages from './components/Messages/Messages'
import Settings from './components/Settings'
import MainPage from './components/MainPage'
import Users from './components/Users'
// import ProtectedRoute from './ProtectedRouter'

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const location = useLocation();
  
    if (!user || user === 'null') {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
  
    if (isAdmin && !user.is_admin) {
      return <Navigate to="/" replace />;
    }
  
    return children;
  };

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <MainPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'schedule',
                element: (
                    <ProtectedRoute>
                        <Schedule />
                    </ProtectedRoute>
                )
            },
            {
                path: 'news',
                element: (
                    <ProtectedRoute>
                        <News />
                    </ProtectedRoute>
                )
            },
            {
                path: 'messages',
                element: (
                    <ProtectedRoute>
                        <Messages />
                    </ProtectedRoute>
                )
            },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                )
            },
            {
                path: 'users',
                element: (
                    <ProtectedRoute isAdmin>
                        <Users />
                    </ProtectedRoute>
                )
            },
            {
                path: 'auth',
                element: null, // Фиктивный элемент для активации состояния
                handle: {
                    showAuthModal: true // Кастомный флаг
                }
            }
        ]
    }
])

export default router