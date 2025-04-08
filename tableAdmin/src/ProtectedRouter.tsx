import { Navigate, useLocation, useNavigate } from "react-router-dom"

const ProtectedRoute = ({ children, isAdmin = false }) => {
    const user = JSON.parse(localStorage.getItem('user')!)
    const location = useLocation()
    const navigate = useNavigate()

    if (!user) {
        navigate('/auth', {
            state: {
                from: location, // Сохраняем исходный путь
                showAuthModal: true
            },
            replace: true
        })
        return null
    }

    if (isAdmin && !user.is_admin) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute