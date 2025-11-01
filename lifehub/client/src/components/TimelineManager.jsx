import React, { useState, useRef, useEffect } from 'react'
import '../styles/timeline-manager.css'

const TimelineManager = ({ timeline, onTimelineAdd, onTimelineUpdate, onTimelineDelete }) => {
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ time: '', activity: '', icon: '📝' })
  const inputRef = useRef(null)

  useEffect(() => {
    if (isAddingItem && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingItem])

  const handleAddItem = () => {
    if (newItem.time.trim() && newItem.activity.trim()) {
      onTimelineAdd({
        time: newItem.time,
        activity: newItem.activity,
        icon: newItem.icon
      })
      setNewItem({ time: '', activity: '', icon: '📝' })
      setIsAddingItem(false)
    }
  }

  const iconOptions = ['📝', '🏋️', '💻', '🍽️', '📚', '🚗', '🛒', '👥', '🎯', '💤']

  return (
    <div className="timeline-manager">
      <div className="timeline-header">
        <h3>Daily Timeline</h3>
        <span className="timeline-count">{timeline.length} items</span>
      </div>

      {/* Add Timeline Item */}
      <div className="add-timeline-section">
        {!isAddingItem ? (
          <button 
            className="add-timeline-trigger"
            onClick={() => setIsAddingItem(true)}
          >
            <span className="add-icon">+</span>
            <span>Add Timeline Item</span>
          </button>
        ) : (
          <div className="add-timeline-form">
            <div className="form-row">
              <input
                ref={inputRef}
                type="time"
                value={newItem.time}
                onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                className="time-input"
              />
              <input
                type="text"
                placeholder="Enter activity..."
                value={newItem.activity}
                onChange={(e) => setNewItem({...newItem, activity: e.target.value})}
                className="activity-input"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <select
                value={newItem.icon}
                onChange={(e) => setNewItem({...newItem, icon: e.target.value})}
                className="icon-select"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button onClick={handleAddItem} className="save-btn">
                ✓ Add Item
              </button>
              <button 
                onClick={() => {
                  setIsAddingItem(false)
                  setNewItem({ time: '', activity: '', icon: '📝' })
                }} 
                className="cancel-btn"
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Items List */}
      <div className="timeline-items-list">
        {timeline.length === 0 ? (
          <div className="empty-timeline">
            <div className="empty-icon">🕐</div>
            <h4>No timeline items</h4>
            <p>Add your first timeline item to get started!</p>
          </div>
        ) : (
          timeline.map(item => (
            <div key={item._id || item.id} className="timeline-item-card">
              <div className="timeline-item-main">
                <div className="timeline-time-badge">{item.time}</div>
                <div className="timeline-item-content">
                  <span className="timeline-item-icon">{item.icon}</span>
                  <span className="timeline-item-activity">{item.activity}</span>
                </div>
                <button
                  className="delete-timeline-btn"
                  onClick={() => onTimelineDelete(item._id || item.id)}
                  title="Delete timeline item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TimelineManager