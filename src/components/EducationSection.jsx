import { useState } from 'react'
import './EducationSection.css'

const LEVELS = ['Secundaria', 'Técnico', 'Universitario Pregrado', 'Universitario Postgrado', 'Maestría', 'Doctorado', 'Otro']
const STATUSES = ['En curso', 'Completado', 'Incompleto']
const currentYear = new Date().getFullYear()
const earlyyears = Array.from({ length: 30 }, (_, i) => currentYear - i)
const lateyears = Array.from({ length: 60 }, (_, i) => (currentYear - 30) + i)

export default function EducationSection({ education, onAdd, onUpdate, onDelete }) {
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({
        institution: '', career: '', level: 'Universitario Pregrado',
        status: 'En curso', start_year: currentYear, end_year: '',
    })

    const resetForm = () => {
        setForm({ institution: '', career: '', level: 'Universitario Pregrado', status: 'En curso', start_year: currentYear, end_year: '' })
        setEditingId(null)
        setShowForm(false)
    }

    const handleEdit = (edu) => {
        setForm({
            institution: edu.institution,
            career: edu.career,
            level: edu.level,
            status: edu.status,
            start_year: edu.start_year,
            end_year: edu.end_year || '',
        })
        setEditingId(edu.id)
        setShowForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (editingId) {
            await onUpdate(editingId, form)
        } else {
            await onAdd(form)
        }
        resetForm()
    }

    return (
        <div className="education-section">
            <div className="education-section__header">
                <h3 className="education-section__title">Estudios académicos</h3>
                {!showForm && (
                    <button className="education-section__add-btn" onClick={() => setShowForm(true)}>
                        + Agregar
                    </button>
                )}
            </div>

            {showForm && (
                <form className="education-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Institución</label>
                            <input className="form-input" required
                                value={form.institution}
                                onChange={e => setForm(p => ({ ...p, institution: e.target.value }))}
                                placeholder="Universidad Nacional Mayor de San Marcos" />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Carrera</label>
                            <input className="form-input" required
                                value={form.career}
                                onChange={e => setForm(p => ({ ...p, career: e.target.value }))}
                                placeholder="Ingeniería de Sistemas" />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Nivel</label>
                            <select className="form-input" value={form.level}
                                onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                                {LEVELS.map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Estado</label>
                            <select className="form-input" value={form.status}
                                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {STATUSES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label className="form-label">Año de inicio</label>
                            <select className="form-input" value={form.start_year}
                                onChange={e => setForm(p => ({ ...p, start_year: parseInt(e.target.value) }))}>
                                {earlyyears.map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Año de fin <span className="form-label__hint">(opcional)</span></label>
                            <select className="form-input" value={form.end_year}
                                onChange={e => setForm(p => ({ ...p, end_year: e.target.value ? parseInt(e.target.value) : '' }))}>
                                <option value="">En curso</option>
                                {lateyears.filter(y => y >= form.start_year).map(y => <option key={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-retry" onClick={resetForm}>Cancelar</button>
                        <button type="submit" className="form-save-btn">
                            {editingId ? 'Guardar cambios' : 'Agregar estudio'}
                        </button>
                    </div>
                </form>
            )}

            {education.length === 0 && !showForm && (
                <p className="education-section__empty">No has agregado estudios aún.</p>
            )}

            <div className="education-list">
                {education.map(edu => (
                    <div key={edu.id} className="education-card">
                        <div className="education-card__left">
                            <div className="education-card__icon">🎓</div>
                            <div>
                                <p className="education-card__career">{edu.career}</p>
                                <p className="education-card__institution">{edu.institution}</p>
                                <div className="education-card__tags">
                                    <span className="education-card__tag">{edu.level}</span>
                                    <span className={`education-card__tag education-card__tag--${edu.status === 'Completado' ? 'done' : edu.status === 'En curso' ? 'active' : 'incomplete'}`}>
                                        {edu.status}
                                    </span>
                                    <span className="education-card__tag education-card__tag--year">
                                        {edu.start_year}{edu.end_year ? ` — ${edu.end_year}` : ' — Presente'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="education-card__actions">
                            <button className="education-card__btn" onClick={() => handleEdit(edu)}>Editar</button>
                            <button className="education-card__btn education-card__btn--delete" onClick={() => onDelete(edu.id)}>✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}