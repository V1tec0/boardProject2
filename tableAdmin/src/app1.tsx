import React, { useState, useEffect } from 'react';
import { Layout, Menu, Spin, Button, Tooltip, Divider, message as antdMessage } from 'antd';
import {
    HomeOutlined,
    CalendarOutlined,
    FileTextOutlined,
    MessageOutlined,
    SettingOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined
} from '@ant-design/icons';
import Schedule from './components/Schedule/Schedule';
import News from './components/News/News';
import Messages from './components/Messages/Messages';
import Settings from './components/Settings';
import MainPage from './components/MainPage/MainPage';
import AuthModal from './components/AuthModal';
import Users from './components/Users';

const { Sider, Content } = Layout;

const App: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [authVisible, setAuthVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState('');
    const [activationEmail, setActivationEmail] = useState('');
    const [selectedMenuItem, setSelectedMenuItem] = useState('1');
    const [activationMode, setActivationMode] = useState(false);
    const [useDockInterface, setUseDockInterface] = useState(() => {
        return localStorage.getItem('useDockInterface') === 'true';
    });

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
            const response = await fetch('http://localhost:8000/api/user/', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setUser(data);
                setIsAdmin(data.is_admin);
                setAuthVisible(false);
            } else {
                setUser(null);
                setAuthVisible(true);
            }
        } catch (err) {
            setUser(null);
            setAuthVisible(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { checkAuth(); }, []);

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        try {
            const csrfToken = await getCsrfToken();
            const response = await fetch('http://localhost:8000/api/session/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                checkAuth();
                setError('');
            } else {
                setError('Неправильный логин или пароль');
            }
        } catch (err) {
            setError('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };

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
                antdMessage.success('На почту отправлен код активации');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Ошибка регистрации');
            }
        } catch (err) {
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
                antdMessage.success('Аккаунт успешно активирован, войдите в систему.');
            } else {
                const data = await response.json();
                antdMessage.error(data.detail || 'Ошибка активации');
            }
        } catch (err) {
            antdMessage.error('Ошибка соединения');
        } finally {
            setLoading(false);
        }
    };


    const handleLogout = async () => {
        const xcsrfToken = await getCsrfToken();
        const sessionid = getCookie('sessionid')
        const csrfToken = getCookie('csrftoken')

        await fetch('http://localhost:8000/api/session/', {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': xcsrfToken,
                'Cookie': `csrftoken=${csrfToken}; sessionid=${sessionid}`
            },
            credentials: 'include',
        });
        setUser(null);
        setAuthVisible(true);
        setIsAdmin(false);
        localStorage.clear()
        document.cookie = ''
        setSelectedMenuItem('1');
    };

    const toggleInterfaceType = () => setUseDockInterface(!useDockInterface);

    const handleMenuClick = (key: string) => {
        if (key === 'toggle') toggleInterfaceType();
        else if (key === '6') handleLogout();
        else setSelectedMenuItem(key);
    };

    const menuItems = user
        ? [
            { key: '1', icon: <HomeOutlined />, label: 'Главная' },
            ...(isAdmin ? [{ key: '7', icon: <UserOutlined />, label: 'Пользователи' }] : []),
            { key: '2', icon: <CalendarOutlined />, label: 'Расписание' },
            { key: '3', icon: <FileTextOutlined />, label: 'Новости' },
            { key: '4', icon: <MessageOutlined />, label: 'Сообщения' },
            { key: '5', icon: <SettingOutlined />, label: 'Настройки' },
            { key: 'toggle', icon: useDockInterface ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />, label: useDockInterface ? 'Обычное меню' : 'Док-меню' },
            { type: 'divider' },
            { key: '6', icon: <LogoutOutlined />, label: 'Выход' },
        ]
        : [{ key: '1', icon: <HomeOutlined />, label: 'Главная' }];

    const renderContent = () => {
        if (!user) return <div>Пожалуйста, авторизуйтесь</div>;
        switch (selectedMenuItem) {
            case '1': return <MainPage user={user} />;
            case '2': return <Schedule />;
            case '3': return <News />;
            case '4': return <Messages />;
            case '5': return <Settings />;
            case '7': return isAdmin ? <Users user={user} /> : null;
            default: return null;
        }
    };

    if (loading) return <Spin size="large" fullscreen />;

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AuthModal
                visible={authVisible || activationMode}
                activationMode={activationMode}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onActivate={handleActivate}
                onClose={() => {
                    setAuthVisible(false);
                    setActivationMode(false);
                }}
                loading={loading}
                error={error}
            />
            {!useDockInterface ? (
                <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ background: 'transparent' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedMenuItem]}
                        items={menuItems}
                        onClick={({ key }) => handleMenuClick(key)}
                        style={{ background: 'transparent' }}
                    />
                </Sider>
            ) : (
                <div style={{
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
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
                                    shape={'round'}
                                    icon={item.icon}
                                    type={selectedMenuItem === item.key ? 'primary' : 'default'}
                                    onClick={() => handleMenuClick(item.key)}
                                    style={{
                                        transition: 'transform 0.2s ease',
                                        transform: selectedMenuItem === item.key ? 'scale(1.2)' : 'scale(1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        margin: '5px'
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)';
                                        const prev = e.currentTarget.previousSibling as HTMLElement;
                                        const next = e.currentTarget.nextSibling as HTMLElement;
                                        if (prev) prev.style.transform = 'scale(1)';
                                        if (next) next.style.transform = 'scale(1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.transform = selectedMenuItem === item.key ? 'scale(1.3)' : 'scale(1)';
                                        const prev = e.currentTarget.previousSibling as HTMLElement;
                                        const next = e.currentTarget.nextSibling as HTMLElement;
                                        if (prev) prev.style.transform = 'scale(1)';
                                        if (next) next.style.transform = 'scale(1)';
                                    }}
                                >
                                    <span style={{ marginLeft: 4 }}>{item.label}</span>
                                </Button>
                            </Tooltip>
                        )
                    ))}
                </div>
            )}

            <Layout>
                <Content style={{ margin: useDockInterface ? 0 : 24, padding: 24, width: !useDockInterface ? 'calc(100vw - 300px)' : '100vw', background: 'var(--bg-color)' }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;