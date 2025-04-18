import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, ConfigProvider, Switch, Space } from 'antd';
import { WalletOutlined, CalendarOutlined, CarOutlined, BulbOutlined, BulbFilled } from '@ant-design/icons';
import { antdTheme } from './theme';
import TripPlanning from './components/TripPlanning';
import TimeTable from './components/TimeTable';
import Budgeting from './components/Budgeting';
import Ideas from './components/Ideas'; // Add this import
import { theme as antdThemeToken } from 'antd';
import '@ant-design/v5-patch-for-react-19'
const { Sider, Content } = Layout;

const items = [
  { label: 'Trip Planning', key: '/', icon: <CarOutlined /> },
  { label: 'Time Table', key: '/timetable', icon: <CalendarOutlined /> },
  { label: 'Budgeting', key: '/budgeting', icon: <WalletOutlined /> },
  { label: 'Ideas', key: '/ideas', icon: <BulbOutlined /> }, // Add Ideas tab
];

function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
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

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Define tokens for both light and dark modes
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

  return (
    <ConfigProvider
      theme={{
        ...antdTheme,
        algorithm: darkMode
          ? antdThemeToken.darkAlgorithm
          : antdThemeToken.defaultAlgorithm,
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
      <Router>
        <Layout >
          <Sider width={220} style={{ background: darkMode ? '#23272f' : '#fff' }}>
            <div style={{ padding: 24, fontWeight: 'bold', fontSize: 22, color: darkMode ? '#f3f4f6' : undefined }}>
              Travel Planner
            </div>
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <SidebarMenu />
          </Sider>
          <Layout>
            <Content style={{
              margin: '24px 16px 0',
              background: darkMode ? '#18181b' : '#fff',
              padding: 24,
              color: darkMode ? '#f3f4f6' : undefined,
              minHeight: '100vh'
            }}>
              <Routes>
                <Route path="/" element={<TripPlanning />} />
                <Route path="/timetable" element={<TimeTable />} />
                <Route path="/budgeting" element={<Budgeting />} />
                <Route path="/ideas" element={<Ideas />} /> {/* Add Ideas route */}
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
