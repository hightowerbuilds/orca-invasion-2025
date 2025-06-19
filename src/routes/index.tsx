import { createFileRoute, Link } from '@tanstack/react-router'
import '../App.css'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="index-container">
      <h1>Orca Invasion</h1>
      <p>
        move around with arrow keys, attack with spacebar
      </p>
      <Link to="/game" className="start-game-button">
        Start Game
      </Link>
    </div>
  )
}
