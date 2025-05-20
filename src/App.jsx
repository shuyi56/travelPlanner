import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Switch, Space, Grid } from 'antd';
import { WalletOutlined, CalendarOutlined, CarOutlined, BulbOutlined, BulbFilled, HomeOutlined } from '@ant-design/icons';
import { antdTheme } from './theme';
import TripPlanning from './components/TripPlanner/TripPlanning';
import TimeTable from './components/TimeTable';
import Budgeting from './components/Budgeting';
import Ideas from './components/Ideas/Ideas';
import Trips from './components/Trips/Trips';
import { theme as antdThemeToken } from 'antd';
import '@ant-design/v5-patch-for-react-19';
import { LoadScript } from '@react-google-maps/api';

const { Sider, Content, Header } = Layout;
const { useBreakpoint } = Grid;

const items = [
  { label: 'My Trips', key: '/', icon: <HomeOutlined /> },
  { label: 'Trip Planning', key: '/trip-planning/:id', icon: <CarOutlined /> },
  { label: 'Time Table', key: '/timetable', icon: <CalendarOutlined /> },
  { label: 'Budgeting', key: '/budgeting', icon: <WalletOutlined /> },
  { label: 'Ideas', key: '/ideas', icon: <BulbOutlined /> },
];

const GOOGLE_MAPS_LIBRARIES = ['places'];

function SidebarMenu({ mode = "inline", onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Menu
      mode={mode}
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => {
        navigate(key);
        if (onMenuClick) onMenuClick();
      }}
      style={mode === "horizontal"
        ? { borderBottom: 0, minWidth: 0, flex: 1 }
        : { height: '100%', borderRight: 0 }
      }
    />
  );
}

function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <Space style={{ marginLeft: 24, marginBottom: 16 }}>
      {darkMode ? <BulbFilled style={{ color: '#facc15' }} /> : <BulbOutlined />}
      <Switch
        checked={darkMode}
        onChange={setDarkMode}
        checkedChildren="Dark"
        unCheckedChildren="Light"
      />
    </Space>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMedium = windowWidth <= 768;

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const lightTokens = {
    ...antdTheme.token,
    colorBgBase: '#F7FAFC',
    colorTextBase: '#1E293B',
    colorBgContainer: '#fff',
    colorPrimary: '#3B82F6',
    colorPrimaryHover: '#2563EB',
    colorPrimaryActive: '#1D4ED8',
    borderRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  };

  const darkTokens = {
    ...antdTheme.token,
    colorBgBase: '#18181b',
    colorTextBase: '#f3f4f6',
    colorBgContainer: '#23272f',
    colorPrimary: '#60a5fa',
    colorPrimaryHover: '#3b82f6',
    colorPrimaryActive: '#2563eb',
    borderRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  };

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <>
      <style>
        {`.ant-layout-sider-trigger { display: none !important; }`}
      </style>
      <ConfigProvider
        theme={{
          ...antdTheme,
          algorithm: darkMode
            ? antdThemeToken.darkAlgorithm
            : antdThemeToken.defaultAlgorithm,
          cssVar: true,
          token: darkMode ? darkTokens : lightTokens,
          components: {
            Button: {
              colorPrimary: darkMode ? '#60a5fa' : '#3B82F6',
              colorPrimaryHover: darkMode ? '#3b82f6' : '#2563EB',
              colorPrimaryActive: darkMode ? '#2563eb' : '#1D4ED8',
              borderRadius: 8,
            },
            Card: {
              borderRadius: 12,
              colorBgContainer: darkMode ? '#23272f' : '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              colorText: darkMode ? '#f3f4f6' : '#1E293B',
            },
            Input: {
              borderRadius: 6,
              colorBgContainer: darkMode ? '#23272f' : '#fff',
              colorText: darkMode ? '#f3f4f6' : '#1E293B',
            },
            Modal: {
              borderRadius: 12,
              colorBgElevated: darkMode ? '#23272f' : '#fff',
              colorText: darkMode ? '#f3f4f6' : '#1E293B',
            },
          },
        }}
      >
        <LoadScript
          googleMapsApiKey={googleMapsApiKey}
          libraries={GOOGLE_MAPS_LIBRARIES}
        >
          <Router>
            <Layout style={{ minHeight: '100vh' }}>
              {isMedium ? (
                <>
                  <Header
                    style={{
                      background: darkMode ? '#23272f' : '#fff',
                      padding: '0 32px',
                      display: 'flex',
                      alignItems: 'center',
                      height: 64,
                      borderBottom: `1px solid ${darkMode ? '#23272f' : '#f0f0f0'}`,
                      zIndex: 100,
                    }}
                  >
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: 22,
                      color: darkMode ? '#f3f4f6' : undefined,
                      marginRight: 32,
                      flexShrink: 0,
                    }}>
                      Travel Planner
                    </div>
                    <SidebarMenu mode="horizontal" />
                    <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                  </Header>
                  <Layout>
                    <Content style={{
                      margin: '2.5vh 2.5vw',
                      background: darkMode ? '#18181b' : '#fff',
                      padding: 24,
                      color: darkMode ? '#f3f4f6' : undefined,
                      minHeight: '100vh',
                      overflowY: 'auto'
                    }}>
                      <Routes>
                        <Route path="/" element={<Trips />} />
                        <Route path="/trip-planning/:id" element={<TripPlanning />} />
                        <Route path="/timetable" element={<TimeTable />} />
                        <Route path="/budgeting" element={<Budgeting />} />
                        <Route path="/ideas" element={<Ideas darkMode={darkMode} />} />
                      </Routes>
                    </Content>
                  </Layout>
                </>
              ) : (
                <>
                  <Sider 
                    width={220} 
                    style={{ 
                      background: darkMode ? '#23272f' : '#fff',
                      position: 'fixed',
                      height: '100vh',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      overflowY: 'hidden',
                      zIndex: 100,
                    }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                  >
                    <div style={{ padding: 24, fontWeight: 'bold', fontSize: 22, color: darkMode ? '#f3f4f6' : undefined }}>
                      Travel Planner
                    </div>
                    <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                    <SidebarMenu />
                  </Sider>
                  <Layout style={{ marginLeft: 220 }}>
                    <Content style={{
                      margin: '2.5vh 2.5vw',
                      background: darkMode ? '#18181b' : '#fff',
                      padding: 24,
                      color: darkMode ? '#f3f4f6' : undefined,
                      minHeight: '100vh',
                      overflowY: 'auto'
                    }}>
                      <Routes>
                        <Route path="/" element={<Trips />} />
                        <Route path="/trip-planning/:id" element={<TripPlanning />} />
                        <Route path="/timetable" element={<TimeTable />} />
                        <Route path="/budgeting" element={<Budgeting />} />
                        <Route path="/ideas" element={<Ideas darkMode={darkMode} />} />
                      </Routes>
                    </Content>
                  </Layout>
                </>
              )}
            </Layout>
          </Router>
        </LoadScript>
      </ConfigProvider>
    </>
  );
}

export default App;
