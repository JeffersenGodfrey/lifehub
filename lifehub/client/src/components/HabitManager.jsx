import React, { useState } from 'react'
import { habitAPI } from '../services/api'
import '../styles/habit-manager.css'

const HabitManager = ({ habits, onHabitAdd, onHabitToggle, onHabitDelete }) => {
  const [isAddingHabit, setIsAddingHabit] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', icon: '🏃♂️' })

  const handleAddHabit = async () => {
    if (newHabit.name.trim()) {
      try {
        const habitData = {
          name: `${newHabit.icon} ${newHabit.name}`,
          completed: false
        }
        const createdHabit = await habitAPI.createHabit(habitData)
        onHabitAdd(createdHabit)
        setNewHabit({ name: '', icon: '🏃♂️' })
        setIsAddingHabit(false)
      } catch (error) {
        console.error('Failed to add habit:', error)
        alert('Failed to create habit. Please try again.')
      }
    }
  }

  const habitIcons = ['🏃♂️', '🧘♀️', '📚', '💧', '🥗', '🎯', '💤', '🚶♂️', '🧠', '❤️']

  return (
    <div className="habit-manager">
      {/* Add Habit Section */}
      <div className="add-habit-section">
        {!isAddingHabit ? (
          <button 
            className="add-habit-btn"
            onClick={() => setIsAddingHabit(true)}
          >
            + Add Habit
          </button>
        ) : (
          <div className="add-habit-form">
            <div className="habit-form-row">
              <select
                value={newHabit.icon}
                onChange={(e) => setNewHabit({...newHabit, icon: e.target.value})}
                className="habit-icon-select"
              >
                {habitIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter habit name..."
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                className="habit-name-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
              />
            </div>
            <div className="habit-form-actions">
              <button onClick={handleAddHabit} className="save-habit-btn">
                ✓ Add
              </button>
              <button 
                onClick={() => {
                  setIsAddingHabit(false)
                  setNewHabit({ name: '', icon: '🏃♂️' })
                }} 
                className="cancel-habit-btn"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Habits List */}
      <div className="habit-list">
        {habits.map(habit => (
          <div key={habit._id || habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
            <span className="habit-name">{habit.name}</span>
            <div className="habit-actions">
              <button
                className="habit-toggle"
                onClick={() => onHabitToggle(habit._id || habit.id)}
              >
                {habit.completed ? '✅' : '⏳'}
              </button>
              <button
                className="habit-delete"
                onClick={() => onHabitDelete(habit._id || habit.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="empty-habits">
          <div className="empty-habits-icon">🎯</div>
          <p>No habits yet. Add your first habit to get started!</p>
        </div>
      )}
    </div>
  )
}

export default HabitManager