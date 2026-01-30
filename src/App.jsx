import { Route, Routes } from 'react-router'
import './App.css'
import Login from './pages/Login/Login'
import RequireAuth from './auth/RequireAuth'
import AdminLayout from './layouts/AdminLayout'
import adminRoutes from './utils/routes/adminRoutes'
import { Toaster } from 'react-hot-toast'
import ErrorPage from './pages/ErrorPage'
import SuperAdminLayout from './layouts/SuperAdminLayout'
import superAdminRoutes from './utils/routes/superAdminRoutes'
import BrokerLayout from './layouts/BrokerLayout'
import brokerRoutes from './utils/routes/brokerRoutes'
import ADfactories from './pages/ADfactories/ADfactories'
import ADcontrol from './pages/ADcontrol/ADcontrol'
import ADcategories from './pages/ADcategories/ADcategories'

function App() {

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<RequireAuth role={"SuperAdmin"} />}>
          <Route path='/superadmin' element={<SuperAdminLayout />}>
            {superAdminRoutes.map((r) => {
              return (
                <Route key={r.name} path={r.path} element={r.element} />
              )
            })}
          </Route>
        </Route>
        <Route element={<RequireAuth role={"Admin"} />}>
          <Route path='/' element={<AdminLayout />}>
            {adminRoutes.map((r) => {
              return (
                <Route key={r.name} path={r.path} element={r.element} />
              )
            })}
            <Route path='factories' element={<ADcontrol />}>
              <Route index element={<ADfactories />} />
              <Route path='categories' element={<ADcategories />} />
            </Route>
          </Route>
        </Route>
        <Route element={<RequireAuth role={"Broker"} />}>
          <Route path='/operator' element={<BrokerLayout />}>
            {brokerRoutes.map((r) => {
              return (
                <Route key={r.name} path={r.path} element={r.element} />
              )
            })}
          </Route>
        </Route>
        <Route path='*' element={<ErrorPage />} />
      </Routes>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  )
}

export default App
