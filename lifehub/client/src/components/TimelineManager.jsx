import React, { useState, useRef, useEffect } from 'react'
import ConfirmModal from './ConfirmModal'
import '../styles/timeline-manager.css'

const TimelineManager = ({ timeline, onTimelineAdd, onTimelineUpdate, onTimelineDelete }) => {
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState({ time: '', activity: '', icon: '📝' })
  const [editingId, setEditingId] = useState(null)
  const [editItem, setEditItem] = useState({ time: '', activity: '', icon: '📝' })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, itemId: null })
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

  const startEdit = (item) => {
    setEditingId(item._id || item.id)
    setEditItem({
      time: item.time,
      activity: item.activity,
      icon: item.icon
    })
  }

  const handleUpdateItem = () => {
    if (editItem.time.trim() && editItem.activity.trim()) {
      onTimelineUpdate({
        _id: editingId,
        time: editItem.time,
        activity: editItem.activity,
        icon: editItem.icon
      })
      setEditingId(null)
      setEditItem({ time: '', activity: '', icon: '📝' })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditItem({ time: '', activity: '', icon: '📝' })
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
          timeline.map(item => {
            const isEditing = editingId === (item._id || item.id)
            return (
              <div key={item._id || item.id} className="timeline-item-card">
                {isEditing ? (
                  <div className="edit-timeline-form">
                    <div className="form-row">
                      <input
                        type="time"
                        value={editItem.time}
                        onChange={(e) => setEditItem({...editItem, time: e.target.value})}
                        className="time-input"
                      />
                      <input
                        type="text"
                        value={editItem.activity}
                        onChange={(e) => setEditItem({...editItem, activity: e.target.value})}
                        className="activity-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateItem()}
                      />
                      <select
                        value={editItem.icon}
                        onChange={(e) => setEditItem({...editItem, icon: e.target.value})}
                        className="icon-select"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-actions">
                      <button onClick={handleUpdateItem} className="save-btn">
                        ✓ Save
                      </button>
                      <button onClick={cancelEdit} className="cancel-btn">
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="timeline-item-main">
                    <div className="timeline-time-badge">{item.time}</div>
                    <div className="timeline-item-content">
                      <span className="timeline-item-icon">{item.icon}</span>
                      <span className="timeline-item-activity">{item.activity}</span>
                    </div>
                    <div className="timeline-item-actions">
                      <button
                        className="edit-timeline-btn"
                        onClick={() => startEdit(item)}
                        title="Edit timeline item"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-timeline-btn"
                        onClick={() => setConfirmModal({ isOpen: true, itemId: item._id || item.id })}
                        title="Delete timeline item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Timeline Item"
        message="Are you sure you want to delete this timeline item? This action cannot be undone."
        onConfirm={() => {
          onTimelineDelete(confirmModal.itemId)
          setConfirmModal({ isOpen: false, itemId: null })
        }}
        onCancel={() => setConfirmModal({ isOpen: false, itemId: null })}
      />
    </div>
  )
}

export default TimelineManager