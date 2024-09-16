import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RouterUrl } from './routes';
import { AdminSide, Public } from './layout';
import { LoginPage } from './pages/index'

function App() {
  const router = createBrowserRouter([
    {
      path:RouterUrl.Login,
      element: <Public />,
      children: [
        { path: RouterUrl.Login, element: <LoginPage />},
      ]
    },
    {
      path: RouterUrl.Login,
      element:<AdminSide />,
      children:[
        
      ]
    }
  ])
  return (
    <RouterProvider router={router} fallbackElement={<h6>Loading...</h6>} />
  )
}

export default App
