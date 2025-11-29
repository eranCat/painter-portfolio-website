import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getPaintings, deletePainting } from '../services/paintingService';
import { getContacts, deleteContact } from '../services/contactService';
import { Painting } from '../types/painting';
import { Contact } from '../types/contact';

export const AdminPanel = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'paintings' | 'contacts'>('paintings');
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);

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
    </motion.div>
  );
};
