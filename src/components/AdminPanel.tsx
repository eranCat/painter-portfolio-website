import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getPaintings, deletePainting, addPainting, updatePainting, getImageUrl } from '../services/paintingService';
import { getContacts, deleteContact } from '../services/contactService';
import { Painting } from '../types/painting';
import { Contact } from '../types/contact';

export const AdminPanel = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'paintings' | 'contacts'>('paintings');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleHe: '',
    descriptionEn: '',
    descriptionHe: '',
    imageUrl: '',
    image: null as File | null,
    category: 'abstract',
    year: new Date().getFullYear(),
    price: 0,
    dimensions: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paintingsData, contactsData] = await Promise.all([
        getPaintings(),
        getContacts(),
      ]);
      setPaintings(paintingsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePainting = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this painting?')) {
      try {
        await deletePainting(id);
        setPaintings(paintings.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Error deleting painting:', error);
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      titleEn: '',
      titleHe: '',
      descriptionEn: '',
      descriptionHe: '',
      imageUrl: '',
      image: null,
      category: 'abstract',
      year: new Date().getFullYear(),
      price: 0,
      dimensions: '',
    } as any);
    setShowForm(true);
  };

  const handleEditClick = (painting: Painting) => {
    setEditingId(painting.id);
    setFormData({
      titleEn: painting.title.en,
      titleHe: painting.title.he,
      descriptionEn: painting.description.en,
      descriptionHe: painting.description.he,
      imageUrl: painting.imageUrl,
      image: null,
      category: painting.category,
      year: painting.year,
      price: painting.price,
      dimensions: painting.dimensions,
    } as any);
    setShowForm(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let imageUrl = '';

      // Use file if selected, otherwise use URL
      if (formData.image) {
        imageUrl = await getImageUrl(formData.image);
      } else if (formData.imageUrl) {
        imageUrl = formData.imageUrl;
      }

      if (!imageUrl) {
        alert('Please select an image or provide an image URL');
        return;
      }

      if (editingId) {
        await updatePainting(editingId, {
          title: { en: formData.titleEn, he: formData.titleHe },
          description: { en: formData.descriptionEn, he: formData.descriptionHe },
          imageUrl,
          category: formData.category,
          year: formData.year,
          price: formData.price,
          dimensions: formData.dimensions,
        });
        const updatedPaintings = paintings.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: { en: formData.titleEn, he: formData.titleHe },
                description: { en: formData.descriptionEn, he: formData.descriptionHe },
                imageUrl,
                category: formData.category,
                year: formData.year,
                price: formData.price,
                dimensions: formData.dimensions,
              }
            : p
        );
        setPaintings(updatedPaintings);
      } else {
        await addPainting(
          {
            titleEn: formData.titleEn,
            titleHe: formData.titleHe,
            descriptionEn: formData.descriptionEn,
            descriptionHe: formData.descriptionHe,
            category: formData.category,
            year: formData.year,
            price: formData.price,
            dimensions: formData.dimensions,
            image: null,
          },
          imageUrl
        );
        await loadData();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving painting:', error);
      alert('Error saving painting. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('paintings')}
          className={`pb-3 px-4 font-light tracking-wide transition-colors ${
            tab === 'paintings'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.paintings')}
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`pb-3 px-4 font-light tracking-wide transition-colors ${
            tab === 'contacts'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.contacts')}
        </button>
      </div>

      {/* Paintings Tab */}
      {tab === 'paintings' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddClick}
            className="mb-6 px-6 py-2 bg-black text-white rounded-lg font-light hover:bg-gray-800"
          >
            + {t('admin.addPainting')}
          </motion.button>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : paintings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No paintings yet. Create your first one!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-light">Title</th>
                    <th className="px-4 py-3 font-light">Year</th>
                    <th className="px-4 py-3 font-light">Price</th>
                    <th className="px-4 py-3 font-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paintings.map((painting) => (
                    <motion.tr
                      key={painting.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{painting.title.en}</td>
                      <td className="px-4 py-3">{painting.year}</td>
                      <td className="px-4 py-3">${painting.price}</td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditClick(painting)}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        >
                          {t('admin.edit')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePainting(painting.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          {t('admin.delete')}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Contacts Tab */}
      {tab === 'contacts' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-light">
                No contact messages yet. When visitors contact you, they'll appear here!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-light">Name</th>
                    <th className="px-4 py-3 font-light">Email</th>
                    <th className="px-4 py-3 font-light">Message</th>
                    <th className="px-4 py-3 font-light">Date</th>
                    <th className="px-4 py-3 font-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <motion.tr
                      key={contact.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        !contact.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold">{contact.name}</td>
                      <td className="px-4 py-3">{contact.email}</td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {contact.message}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {contact.timestamp.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          href={`mailto:${contact.email}`}
                          className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 inline-block"
                        >
                          Reply
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteContact(contact.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-light mb-6">
              {editingId ? 'Edit Painting' : 'Add New Painting'}
            </h2>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light mb-2">Title (English)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) =>
                      setFormData({ ...formData, titleEn: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Title (Hebrew)</label>
                  <input
                    type="text"
                    value={formData.titleHe}
                    onChange={(e) =>
                      setFormData({ ...formData, titleHe: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-2">
                  Description (Hebrew)
                </label>
                <textarea
                  value={formData.descriptionHe}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionHe: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-light mb-2">Image URL or File</label>
                <input
                  type="text"
                  placeholder="Paste image URL or select file below"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData({ ...formData, image: file });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Paste an image URL above or select a file to upload (JPG, PNG, GIF). File upload takes priority.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-light mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="abstract">Abstract</option>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                    <option value="still-life">Still Life</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-light mb-2">Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) =>
                    setFormData({ ...formData, dimensions: e.target.value })
                  }
                  placeholder="e.g., 100x100cm"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-black text-white py-2 rounded-lg font-light hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? 'Saving...' : editingId ? 'Update Painting' : 'Add Painting'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg font-light hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
