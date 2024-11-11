import React, { useState } from 'react';
import { Plus, ChevronRight, Edit2, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useGoals, Goal, GoalInput, SubGoal } from '../hooks/useGoals';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const translations = {
  en: {
    title: 'Goals',
    subtitle: 'Track and manage your personal goals',
    newGoal: 'New Goal',
    loading: 'Loading goals...',
    noGoals: 'No goals yet. Create your first goal!',
    form: {
      title: 'Title',
      description: 'Description',
      category: 'Category',
      targetDate: 'Target Date',
      save: 'Save',
      cancel: 'Cancel'
    },
    subGoals: {
      add: 'Add Sub-goal',
      title: 'Sub-goals',
      placeholder: 'Enter sub-goal title',
      maxReached: 'Maximum number of sub-goals reached',
      addSuccess: 'Sub-goal added successfully',
      deleteSuccess: 'Sub-goal deleted successfully',
      updateSuccess: 'Sub-goal updated successfully'
    }
  },
  fr: {
    title: 'Objectifs',
    subtitle: 'Suivez et gérez vos objectifs personnels',
    newGoal: 'Nouvel Objectif',
    loading: 'Chargement des objectifs...',
    noGoals: 'Aucun objectif pour le moment. Créez votre premier objectif !',
    form: {
      title: 'Titre',
      description: 'Description',
      category: 'Catégorie',
      targetDate: 'Date Cible',
      save: 'Enregistrer',
      cancel: 'Annuler'
    },
    subGoals: {
      add: 'Ajouter un sous-objectif',
      title: 'Sous-objectifs',
      placeholder: 'Entrez le titre du sous-objectif',
      maxReached: 'Nombre maximum de sous-objectifs atteint',
      addSuccess: 'Sous-objectif ajouté avec succès',
      deleteSuccess: 'Sous-objectif supprimé avec succès',
      updateSuccess: 'Sous-objectif mis à jour avec succès'
    }
  }
};

export default function Goals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, addSubGoal, updateSubGoal, deleteSubGoal } = useGoals();
  const { settings } = useSettings();
  const t = translations[settings.language];
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState<GoalInput>({
    title: '',
    description: '',
    targetDate: new Date(),
    category: ''
  });
  const [newSubGoal, setNewSubGoal] = useState('');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      await updateGoal(editingGoal.id, formData);
    } else {
      await addGoal(formData);
    }
    
    setIsFormOpen(false);
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      targetDate: new Date(),
      category: ''
    });
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      category: goal.category
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(goalId);
    }
  };

  const handleAddSubGoal = async (goalId: string) => {
    if (!newSubGoal.trim()) return;

    try {
      await addSubGoal(goalId, newSubGoal.trim());
      setNewSubGoal('');
      toast.success(t.subGoals.addSuccess);
    } catch (error) {
      console.error('Error adding sub-goal:', error);
      if (error instanceof Error && error.message.includes('Cannot add more than')) {
        toast.error(t.subGoals.maxReached);
      } else {
        toast.error('Failed to add sub-goal');
      }
    }
  };

  const handleToggleSubGoal = async (goalId: string, subGoalId: string, completed: boolean) => {
    try {
      await updateSubGoal(goalId, subGoalId, { completed });
      toast.success(t.subGoals.updateSuccess);
    } catch (error) {
      console.error('Error updating sub-goal:', error);
      toast.error('Failed to update sub-goal');
    }
  };

  const handleDeleteSubGoal = async (goalId: string, subGoalId: string) => {
    try {
      await deleteSubGoal(goalId, subGoalId);
      toast.success(t.subGoals.deleteSuccess);
    } catch (error) {
      console.error('Error deleting sub-goal:', error);
      toast.error('Failed to delete sub-goal');
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t.loading}</div>;
  }

  return (
    <div className="space-y-6">
      <header className="bg-white shadow-sm rounded-lg p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.newGoal}
        </button>
      </header>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {goals.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{t.noGoals}</div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">{goal.progress}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{goal.title}</h2>
                    <p className="text-sm text-gray-500">
                      {new Date(goal.targetDate).toLocaleDateString(
                        settings.language === 'fr' ? 'fr-FR' : 'en-US',
                        { dateStyle: 'long' }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-2 text-gray-400 hover:text-purple-600"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="mt-2 text-sm text-gray-600">{goal.description}</p>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  className="flex items-center text-sm text-gray-600 hover:text-purple-600"
                >
                  <ChevronRight
                    className={`w-4 h-4 mr-1 transform transition-transform ${
                      expandedGoal === goal.id ? 'rotate-90' : ''
                    }`}
                  />
                  {t.subGoals.title} ({goal.subGoals?.length || 0})
                </button>

                {expandedGoal === goal.id && (
                  <div className="mt-2 pl-6 space-y-2">
                    {goal.subGoals?.map((subGoal) => (
                      <div key={subGoal.id} className="flex items-center group">
                        <button
                          onClick={() => handleToggleSubGoal(goal.id, subGoal.id, !subGoal.completed)}
                          className="flex items-center flex-1"
                        >
                          {subGoal.completed ? (
                            <CheckCircle className="w-4 h-4 text-purple-600 mr-2" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <span className={`text-sm ${subGoal.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {subGoal.title}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDeleteSubGoal(goal.id, subGoal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newSubGoal}
                        onChange={(e) => setNewSubGoal(e.target.value)}
                        placeholder={t.subGoals.placeholder}
                        className="flex-1 text-sm rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddSubGoal(goal.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddSubGoal(goal.id)}
                        className="ml-2 p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                    <div
                      style={{ width: `${goal.progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingGoal ? t.form.edit : t.form.create}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t.form.title}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t.form.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t.form.category}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="">Select a category</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="career">Career</option>
                  <option value="education">Education</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t.form.targetDate}
                </label>
                <input
                  type="date"
                  value={formData.targetDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, targetDate: new Date(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingGoal(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  {t.form.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  {t.form.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}