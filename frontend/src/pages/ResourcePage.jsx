import { useEffect, useMemo, useState } from 'react'
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from '@/api/resources'
import { getApiErrorMessage } from '@/api/errors'

const configs = {
  students: {
    title: 'Students',
    fields: ['name', 'email', 'classLevel'],
  },
  staff: {
    title: 'Staff',
    fields: ['name', 'email', 'role'],
  },
  courses: {
    title: 'Courses',
    fields: ['name', 'code', 'teacherId'],
  },
  attendance: {
    title: 'Attendance',
    fields: ['studentId', 'date', 'status'],
  },
  results: {
    title: 'Results',
    fields: ['studentId', 'subjectId', 'score'],
    // Note: Delete not supported by backend. Grade, released, locked are read-only server-side.
    canDelete: false,
  },
  notifications: {
    title: 'Notifications',
    fields: ['title', 'message', 'audience'],
  },
  settings: {
    title: 'Settings',
    fields: ['key', 'value'],
  },
}

function getId(item) {
  return item.id || item._id
}

function emptyForm(fields) {
  return fields.reduce((acc, field) => ({ ...acc, [field]: '' }), {})
}

function formatValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export default function ResourcePage({ resource }) {
  const config = configs[resource]
  const [items, setItems] = useState([])
  const [form, setForm] = useState(() => emptyForm(config.fields))
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const columns = useMemo(() => {
    const keys = new Set(['id', ...config.fields])
    items.slice(0, 5).forEach((item) => {
      Object.keys(item || {}).forEach((key) => {
        if (!['_id', '__v'].includes(key)) keys.add(key)
      })
    })
    return Array.from(keys)
  }, [config.fields, items])

  async function loadItems(showLoading = true) {
    try {
      if (showLoading) setLoading(true)
      const data = await listResource(resource)
      setItems(data)
      setError('')
    } catch (err) {
      setError(getApiErrorMessage(err, `Unable to load ${config.title}`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true

    listResource(resource)
      .then((data) => {
        if (alive) {
          setItems(data)
          setError('')
        }
      })
      .catch((err) => {
        if (alive) {
          setError(getApiErrorMessage(err, `Unable to load ${config.title}`))
        }
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [config.title, resource])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function startEdit(item) {
    setEditingId(getId(item))
    setForm(
      config.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field]: formatValue(item[field]),
        }),
        {}
      )
    )
  }

  function resetForm() {
    setEditingId('')
    setForm(emptyForm(config.fields))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        await updateResource(resource, editingId, form)
      } else {
        await createResource(resource, form)
      }
      resetForm()
      await loadItems(false)
    } catch (err) {
      setError(getApiErrorMessage(err, `Unable to save ${config.title}`))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    const id = getId(item)
    if (!id) {
      setError('Cannot delete this item because it has no id.')
      return
    }

    try {
      await deleteResource(resource, id)
      await loadItems(false)
    } catch (err) {
      setError(getApiErrorMessage(err, `Unable to delete ${config.title}`))
    }
  }

  return (
    <section>
      <h1>{config.title}</h1>
      {error && <p role="alert">{error}</p>}
      <form className="resource-form" onSubmit={handleSubmit}>
        {config.fields.map((field) => (
          <label key={field}>
            <span>{field}</span>
            <input name={field} value={form[field]} onChange={handleChange} required />
          </label>
        ))}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading {config.title.toLowerCase()}...</p>
      ) : items.length === 0 ? (
        <p>No {config.title.toLowerCase()} found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={getId(item) || index}>
                  {columns.map((column) => (
                    <td key={column}>{formatValue(column === 'id' ? getId(item) : item[column])}</td>
                  ))}
                  <td>
                    <button type="button" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    {config.canDelete === true && (
                      <button type="button" onClick={() => handleDelete(item)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
