import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Teachers from "./pages/Teachers";
import Batches from "./pages/Batches"
import Landing from "./pages/Landing";
import OAuthSuccess from "./pages/oauth-success";
import StudentRegistration from "./pages/StudentRegistration";
import EditStudent from "./pages/EditStudent";
import Fees from "./pages/Fees";
import AddTeacher from "./pages/AddTeacher";
import EditTeacher from "./pages/EditTeacher";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/oauth-success"
           element={
            <OAuthSuccess />
          } 
        />

        <Route
          path="/"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" />
              : <Landing />
          }
        />

        <Route
          path="/login"
          element={
            localStorage.getItem("token")
              ? <Navigate to="/dashboard" />
              : <Login />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Layout>
                <Students />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers"
          element={
            <ProtectedRoute>
              <Layout>
                <Teachers />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/new"
          element= {
            <ProtectedRoute>
              <Layout>
                <AddTeacher />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teachers/edit/:id"
          element= {
            <ProtectedRoute>
              <Layout>
                <EditTeacher />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/batches"
          element={
            <ProtectedRoute>
              <Layout>
                <Batches />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/new"
          element= {
            <ProtectedRoute>
              <Layout>
                <StudentRegistration />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/edit/:id"
          element= {
            <ProtectedRoute>
              <Layout>
                <EditStudent />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/fee/:id"
          element= {
            <ProtectedRoute>
              <Layout>
                <Fees />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;