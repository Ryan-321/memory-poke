import { Typography } from '@mui/material'
import './App.css'

import Board from './components/Board'

function App() {
  // make a call to get pokemon and transform them into objects
  return (
    <>
      <Typography variant='h3'>
        Pokemon Memory
      </Typography>
      <Board />
    </>
  )
}

export default App
