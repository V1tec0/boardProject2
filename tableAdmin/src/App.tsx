import React, { useState, useEffect } from 'react';
import { Layout, Spin, Button, Tooltip, Divider, message } from 'antd';
import {
    HomeOutlined,
    CalendarOutlined,
    FileTextOutlined,
    MessageOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    LeftOutlined,
    RightOutlined,
    MenuOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';

const { Content } = Layout;

const App: React.FC = () => {
    const [authVisible, setAuthVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [activationEmail, setActivationEmail] = useState('');
    const [activationMode, setActivationMode] = useState(false);
    const [useDockInterface, setUseDockInterface] = useState(() => {
        return localStorage.getItem('useDockInterface') === 'true';
    });
    const navigate = useNavigate()
    const location = useLocation()

    const [dockPosition, setDockPosition] = useState(() => {
        return localStorage.getItem('dockPosition') || 'bottom';
    });

    const [hideLabels, setHideLabels] = useState(() => {
        return localStorage.getItem('hideLabels') === 'true';
    });

    const changeDockPosition = (position: string) => {
        setDockPosition(position);
        localStorage.setItem('dockPosition', position);
    };

    const toggleLabels = () => {
        const newState = !hideLabels;
        setHideLabels(newState);
        localStorage.setItem('hideLabels', String(newState));
    };

    const showAuth = location.state?.showAuthModal || (location.pathname === '/auth')

    console.log(authVisible);


    useEffect(() => {
        localStorage.setItem('useDockInterface', String(useDockInterface));
    }, [useDockInterface]);

    const getCookie = (name: string): string | null => {
        const cookies = document.cookie
            .split(';')
            .map(cookie => cookie.trim().split('='));

        const targetCookie = cookies.find(([cookieName]) => cookieName === name);
        return targetCookie ? decodeURIComponent(targetCookie[1]) : null;
    };

    useEffect(() => {
        localStorage.setItem('dockPosition', dockPosition);
    }, [dockPosition]);


    const getCsrfToken = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/csrf/', { credentials: 'include' });
            return response.headers.get('X-CSRFToken');
        } catch (error) {
            console.error('CSRF Error:', error);
            return null;
        }
    };

    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/user/', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsAdmin(data.is_admin);
                localStorage.setItem('user', JSON.stringify(data)); // Добавлено сохранение
                setAuthVisible(false);
            } else {
                localStorage.removeItem('user'); // Чистим при отсутствии авторизации
                setUser(null);
                setAuthVisible(true);
            }
        } catch {
            localStorage.removeItem('user');
            setUser(null);
            setAuthVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const contentStyles = {
        margin: useDockInterface ? 0 : 24,
        padding: 24,
        width: 'calc(100vw - 50px)',
        background: 'var(--bg-color)',
        marginTop: ['top'].includes(dockPosition) ? 60 : 24, // Отступ сверху
        marginBottom: ['bottom'].includes(dockPosition) ? 60 : 24, // Отступ снизу
        marginLeft: ['left'].includes(dockPosition) ? 80 : 24, // Отступ сбоку
        marginRight: ['right'].includes(dockPosition) ? 80 : 24, // Отступ сбоку
    };

    const positionStyles = {
        bottom: {
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'row',
        },
        top: {
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'row',
        },
        left: {
            left: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
        },
        right: {
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            flexDirection: 'column',
        },
    };


    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('http://localhost:8000/api/session/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || ''
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                await checkAuth();  // <-- возвращаем как было, вызываем checkAuth
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                message.success(`Добро пожаловать, ${storedUser.email || email}!`);
                navigate(location.state?.from?.pathname || '/');
                setError('');
            } else {
                setError('Неправильный логин или пароль');
            }
        } catch {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };



    const closeAuth = () => {
        navigate(-1) // Возврат к предыдущему пути
        setActivationMode(false)
    }

    const handleRegister = async (email: string, password: string, confirmPassword: string, firstname: string, lastname: string) => {
        setLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('http://localhost:8000/api/users/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                credentials: 'include',
                body: JSON.stringify({ email, password, firstname, lastname, confirm_password: confirmPassword }),
            });

            if (response.ok) {
                setActivationEmail(email);
                setActivationMode(true); // важно включить этот стейт
                setError('');
                message.success('На почту отправлен код активации')
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Ошибка регистрации');
            }
        } catch {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };


    const handleActivate = async (activationCode: string) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/activate/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: activationEmail, activation_code: activationCode }),
            });

            if (response.ok) {
                setActivationMode(false); // отключаем после активации
                setAuthVisible(true);
                message.success('Аккаунт успешно активирован. Теперь войдите в учетную запись')
            } else {
                const data = await response.json();
                message.success(data.detail || 'Ошибка активации')
            }
        } catch {
            message.error('Ошибка соединения')
        } finally {
            setLoading(false);
        }
    };


    const handleLogout = async () => {
        const xcsrfToken = await getCsrfToken();

        await fetch('http://localhost:8000/api/session/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': xcsrfToken || undefined
            },
            credentials: 'include',
        });
        setUser(null);
        setAuthVisible(true);
        setIsAdmin(false); localStorage.removeItem('user') // Вместо clear()
        document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        navigate('/auth')
    };

    const toggleInterfaceType = () => setUseDockInterface(!useDockInterface);

    const handleMenuClick = (key: string) => {
        if (key === 'toggle') toggleInterfaceType()
        else if (key === '6') handleLogout()
        else {
            const routes = {
                '1': '/',
                '2': '/schedule',
                '3': '/news',
                '4': '/messages',
                '5': '/settings',
                '7': '/users'
            }
            navigate(routes[key as keyof typeof routes] || '/')
        }
    }

    const getSelectedKey = () => {
        const pathToKeyMap = {
            '/': '1',
            '/schedule': '2',
            '/news': '3',
            '/messages': '4',
            '/settings': '5',
            '/users': '7'
        }
        return pathToKeyMap[location.pathname] || '1'
    }

    const menuItems = user
        ? [
            { key: '1', icon: <HomeOutlined />, label: 'Главная', path: '/' },
            ...(isAdmin ? [{ key: '7', icon: <UserOutlined />, label: 'Пользователи', path: '/users' }] : []),
            { key: '2', icon: <CalendarOutlined />, label: 'Расписание', path: '/schedule' },
            { key: '3', icon: <FileTextOutlined />, label: 'Новости', path: '/news' },
            { key: '4', icon: <MessageOutlined />, label: 'Сообщения', path: '/messages' },
            { key: '5', icon: <SettingOutlined />, label: 'Настройки', path: '/settings' },
            { type: 'divider' },
            { key: '6', icon: <LogoutOutlined />, label: 'Выход' },
        ]
        : [{ key: '1', icon: <HomeOutlined />, label: 'Главная', path: '/' }, { key: '5', icon: <SettingOutlined />, label: 'Настройки', path: '/settings' },]

    if (loading) return <Spin size="large" fullscreen />;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AuthModal
                visible={showAuth || activationMode}
                activationMode={activationMode}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onActivate={handleActivate}
                onClose={closeAuth}
                loading={loading}
                error={error}
            />
            <div style={{
                ...positionStyles[dockPosition as keyof typeof positionStyles],
                position: 'fixed',
                padding: '8px 16px',
                background: 'var(--bg-color)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                zIndex: 1000,
            }}>
                {menuItems.map(item => (
                    item.type === 'divider' ? (
                        <Divider type="vertical" key="divider" style={{ height: 24 }} />
                    ) : (
                        <Tooltip key={item.key} title={item.label}>
                            <Button
                                shape="round"
                                icon={item.icon}
                                type={getSelectedKey() === item.key ? 'primary' : 'default'}
                                onClick={() => handleMenuClick(item.key)}
                                style={{
                                    transition: 'transform 0.2s ease',
                                    transform: getSelectedKey() === item.key ? 'scale(1.2)' : 'scale(1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    margin: '5px'
                                }}
                            >
                                {(['top', 'bottom'].includes(dockPosition) || !hideLabels) && (
                                    <span style={{ marginLeft: 4 }}>{item.label}</span>
                                )}
                            </Button>
                        </Tooltip>
                    )
                ))}
                {['left', 'right'].includes(dockPosition) && (
                    <Button
                        shape="circle"
                        icon={hideLabels ? <MenuOutlined /> : dockPosition === 'left' ? <RightOutlined /> : <LeftOutlined />}
                        onClick={toggleLabels}
                        style={{ margin: '5px' }}
                    />
                )}
            </div>

            <Layout>
                <Content style={contentStyles}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;